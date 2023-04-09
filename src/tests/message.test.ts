import { clear, authRegister, dmCreate, dmLeave, dmMessages, channelMessages, channelLeave, channelJoin, channelsCreate, messageSend, messageEdit, messageRemove, messageSendDm } from './routeRequests';

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
        },
        {
          messageId: expect.any(Number),
          uId: userId,
          message: 'Hi G',
          timeSent: expect.any(Number),
        },
        {
          messageId: expect.any(Number),
          uId: userId,
          message: 'Wassup G',
          timeSent: expect.any(Number),
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
        },
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
        },
        {
          messageId: expect.any(Number),
          uId: userData.authUserId,
          message: 'Hello',
          timeSent: expect.any(Number),
        },
        {
          messageId: expect.any(Number),
          uId: userData.authUserId,
          message: 'Hello World',
          timeSent: expect.any(Number),
        }
      ],
      start: 0,
      end: -1,
    }
    );
  });
});
