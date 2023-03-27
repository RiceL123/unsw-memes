import request from 'sync-request';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

const ERROR = { error: expect.any(String) };
const VALID_DM_RETURN = { dmId: expect.any(Number) };

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

describe('/dm/create/v1', () => {
  let userObj: AuthRegisterReturn;

  beforeEach(() => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
        }
      }
    );
    userObj = JSON.parse(res.getBody() as string);
  });

  test('invalid token', () => {
    const dmCreate = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token + 'invalid',
          uIds: []
        }
      }
    );
    const data = JSON.parse(dmCreate.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('invalid uId - does not refer to valid user', () => {
    const dmCreate = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: [userObj.authUserId + 1]
        }
      }
    );

    const data = JSON.parse(dmCreate.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('invalid uId - duplicate uIds', () => {
    const dmCreate = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: [userObj.authUserId]
        }
      }
    );

    const data = JSON.parse(dmCreate.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('valid dm creation - empty uId array', () => {
    const dmCreate = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: []
        }
      }
    );

    const data = JSON.parse(dmCreate.getBody() as string);
    expect(data).toStrictEqual(VALID_DM_RETURN);
  });

  test('valid dm creation - multiple uIds', () => {
    // register another 2 more users
    const res2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5444444@ad.unsw.edu.au',
          password: 'validPassword,1',
          nameFirst: 'Shouko',
          nameLast: 'Nishimiya',
        }
      }
    );

    const res3 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5333333@ad.unsw.edu.au',
          password: 'hearingAidsLmao,1',
          nameFirst: 'shouya',
          nameLast: 'ishida',
        }
      }
    );
    const userObj2 = JSON.parse(res2.getBody() as string);
    const userObj3 = JSON.parse(res3.getBody() as string);

    // creating a dm with three members
    const dmCreate = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: [userObj2.authUserId, userObj3.authUserId]
        }
      }
    );

    const data = JSON.parse(dmCreate.getBody() as string);
    expect(data).toStrictEqual(VALID_DM_RETURN);
  });

  test('multiple dms', () => {
    // register another 2 more users
    const res2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5444444@ad.unsw.edu.au',
          password: 'validPassword,1',
          nameFirst: 'Shouko',
          nameLast: 'Nishimiya',
        }
      }
    );

    const res3 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5333333@ad.unsw.edu.au',
          password: 'hearingAidsLmao,1',
          nameFirst: 'shouya',
          nameLast: 'ishida',
        }
      }
    );
    const userObj2 = JSON.parse(res2.getBody() as string);
    const userObj3 = JSON.parse(res3.getBody() as string);

    // creating multiple dms
    const dmCreate1 = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: [userObj2.authUserId]
        }
      }
    );

    const dmCreate2 = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: [userObj3.authUserId]
        }
      }
    );

    const dmCreate3 = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: [userObj2.authUserId, userObj3.authUserId]
        }
      }
    );

    const data1 = JSON.parse(dmCreate1.getBody() as string);
    expect(data1).toStrictEqual(VALID_DM_RETURN);

    const data2 = JSON.parse(dmCreate2.getBody() as string);
    expect(data2).toStrictEqual(VALID_DM_RETURN);

    const data3 = JSON.parse(dmCreate3.getBody() as string);
    expect(data3).toStrictEqual(VALID_DM_RETURN);

    // expect dmIds to be unique
    expect(data1.dmId).not.toStrictEqual(data2.dmId);
    expect(data1.dmId).not.toStrictEqual(data3.dmId);
    expect(data2.dmId).not.toStrictEqual(data3.dmId);
  });
});

describe('/dm/create/v1 dm name generation', () => {
  expect(1).toStrictEqual(1);
});
