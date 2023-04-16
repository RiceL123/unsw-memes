import {
  clear,
  notificationsGet,
  authRegister,
  dmCreate,
  dmLeave,
  channelsCreate,
  channelJoin,
  channelLeave,
  channelInvite,
  messageSend,
  messageSendDm,
  messageReact,
  messageUnreact,
  messageShare,
  messageEdit,
} from './routeRequests';

beforeEach(() => {
  clear();
});

interface AuthRegisterReturn {
  token: string;
  authUserId: number;
}

interface ChannelReturn {
  channelId: number;
}

interface DmReturn {
  dmId: number;
}

interface MessageSendReturn {
  messageId: number;
}

describe('/notifications/get/v1', () => {
  let user1: AuthRegisterReturn;
  let user2: AuthRegisterReturn;
  let channel: ChannelReturn;
  let dm: DmReturn;
  let dmMessage: MessageSendReturn;
  let channelMessage: MessageSendReturn;
  beforeEach(() => {
    user1 = authRegister('z5555555@ad.unsw.edu.au', 'password1', 'Madhav', 'Mishra');
    user2 = authRegister('z5444444@ad.unsw.edu.au', 'password2', 'Miguel', 'Guthridge');
    channel = channelsCreate(user1.token, 'dummy channel', true);
    channelJoin(user2.token, channel.channelId);
    dm = dmCreate(user1.token, [user2.authUserId]);
    dmMessage = messageSendDm(user2.token, dm.dmId, 'hello from Miguel in dm');
    channelMessage = messageSend(user2.token, channel.channelId, 'hello from Miguel in channel');
  });

  test('invalid token', () => {
    expect(notificationsGet(user1.token + user2.token + 'invalid')).toStrictEqual(403);
  });

  test('valid notifcation being added to a dm', () => {
    expect(notificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'madhavmishra added you to madhavmishra, miguelguthridge'
        }
      ]
    });
  });

  test('valid notification being added to a channel', () => {
    const channel2 = channelsCreate(user1.token, 'dummy channel 2', false);
    expect(channelInvite(user1.token, channel2.channelId, user2.authUserId)).toStrictEqual({});
    expect(notificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel2.channelId,
          dmId: -1,
          notificationMessage: 'madhavmishra added you to dummy channel 2'
        },
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'madhavmishra added you to madhavmishra, miguelguthridge'
        }
      ]
    });
  });

  test('no notifications from reacting to own message', () => {
    expect(messageReact(user1.token, dmMessage.messageId, 1)).toStrictEqual({});
    expect(notificationsGet(user1.token)).toStrictEqual({ notifications: [] });

    expect(messageReact(user1.token, channelMessage.messageId, 1)).toStrictEqual({});
    expect(notificationsGet(user1.token)).toStrictEqual({ notifications: [] });
  });

  test('notification when someone reacts to your message', () => {
    // miguel and Nanami reacts to madhav's message in the dm
    const dmMessage2 = messageSendDm(user1.token, dm.dmId, 'hello from madhav');
    const channelMessage2 = messageSend(user1.token, channel.channelId, 'allo from madhav');
    expect(messageReact(user2.token, dmMessage2.messageId, 1)).toStrictEqual({});
    expect(notificationsGet(user1.token)).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'miguelguthridge reacted to your message in madhavmishra, miguelguthridge'
        }
      ]
    });

    // miguel reacts to madhav's message in the channels
    expect(messageReact(user2.token, channelMessage2.messageId, 1)).toStrictEqual({});
    const notifcationsReturn2 = notificationsGet(user1.token);
    expect(notifcationsReturn2).toStrictEqual({
      notifications: [
        {
          channelId: channel.channelId,
          dmId: -1,
          notificationMessage: 'miguelguthridge reacted to your message in dummy channel'
        },
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'miguelguthridge reacted to your message in madhavmishra, miguelguthridge'
        }
      ]
    });

    // when the miguel removes his react on madhav's messages, the notifications should not be changed
    expect(messageUnreact(user2.token, dmMessage2.messageId, 1)).toStrictEqual({});
    expect(messageUnreact(user2.token, channelMessage2.messageId, 1)).toStrictEqual({});

    expect(notificationsGet(user1.token)).toStrictEqual(notifcationsReturn2);

    // madhav leaves
    expect(channelLeave(user1.token, channel.channelId)).toStrictEqual({});
    expect(dmLeave(user1.token, dm.dmId)).toStrictEqual({});

    // miguel reacts to madhav's messages again -> no notifications should appear as madhav has left
    expect(messageReact(user2.token, dmMessage2.messageId, 1)).toStrictEqual({});
    expect(messageReact(user2.token, channelMessage2.messageId, 1)).toStrictEqual({});
    expect(notificationsGet(user1.token)).toStrictEqual(notifcationsReturn2);
  });

  test('valid notification from react - react array not empty', () => {
    const user3 = authRegister('z53333333@ad.unsw.edu.au', 'password', 'Nanami', 'Uta');
    expect(channelJoin(user3.token, channel.channelId)).toStrictEqual({});

    // miguel leaves
    expect(channelLeave(user2.token, channel.channelId)).toStrictEqual({});

    // madhav and Nanami reacts to the message
    expect(messageReact(user3.token, channelMessage.messageId, 1)).toStrictEqual({});
    expect(messageReact(user1.token, channelMessage.messageId, 1)).toStrictEqual({});

    // miguel doesn't receive any messages about the new reacts
    expect(notificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'madhavmishra added you to madhavmishra, miguelguthridge'
        }
      ]
    });
  });

  test('valid notification from tag in channel from another user', () => {
    expect(messageSend(user1.token, channel.channelId, '@miguelguthridge 1')).toStrictEqual({ messageId: expect.any(Number) });
    const notifications = notificationsGet(user2.token);
    expect(notifications).toStrictEqual({
      notifications: [
        {
          channelId: channel.channelId,
          dmId: -1,
          notificationMessage: 'madhavmishra tagged you in dummy channel: @miguelguthridge 1'
        },
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'madhavmishra added you to madhavmishra, miguelguthridge'
        }
      ]
    });

    // if miguel leaves the channel miguel should not be notified when tagged in a new message
    expect(channelLeave(user2.token, channel.channelId)).toStrictEqual({});
    expect(messageSend(user1.token, channel.channelId, '@miguelguthridge 2')).toStrictEqual({ messageId: expect.any(Number) });

    // the notification array should be the same as before as miguel left the channel
    expect(notificationsGet(user2.token)).toStrictEqual(notifications);
  });

  test('valid notification from tag in dm from another user', () => {
    expect(messageSendDm(user1.token, dm.dmId, '@miguelguthridge 1')).toStrictEqual({ messageId: expect.any(Number) });
    const notifications = notificationsGet(user2.token);
    expect(notifications).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'madhavmishra tagged you in madhavmishra, miguelguthridge: @miguelguthridge 1'
        },
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'madhavmishra added you to madhavmishra, miguelguthridge'
        }
      ]
    });

    // if miguel leaves the dm miguel should not be notified when tagged in a new message
    expect(dmLeave(user2.token, dm.dmId)).toStrictEqual({});
    expect(messageSendDm(user1.token, dm.dmId, '@miguelguthridge 2')).toStrictEqual({ messageId: expect.any(Number) });

    // the notification array should be the same as before as miguel left the dm
    expect(notificationsGet(user2.token)).toStrictEqual(notifications);
  });

  test('valid notification from tag in channel from themself', () => {
    expect(messageSend(user1.token, channel.channelId, '@madhavmishra 💀')).toStrictEqual({ messageId: expect.any(Number) });
    expect(notificationsGet(user1.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel.channelId,
          dmId: -1,
          notificationMessage: 'madhavmishra tagged you in dummy channel: @madhavmishra 💀'
        }
      ]
    });
  });

  test('valid notifaction from tag in dm from themself', () => {
    expect(messageSendDm(user1.token, dm.dmId, '@madhavmishra 💀')).toStrictEqual({ messageId: expect.any(Number) });
    expect(notificationsGet(user1.token)).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'madhavmishra tagged you in madhavmishra, miguelguthridge: @madhavmishra 💀'
        }
      ]
    });
  });

  test('valid notification message - string is sliced to first 20 chars', () => {
    expect(messageSend(user1.token, channel.channelId, '@miguelguthridge 12345678901234567890')).toStrictEqual({ messageId: expect.any(Number) });
    expect(notificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel.channelId,
          dmId: -1,
          notificationMessage: 'madhavmishra tagged you in dummy channel: @miguelguthridge 123'
        },
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'madhavmishra added you to madhavmishra, miguelguthridge'
        }
      ]
    });
  });

  test('multiple valid notifications from multiple tags in 1 message in channel', () => {
    expect(messageSend(user1.token, channel.channelId, '@miguelguthridge @madhavmishra')).toStrictEqual({ messageId: expect.any(Number) });
    const notification1 = notificationsGet(user1.token);
    expect(notification1).toStrictEqual({
      notifications: [
        {
          channelId: channel.channelId,
          dmId: -1,
          notificationMessage: 'madhavmishra tagged you in dummy channel: @miguelguthridge @ma'
        }
      ]
    });

    // since madhav also tagged miguel in the same message, miguel should have the same most recent notification
    expect(notificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel.channelId,
          dmId: -1,
          notificationMessage: 'madhavmishra tagged you in dummy channel: @miguelguthridge @ma'
        },
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'madhavmishra added you to madhavmishra, miguelguthridge'
        }
      ]
    });
  });

  test('multiple valid notifications from multiple tags in 1 message in dm', () => {
    expect(messageSendDm(user1.token, dm.dmId, '@miguelguthridge @madhavmishra')).toStrictEqual({ messageId: expect.any(Number) });
    const notification1 = notificationsGet(user1.token);
    expect(notification1).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'madhavmishra tagged you in madhavmishra, miguelguthridge: @miguelguthridge @ma'
        }
      ]
    });

    // since madhav also tagged miguel in the same message, miguel should have a notification as well
    expect(notificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'madhavmishra tagged you in madhavmishra, miguelguthridge: @miguelguthridge @ma'
        },
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'madhavmishra added you to madhavmishra, miguelguthridge'
        }
      ]
    });
  });

  test('valid notification from edit message in channel', () => {
    expect(messageEdit(user1.token, channelMessage.messageId, '@miguelguthridge 1')).toStrictEqual({});
    const notifications = notificationsGet(user2.token);
    expect(notifications).toStrictEqual({
      notifications: [
        {
          channelId: channel.channelId,
          dmId: -1,
          notificationMessage: 'madhavmishra tagged you in dummy channel: @miguelguthridge 1'
        },
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'madhavmishra added you to madhavmishra, miguelguthridge'
        }
      ]
    });

    // if miguel leaves the channel miguel should not be notified when tagged in a new message edit
    expect(channelLeave(user2.token, channel.channelId)).toStrictEqual({});
    expect(messageEdit(user1.token, channelMessage.messageId, '@miguelguthridge 2')).toStrictEqual({});

    // the notification array should be the same as before as miguel left the channel
    expect(notificationsGet(user2.token)).toStrictEqual(notifications);
  });

  test('valid notification from edit message in dm', () => {
    expect(messageEdit(user1.token, dmMessage.messageId, '@miguelguthridge 1')).toStrictEqual({});
    const notifications = notificationsGet(user2.token);
    expect(notifications).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'madhavmishra tagged you in madhavmishra, miguelguthridge: @miguelguthridge 1'
        },
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'madhavmishra added you to madhavmishra, miguelguthridge'
        }
      ]
    });

    // if miguel leaves the dm miguel should not be notified when tagged in a new message edit
    expect(dmLeave(user2.token, dm.dmId)).toStrictEqual({});
    expect(messageEdit(user1.token, dmMessage.messageId, '@miguelguthridge 2')).toStrictEqual({});

    // the notification array should be the same as before as miguel left the dm
    expect(notificationsGet(user2.token)).toStrictEqual(notifications);
  });

  test('valid notifcation from message share to channel from dm', () => {
    expect(messageShare(user1.token, dmMessage.messageId, '@miguelguthridge 1', channel.channelId, -1)).toStrictEqual({ sharedMessageId: expect.any(Number) });
    const notifications = notificationsGet(user2.token);
    expect(notifications).toStrictEqual({
      notifications: [
        {
          channelId: channel.channelId,
          dmId: -1,
          notificationMessage: expect.any(String)
        },
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'madhavmishra added you to madhavmishra, miguelguthridge'
        }
      ]
    });

    expect(notifications.notifications[0].notificationMessage).toContain('madhavmishra tagged you in dummy channel: ');

    // if miguel leaves the channel miguel should not be notified when tagged in a new message share
    expect(channelLeave(user2.token, channel.channelId)).toStrictEqual({});
    expect(messageShare(user1.token, dmMessage.messageId, '@miguelguthridge 2', channel.channelId, -1)).toStrictEqual({ sharedMessageId: expect.any(Number) });

    // the notification array should be the same as before as miguel left the channel
    expect(notificationsGet(user2.token)).toStrictEqual(notifications);
  });

  test('valid notifcation from message share to dm from dm', () => {
    expect(messageShare(user1.token, dmMessage.messageId, '@miguelguthridge 💀', -1, dm.dmId)).toStrictEqual({ sharedMessageId: expect.any(Number) });
    expect(notificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'madhavmishra tagged you in madhavmishra, miguelguthridge: @miguelguthridge 💀'
        },
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'madhavmishra added you to madhavmishra, miguelguthridge'
        }
      ]
    });
  });

  test('valid notifcation from message share to dm from channel', () => {
    expect(messageShare(user1.token, channelMessage.messageId, '@miguelguthridge 1', -1, dm.dmId)).toStrictEqual({ sharedMessageId: expect.any(Number) });
    const notifications = notificationsGet(user2.token);
    expect(notifications).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: expect.any(String)
        },
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'madhavmishra added you to madhavmishra, miguelguthridge'
        }
      ]
    });

    expect(notifications.notifications[0].notificationMessage).toContain('madhavmishra tagged you in madhavmishra, miguelguthridge: ');

    // if miguel leaves the dm miguel should not be notified when tagged in a new message share
    expect(dmLeave(user2.token, dm.dmId)).toStrictEqual({});
    expect(messageShare(user1.token, channelMessage.messageId, '@miguelguthridge 2', -1, dm.dmId)).toStrictEqual({ sharedMessageId: expect.any(Number) });

    // the notification array should be the same as before as miguel left the dm
    expect(notificationsGet(user2.token)).toStrictEqual(notifications);
  });

  test('valid notifcation from message share to channel from channel', () => {
    expect(messageShare(user1.token, channelMessage.messageId, '@miguelguthridge 💀', channel.channelId, -1)).toStrictEqual({ sharedMessageId: expect.any(Number) });
    expect(notificationsGet(user2.token)).toStrictEqual({
      notifications: [
        {
          channelId: channel.channelId,
          dmId: -1,
          notificationMessage: 'madhavmishra tagged you in dummy channel: @miguelguthridge 💀'
        },
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'madhavmishra added you to madhavmishra, miguelguthridge'
        }
      ]
    });
  });

  test('valid notifcation from message send & message share to dm', () => {
    // the original message tags
    const message = messageSendDm(user1.token, dm.dmId, '@miguelguthridge :)');
    expect(message).toStrictEqual({ messageId: expect.any(Number) });

    // the optional share message tags
    expect(messageShare(user1.token, message.messageId, '@miguelguthridge Bump', -1, dm.dmId)).toStrictEqual({ sharedMessageId: expect.any(Number) });

    // expects two different notifications
    const notifications = notificationsGet(user2.token);
    expect(notifications).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: expect.any(String)
        },
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'madhavmishra tagged you in madhavmishra, miguelguthridge: @miguelguthridge :)'
        },
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'madhavmishra added you to madhavmishra, miguelguthridge'
        }
      ]
    });

    expect(notifications.notifications[0].notificationMessage).toContain('madhavmishra tagged you in madhavmishra, miguelguthridge: ');
  });

  test('valid notifcation from message send & message share to channel', () => {
    // the original message tags
    const message = messageSend(user1.token, channel.channelId, '@miguelguthridge :)');
    expect(message).toStrictEqual({ messageId: expect.any(Number) });

    // the optional share message tags
    expect(messageShare(user1.token, message.messageId, '@miguelguthridge Bump', channel.channelId, -1)).toStrictEqual({ sharedMessageId: expect.any(Number) });

    // expects two different notifications
    const notifications = notificationsGet(user2.token);
    expect(notifications).toStrictEqual({
      notifications: [
        {
          channelId: channel.channelId,
          dmId: -1,
          notificationMessage: expect.any(String)
        },
        {
          channelId: channel.channelId,
          dmId: -1,
          notificationMessage: 'madhavmishra tagged you in dummy channel: @miguelguthridge :)'
        },
        {
          channelId: -1,
          dmId: dm.dmId,
          notificationMessage: 'madhavmishra added you to madhavmishra, miguelguthridge'
        }
      ]
    });

    expect(notifications.notifications[0].notificationMessage).toContain('madhavmishra tagged you in dummy channel: ');
  });

  test('20 notifications', () => {
    for (let i = 0; i < 20; i++) {
      messageSend(user1.token, channel.channelId, '@miguelguthridge hi dummy');
    }

    const expectedNotificationMessage = Array(20).fill({
      channelId: channel.channelId,
      dmId: -1,
      notificationMessage: 'madhavmishra tagged you in dummy channel: @miguelguthridge hi '
    });

    expect(notificationsGet(user2.token)).toStrictEqual({
      notifications: expectedNotificationMessage
    });
  });
});
