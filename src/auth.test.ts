import request from 'sync-request';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

const ERROR = { error: expect.any(String) };
const VALID_AUTH_REGISTER = { token: expect.any(String), authUserId: expect.any(Number) };

beforeEach(() => {
  request(
    'DELETE',
    SERVER_URL + '/clear/v1'
  );
});

describe('/auth/register/v2', () => {
  const email = 'z5555555@ad.unsw.edu.au';
  const password = 'password';
  const nameFirst = 'Madhav';
  const nameLast = 'Mishra';

  test('invalid email - no @', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'invalidEmail',
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast,
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('invalid email - two @', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'invalid@Email@',
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast,
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('invalid email already used by another user', () => {
    const res1 = request(
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

    const data1 = JSON.parse(res1.getBody() as string);
    expect(data1).not.toStrictEqual(ERROR);

    // second post request should be invalid due to same email
    const res2 = request(
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

    const data2 = JSON.parse(res2.getBody() as string);
    expect(data2).toStrictEqual(ERROR);
  });

  test('invalid password - password.length < 6', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: email,
          password: '12345',
          nameFirst: nameFirst,
          nameLast: nameLast,
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('invalid nameFirst - nameFirst.length < 1', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: email,
          password: password,
          nameFirst: '',
          nameLast: nameLast,
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('invalid nameFirst - nameFirst.length > 50', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: email,
          password: password,
          nameFirst: '123456789012345678901234567890123456789012345678901',
          nameLast: nameLast,
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('invalid nameLast - nameLast.length < 1', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: '',
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('invalid nameLast - nameLast.length > 50', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: '123456789012345678901234567890123456789012345678901',
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('valid user - control test', () => {
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
    expect(data).toStrictEqual(VALID_AUTH_REGISTER);
  });

  test('valid user - nameFirst.length = 1', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: email,
          password: password,
          nameFirst: '1',
          nameLast: nameLast,
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(VALID_AUTH_REGISTER);
  });

  test('valid user - nameFirst.length = 50', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: email,
          password: password,
          nameFirst: '12345678901234567890123456789012345678901234567890',
          nameLast: nameLast,
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(VALID_AUTH_REGISTER);
  });

  test('valid user - nameLast.length = 1', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: '1',
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(VALID_AUTH_REGISTER);
  });

  test('valid user - nameLast.length = 50', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: '12345678901234567890123456789012345678901234567890',
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(VALID_AUTH_REGISTER);
  });

  test('valid user - password.length = 6', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: email,
          password: '123456',
          nameFirst: nameFirst,
          nameLast: nameLast,
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(VALID_AUTH_REGISTER);
  });

  test('multiple valid users', () => {
    const res1 = request(
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

    const res2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5444444@ad.unsw.edu.au',
          password: 'password,1',
          nameFirst: 'John',
          nameLast: 'Smith',
        }
      }
    );

    const res3 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5333333@ad.unsw.edu.au',
          password: 'password1',
          nameFirst: 'John',
          nameLast: 'Smith',
        }
      }
    );

    const data1 = JSON.parse(res1.getBody() as string);
    const data2 = JSON.parse(res2.getBody() as string);
    const data3 = JSON.parse(res3.getBody() as string);

    expect(data1).toStrictEqual(VALID_AUTH_REGISTER);
    expect(data2).toStrictEqual(VALID_AUTH_REGISTER);
    expect(data3).toStrictEqual(VALID_AUTH_REGISTER);

    // check uniqueness of user's authUserId's
    expect(data1.authUserId).not.toStrictEqual(data2.authUserId);
    expect(data1.authUserId).not.toStrictEqual(data3.authUserId);
    expect(data2.authUserId).not.toStrictEqual(data3.authUserId);

    // checking uniqueness of user's token's
    expect(data1.token).not.toStrictEqual(data2.token);
    expect(data1.token).not.toStrictEqual(data3.token);
    expect(data2.token).not.toStrictEqual(data3.token);
  });
});

describe('/auth/register/v2 - handle generation', () => {
  test('concatenating of nameFirst + nameLast', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'madhav';
    const nameLast = 'mishra';

    const register = request(
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

    const data = JSON.parse(register.getBody() as string);
    expect(data).toStrictEqual(VALID_AUTH_REGISTER);

    const profile = request(
      'GET',
      SERVER_URL + '/user/profile/v2',
      {
        qs: {
          token: data.token,
          uId: data.authUserId
        }
      }
    );
    const userObj = JSON.parse(profile.getBody() as string);
    expect(userObj.user).toHaveProperty('handleStr');
    expect(userObj.user.handleStr).toStrictEqual((nameFirst + nameLast));
  });

  test('concatenating of (nameFirst + nameLast).length > 20', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'maaaaaaadhav';
    const nameLast = 'padmakumar';

    const register = request(
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

    const data = JSON.parse(register.getBody() as string);
    expect(data).toStrictEqual(VALID_AUTH_REGISTER);

    const profile = request(
      'GET',
      SERVER_URL + '/user/profile/v2',
      {
        qs: {
          token: data.token,
          uId: data.authUserId
        }
      }
    );
    const userObj = JSON.parse(profile.getBody() as string);
    expect(userObj.user).toHaveProperty('handleStr');
    expect(userObj.user.handleStr).toStrictEqual((nameFirst + nameLast).slice(0, 20));
  });

  test('Changing uppercase to lowerCase', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'mAdHav';
    const nameLast = 'MiShRa';

    const register = request(
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

    const data = JSON.parse(register.getBody() as string);
    expect(data).toStrictEqual(VALID_AUTH_REGISTER);

    const profile = request(
      'GET',
      SERVER_URL + '/user/profile/v2',
      {
        qs: {
          token: data.token,
          uId: data.authUserId
        }
      }
    );
    const userObj = JSON.parse(profile.getBody() as string);
    expect(userObj.user).toHaveProperty('handleStr');
    expect(userObj.user.handleStr).toStrictEqual((nameFirst + nameLast).toLowerCase());
  });

  test('removal of non-ascii characters', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = '!m#a$d%hav';
    const nameLast = 'm^i&s&hra';

    const register = request(
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

    const data = JSON.parse(register.getBody() as string);
    expect(data).toStrictEqual(VALID_AUTH_REGISTER);

    const profile = request(
      'GET',
      SERVER_URL + '/user/profile/v2',
      {
        qs: {
          token: data.token,
          uId: data.authUserId
        }
      }
    );
    const userObj = JSON.parse(profile.getBody() as string);
    expect(userObj.user).toHaveProperty('handleStr');
    expect(userObj.user.handleStr).toStrictEqual('madhavmishra');
  });

  test('removal of non-ascii characters + length > 20 + to lower case', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = '!m#aaaAaaa$d%Ha\\v';
    const nameLast = 'P,a.D/m+A k-u)M(a&R';

    const register = request(
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

    const data = JSON.parse(register.getBody() as string);
    expect(data).toStrictEqual(VALID_AUTH_REGISTER);

    const profile = request(
      'GET',
      SERVER_URL + '/user/profile/v2',
      {
        qs: {
          token: data.token,
          uId: data.authUserId
        }
      }
    );
    const userObj = JSON.parse(profile.getBody() as string);
    expect(userObj.user).toHaveProperty('handleStr');
    expect(userObj.user.handleStr).toStrictEqual('maaaaaaadhavpadmakum');
  });
});
