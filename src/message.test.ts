import request from 'sync-request';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

const ERROR = { error: expect.any(String) };

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
      SERVER_URL + '/auth/register/v2',
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
      SERVER_URL + '/auth/register/v2',
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
