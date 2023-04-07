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
  request(
    'DELETE',
    SERVER_URL + '/clear/v1'
  );
});

describe('messageSendV1', () => {
  let userToken: string;
  let userId: number;
  let chanId: number;
  beforeEach(() => {
    const userRes = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
        }
      }
    );

    const userData = JSON.parse(userRes.getBody() as string);
    userToken = userData.token;
    userId = userData.authUserId;
    const channelRes = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userToken,
          name: 'Coding',
          isPublic: true,
        }
      }
    );
    const channelData = JSON.parse(channelRes.getBody() as string);
    chanId = channelData.channelId;
  });

  test('invalid channelId', () => {
    const messageRes = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userToken,
          channelId: chanId + 1,
          message: 'Wassup G',
        }
      }
    );

    const messageData = JSON.parse(messageRes.getBody() as string);

    expect(messageData).toStrictEqual(ERROR);
  });

  test('invalid message length minimum', () => {
    const messageRes = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          message: '',
        }
      }
    );

    const messageData = JSON.parse(messageRes.getBody() as string);

    expect(messageData).toStrictEqual(ERROR);
  });

  test('invalid message length maximum', () => {
    // generates 1001 character long string
    const messageLong = Array(1001).fill(undefined).map(() => Math.random().toString(36)[2]).join('');
    const messageRes = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          message: messageLong,
        }
      }
    );

    const messageData = JSON.parse(messageRes.getBody() as string);

    expect(messageData).toStrictEqual(ERROR);
  });

  test('invalid token', () => {
    const messageRes = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userToken + 1,
          channelId: chanId,
          message: 'Wassup G'
        }
      }
    );

    const messageData = JSON.parse(messageRes.getBody() as string);

    expect(messageData).toStrictEqual(ERROR);
  });

  test('valid channelId but authorised user is not a member', () => {
    const userRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z1111111@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Charmander',
          nameLast: 'Pokemon',
        }
      }
    );

    const userData2 = JSON.parse(userRes2.getBody() as string);

    const messageRes = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userData2.token,
          channelId: chanId,
          message: 'Wassup G',
        }
      }
    );

    const messageData = JSON.parse(messageRes.getBody() as string);
    expect(messageData).toStrictEqual(ERROR);
  });

  test('sending one message', () => {
    const expectedTime = Math.floor(Date.now() / 1000);
    const messageSendRes = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          message: 'Wassup G'
        }
      }
    );
    const messageSendData = JSON.parse(messageSendRes.getBody() as string);
    expect(messageSendData).toStrictEqual(VALID_MESSAGE);

    const messageRes = request(
      'GET',
      SERVER_URL + '/channel/messages/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
          start: 0,
        }
      }
    );

    const messageData = JSON.parse(messageRes.getBody() as string);

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
    const userRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z1111111@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Charmander',
          nameLast: 'Pokemon',
        }
      }
    );

    const userRes3 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z2222222@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Charizard',
          nameLast: 'Pokemon',
        }
      }
    );

    const userData2 = JSON.parse(userRes2.getBody() as string);
    const userData3 = JSON.parse(userRes3.getBody() as string);

    const channelRes2 = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userData2.token,
          name: 'Maths',
          isPublic: true,
        }
      }
    );

    const channelRes3 = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userData3.token,
          name: 'Commerce',
          isPublic: true,
        }
      }
    );

    const channelData2 = JSON.parse(channelRes2.getBody() as string);
    const channelData3 = JSON.parse(channelRes3.getBody() as string);

    const expectedTime = Math.floor(Date.now() / 1000);
    const messageSendRes = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          message: 'This is the first msg'
        }
      }
    );
    const messageSendData = JSON.parse(messageSendRes.getBody() as string);
    expect(messageSendData).toStrictEqual(VALID_MESSAGE);

    const expectedTime2 = Math.floor(Date.now() / 1000);
    const messageSendRes2 = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userData2.token,
          channelId: channelData2.channelId,
          message: 'This is the second msg'
        }
      }
    );
    const messageSendData2 = JSON.parse(messageSendRes2.getBody() as string);
    expect(messageSendData2).toStrictEqual(VALID_MESSAGE);

    const expectedTime3 = Math.floor(Date.now() / 1000);
    const messageSendRes3 = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userData3.token,
          channelId: channelData3.channelId,
          message: 'This is the third msg'
        }
      }
    );
    const messageSendData3 = JSON.parse(messageSendRes3.getBody() as string);
    expect(messageSendData3).toStrictEqual(VALID_MESSAGE);

    const messageRes = request(
      'GET',
      SERVER_URL + '/channel/messages/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
          start: 0,
        }
      }
    );

    const messageRes2 = request(
      'GET',
      SERVER_URL + '/channel/messages/v2',
      {
        qs: {
          token: userData2.token,
          channelId: channelData2.channelId,
          start: 0,
        }
      }
    );

    const messageRes3 = request(
      'GET',
      SERVER_URL + '/channel/messages/v2',
      {
        qs: {
          token: userData3.token,
          channelId: channelData3.channelId,
          start: 0,
        }
      }
    );
    const messageData = JSON.parse(messageRes.getBody() as string);
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

    const messageData2 = JSON.parse(messageRes2.getBody() as string);
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

    const messageData3 = JSON.parse(messageRes3.getBody() as string);
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
    const messageSendRes = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          message: 'Wassup G'
        }
      }
    );
    const messageSendData = JSON.parse(messageSendRes.getBody() as string);
    expect(messageSendData).toStrictEqual(VALID_MESSAGE);

    const messageSendRes2 = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          message: 'Hi G'
        }
      }
    );
    const messageSendData2 = JSON.parse(messageSendRes2.getBody() as string);
    expect(messageSendData2).toStrictEqual(VALID_MESSAGE);

    const messageSendRes3 = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          message: 'Yoo G'
        }
      }
    );
    const messageSendData3 = JSON.parse(messageSendRes3.getBody() as string);
    expect(messageSendData3).toStrictEqual(VALID_MESSAGE);

    const messageRes = request(
      'GET',
      SERVER_URL + '/channel/messages/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
          start: 0,
        }
      }
    );

    const messageData = JSON.parse(messageRes.getBody() as string);

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

describe('messageEditV1', () => {
  let userToken: string;
  let userId: number;
  let chanId: number;
  beforeEach(() => {
    const userRes = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
        }
      }
    );

    const userData = JSON.parse(userRes.getBody() as string);
    userToken = userData.token;
    userId = userData.authUserId;
    const channelRes = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userToken,
          name: 'Coding',
          isPublic: true,
        }
      }
    );
    const channelData = JSON.parse(channelRes.getBody() as string);
    chanId = channelData.channelId;
  });

  test('invalid token', () => {
    const messageRes = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          message: 'Wassup G'
        }
      }
    );

    const messageData = JSON.parse(messageRes.getBody() as string);
    const messageId = messageData.messageId;

    const setRes = request(
      'PUT',
      SERVER_URL + '/message/edit/v1',
      {
        json: {
          token: userToken + 1,
          messageId: messageId,
          message: 'This is the edited message',
        },
      }
    );
    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).toStrictEqual(ERROR);
  });

  test('invalid message length', () => {
    const messageRes = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          message: 'Wassup G'
        }
      }
    );

    const messageData = JSON.parse(messageRes.getBody() as string);
    const messageId = messageData.messageId;

    const messageLong = Array(1001).fill(undefined).map(() => Math.random().toString(36)[2]).join('');
    const setRes = request(
      'PUT',
      SERVER_URL + '/message/edit/v1',
      {
        json: {
          token: userToken,
          messageId: messageId,
          message: messageLong,
        },
      }
    );
    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).toStrictEqual(ERROR);
  });

  test('the message was not sent by the authorised user making this request', () => {
    const userRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z1111111@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Charmander',
          nameLast: 'Pokemon',
        }
      }
    );
    const userData2 = JSON.parse(userRes2.getBody() as string);

    const messageRes = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          message: 'Wassup G',
        }
      }
    );
    const messageData = JSON.parse(messageRes.getBody() as string);
    const messageId = messageData.messageId;

    const setRes = request(
      'PUT',
      SERVER_URL + '/message/edit/v1',
      {
        json: {
          token: userData2.token,
          messageId: messageId,
          message: 'This is the edited message',
        },
      }
    );

    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).toStrictEqual(ERROR);
  });

  test('the message was not sent by the authorised user making this request but user has perms', () => {
    const userRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z1111111@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Charmander',
          nameLast: 'Pokemon',
        }
      }
    );
    const userData2 = JSON.parse(userRes2.getBody() as string);

    const channelJoin = request(
      'POST',
      SERVER_URL + '/channel/join/v2',
      {
        json: {
          token: userData2.token,
          channelId: chanId,
        }
      }
    );

    const join = JSON.parse(channelJoin.getBody() as string);
    expect(join).not.toStrictEqual(ERROR);

    const messageRes = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userData2.token,
          channelId: chanId,
          message: 'Wassup G',
        }
      }
    );
    const messageData = JSON.parse(messageRes.getBody() as string);
    const messageId = messageData.messageId;

    const setRes = request(
      'PUT',
      SERVER_URL + '/message/edit/v1',
      {
        json: {
          token: userToken,
          messageId: messageId,
          message: 'This is the edited message',
        },
      }
    );
    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).not.toStrictEqual(ERROR);

    const messageReturn = request(
      'GET',
      SERVER_URL + '/channel/messages/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
          start: 0,
        }
      }
    );

    const checkMessageData = JSON.parse(messageReturn.getBody() as string);
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

  test('messageId does not refer to a valid message within a channel/DM that the user has joined', () => {
    const messageRes = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          message: 'Wassup G',
        }
      }
    );
    const messageData = JSON.parse(messageRes.getBody() as string);
    const messageId = messageData.messageId;

    const setRes = request(
      'PUT',
      SERVER_URL + '/message/edit/v1',
      {
        json: {
          token: userToken,
          messageId: messageId + 1,
          message: 'This is the edited message',
        },
      }
    );

    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).toStrictEqual(ERROR);
  });

  test('working case for Channel', () => {
    const messageRes = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          message: 'Wassup G',
        }
      }
    );
    const messageData = JSON.parse(messageRes.getBody() as string);
    const messageId = messageData.messageId;

    const setRes = request(
      'PUT',
      SERVER_URL + '/message/edit/v1',
      {
        json: {
          token: userToken,
          messageId: messageId,
          message: 'This is the edited message',
        },
      }
    );

    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).not.toStrictEqual(ERROR);

    const messageReturn = request(
      'GET',
      SERVER_URL + '/channel/messages/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
          start: 0,
        }
      }
    );

    const checkMessageData = JSON.parse(messageReturn.getBody() as string);
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
    const userRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z1111111@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Charmander',
          nameLast: 'Pokemon',
        }
      }
    );
    const userData2 = JSON.parse(userRes2.getBody() as string);

    const dmCreate = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userToken,
          uIds: [userData2.authUserId],
        }
      }
    );
    const data = JSON.parse(dmCreate.getBody() as string);
    const dmId = data.dmId;

    const sendDmRes = request(
      'POST',
      SERVER_URL + '/message/senddm/v1',
      {
        json: {
          token: userToken,
          dmId: dmId,
          message: 'Hello World'
        },
      }
    );

    const sendDmData = JSON.parse(sendDmRes.getBody() as string);
    const messageId = sendDmData.messageId;

    const setRes = request(
      'PUT',
      SERVER_URL + '/message/edit/v1',
      {
        json: {
          token: userToken,
          messageId: messageId,
          message: 'This is the edited message',
        },
      }
    );

    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).not.toStrictEqual(ERROR);

    const messageRes = request(
      'GET',
      SERVER_URL + '/dm/messages/v1',
      {
        qs: {
          token: userToken,
          dmId: dmId,
          start: 0,
        }
      }
    );

    const messageData = JSON.parse(messageRes.getBody() as string);
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

  test('empty string Channel', () => {
    const messageRes = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          message: 'Wassup G',
        }
      }
    );
    const messageData = JSON.parse(messageRes.getBody() as string);
    const messageId = messageData.messageId;

    const setRes = request(
      'PUT',
      SERVER_URL + '/message/edit/v1',
      {
        json: {
          token: userToken,
          messageId: messageId,
          message: '',
        },
      }
    );

    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).not.toStrictEqual(ERROR);

    const messageReturn = request(
      'GET',
      SERVER_URL + '/channel/messages/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
          start: 0,
        }
      }
    );

    const checkMessageData = JSON.parse(messageReturn.getBody() as string);
    expect(checkMessageData).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('empty string Channel with existing messages', () => {
    const messageRes = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          message: 'Wassup G',
        }
      }
    );
    const messageData = JSON.parse(messageRes.getBody() as string);
    const messageId = messageData.messageId;

    const messageRes2 = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          message: 'Wassup Homie',
        }
      }
    );
    const messageData2 = JSON.parse(messageRes2.getBody() as string);
    expect(messageData2).not.toStrictEqual(ERROR);

    const setRes = request(
      'PUT',
      SERVER_URL + '/message/edit/v1',
      {
        json: {
          token: userToken,
          messageId: messageId,
          message: '',
        },
      }
    );

    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).not.toStrictEqual(ERROR);

    const messageReturn = request(
      'GET',
      SERVER_URL + '/channel/messages/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
          start: 0,
        }
      }
    );

    const checkMessageData = JSON.parse(messageReturn.getBody() as string);
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
    const userRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z1111111@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Charmander',
          nameLast: 'Pokemon',
        }
      }
    );
    const userData2 = JSON.parse(userRes2.getBody() as string);

    const dmCreate = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userToken,
          uIds: [userData2.authUserId],
        }
      }
    );
    const data = JSON.parse(dmCreate.getBody() as string);
    const dmId = data.dmId;

    const sendDmRes = request(
      'POST',
      SERVER_URL + '/message/senddm/v1',
      {
        json: {
          token: userToken,
          dmId: dmId,
          message: 'Hello World'
        },
      }
    );

    const sendDmData = JSON.parse(sendDmRes.getBody() as string);
    const messageId = sendDmData.messageId;

    const sendDmRes2 = request(
      'POST',
      SERVER_URL + '/message/senddm/v1',
      {
        json: {
          token: userToken,
          dmId: dmId,
          message: 'Hello World2'
        },
      }
    );

    const sendDmData2 = JSON.parse(sendDmRes2.getBody() as string);
    expect(sendDmData2).not.toStrictEqual(ERROR);
    const setRes = request(
      'PUT',
      SERVER_URL + '/message/edit/v1',
      {
        json: {
          token: userToken,
          messageId: messageId,
          message: '',
        },
      }
    );

    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).not.toStrictEqual(ERROR);

    const messageRes = request(
      'GET',
      SERVER_URL + '/dm/messages/v1',
      {
        qs: {
          token: userToken,
          dmId: dmId,
          start: 0,
        }
      }
    );

    const messageData = JSON.parse(messageRes.getBody() as string);
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
    const userRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z1111111@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Charmander',
          nameLast: 'Pokemon',
        }
      }
    );
    const userData2 = JSON.parse(userRes2.getBody() as string);
    const userId2 = userData2.authUserId;

    const channelJoin = request(
      'POST',
      SERVER_URL + '/channel/join/v2',
      {
        json: {
          token: userData2.token,
          channelId: chanId,
        }
      }
    );

    const join = JSON.parse(channelJoin.getBody() as string);
    expect(join).not.toStrictEqual(ERROR);

    const messageRes = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userData2.token,
          channelId: chanId,
          message: 'Wassup G',
        }
      }
    );
    const messageData = JSON.parse(messageRes.getBody() as string);
    const messageId = messageData.messageId;

    const setRes = request(
      'PUT',
      SERVER_URL + '/message/edit/v1',
      {
        json: {
          token: userData2.token,
          messageId: messageId,
          message: 'Hello this is edited',
        },
      }
    );

    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).not.toStrictEqual(ERROR);

    const messageReturn = request(
      'GET',
      SERVER_URL + '/channel/messages/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
          start: 0,
        }
      }
    );

    const checkMessageData = JSON.parse(messageReturn.getBody() as string);
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

  test('sender leaves the channel, cannot edit', () => {
    const userRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z1111111@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Charmander',
          nameLast: 'Pokemon',
        }
      }
    );
    const userData2 = JSON.parse(userRes2.getBody() as string);
    const userId2 = userData2.authUserId;

    const channelJoin = request(
      'POST',
      SERVER_URL + '/channel/join/v2',
      {
        json: {
          token: userData2.token,
          channelId: chanId,
        }
      }
    );

    const join = JSON.parse(channelJoin.getBody() as string);
    expect(join).not.toStrictEqual(ERROR);

    const messageRes = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userData2.token,
          channelId: chanId,
          message: 'Wassup G',
        }
      }
    );
    const messageData = JSON.parse(messageRes.getBody() as string);
    const messageId = messageData.messageId;

    const leaveRes = request(
      'POST',
      SERVER_URL + '/channel/leave/v1',
      {
        json: {
          token: userData2.token,
          channelId: chanId,
        }
      }
    );
    const leaveData = JSON.parse(leaveRes.getBody() as string);
    expect(leaveData).not.toStrictEqual(ERROR);

    const setRes = request(
      'PUT',
      SERVER_URL + '/message/edit/v1',
      {
        json: {
          token: userData2.token,
          messageId: messageId,
          message: 'Hello this is edited',
        },
      }
    );

    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).toStrictEqual(ERROR);

    const messageReturn = request(
      'GET',
      SERVER_URL + '/channel/messages/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
          start: 0,
        }
      }
    );

    const checkMessageData = JSON.parse(messageReturn.getBody() as string);
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

describe('messageRemoveV1', () => {
  let userToken: string;
  let userId: number;
  let chanId: number;
  beforeEach(() => {
    const userRes = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
        }
      }
    );

    const userData = JSON.parse(userRes.getBody() as string);
    userToken = userData.token;
    userId = userData.authUserId;
    const channelRes = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userToken,
          name: 'Coding',
          isPublic: true,
        }
      }
    );
    const channelData = JSON.parse(channelRes.getBody() as string);
    chanId = channelData.channelId;
  });

  test('invalid token', () => {
    const messageRes = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          message: 'Wassup G'
        }
      }
    );

    const messageData = JSON.parse(messageRes.getBody() as string);
    const messageId = messageData.messageId;

    const setRes = request(
      'DELETE',
      SERVER_URL + '/message/remove/v1',
      {
        qs: {
          token: userToken + 1,
          messageId: messageId,
        },
      }
    );
    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).toStrictEqual(ERROR);
  });

  test('the message was not sent by the authorised user making this request', () => {
    const userRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z1111111@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Charmander',
          nameLast: 'Pokemon',
        }
      }
    );
    const userData2 = JSON.parse(userRes2.getBody() as string);

    const messageRes = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          message: 'Wassup G',
        }
      }
    );
    const messageData = JSON.parse(messageRes.getBody() as string);
    const messageId = messageData.messageId;

    const setRes = request(
      'DELETE',
      SERVER_URL + '/message/remove/v1',
      {
        qs: {
          token: userData2.token,
          messageId: messageId,
        },
      }
    );

    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).toStrictEqual(ERROR);
  });

  test('the message was not sent by the authorised user making this request but user has perms', () => {
    const userRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z1111111@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Charmander',
          nameLast: 'Pokemon',
        }
      }
    );
    const userData2 = JSON.parse(userRes2.getBody() as string);

    const channelJoin = request(
      'POST',
      SERVER_URL + '/channel/join/v2',
      {
        json: {
          token: userData2.token,
          channelId: chanId,
        }
      }
    );

    const join = JSON.parse(channelJoin.getBody() as string);
    expect(join).not.toStrictEqual(ERROR);

    const messageRes = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userData2.token,
          channelId: chanId,
          message: 'Wassup G',
        }
      }
    );
    const messageData = JSON.parse(messageRes.getBody() as string);
    const messageId = messageData.messageId;

    const setRes = request(
      'DELETE',
      SERVER_URL + '/message/remove/v1',
      {
        qs: {
          token: userToken,
          messageId: messageId,
        },
      }
    );
    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).not.toStrictEqual(ERROR);

    const messageReturn = request(
      'GET',
      SERVER_URL + '/channel/messages/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
          start: 0,
        }
      }
    );

    const checkMessageData = JSON.parse(messageReturn.getBody() as string);
    expect(checkMessageData).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('messageId does not refer to a valid message within a channel/DM that the user has joined', () => {
    const messageRes = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          message: 'Wassup G',
        }
      }
    );
    const messageData = JSON.parse(messageRes.getBody() as string);
    const messageId = messageData.messageId;

    const setRes = request(
      'DELETE',
      SERVER_URL + '/message/remove/v1',
      {
        qs: {
          token: userToken,
          messageId: messageId + 1,
        },
      }
    );

    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).toStrictEqual(ERROR);
  });

  test('working case for Channel', () => {
    const messageRes = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          message: 'Wassup G',
        }
      }
    );
    const messageData = JSON.parse(messageRes.getBody() as string);
    const messageId = messageData.messageId;
    const setRes = request(
      'DELETE',
      SERVER_URL + '/message/remove/v1',
      {
        qs: {
          token: userToken,
          messageId: messageId,
        },
      }
    );

    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).toStrictEqual({});

    const messageReturn = request(
      'GET',
      SERVER_URL + '/channel/messages/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
          start: 0,
        }
      }
    );

    const checkMessageData = JSON.parse(messageReturn.getBody() as string);
    expect(checkMessageData).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('working case for DM', () => {
    const userRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z1111111@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Charmander',
          nameLast: 'Pokemon',
        }
      }
    );

    const userData2 = JSON.parse(userRes2.getBody() as string);

    const dmCreate = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userToken,
          uIds: [userData2.authUserId]
        }
      }
    );
    const data = JSON.parse(dmCreate.getBody() as string);
    const dmId = data.dmId;

    const sendDmRes = request(
      'POST',
      SERVER_URL + '/message/senddm/v1',
      {
        json: {
          token: userToken,
          dmId: dmId,
          message: 'Hello World'
        },
      }
    );

    const sendDmData = JSON.parse(sendDmRes.getBody() as string);
    const messageId = sendDmData.messageId;

    const setRes = request(
      'DELETE',
      SERVER_URL + '/message/remove/v1',
      {
        qs: {
          token: userToken,
          messageId: messageId,
        },
      }
    );

    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).not.toStrictEqual(ERROR);

    const messageRes = request(
      'GET',
      SERVER_URL + '/dm/messages/v1',
      {
        qs: {
          token: userToken,
          dmId: dmId,
          start: 0,
        }
      }
    );

    const messageData = JSON.parse(messageRes.getBody() as string);
    expect(messageData).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('testing remove for channel with existing messages', () => {
    const messageRes = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          message: 'Wassup G',
        }
      }
    );
    const messageData = JSON.parse(messageRes.getBody() as string);
    const messageId = messageData.messageId;

    const messageRes2 = request(
      'POST',
      SERVER_URL + '/message/send/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          message: 'Wassup Homie',
        }
      }
    );
    const messageData2 = JSON.parse(messageRes2.getBody() as string);
    expect(messageData2).not.toStrictEqual(ERROR);

    const setRes = request(
      'DELETE',
      SERVER_URL + '/message/remove/v1',
      {
        qs: {
          token: userToken,
          messageId: messageId,
        },
      }
    );

    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).not.toStrictEqual(ERROR);

    const messageReturn = request(
      'GET',
      SERVER_URL + '/channel/messages/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
          start: 0,
        }
      }
    );

    const checkMessageData = JSON.parse(messageReturn.getBody() as string);
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
    const userRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z1111111@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Charmander',
          nameLast: 'Pokemon',
        }
      }
    );
    const userData2 = JSON.parse(userRes2.getBody() as string);

    const dmCreate = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userToken,
          uIds: [userData2.authUserId]
        }
      }
    );
    const data = JSON.parse(dmCreate.getBody() as string);
    const dmId = data.dmId;

    const sendDmRes = request(
      'POST',
      SERVER_URL + '/message/senddm/v1',
      {
        json: {
          token: userToken,
          dmId: dmId,
          message: 'Hello World'
        },
      }
    );

    const sendDmData = JSON.parse(sendDmRes.getBody() as string);
    const messageId = sendDmData.messageId;

    const sendDmRes2 = request(
      'POST',
      SERVER_URL + '/message/senddm/v1',
      {
        json: {
          token: userToken,
          dmId: dmId,
          message: 'Hello World'
        },
      }
    );

    const sendDmData2 = JSON.parse(sendDmRes2.getBody() as string);
    expect(sendDmData2).not.toStrictEqual(ERROR);

    const setRes = request(
      'DELETE',
      SERVER_URL + '/message/remove/v1',
      {
        qs: {
          token: userToken,
          messageId: messageId,
        },
      }
    );

    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).not.toStrictEqual(ERROR);

    const messageRes = request(
      'GET',
      SERVER_URL + '/dm/messages/v1',
      {
        qs: {
          token: userToken,
          dmId: dmId,
          start: 0,
        }
      }
    );

    const messageData = JSON.parse(messageRes.getBody() as string);
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
    const userRes = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast,
        }
      }
    );

    userData = JSON.parse(userRes.getBody() as string);

    const dmCreate = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userData.token,
          uIds: []
        }
      }
    );

    const dmData = JSON.parse(dmCreate.getBody() as string);
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
    const userRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z4444444@ad.unsw.edu.au',
          password: 'password1',
          nameFirst: 'Charmander',
          nameLast: 'Charizard',
        }
      }
    );

    const userData2 = JSON.parse(userRes2.getBody() as string);

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

    const messageRes = request(
      'GET',
      SERVER_URL + '/dm/messages/v1',
      {
        qs: {
          token: userData.token,
          dmId: dmDataId,
          start: 0,
        }
      }
    );

    const messageData = JSON.parse(messageRes.getBody() as string);

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

    const messageRes = request(
      'GET',
      SERVER_URL + '/dm/messages/v1',
      {
        qs: {
          token: userData.token,
          dmId: dmDataId,
          start: 0,
        }
      }
    );

    const messageData = JSON.parse(messageRes.getBody() as string);

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
