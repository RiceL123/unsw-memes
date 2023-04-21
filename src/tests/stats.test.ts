import {
  clear,
  userStats,
  usersStats,
  authRegister,
  channelsCreate,
  channelJoin,
  channelInvite,
  channelLeave,
  dmCreate,
  dmRemove,
  dmLeave,
  messageSend,
  messageSendDm,
  messageRemove,
  messageSendLater,
  messageSendLaterDm,
  standupStart,
  standupSend,
} from './routeRequests';

function sleep(ms: number) {
  const start = Date.now();
  while (Date.now() - start < ms);
}

beforeEach(() => {
  clear();
});

describe('user/stats/v1', () => {
  test('invalid token', () => {
    expect(userStats('')).toStrictEqual(403);
  });

  test('if denominator is 0, involvement = 0', () => {
    const user = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    expect(userStats(user.token)).toStrictEqual({
      userStats: {
        channelsJoined: [
          { numChannelsJoined: 0, timeStamp: expect.any(Number) }
        ],
        dmsJoined: [
          { numDmsJoined: 0, timeStamp: expect.any(Number) }
        ],
        messagesSent: [
          { numMessagesSent: 0, timeStamp: expect.any(Number) }
        ],
        involvementRate: 0
      }
    });
  });

  test('valid message channel and dm stats - 100% involement', () => {
    const user = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    const channel = channelsCreate(user.token, 'channel', true);
    const dm = dmCreate(user.token, []);
    messageSend(user.token, channel.channelId, '1');
    messageSendDm(user.token, dm.dmId, '2');

    expect(userStats(user.token)).toStrictEqual({
      userStats: {
        channelsJoined: [
          { numChannelsJoined: 0, timeStamp: expect.any(Number) },
          { numChannelsJoined: 1, timeStamp: expect.any(Number) }
        ],
        dmsJoined: [
          { numDmsJoined: 0, timeStamp: expect.any(Number) },
          { numDmsJoined: 1, timeStamp: expect.any(Number) }
        ],
        messagesSent: [
          { numMessagesSent: 0, timeStamp: expect.any(Number) },
          { numMessagesSent: 1, timeStamp: expect.any(Number) },
          { numMessagesSent: 2, timeStamp: expect.any(Number) },
        ],
        involvementRate: 1
      }
    });
  });

  test('removal of messages does NOT affect numMessagesSent + dm remove', () => {
    const user = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    const dm1 = dmCreate(user.token, []);
    const dm2 = dmCreate(user.token, []);
    const msg1 = messageSendDm(user.token, dm1.dmId, '1');
    messageSendDm(user.token, dm1.dmId, '1');
    messageSendDm(user.token, dm2.dmId, '2');
    messageSendDm(user.token, dm2.dmId, '2');

    // removes a message from dm1
    messageRemove(user.token, msg1.messageId);

    // removes the whole dm2 (the two messages in dm2 should be remove aswell)
    dmRemove(user.token, dm2.dmId);

    // the remove of 3 messages does not affect the number of messages
    expect(userStats(user.token)).toStrictEqual({
      userStats: {
        channelsJoined: [
          { numChannelsJoined: 0, timeStamp: expect.any(Number) }
        ],
        dmsJoined: [
          { numDmsJoined: 0, timeStamp: expect.any(Number) },
          { numDmsJoined: 1, timeStamp: expect.any(Number) },
          { numDmsJoined: 2, timeStamp: expect.any(Number) },
          { numDmsJoined: 1, timeStamp: expect.any(Number) }, // the number of dms joined decreases as dm2 is removed
        ],
        messagesSent: [
          { numMessagesSent: 0, timeStamp: expect.any(Number) },
          { numMessagesSent: 1, timeStamp: expect.any(Number) },
          { numMessagesSent: 2, timeStamp: expect.any(Number) },
          { numMessagesSent: 3, timeStamp: expect.any(Number) },
          { numMessagesSent: 4, timeStamp: expect.any(Number) }, // number of messages sent unaffected
        ],
        involvementRate: 1 // since the message and dm have been removed the involvement > 1 but should be capped at 1
      }
    });
  });

  test('invited / joined channel + channel leave', () => {
    const user1 = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    const user2 = authRegister('z5111111@ad.unsw.edu.au', 'password', 'Miguel', 'Guthridge');

    // madhav makes a channel + invites miguel
    const chan1 = channelsCreate(user1.token, 'channel', false);
    channelInvite(user1.token, chan1.channelId, user2.authUserId);

    // miguel leaves channel after sending a message
    messageSend(user2.token, chan1.channelId, '1');
    channelLeave(user2.token, chan1.channelId);

    // madhav makes another channel + miguel joins after sending amessage
    const chan2 = channelsCreate(user1.token, 'channel', true);
    channelJoin(user2.token, chan2.channelId);
    messageSend(user2.token, chan2.channelId, '1');
    channelLeave(user2.token, chan2.channelId);

    expect(userStats(user2.token)).toStrictEqual({
      userStats: {
        channelsJoined: [
          { numChannelsJoined: 0, timeStamp: expect.any(Number) },
          { numChannelsJoined: 1, timeStamp: expect.any(Number) },
          { numChannelsJoined: 0, timeStamp: expect.any(Number) },
          { numChannelsJoined: 1, timeStamp: expect.any(Number) },
          { numChannelsJoined: 0, timeStamp: expect.any(Number) }
        ],
        dmsJoined: [
          { numDmsJoined: 0, timeStamp: expect.any(Number) },
        ],
        messagesSent: [
          { numMessagesSent: 0, timeStamp: expect.any(Number) },
          { numMessagesSent: 1, timeStamp: expect.any(Number) }, // miguel leaves channel - messages sent does not decrease
          { numMessagesSent: 2, timeStamp: expect.any(Number) }
        ],
        involvementRate: 0.5
      }
    });
  });

  test('another user creates a dm with you + dm leave', () => {
    const user1 = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    const user2 = authRegister('z5111111@ad.unsw.edu.au', 'password', 'Miguel', 'Guthridge');

    // madhav makes a dm with miguel
    const dm = dmCreate(user1.token, [user2.authUserId]);

    // miguel leaves dm after sending a message
    messageSendDm(user2.token, dm.dmId, '1');
    dmLeave(user2.token, dm.dmId);

    expect(userStats(user2.token)).toStrictEqual({
      userStats: {
        channelsJoined: [
          { numChannelsJoined: 0, timeStamp: expect.any(Number) },
        ],
        dmsJoined: [
          { numDmsJoined: 0, timeStamp: expect.any(Number) },
          { numDmsJoined: 1, timeStamp: expect.any(Number) },
          { numDmsJoined: 0, timeStamp: expect.any(Number) }
        ],
        messagesSent: [
          { numMessagesSent: 0, timeStamp: expect.any(Number) },
          { numMessagesSent: 1, timeStamp: expect.any(Number) }, // miguel leaves dm - messages sent does not decrease
        ],
        involvementRate: 0.5
      }
    });
  });

  test('message sent later - message/sendlater / message/sendlaterdm', () => {
    const user = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    const channel = channelsCreate(user.token, 'channel', true);
    const dm = dmCreate(user.token, []);

    // send two messages later
    const currentTime = Math.floor(Date.now() / 1000);
    messageSendLater(user.token, channel.channelId, 'hello in channel', currentTime + 2);
    messageSendLaterDm(user.token, dm.dmId, 'hello in dm', currentTime + 2);

    expect(userStats(user.token)).toStrictEqual({
      userStats: {
        channelsJoined: [
          { numChannelsJoined: 0, timeStamp: expect.any(Number) },
          { numChannelsJoined: 1, timeStamp: expect.any(Number) }
        ],
        dmsJoined: [
          { numDmsJoined: 0, timeStamp: expect.any(Number) },
          { numDmsJoined: 1, timeStamp: expect.any(Number) }
        ],
        messagesSent: [
          { numMessagesSent: 0, timeStamp: expect.any(Number) } // no messages sent yet
        ],
        involvementRate: 1
      }
    });

    sleep(3000); // wait for the messages to send

    expect(userStats(user.token)).toStrictEqual({
      userStats: {
        channelsJoined: [
          { numChannelsJoined: 0, timeStamp: expect.any(Number) },
          { numChannelsJoined: 1, timeStamp: expect.any(Number) }
        ],
        dmsJoined: [
          { numDmsJoined: 0, timeStamp: expect.any(Number) },
          { numDmsJoined: 1, timeStamp: expect.any(Number) }
        ],
        messagesSent: [
          { numMessagesSent: 0, timeStamp: expect.any(Number) },
          { numMessagesSent: 1, timeStamp: expect.any(Number) },
          { numMessagesSent: 2, timeStamp: expect.any(Number) } // messages have been sent
        ],
        involvementRate: 1
      }
    });
  });

  test('message sent later - standup/send', () => {
    const user = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    const channel = channelsCreate(user.token, 'channel', true);

    // start a standup
    standupStart(user.token, channel.channelId, 2);
    standupSend(user.token, channel.channelId, 'standup 1');
    standupSend(user.token, channel.channelId, 'standup 2');

    expect(userStats(user.token)).toStrictEqual({
      userStats: {
        channelsJoined: [
          { numChannelsJoined: 0, timeStamp: expect.any(Number) },
          { numChannelsJoined: 1, timeStamp: expect.any(Number) }
        ],
        dmsJoined: [
          { numDmsJoined: 0, timeStamp: expect.any(Number) },
        ],
        messagesSent: [
          { numMessagesSent: 0, timeStamp: expect.any(Number) } // no messages sent yet
        ],
        involvementRate: 1
      }
    });

    // wait for standup to finish
    sleep(3000);

    // although 2 standup messages were sent, numMessages sent should only increase by 1
    expect(userStats(user.token)).toStrictEqual({
      userStats: {
        channelsJoined: [
          { numChannelsJoined: 0, timeStamp: expect.any(Number) },
          { numChannelsJoined: 1, timeStamp: expect.any(Number) }
        ],
        dmsJoined: [
          { numDmsJoined: 0, timeStamp: expect.any(Number) },
        ],
        messagesSent: [
          { numMessagesSent: 0, timeStamp: expect.any(Number) },
          { numMessagesSent: 1, timeStamp: expect.any(Number) } // now the standup message has been sent
        ],
        involvementRate: 1
      }
    });
  });
});

describe('users/stats/v1', () => {
  test('invalid token', () => {
    expect(usersStats('')).toStrictEqual(403);
  });

  test('valid channels and dms exist', () => {
    const user = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    const channel = channelsCreate(user.token, 'channel', true);
    const dm = dmCreate(user.token, []);
    messageSend(user.token, channel.channelId, '1');
    messageSendDm(user.token, dm.dmId, '2');

    expect(usersStats(user.token)).toStrictEqual({
      workspaceStats: {
        channelsExist: [
          { numChannelsExist: 0, timeStamp: expect.any(Number) },
          { numChannelsExist: 1, timeStamp: expect.any(Number) }
        ],
        dmsExist: [
          { numDmsExist: 0, timeStamp: expect.any(Number) },
          { numDmsExist: 1, timeStamp: expect.any(Number) },
        ],
        messagesExist: [
          { numMessagesExist: 0, timeStamp: expect.any(Number) },
          { numMessagesExist: 1, timeStamp: expect.any(Number) },
          { numMessagesExist: 2, timeStamp: expect.any(Number) },
        ],
        utilizationRate: 1
      }
    });
  });

  test('valid dm remove and message remove - stats reflect decrease in messages', () => {
    const user = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    const dm1 = dmCreate(user.token, []);
    const dm2 = dmCreate(user.token, []);
    const msg1 = messageSendDm(user.token, dm1.dmId, '1');
    messageSendDm(user.token, dm1.dmId, '1');
    messageSendDm(user.token, dm2.dmId, '2');
    messageSendDm(user.token, dm2.dmId, '2');

    // removes a message from dm1
    messageRemove(user.token, msg1.messageId);

    // removes the whole dm2 (the two messages in dm2 should be removed aswell)
    dmRemove(user.token, dm2.dmId);

    // the remove of 3 messages should be reflected in dm
    expect(usersStats(user.token)).toStrictEqual({
      workspaceStats: {
        channelsExist: [
          { numChannelsExist: 0, timeStamp: expect.any(Number) }
        ],
        dmsExist: [
          { numDmsExist: 0, timeStamp: expect.any(Number) },
          { numDmsExist: 1, timeStamp: expect.any(Number) },
          { numDmsExist: 2, timeStamp: expect.any(Number) },
          { numDmsExist: 1, timeStamp: expect.any(Number) },
        ],
        messagesExist: [
          { numMessagesExist: 0, timeStamp: expect.any(Number) },
          { numMessagesExist: 1, timeStamp: expect.any(Number) },
          { numMessagesExist: 2, timeStamp: expect.any(Number) },
          { numMessagesExist: 3, timeStamp: expect.any(Number) },
          { numMessagesExist: 4, timeStamp: expect.any(Number) },
          { numMessagesExist: 3, timeStamp: expect.any(Number) }, // message/remove removes 1 message
          { numMessagesExist: 1, timeStamp: expect.any(Number) } // dm/remove removes 2 messages in 1 call
        ],
        utilizationRate: 1
      }
    });
  });

  test('message sent later - message/sendlater / message/sendlaterdm', () => {
    const user = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    const channel = channelsCreate(user.token, 'channel', true);
    const dm = dmCreate(user.token, []);

    // send two messages later
    const currentTime = Math.floor(Date.now() / 1000);
    messageSendLater(user.token, channel.channelId, 'hello in channel', currentTime + 2);
    messageSendLaterDm(user.token, dm.dmId, 'hello in dm', currentTime + 2);

    expect(usersStats(user.token)).toStrictEqual({
      workspaceStats: {
        channelsExist: [
          { numChannelsExist: 0, timeStamp: expect.any(Number) },
          { numChannelsExist: 1, timeStamp: expect.any(Number) }
        ],
        dmsExist: [
          { numDmsExist: 0, timeStamp: expect.any(Number) },
          { numDmsExist: 1, timeStamp: expect.any(Number) },
        ],
        messagesExist: [
          { numMessagesExist: 0, timeStamp: expect.any(Number) } // messages haven't been sent yet
        ],
        utilizationRate: 1
      }
    });

    sleep(3000); // wait for the messages to send
    expect(usersStats(user.token)).toStrictEqual({
      workspaceStats: {
        channelsExist: [
          { numChannelsExist: 0, timeStamp: expect.any(Number) },
          { numChannelsExist: 1, timeStamp: expect.any(Number) }
        ],
        dmsExist: [
          { numDmsExist: 0, timeStamp: expect.any(Number) },
          { numDmsExist: 1, timeStamp: expect.any(Number) },
        ],
        messagesExist: [
          { numMessagesExist: 0, timeStamp: expect.any(Number) }, // messages have been sent
          { numMessagesExist: 1, timeStamp: expect.any(Number) },
          { numMessagesExist: 2, timeStamp: expect.any(Number) }
        ],
        utilizationRate: 1
      }
    });
  });

  test('message sent later - standup/send', () => {
    const user = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    const channel = channelsCreate(user.token, 'channel', true);

    // start a standup
    standupStart(user.token, channel.channelId, 2);
    standupSend(user.token, channel.channelId, 'standup 1');
    standupSend(user.token, channel.channelId, 'standup 2');

    expect(usersStats(user.token)).toStrictEqual({
      workspaceStats: {
        channelsExist: [
          { numChannelsExist: 0, timeStamp: expect.any(Number) },
          { numChannelsExist: 1, timeStamp: expect.any(Number) }
        ],
        dmsExist: [
          { numDmsExist: 0, timeStamp: expect.any(Number) }
        ],
        messagesExist: [
          { numMessagesExist: 0, timeStamp: expect.any(Number) } // messages haven't been sent yet
        ],
        utilizationRate: 1
      }
    });

    sleep(3000); // wait for standup to finish
    expect(usersStats(user.token)).toStrictEqual({
      workspaceStats: {
        channelsExist: [
          { numChannelsExist: 0, timeStamp: expect.any(Number) },
          { numChannelsExist: 1, timeStamp: expect.any(Number) }
        ],
        dmsExist: [
          { numDmsExist: 0, timeStamp: expect.any(Number) }
        ],
        messagesExist: [
          { numMessagesExist: 0, timeStamp: expect.any(Number) },
          { numMessagesExist: 1, timeStamp: expect.any(Number) } // now that standup has finished, 1 message is sent
        ],
        utilizationRate: 1
      }
    });
  });

  test('correct involvement rate', () => {
    const user1 = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    const user2 = authRegister('z5111111@ad.unsw.edu.au', 'password', 'Miguel', 'Guthridge');
    const user3 = authRegister('z3333333@ad.unsw.edu.au', 'password', 'Liren', 'Ding');

    expect(usersStats(user1.token).workspaceStats.utilizationRate).toStrictEqual(0);

    const channel = channelsCreate(user1.token, 'channelname', true);
    channelJoin(user2.token, channel.channelId);

    const dm = dmCreate(user1.token, [user3.authUserId]);

    expect(usersStats(user1.token).workspaceStats.utilizationRate).toStrictEqual(3 / 3); // every user is now part of either a channel or dm

    channelLeave(user2.token, channel.channelId);
    expect(usersStats(user1.token).workspaceStats.utilizationRate).toStrictEqual(2 / 3); // miguel is now not utilizing anything

    dmLeave(user3.token, dm.dmId);
    expect(usersStats(user1.token).workspaceStats.utilizationRate).toStrictEqual(1 / 3); // only mahav is apart of a channel or dm now
  });
});
