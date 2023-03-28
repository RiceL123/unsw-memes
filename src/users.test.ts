import request from 'sync-request';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

const ERROR = { error: expect.any(String) };

interface userObj {
  uId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
}

beforeEach(() => {
  request(
    'DELETE',
    SERVER_URL + '/clear/v1'
  );
});

describe('/users/all/v1', () => {
  test('invalid token', () => {
    const userRequest1 = request(
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

    const data1 = JSON.parse(userRequest1.getBody() as string);

    const res = request(
      'GET',
      SERVER_URL + '/users/all/v1',
      {
        qs: {
          token: data1.token + 1,
        },
      }
    );
    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('valid token, shows 1 users', () => {
    const userRequest1 = request(
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

    const data1 = JSON.parse(userRequest1.getBody() as string);

    const viewRes = request(
      'GET',
      SERVER_URL + '/users/all/v1',
      {
        qs: {
          token: data1.token,
        },
      }
    );

    const expectedArray: userObj[] = [
      {
        uId: data1.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'madhavmishra'
      },
    ];

    const viewData = JSON.parse(viewRes.getBody() as string);
    expect(viewData.users).toStrictEqual(expectedArray);
  });

  test('valid token, shows multiple users', () => {
    const userRequest1 = request(
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

    const userRequest2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555554@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Charmander',
          nameLast: 'FireType',
        }
      }
    );

    const userRequest3 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555553@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Charizard',
          nameLast: 'Pokemon',
        }
      }
    );

    const data1 = JSON.parse(userRequest1.getBody() as string);
    const data2 = JSON.parse(userRequest2.getBody() as string);
    const data3 = JSON.parse(userRequest3.getBody() as string);

    const viewRes = request(
      'GET',
      SERVER_URL + '/users/all/v1',
      {
        qs: {
          token: data1.token,
        },
      }
    );

    const expectedArray: userObj[] = [
      {
        uId: data1.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'madhavmishra'
      },
      {
        uId: data2.authUserId,
        email: 'z5555554@ad.unsw.edu.au',
        nameFirst: 'Charmander',
        nameLast: 'FireType',
        handleStr: 'charmanderfiretype'
      },
      {
        uId: data3.authUserId,
        email: 'z5555553@ad.unsw.edu.au',
        nameFirst: 'Charizard',
        nameLast: 'Pokemon',
        handleStr: 'charizardpokemon'
      },

    ];

    const viewData = JSON.parse(viewRes.getBody() as string);
    expect(viewData.users).toStrictEqual(expectedArray);

    expect(viewData.users.sort((a: userObj, b: userObj) => a.uId - b.uId)).toStrictEqual(
      expectedArray.sort((a, b) => a.uId - b.uId)
    );
  });
});
