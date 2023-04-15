import {
  clear,
  authRegister,
  dmCreate,
  dmLeave,
  dmMessages,
  channelMessages,
  channelLeave,
  channelJoin,
  channelsCreate,
  messageSend,
  messageEdit,
  messageRemove,
  messageSendDm,
  messagePin,
  messageUnpin,
  messageShare,
  standupStart,
  standupSend,
  messageReact,
} from './routeRequests';

import request from 'sync-request';

import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;

const ERROR = { error: expect.any(String) };
const VALID_MESSAGE = { messageId: expect.any(Number) };
// 5 seconds to account for the time between the request and the expect (server latency).
const EXPECTED_TIME_ERROR_MARGIN = 5;

interface AuthRegisterReturn {
  token: string;
  authUserId: number;
}

interface MessageReturn {
  messageId: number;
}

interface ChannelReturn {
  channelId: number;
}

interface DmReturn {
  dmId: number;
}

interface Message {
  messageId: number;
  uId: number;
  message: string;
  timeSent: number;
  reacts: any[];
  isPinned: boolean;
}

function sleep(ms: number) {
  const start = Date.now();
  while (Date.now() - start < ms);
}

beforeEach(() => {
  clear();
});

describe('messageSendV3', () => {
  let userToken: string;
  let userId: number;
  let chanId: number;
  beforeEach(() => {
    const userData = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    userToken = userData.token;
    userId = userData.authUserId;
    chanId = channelsCreate(userToken, 'Coding', true).channelId;
  });

  test('invalid channelId', () => {
    const messageData = messageSend(userToken, chanId + 1, 'Wassup G');
    expect(messageData).toStrictEqual(400);
  });

  test('invalid message length minimum', () => {
    const messageData = messageSend(userToken, chanId, '');
    expect(messageData).toStrictEqual(400);
  });

  test('invalid message length maximum', () => {
    // generates 1001 character long string
    const messageLong = Array(1001).fill(undefined).map(() => Math.random().toString(36)[2]).join('');
    const messageData = messageSend(userToken, chanId, messageLong);
    expect(messageData).toStrictEqual(400);
  });

  test('invalid token', () => {
    const messageData = messageSend(userToken + 1, chanId, 'Wassup G');
    expect(messageData).toStrictEqual(403);
  });

  test('valid channelId but authorised user is not a member', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const messageData = messageSend(userData2.token, chanId, 'Wassup G');
    expect(messageData).toStrictEqual(403);
  });

  test('sending one message', () => {
    const expectedTime = Math.floor(Date.now() / 1000);
    const messageSendRes = messageSend(userToken, chanId, 'Wassup G');
    expect(messageSendRes).toStrictEqual(VALID_MESSAGE);
    const messageData = channelMessages(userToken, chanId, 0);
    expect(messageData).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: userId,
          message: 'Wassup G',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        }
      ],
      start: 0,
      end: -1,
    });
    expect(messageData.messages[0].timeSent).toBeLessThanOrEqual(expectedTime + EXPECTED_TIME_ERROR_MARGIN);
  });

  test('sending multiple messages', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const userData3 = authRegister('z2222222@ad.unsw.edu.au', 'password', 'Charizard', 'Pokemon');

    const channelData2 = channelsCreate(userData2.token, 'Maths', true);
    const channelData3 = channelsCreate(userData3.token, 'Commerce', true);

    const expectedTime = Math.floor(Date.now() / 1000);

    const messageSendData = messageSend(userToken, chanId, 'This is the first msg');
    expect(messageSendData).toStrictEqual(VALID_MESSAGE);

    const expectedTime2 = Math.floor(Date.now() / 1000);
    const messageSendData2 = messageSend(userData2.token, channelData2.channelId, 'This is the second msg');
    expect(messageSendData2).toStrictEqual(VALID_MESSAGE);

    const expectedTime3 = Math.floor(Date.now() / 1000);
    const messageSendData3 = messageSend(userData3.token, channelData3.channelId, 'This is the third msg');
    expect(messageSendData3).toStrictEqual(VALID_MESSAGE);

    const messageData = channelMessages(userToken, chanId, 0);
    expect(messageData).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: userId,
          message: 'This is the first msg',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        }
      ],
      start: 0,
      end: -1,
    });

    const messageData2 = channelMessages(userData2.token, channelData2.channelId, 0);
    expect(messageData2).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: userData2.authUserId,
          message: 'This is the second msg',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        }
      ],
      start: 0,
      end: -1,
    });

    const messageData3 = channelMessages(userData3.token, channelData3.channelId, 0);
    expect(messageData3).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: userData3.authUserId,
          message: 'This is the third msg',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        }
      ],
      start: 0,
      end: -1,
    });
    expect(messageData.messages[0].timeSent).toBeLessThanOrEqual(expectedTime + EXPECTED_TIME_ERROR_MARGIN);
    expect(messageData2.messages[0].timeSent).toBeLessThanOrEqual(expectedTime2 + EXPECTED_TIME_ERROR_MARGIN);
    expect(messageData3.messages[0].timeSent).toBeLessThanOrEqual(expectedTime3 + EXPECTED_TIME_ERROR_MARGIN);
  });

  test('sending multiple messages in one channel', () => {
    const expectedTime = Math.floor(Date.now() / 1000);
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    expect(messageSendData).toStrictEqual(VALID_MESSAGE);

    const messageSendData2 = messageSend(userToken, chanId, 'Hi G');
    expect(messageSendData2).toStrictEqual(VALID_MESSAGE);

    const messageSendData3 = messageSend(userToken, chanId, 'Yoo G');
    expect(messageSendData3).toStrictEqual(VALID_MESSAGE);

    const messageData = channelMessages(userToken, chanId, 0);

    expect(messageData).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: userId,
          message: 'Yoo G',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: expect.any(Number),
          uId: userId,
          message: 'Hi G',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: expect.any(Number),
          uId: userId,
          message: 'Wassup G',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        }
      ],
      start: 0,
      end: -1,
    });
    expect(messageData.messages[0].timeSent).toBeLessThanOrEqual(expectedTime + EXPECTED_TIME_ERROR_MARGIN);
    expect(messageData.messages[1].timeSent).toBeLessThanOrEqual(expectedTime + EXPECTED_TIME_ERROR_MARGIN);
    expect(messageData.messages[2].timeSent).toBeLessThanOrEqual(expectedTime + EXPECTED_TIME_ERROR_MARGIN);
  });
});

describe('messageEditV3', () => {
  let userToken: string;
  let userId: number;
  let chanId: number;
  beforeEach(() => {
    const userData = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    userToken = userData.token;
    userId = userData.authUserId;
    chanId = channelsCreate(userToken, 'Coding', true).channelId;
  });

  test('invalid token', () => {
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;
    const setNameData = messageEdit(userToken + 1, messageId, 'This is the edited message');
    expect(setNameData).toStrictEqual(403);
  });

  test('invalid messageId', () => {
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;
    const setNameData = messageEdit(userToken, messageId + 1, 'This is the edited message');
    expect(setNameData).toStrictEqual(400);
  });

  test('invalid message length', () => {
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messageLong = Array(1001).fill(undefined).map(() => Math.random().toString(36)[2]).join('');
    const setNameData = messageEdit(userToken, messageId, messageLong);

    expect(setNameData).toStrictEqual(400);
  });

  test('the message was not sent by the authorised user making this request', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const setNameData = messageEdit(userData2.token, messageId, 'This is the edited message');
    expect(setNameData).toStrictEqual(403);
  });

  test('the message was not sent by the authorised user making this request but user has perms', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const join = channelJoin(userData2.token, chanId);
    expect(join).toStrictEqual({});

    const messageSendData = messageSend(userData2.token, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const setNameData = messageEdit(userToken, messageId, 'This is the edited message');
    expect(setNameData).toStrictEqual({});

    const checkMessageData = channelMessages(userToken, chanId, 0);
    expect(checkMessageData).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: userData2.authUserId,
          message: 'This is the edited message',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        }
      ],
      start: 0,
      end: -1,
    });
  });

  test('the message was not sent by the authorised user making this request AND the user DOES NOT has perms channels', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const join = channelJoin(userData2.token, chanId);
    expect(join).toStrictEqual({});

    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const setNameData = messageEdit(userData2.token, messageId, 'This is the edited message');
    expect(setNameData).toStrictEqual(403);
  });

  test('the message was not sent by the authorised user making this request AND the user DOES NOT has perms DM', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userToken, [userData2.authUserId]);
    const dmId = data.dmId;

    const messageSendData = messageSendDm(userToken, dmId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const setNameData = messageEdit(userData2.token, messageId, 'This is the edited message');
    expect(setNameData).toStrictEqual(403);
  });

  test('messageId does not refer to a valid message within a channel/DM that the user has joined', () => {
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const setNameData = messageEdit(userToken, messageId + 1, 'This is the edited message');
    expect(setNameData).toStrictEqual(400);
  });

  test('working case for Channel', () => {
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const setNameData = messageEdit(userToken, messageId, 'This is the edited message');
    expect(setNameData).toStrictEqual({});

    const checkMessageData = channelMessages(userToken, chanId, 0);
    expect(checkMessageData).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: userId,
          message: 'This is the edited message',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        }
      ],
      start: 0,
      end: -1,
    });
  });

  test('working case for DM', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userToken, [userData2.authUserId]);
    const dmId = data.dmId;

    const sendDmData = messageSendDm(userToken, dmId, 'Hello World');
    const messageId = sendDmData.messageId;

    const setNameData = messageEdit(userToken, messageId, 'This is the edited message');
    expect(setNameData).toStrictEqual({});

    const messageData = dmMessages(userToken, dmId, 0);
    expect(messageData).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: userId,
          message: 'This is the edited message',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        }
      ],
      start: 0,
      end: -1,
    });
  });

  test('Invalid messageId for DM', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userToken, [userData2.authUserId]);
    const dmId = data.dmId;

    const sendDmData = messageSendDm(userToken, dmId, 'Hello World');
    const messageId = sendDmData.messageId;

    const setNameData = messageEdit(userToken, messageId + 1, 'This is the edited message');
    expect(setNameData).toStrictEqual(400);
  });

  test('empty string Channel', () => {
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const setNameData = messageEdit(userToken, messageId, '');
    expect(setNameData).toStrictEqual({});

    const checkMessageData = channelMessages(userToken, chanId, 0);
    expect(checkMessageData).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('empty string Channel with existing messages', () => {
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messageSendData2 = messageSend(userToken, chanId, 'Wassup Homie');
    const messageId2 = messageSendData2.messageId;
    expect(messageSendData2).toStrictEqual({ messageId: messageId2 });

    const setNameData = messageEdit(userToken, messageId, '');
    expect(setNameData).toStrictEqual({});

    const checkMessageData = channelMessages(userToken, chanId, 0);
    expect(checkMessageData).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: userId,
          message: 'Wassup Homie',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('empty string Dm with existing messages', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userToken, [userData2.authUserId]);
    const dmId = data.dmId;

    const sendDmData = messageSendDm(userToken, dmId, 'Hello World');
    const messageId = sendDmData.messageId;

    const sendDmData2 = messageSendDm(userToken, dmId, 'Hello World2');
    const messageId2 = sendDmData2.messageId;

    expect(sendDmData2).toStrictEqual({ messageId: messageId2 });

    const setNameData = messageEdit(userToken, messageId, '');
    expect(setNameData).toStrictEqual({});

    const messageData = dmMessages(userToken, dmId, 0);
    expect(messageData).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: userId,
          message: 'Hello World2',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        }
      ],
      start: 0,
      end: -1,
    });
  });

  test('original sender not owner can edit', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const userId2 = userData2.authUserId;

    const join = channelJoin(userData2.token, chanId);
    expect(join).toStrictEqual({});

    const messageSendData = messageSend(userData2.token, chanId, 'Wassup Homie');
    const messageId = messageSendData.messageId;

    const setNameData = messageEdit(userData2.token, messageId, 'Hello this is edited');
    expect(setNameData).toStrictEqual({});

    const checkMessageData = channelMessages(userToken, chanId, 0);
    expect(checkMessageData).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: userId2,
          message: 'Hello this is edited',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('sender leaves the channel, cannot edit for dm', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userToken, [userData2.authUserId]);
    const dmId = data.dmId;

    const messageSendData = messageSendDm(userData2.token, dmId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const leaveData = dmLeave(userData2.token, dmId);
    expect(leaveData).toStrictEqual({});

    const setNameData = messageEdit(userData2.token, messageId, 'Hello this is edited');
    expect(setNameData).toStrictEqual(403);
  });

  test('sender leaves the channel, cannot edit for channel', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const userId2 = userData2.authUserId;
    const join = channelJoin(userData2.token, chanId);
    expect(join).toStrictEqual({});

    const messageSendData = messageSend(userData2.token, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const leaveData = channelLeave(userData2.token, chanId);
    expect(leaveData).toStrictEqual({});

    const setNameData = messageEdit(userData2.token, messageId, 'Hello this is edited');
    expect(setNameData).toStrictEqual(403);

    const checkMessageData = channelMessages(userToken, chanId, 0);
    expect(checkMessageData).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: userId2,
          message: 'Wassup G',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('standup edits', () => {
    // start standup
    const startData = standupStart(userToken, chanId, 3);
    expect(startData).toStrictEqual({ timeFinish: expect.any(Number) });

    // send messages into standup
    const message1 = standupSend(userToken, chanId, 'I ate a catfish');
    expect(message1).toStrictEqual({});

    const messagePackage = 'madhavmishra: I ate a catfish';

    sleep(3000);

    const messageData = channelMessages(userToken, chanId, 0);
    const messageStandupId = messageData.messages.find((x: Message) => x.message === messagePackage).messageId;

    expect(messageData).toStrictEqual({
      messages: [
        {
          isPinned: false,
          messageId: expect.any(Number),
          uId: userId,
          message: messagePackage,
          timeSent: expect.any(Number),
          reacts: [],
        }
      ],
      start: 0,
      end: -1,
    });

    const setNameData = messageEdit(userToken, messageStandupId, 'Hello this is edited');
    expect(setNameData).toStrictEqual({});

    const checkMessageData = channelMessages(userToken, chanId, 0);
    expect(checkMessageData).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: userId,
          message: 'Hello this is edited',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('standup edits empty string', () => {
    // start standup
    const startData = standupStart(userToken, chanId, 3);
    expect(startData).toStrictEqual({ timeFinish: expect.any(Number) });

    // send messages into standup
    const message1 = standupSend(userToken, chanId, 'I ate a catfish');
    expect(message1).toStrictEqual({});

    const messagePackage = 'madhavmishra: I ate a catfish';

    sleep(3000);

    const messageData = channelMessages(userToken, chanId, 0);
    const messageStandupId = messageData.messages.find((x: Message) => x.message === messagePackage).messageId;
    expect(messageData).toStrictEqual({
      messages: [
        {
          isPinned: false,
          messageId: expect.any(Number),
          uId: userId,
          message: messagePackage,
          timeSent: expect.any(Number),
          reacts: [],
        }
      ],
      start: 0,
      end: -1,
    });

    const setNameData = messageEdit(userToken, messageStandupId, '');
    expect(setNameData).toStrictEqual({});

    const checkMessageData = channelMessages(userToken, chanId, 0);
    expect(checkMessageData).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('standup edits 2 msg', () => {
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;
    const checkNormData = channelMessages(userToken, chanId, 0);
    expect(checkNormData).toStrictEqual({
      messages: [
        {
          messageId: messageId,
          uId: userId,
          message: 'Wassup G',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        }
      ],
      start: 0,
      end: -1,
    });

    // start standup
    const startData = standupStart(userToken, chanId, 3);
    expect(startData).toStrictEqual({ timeFinish: expect.any(Number) });

    // send messages into standup
    const message1 = standupSend(userToken, chanId, 'I ate a catfish');
    expect(message1).toStrictEqual({});

    const messagePackage = 'madhavmishra: I ate a catfish';

    sleep(3000);

    const messageData = channelMessages(userToken, chanId, 0);
    const messageStandupId = messageData.messages.find((x: Message) => x.message === messagePackage).messageId;
    expect(messageData).toStrictEqual({
      messages: [
        {
          isPinned: false,
          messageId: expect.any(Number),
          uId: userId,
          message: messagePackage,
          timeSent: expect.any(Number),
          reacts: [],
        },
        {
          isPinned: false,
          messageId: expect.any(Number),
          uId: userId,
          message: 'Wassup G',
          timeSent: expect.any(Number),
          reacts: [],
        }
      ],
      start: 0,
      end: -1,
    });

    const setNameData = messageEdit(userToken, messageStandupId, '');
    expect(setNameData).toStrictEqual({});

    const checkMessageData = channelMessages(userToken, chanId, 0);
    expect(checkMessageData).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: userId,
          message: 'Wassup G',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        }
      ],
      start: 0,
      end: -1,
    });
  });
});

describe('messageRemoveV3', () => {
  let userToken: string;
  let userId: number;
  let chanId: number;
  beforeEach(() => {
    const userData = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    userId = userData.authUserId;
    userToken = userData.token;

    chanId = channelsCreate(userToken, 'Coding', true).channelId;
  });

  test('invalid token', () => {
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const setNameData = messageRemove(userToken + 1, messageId);
    expect(setNameData).toStrictEqual(403);
  });

  test('invalid messageId in channel', () => {
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const setNameData = messageRemove(userToken, messageId + 1);
    expect(setNameData).toStrictEqual(400);
  });

  test('invalid messageId in Dm', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userToken, [userData2.authUserId]);
    const dmId = data.dmId;

    const messageSendData = messageSendDm(userData2.token, dmId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const removeData = messageRemove(userData2.token, messageId + 1);
    expect(removeData).toStrictEqual(400);
  });

  test('sender leaves Dm and is not owner', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userToken, [userData2.authUserId]);
    const dmId = data.dmId;

    const messageSendData = messageSendDm(userData2.token, dmId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const leaveData = dmLeave(userData2.token, dmId);
    expect(leaveData).toStrictEqual({});

    const removeData = messageRemove(userData2.token, messageId);
    expect(removeData).toStrictEqual(403);
  });

  test('guy not in Dm tries to remove', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userToken, [userData2.authUserId]);
    const dmId = data.dmId;

    const userData3 = authRegister('z1111211@ad.unsw.edu.au', 'password', 'Bigman', 'Pokemon');

    const messageSendData = messageSendDm(userData2.token, dmId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const removeData = messageRemove(userData3.token, messageId);
    expect(removeData).toStrictEqual(403);
  });

  test('the message was not sent by the authorised user making this request', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');

    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const setNameData = messageRemove(userData2.token, messageId);
    expect(setNameData).toStrictEqual(403);
  });

  test('the message was not sent by the authorised user making this request but user has perms', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const join = channelJoin(userData2.token, chanId);
    expect(join).toStrictEqual({});

    const messageSendData = messageSend(userData2.token, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const setNameData = messageRemove(userToken, messageId);
    expect(setNameData).toStrictEqual({});

    const checkMessageData = channelMessages(userToken, chanId, 0);
    expect(checkMessageData).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('the message was not sent by the authorised user making this request AND the user DOES NOT has perms channels', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const join = channelJoin(userData2.token, chanId);
    expect(join).toStrictEqual({});

    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const setNameData = messageRemove(userData2.token, messageId);
    expect(setNameData).toStrictEqual(403);
  });

  test('the message was not sent by the authorised user making this request AND the user DOES NOT has perms DM', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userToken, [userData2.authUserId]);
    const dmId = data.dmId;

    const messageSendData = messageSendDm(userToken, dmId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const setNameData = messageRemove(userData2.token, messageId);
    expect(setNameData).toStrictEqual(403);
  });

  test('messageId does not refer to a valid message within a channel/DM that the user has joined', () => {
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const setNameData = messageRemove(userToken, messageId + 1);
    expect(setNameData).toStrictEqual(400);
  });

  test('working case for Channel', () => {
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const setNameData = messageRemove(userToken, messageId);
    expect(setNameData).toStrictEqual({});

    const checkMessageData = channelMessages(userToken, chanId, 0);
    expect(checkMessageData).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('working case for DM', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userToken, [userData2.authUserId]);
    const dmId = data.dmId;

    const sendDmData = messageSendDm(userToken, dmId, 'Hello World');
    const messageId = sendDmData.messageId;

    const setNameData = messageRemove(userToken, messageId);
    expect(setNameData).toStrictEqual({});

    const messageData = dmMessages(userToken, dmId, 0);
    expect(messageData).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('testing remove for channel with existing messages', () => {
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messageSendData2 = messageSend(userToken, chanId, 'Wassup Homie');
    expect(messageSendData2).toStrictEqual({ messageId: messageSendData2.messageId });

    const setNameData = messageRemove(userToken, messageId);
    expect(setNameData).toStrictEqual({});

    const checkMessageData = channelMessages(userToken, chanId, 0);
    expect(checkMessageData).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: userId,
          message: 'Wassup Homie',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('remove for Dm with existing messages', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userToken, [userData2.authUserId]);
    const dmId = data.dmId;

    const sendDmData = messageSendDm(userToken, dmId, 'Hello World');
    const messageId = sendDmData.messageId;

    const sendDmData2 = messageSendDm(userToken, dmId, 'Hello World');
    expect(sendDmData2).toStrictEqual({ messageId: sendDmData2.messageId });

    const setNameData = messageRemove(userToken, messageId);
    expect(setNameData).toStrictEqual({});

    const messageData = dmMessages(userToken, dmId, 0);
    expect(messageData).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: userId,
          message: 'Hello World',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        }
      ],
      start: 0,
      end: -1,
    });
  });
});

describe('/message/senddm/v1', () => {
  const email = 'z5555555@ad.unsw.edu.au';
  const password = 'password';
  const nameFirst = 'Madhav';
  const nameLast = 'Mishra';

  let userData: AuthRegisterReturn;
  let dmDataId: number;
  beforeEach(() => {
    userData = authRegister(email, password, nameFirst, nameLast);
    const dmData = dmCreate(userData.token, []);
    dmDataId = dmData.dmId;
  });

  test('invalid token', () => {
    const sendDmRes = request(
      'POST',
      SERVER_URL + '/message/senddm/v1',
      {
        json: {
          token: userData.token + 1,
          dmId: dmDataId,
          message: 'Hello World'
        },
      }
    );

    const sendDmData = JSON.parse(sendDmRes.getBody() as string);

    expect(sendDmData).toStrictEqual(ERROR);
  });

  test('invalid dmId', () => {
    const sendDmRes = request(
      'POST',
      SERVER_URL + '/message/senddm/v1',
      {
        json: {
          token: userData.token,
          dmId: dmDataId + 1,
          message: 'Hello World'
        },
      }
    );

    const sendDmData = JSON.parse(sendDmRes.getBody() as string);

    expect(sendDmData).toStrictEqual(ERROR);
  });

  test('invalid message - message.length < 1', () => {
    const sendDmRes = request(
      'POST',
      SERVER_URL + '/message/senddm/v1',
      {
        json: {
          token: userData.token,
          dmId: dmDataId,
          message: ''
        },
      }
    );

    const sendDmData = JSON.parse(sendDmRes.getBody() as string);

    expect(sendDmData).toStrictEqual(ERROR);
  });

  test('invalid message - message.length < 1000', () => {
    const sendDmRes = request(
      'POST',
      SERVER_URL + '/message/senddm/v1',
      {
        json: {
          token: userData.token,
          dmId: dmDataId,
          message: 'a'.repeat(1001)
        },
      }
    );

    const sendDmData = JSON.parse(sendDmRes.getBody() as string);

    expect(sendDmData).toStrictEqual(ERROR);
  });

  test('valid dmId, user is not a member of DM', () => {
    const userData2 = authRegister('z4444444@ad.unsw.edu.au', 'password1', 'Charmander', 'Charizard');

    const sendDmRes = request(
      'POST',
      SERVER_URL + '/message/senddm/v1',
      {
        json: {
          token: userData2.token,
          dmId: dmDataId,
          message: 'Hello World'
        },
      }
    );

    const sendDmData = JSON.parse(sendDmRes.getBody() as string);

    expect(sendDmData).toStrictEqual(ERROR);
  });

  test('valid /message/senddm/v1', () => {
    const sendDmRes = request(
      'POST',
      SERVER_URL + '/message/senddm/v1',
      {
        json: {
          token: userData.token,
          dmId: dmDataId,
          message: 'Hello World'
        },
      }
    );

    const sendDmData = JSON.parse(sendDmRes.getBody() as string);

    expect(sendDmData).toStrictEqual({ messageId: expect.any(Number) });

    const messageData = dmMessages(userData.token, dmDataId, 0);

    expect(messageData).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: userData.authUserId,
          message: 'Hello World',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },

      ],
      start: 0,
      end: -1,
    }
    );
  });

  test('valid multiple /message/senddm/v1', () => {
    const sendDmRes1 = request(
      'POST',
      SERVER_URL + '/message/senddm/v1',
      {
        json: {
          token: userData.token,
          dmId: dmDataId,
          message: 'Hello World'
        },
      }
    );

    const sendDmRes2 = request(
      'POST',
      SERVER_URL + '/message/senddm/v1',
      {
        json: {
          token: userData.token,
          dmId: dmDataId,
          message: 'Hello'
        },
      }
    );

    const sendDmRes3 = request(
      'POST',
      SERVER_URL + '/message/senddm/v1',
      {
        json: {
          token: userData.token,
          dmId: dmDataId,
          message: 'Goodbye World'
        },
      }
    );

    const sendDmData1 = JSON.parse(sendDmRes1.getBody() as string);
    const sendDmData2 = JSON.parse(sendDmRes2.getBody() as string);
    const sendDmData3 = JSON.parse(sendDmRes3.getBody() as string);

    expect(sendDmData1).toStrictEqual({ messageId: expect.any(Number) });
    expect(sendDmData2).toStrictEqual({ messageId: expect.any(Number) });
    expect(sendDmData3).toStrictEqual({ messageId: expect.any(Number) });

    const messageData = dmMessages(userData.token, dmDataId, 0);

    expect(messageData).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: userData.authUserId,
          message: 'Goodbye World',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: expect.any(Number),
          uId: userData.authUserId,
          message: 'Hello',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: expect.any(Number),
          uId: userData.authUserId,
          message: 'Hello World',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        }
      ],
      start: 0,
      end: -1,
    }
    );
  });
});

describe('/message/pin/v1', () => {
  let userToken: string;
  let chanId: number;
  let userId: number;
  beforeEach(() => {
    const userData = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    userToken = userData.token;
    userId = userData.authUserId;

    chanId = channelsCreate(userToken, 'COMP1531', true).channelId;
  });

  test('invalid token', () => {
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messagePinData = messagePin(userToken + 1, messageId);
    expect(messagePinData).toStrictEqual(403);
  });

  test('invalid messageId in channel', () => {
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messagePinData = messagePin(userToken, messageId + 1);
    expect(messagePinData).toStrictEqual(400);
  });

  test('invalid messageId in Dm', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userToken, [userData2.authUserId]);
    const dmId = data.dmId;

    const messageSendData = messageSendDm(userData2.token, dmId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messagePinData = messagePin(userToken, messageId + 1);
    expect(messagePinData).toStrictEqual(400);
  });

  test('owner tries to pin message already pinned in channel', () => {
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messagePinData = messagePin(userToken, messageId);
    expect(messagePinData).toStrictEqual({});

    const messagePinData2 = messagePin(userToken, messageId);
    expect(messagePinData2).toStrictEqual(400);
  });

  test('owner tries to pin message already pinned in dm', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userToken, [userData2.authUserId]);
    const dmId = data.dmId;

    const messageSendData = messageSendDm(userToken, dmId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messagePinData = messagePin(userToken, messageId);
    expect(messagePinData).toStrictEqual({});

    const messagePinData2 = messagePin(userToken, messageId);
    expect(messagePinData2).toStrictEqual(400);
  });

  test('global owner attempts to pin message in dm', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userData2.token, [userId]);
    const dmId = data.dmId;

    const messageSendData = messageSendDm(userData2.token, dmId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messagePinData = messagePin(userToken, messageId);
    expect(messagePinData).toStrictEqual(403);
  });

  test('messageId valid but authUserId no owner permissions in channel', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const join = channelJoin(userData2.token, chanId);
    expect(join).toStrictEqual({});

    const messageSendData = messageSend(userData2.token, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messagePinData = messagePin(userData2.token, messageId);
    expect(messagePinData).toStrictEqual(403);
  });

  test('messageId valid but authUserId no owner permissions in dm', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userToken, [userData2.authUserId]);
    const dmId = data.dmId;

    const messageSendData = messageSendDm(userToken, dmId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messagePinData = messagePin(userData2.token, messageId);
    expect(messagePinData).toStrictEqual(403);
  });

  test('message successfully pinned in channel by owner', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const join = channelJoin(userData2.token, chanId);
    expect(join).toStrictEqual({});

    const messageSendData = messageSend(userData2.token, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messagePinData = messagePin(userToken, messageId);
    expect(messagePinData).toStrictEqual({});
  });

  test('message successfully pinned in channel by global owner', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const chanId2 = channelsCreate(userData2.token, 'Crunchie', true).channelId;
    const join = channelJoin(userToken, chanId2);
    expect(join).toStrictEqual({});

    const messageSendData = messageSend(userData2.token, chanId2, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messagePinData = messagePin(userToken, messageId);
    expect(messagePinData).toStrictEqual({});
  });

  test('message successfully pinned in dm', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userToken, [userData2.authUserId]);
    const dmId = data.dmId;

    const messageSendData = messageSendDm(userData2.token, dmId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messagePinData = messagePin(userToken, messageId);
    expect(messagePinData).toStrictEqual({});
  });
});

describe('/message/unpin/v1', () => {
  let userToken: string;
  let chanId: number;
  let userId: number;
  beforeEach(() => {
    const userData = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    userToken = userData.token;
    userId = userData.authUserId;

    chanId = channelsCreate(userToken, 'COMP1531', true).channelId;
  });

  test('invalid token', () => {
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messageUnpinData = messageUnpin(userToken + 1, messageId);
    expect(messageUnpinData).toStrictEqual(403);
  });

  test('invalid messageId in channel', () => {
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messageUnpinData = messageUnpin(userToken, messageId + 1);
    expect(messageUnpinData).toStrictEqual(400);
  });

  test('invalid messageId in Dm', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userToken, [userData2.authUserId]);
    const dmId = data.dmId;

    const messageSendData = messageSendDm(userData2.token, dmId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messageUnpinData = messageUnpin(userToken, messageId + 1);
    expect(messageUnpinData).toStrictEqual(400);
  });

  test('owner tries to unpin unpinned message in channel', () => {
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messageUnpinData = messageUnpin(userToken, messageId);
    expect(messageUnpinData).toStrictEqual(400);
  });

  test('owner tries to unpin unpinned message in dm', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userToken, [userData2.authUserId]);
    const dmId = data.dmId;

    const messageSendData = messageSendDm(userToken, dmId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messageUnpinData2 = messageUnpin(userToken, messageId);
    expect(messageUnpinData2).toStrictEqual(400);
  });

  test('global owner tries to unpin pinned message in dm', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userData2.token, [userId]);
    const dmId = data.dmId;

    const messageSendData = messageSendDm(userData2.token, dmId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messagePinData = messagePin(userData2.token, messageId);
    expect(messagePinData).toStrictEqual({});

    const messageUnpinData2 = messageUnpin(userToken, messageId);
    expect(messageUnpinData2).toStrictEqual(403);
  });

  test('messageId valid but authUserId no owner permissions in channel', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const join = channelJoin(userData2.token, chanId);
    expect(join).toStrictEqual({});

    const messageSendData = messageSend(userData2.token, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messagePinData = messagePin(userToken, messageId);
    expect(messagePinData).toStrictEqual({});
    const messageUnpinData = messageUnpin(userData2.token, messageId);
    expect(messageUnpinData).toStrictEqual(403);
  });

  test('messageId valid but authUserId no owner permissions in dm', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userToken, [userData2.authUserId]);
    const dmId = data.dmId;

    const messageSendData = messageSendDm(userToken, dmId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messagePinData = messagePin(userToken, messageId);
    expect(messagePinData).toStrictEqual({});

    const messageUnpinData = messageUnpin(userData2.token, messageId);
    expect(messageUnpinData).toStrictEqual(403);
  });

  test('message successfully unpinned in channel by owner', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const chanId2 = channelsCreate(userData2.token, 'Crunchie', true).channelId;

    const messageSendData = messageSend(userData2.token, chanId2, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messagePinData = messagePin(userData2.token, messageId);
    expect(messagePinData).toStrictEqual({});

    const messageUnpinData = messageUnpin(userData2.token, messageId);
    expect(messageUnpinData).toStrictEqual({});
  });

  test('message successfully unpinned in channel by global owner', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const chanId2 = channelsCreate(userData2.token, 'Crunchie', true).channelId;
    const join = channelJoin(userToken, chanId2);
    expect(join).toStrictEqual({});

    const messageSendData = messageSend(userData2.token, chanId2, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messagePinData = messagePin(userData2.token, messageId);
    expect(messagePinData).toStrictEqual({});

    const messageUnpinData = messageUnpin(userToken, messageId);
    expect(messageUnpinData).toStrictEqual({});
  });

  test('message successfully unpinned in dm', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userData2.token, [userId]);
    const dmId = data.dmId;

    const messageSendData = messageSendDm(userData2.token, dmId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messagePinData = messagePin(userData2.token, messageId);
    expect(messagePinData).toStrictEqual({});

    const messageUnpinData = messageUnpin(userData2.token, messageId);
    expect(messageUnpinData).toStrictEqual({});
  });
});

describe('/message/share/v1', () => {
  let userObj: AuthRegisterReturn;
  let channelObj: ChannelReturn;
  let dmObj: DmReturn;
  let dmOgMessage: MessageReturn;
  let channelOgMessage: MessageReturn;

  beforeEach(() => {
    userObj = authRegister('email@email.com', 'password', 'Madhav', 'Mishra');
    channelObj = channelsCreate(userObj.token, 'OOP', true);
    channelOgMessage = messageSend(userObj.token, channelObj.channelId, 'channel channel');
    dmObj = dmCreate(userObj.token, []);
    dmOgMessage = messageSendDm(userObj.token, dmObj.dmId, 'hello dm');
  });

  test('invalid channelId and dmId inputs', () => {
    expect(messageShare(userObj.token, channelOgMessage.messageId, '', channelObj.channelId + 1, dmObj.dmId + 1)).toStrictEqual(400);
    expect(messageShare(userObj.token, channelOgMessage.messageId, '', channelObj.channelId, dmObj.dmId)).toStrictEqual(400);
    expect(messageShare(userObj.token, channelOgMessage.messageId, '', channelObj.channelId + 1, -1)).toStrictEqual(400);
    expect(messageShare(userObj.token, channelOgMessage.messageId, '', -1, dmObj.dmId + 1)).toStrictEqual(400);
    expect(messageShare(userObj.token, channelOgMessage.messageId, '', -1, -1)).toStrictEqual(400);
  });

  test('ogMessageId does not refer to a valid messageId', () => {
    expect(messageShare(userObj.token, channelOgMessage.messageId + dmOgMessage.messageId + 1, '', channelObj.channelId, -1)).toStrictEqual(400);
    expect(messageShare(userObj.token, channelOgMessage.messageId + dmOgMessage.messageId + 1, '', -1, dmObj.dmId)).toStrictEqual(400);
  });

  test('message.length > 1000', () => {
    expect(messageShare(userObj.token, channelOgMessage.messageId, 'a'.repeat(1001), -1, dmObj.dmId)).toStrictEqual(400);
    expect(messageShare(userObj.token, channelOgMessage.messageId, 'a'.repeat(1001), channelObj.channelId, -1)).toStrictEqual(400);
  });

  test('invalid token', () => {
    expect(messageShare(userObj.token + 'invalid', channelOgMessage.messageId, '', -1, dmObj.dmId)).toStrictEqual(403);
  });

  test('user is not a member of the dm or channel', () => {
    const userObj2 = authRegister('z544444@ad.unsw.edu.au', 'password', 'Bobby', 'Fisher');
    expect(messageShare(userObj2.token, channelOgMessage.messageId, '', -1, dmObj.dmId)).toStrictEqual(403);
    expect(messageShare(userObj2.token, channelOgMessage.messageId, '', channelObj.channelId, -1)).toStrictEqual(403);
  });

  test('valid message share in dm from dm', () => {
    const dmObj2 = dmCreate(userObj.token, []);
    const sharedMessageObj = messageShare(userObj.token, dmOgMessage.messageId, '', -1, dmObj2.dmId);
    expect(sharedMessageObj).toStrictEqual({ sharedMessageId: expect.any(Number) });
    expect(dmMessages(userObj.token, dmObj2.dmId, 0)).toStrictEqual({
      start: 0,
      end: -1,
      messages: [
        {
          messageId: sharedMessageObj.sharedMessageId,
          uId: userObj.authUserId,
          message: 'hello dm',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        }
      ]
    });
  });

  test('valid message share in dm from channel', () => {
    const sharedMessageObj = messageShare(userObj.token, channelOgMessage.messageId, '', -1, dmObj.dmId);
    expect(sharedMessageObj).toStrictEqual({ sharedMessageId: expect.any(Number) });
    expect(dmMessages(userObj.token, dmObj.dmId, 0)).toStrictEqual({
      start: 0,
      end: -1,
      messages: [
        {
          messageId: sharedMessageObj.sharedMessageId,
          uId: userObj.authUserId,
          message: 'channel channel',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
        {
          messageId: dmOgMessage.messageId,
          uId: userObj.authUserId,
          message: 'hello dm',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
      ]
    });
  });

  test('valid message share in channel from channel', () => {
    const channelObj2 = channelsCreate(userObj.token, 'new channel', true);
    const sharedMessageObj = messageShare(userObj.token, channelOgMessage.messageId, '', channelObj2.channelId, -1);
    expect(sharedMessageObj).toStrictEqual({ sharedMessageId: expect.any(Number) });
    expect(channelMessages(userObj.token, channelObj2.channelId, 0)).toStrictEqual({
      start: 0,
      end: -1,
      messages: [
        {
          messageId: sharedMessageObj.sharedMessageId,
          uId: userObj.authUserId,
          message: 'channel channel',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        }
      ]
    });
  });

  test('valid message share in channel from dm', () => {
    const sharedMessageObj = messageShare(userObj.token, dmOgMessage.messageId, '', channelObj.channelId, -1);
    expect(sharedMessageObj).toStrictEqual({ sharedMessageId: expect.any(Number) });
    expect(channelMessages(userObj.token, channelObj.channelId, 0)).toStrictEqual({
      start: 0,
      end: -1,
      messages: [
        {
          messageId: sharedMessageObj.sharedMessageId,
          uId: userObj.authUserId,
          message: 'hello dm',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        },
        {
          messageId: channelOgMessage.messageId,
          uId: userObj.authUserId,
          message: 'channel channel',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        }
      ]
    });
  });

  test('valid message share includes ogmessage and message as substrings', () => {
    const channelObj2 = channelsCreate(userObj.token, 'new channel', true);
    const sharedMessageObj = messageShare(userObj.token, channelOgMessage.messageId, 'substring', channelObj2.channelId, -1);
    expect(sharedMessageObj).toStrictEqual({ sharedMessageId: expect.any(Number) });

    const channelMessagesObj = channelMessages(userObj.token, channelObj2.channelId, 0);
    expect(channelMessagesObj).toStrictEqual({
      start: 0,
      end: -1,
      messages: [
        {
          messageId: sharedMessageObj.sharedMessageId,
          uId: userObj.authUserId,
          message: expect.any(String),
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        }
      ]
    });

    expect(channelMessagesObj.messages[0].message).toContain('substring');
    expect(channelMessagesObj.messages[0].message).toContain('channel channel');
  });

  test('new message has no link to original message', () => {
    const channelObj2 = channelsCreate(userObj.token, 'new channel', true);
    const sharedMessageObj = messageShare(userObj.token, channelOgMessage.messageId, 'substring', channelObj2.channelId, -1);
    expect(sharedMessageObj).toStrictEqual({ sharedMessageId: expect.any(Number) });

    messageRemove(userObj.token, channelOgMessage.messageId);

    const channelMessagesObj = channelMessages(userObj.token, channelObj2.channelId, 0);
    expect(channelMessagesObj).toStrictEqual({
      start: 0,
      end: -1,
      messages: [
        {
          messageId: sharedMessageObj.sharedMessageId,
          uId: userObj.authUserId,
          message: expect.any(String),
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false
        }
      ]
    });

    expect(channelMessagesObj.messages[0].message).toContain('substring');
    expect(channelMessagesObj.messages[0].message).toContain('channel channel');
  });
});

describe('/message/react/v1', () => {
  let userToken: string;
  let userId: number;
  let chanId: number;
  const validReactId = 1;
  beforeEach(() => {
    const userData = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    userToken = userData.token;
    userId = userData.authUserId;

    chanId = channelsCreate(userToken, 'COMP1531', true).channelId;
  });

  test('invalid token', () => {
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messageReactData = messageReact(userToken + 1, messageId, validReactId);
    expect(messageReactData).toStrictEqual(403);
  });

  test('invalid messageId in channel', () => {
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messageReactData = messageReact(userToken, messageId + 1, validReactId);
    expect(messageReactData).toStrictEqual(400);
  });

  test('invalid messageId in Dm', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userToken, [userData2.authUserId]);
    const dmId = data.dmId;

    const messageSendData = messageSendDm(userData2.token, dmId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messageReactData = messageReact(userToken, messageId + 1, validReactId);
    expect(messageReactData).toStrictEqual(400);
  });

  test('invalid reactId in channel', () => {
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messageReactData = messageReact(userToken, messageId, validReactId + 1);
    expect(messageReactData).toStrictEqual(400);
  });

  test('invalid reactId in dm', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userToken, [userData2.authUserId]);
    const dmId = data.dmId;

    const messageSendData = messageSendDm(userData2.token, dmId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messageReactData = messageReact(userToken, messageId, validReactId + 1);
    expect(messageReactData).toStrictEqual(400);
  });

  test('user has already reacted to given message in channel', () => {
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messageReactData = messageReact(userToken, messageId, validReactId);
    expect(messageReactData).toStrictEqual({});

    const messageReactData2 = messageReact(userToken, messageId, validReactId);
    expect(messageReactData2).toStrictEqual(400);
  });

  test('user has already reacted to given message in dm', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userToken, [userData2.authUserId]);
    const dmId = data.dmId;

    const messageSendData = messageSendDm(userData2.token, dmId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messageReactData = messageReact(userToken, messageId, validReactId);
    expect(messageReactData).toStrictEqual({});

    const messageReactData2 = messageReact(userToken, messageId, validReactId);
    expect(messageReactData2).toStrictEqual(400);
  });

  test('successful message react in channel', () => {
    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messageReactData = messageReact(userToken, messageId, validReactId);
    expect(messageReactData).toStrictEqual({});

    expect(channelMessages(userToken, chanId, 0)).toStrictEqual({
      start: 0,
      end: -1,
      messages: [
        {
          messageId: messageId,
          uId: userId,
          message: 'Wassup G',
          timeSent: expect.any(Number),
          reacts: [
            {
              reactId: expect.any(Number),
              uIds: [userId],
              isThisUserReacted: true
            }
          ],
          isPinned: false
        }
      ]
    });
  });

  test('different user reacts to message with react in channel', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const channelJoinData = channelJoin(userData2.token, chanId);
    expect(channelJoinData).toStrictEqual({});

    const messageSendData = messageSend(userToken, chanId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messageReactData = messageReact(userToken, messageId, validReactId);
    expect(messageReactData).toStrictEqual({});

    const messageReactData2 = messageReact(userData2.token, messageId, validReactId);
    expect(messageReactData2).toStrictEqual({});
  });

  test('successful message react in dm ', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userToken, [userData2.authUserId]);
    const dmId = data.dmId;

    const messageSendData = messageSendDm(userData2.token, dmId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messageReactData = messageReact(userToken, messageId, validReactId);
    expect(messageReactData).toStrictEqual({});

    expect(dmMessages(userToken, dmId, 0)).toStrictEqual({
      start: 0,
      end: -1,
      messages: [
        {
          messageId: messageId,
          uId: userData2.authUserId,
          message: 'Wassup G',
          timeSent: expect.any(Number),
          reacts: [
            {
              reactId: expect.any(Number),
              uIds: [userId],
              isThisUserReacted: true
            }
          ],
          isPinned: false
        }
      ]
    });
  });

  test('different user reacts to message with react in dm ', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data = dmCreate(userToken, [userData2.authUserId]);
    const dmId = data.dmId;

    const messageSendData = messageSendDm(userData2.token, dmId, 'Wassup G');
    const messageId = messageSendData.messageId;

    const messageReactData = messageReact(userToken, messageId, validReactId);
    expect(messageReactData).toStrictEqual({});

    const messageReactData2 = messageReact(userData2.token, messageId, validReactId);
    expect(messageReactData2).toStrictEqual({});

    expect(dmMessages(userToken, dmId, 0)).toStrictEqual({
      start: 0,
      end: -1,
      messages: [
        {
          messageId: messageId,
          uId: userData2.authUserId,
          message: 'Wassup G',
          timeSent: expect.any(Number),
          reacts: [
            {
              reactId: expect.any(Number),
              uIds: [userId, userData2.authUserId],
              isThisUserReacted: true
            }
          ],
          isPinned: false
        }
      ]
    });
  });

  test('two messages in channel - user only reacted to 1 of them', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    expect(channelJoin(userData2.token, chanId)).toStrictEqual({});

    const messageSendData1 = messageSend(userToken, chanId, 'Wassup G - Charmander react to me plz');
    const messageId1 = messageSendData1.messageId;

    const messageSendData2 = messageSend(userToken, chanId, 'Wassup B - Madhav react to me plz');
    const messageId2 = messageSendData2.messageId;

    // charmander reacts to messageId1
    expect(messageReact(userData2.token, messageId1, validReactId)).toStrictEqual({});

    // madhav reacts to messageId2
    expect(messageReact(userToken, messageId2, validReactId)).toStrictEqual({});

    // when madhav calls channelMessages isThisUserReacted returns true only for messageId2
    expect(channelMessages(userToken, chanId, 0)).toStrictEqual({
      start: 0,
      end: -1,
      messages: [
        {
          messageId: messageId2,
          uId: userId,
          message: 'Wassup B - Madhav react to me plz',
          timeSent: expect.any(Number),
          reacts: [
            {
              reactId: expect.any(Number),
              uIds: [userId],
              isThisUserReacted: true // madhav has reacted to messageId2
            }
          ],
          isPinned: false
        },
        {
          messageId: messageId1,
          uId: userId,
          message: 'Wassup G - Charmander react to me plz',
          timeSent: expect.any(Number),
          reacts: [
            {
              reactId: expect.any(Number),
              uIds: [userData2.authUserId],
              isThisUserReacted: false // madhav has not reacted to messageId1
            }
          ],
          isPinned: false
        }
      ]
    });

    // when charmander calls channelMessages isThisUserReacted returns true only for messageId1
    expect(channelMessages(userData2.token, chanId, 0)).toStrictEqual({
      start: 0,
      end: -1,
      messages: [
        {
          messageId: messageId2,
          uId: userId,
          message: 'Wassup B - Madhav react to me plz',
          timeSent: expect.any(Number),
          reacts: [
            {
              reactId: expect.any(Number),
              uIds: [userId],
              isThisUserReacted: false // charmander has not reacted to messageId2
            }
          ],
          isPinned: false
        },
        {
          messageId: messageId1,
          uId: userId,
          message: 'Wassup G - Charmander react to me plz',
          timeSent: expect.any(Number),
          reacts: [
            {
              reactId: expect.any(Number),
              uIds: [userData2.authUserId],
              isThisUserReacted: true // charmander has reacted to messageId1
            }
          ],
          isPinned: false
        }
      ]
    });
  });

  test('two messages in dm - user only reacted to 1 of them', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const dmData = dmCreate(userToken, [userData2.authUserId]);

    const messageSendData1 = messageSendDm(userToken, dmData.dmId, 'Wassup G - Charmander react to me plz');
    const messageId1 = messageSendData1.messageId;

    const messageSendData2 = messageSendDm(userToken, dmData.dmId, 'Wassup B - Madhav react to me plz');
    const messageId2 = messageSendData2.messageId;

    // charmander reacts to messageId1
    expect(messageReact(userData2.token, messageId1, validReactId)).toStrictEqual({});

    // madhav reacts to messageId2
    expect(messageReact(userToken, messageId2, validReactId)).toStrictEqual({});

    // when madhav calls dmMessages isThisUserReacted returns true only for messageId2
    expect(dmMessages(userToken, dmData.dmId, 0)).toStrictEqual({
      start: 0,
      end: -1,
      messages: [
        {
          messageId: messageId2,
          uId: userId,
          message: 'Wassup B - Madhav react to me plz',
          timeSent: expect.any(Number),
          reacts: [
            {
              reactId: expect.any(Number),
              uIds: [userId],
              isThisUserReacted: true // madhav has reacted to messageId2
            }
          ],
          isPinned: false
        },
        {
          messageId: messageId1,
          uId: userId,
          message: 'Wassup G - Charmander react to me plz',
          timeSent: expect.any(Number),
          reacts: [
            {
              reactId: expect.any(Number),
              uIds: [userData2.authUserId],
              isThisUserReacted: false // madhav has not reacted to messageId1
            }
          ],
          isPinned: false
        }
      ]
    });

    // when charmander calls dmMessages isThisUserReacted returns true only for messageId1
    expect(dmMessages(userData2.token, dmData.dmId, 0)).toStrictEqual({
      start: 0,
      end: -1,
      messages: [
        {
          messageId: messageId2,
          uId: userId,
          message: 'Wassup B - Madhav react to me plz',
          timeSent: expect.any(Number),
          reacts: [
            {
              reactId: expect.any(Number),
              uIds: [userId],
              isThisUserReacted: false // charmander has not reacted to messageId2
            }
          ],
          isPinned: false
        },
        {
          messageId: messageId1,
          uId: userId,
          message: 'Wassup G - Charmander react to me plz',
          timeSent: expect.any(Number),
          reacts: [
            {
              reactId: expect.any(Number),
              uIds: [userData2.authUserId],
              isThisUserReacted: true // charmander has reacted to messageId1
            }
          ],
          isPinned: false
        }
      ]
    });
  });
});
