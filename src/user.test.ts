import request from 'sync-request';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  request(
    'DELETE',
    SERVER_URL + '/clear/v1'
  );
});

describe('/user/profile/V2', () => {
  const email = 'z5555555@ad.unsw.edu.au';
  const password = 'password';
  const nameFirst = 'Madhav';
  const nameLast = 'Mishra';

  test('invalid token / uId in empty data', () => {
    const res = request(
      'GET',
      SERVER_URL + '/user/profile/v2',
      {
        qs: {
          token: 1,
          uId: 1,
        },
      }
    );
    const data = JSON.parse(res.getBody() as string);

    expect(data).toStrictEqual(ERROR);
  });

  test('invalid uId', () => {
    const res = request(
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

    const data = JSON.parse(res.getBody() as string);

    const res2 = request(
      'GET',
      SERVER_URL + '/user/profile/v2',
      {
        qs: {
          token: data.token,
          uId: data.authUserId + 1,
        },
      }
    );

    const data2 = JSON.parse(res2.getBody() as string);

    expect(data2).toStrictEqual(ERROR);
  });

  test('invalid token', () => {
    const res = request(
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

    const data = JSON.parse(res.getBody() as string);

    const res2 = request(
      'GET',
      SERVER_URL + '/user/profile/v2',
      {
        qs: {
          token: data.token + 1,
          uId: data.authUserId,
        },
      }
    );

    const data2 = JSON.parse(res2.getBody() as string);

    expect(data2).toStrictEqual(ERROR);
  });

  test('valid uId and token', () => {
    const res = request(
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

    const data = JSON.parse(res.getBody() as string);

    const res2 = request(
      'GET',
      SERVER_URL + '/user/profile/v2',
      {
        qs: {
          token: data.token,
          uId: data.authUserId,
        },
      }
    );

    const data2 = JSON.parse(res2.getBody() as string);

    expect(data2).toStrictEqual(
      {
        user: {
          uId: data.authUserId,
          email: email,
          nameFirst: nameFirst,
          nameLast: nameLast,
          handleStr: 'madhavmishra'
        }
      }
    );
  });

  test('multiple valid users', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'charmander@ad.unsw.edu.au',
          password: 'password1',
          nameFirst: 'Charmander',
          nameLast: 'PokemonName1',
        }
      }
    );

    const res2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'charmeleon@gmail.com',
          password: 'password2',
          nameFirst: 'Charmeleon',
          nameLast: 'PokemonName2',
        }
      }
    );

    const res3 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'charizard@yahoo.com',
          password: 'password3',
          nameFirst: 'Charizard',
          nameLast: 'PokemonName3',
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    const data2 = JSON.parse(res2.getBody() as string);
    const data3 = JSON.parse(res3.getBody() as string);

    const res4 = request(
      'GET',
      SERVER_URL + '/user/profile/v2',
      {
        qs: {
          token: data.token,
          uId: data.authUserId,
        },
      }
    );

    const res5 = request(
      'GET',
      SERVER_URL + '/user/profile/v2',
      {
        qs: {
          token: data2.token,
          uId: data2.authUserId,
        },
      }
    );

    const res6 = request(
      'GET',
      SERVER_URL + '/user/profile/v2',
      {
        qs: {
          token: data3.token,
          uId: data3.authUserId,
        },
      }
    );

    const data4 = JSON.parse(res4.getBody() as string);
    const data5 = JSON.parse(res5.getBody() as string);
    const data6 = JSON.parse(res6.getBody() as string);

    expect(data4).toStrictEqual({
      user: {
        uId: data.authUserId,
        email: 'charmander@ad.unsw.edu.au',
        nameFirst: 'Charmander',
        nameLast: 'PokemonName1',
        handleStr: 'charmanderpokemonnam',
      },
    });

    expect(data5).toStrictEqual({
      user: {
        uId: data2.authUserId,
        email: 'charmeleon@gmail.com',
        nameFirst: 'Charmeleon',
        nameLast: 'PokemonName2',
        handleStr: 'charmeleonpokemonnam',
      },
    });

    expect(data6).toStrictEqual({
      user: {
        uId: data3.authUserId,
        email: 'charizard@yahoo.com',
        nameFirst: 'Charizard',
        nameLast: 'PokemonName3',
        handleStr: 'charizardpokemonname',
      },
    });
  });
});
