import request from 'sync-request';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

const ERROR = { error: expect.any(String) };
const VALID_AUTH_RETURN = { token: expect.any(String), authUserId: expect.any(Number) };

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
    expect(data).toStrictEqual(VALID_AUTH_RETURN);
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
    expect(data).toStrictEqual(VALID_AUTH_RETURN);
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
    expect(data).toStrictEqual(VALID_AUTH_RETURN);
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
    expect(data).toStrictEqual(VALID_AUTH_RETURN);
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
    expect(data).toStrictEqual(VALID_AUTH_RETURN);
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
    expect(data).toStrictEqual(VALID_AUTH_RETURN);
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

    expect(data1).toStrictEqual(VALID_AUTH_RETURN);
    expect(data2).toStrictEqual(VALID_AUTH_RETURN);
    expect(data3).toStrictEqual(VALID_AUTH_RETURN);

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
    expect(data).toStrictEqual(VALID_AUTH_RETURN);

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
    expect(data).toStrictEqual(VALID_AUTH_RETURN);

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
    expect(data).toStrictEqual(VALID_AUTH_RETURN);

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
    expect(data).toStrictEqual(VALID_AUTH_RETURN);

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
    expect(data).toStrictEqual(VALID_AUTH_RETURN);

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

describe('/auth/login/v2', () => {
  const email = '5555555@ad.unsw.edu.au';
  const password = 'password';
  let registered: AuthRegisterReturn;

  beforeEach(() => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: email,
          password: password,
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
        }
      }
    );
    registered = JSON.parse(res.getBody() as string);
  });

  test('invalid email', () => {
    const login = request(
      'POST',
      SERVER_URL + '/auth/login/v2',
      {
        json: {
          email: 'invalid' + email,
          password: password
        }
      }
    );

    const data = JSON.parse(login.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('invalid password', () => {
    const login = request(
      'POST',
      SERVER_URL + '/auth/login/v2',
      {
        json: {
          email: email,
          password: 'invalid' + password
        }
      }
    );

    const data = JSON.parse(login.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('valid login', () => {
    const login = request(
      'POST',
      SERVER_URL + '/auth/login/v2',
      {
        json: {
          email: email,
          password: password
        }
      }
    );

    const loggedIn = JSON.parse(login.getBody() as string);

    expect(registered).toStrictEqual(VALID_AUTH_RETURN);
    expect(loggedIn).toStrictEqual(VALID_AUTH_RETURN);

    // expect the authUserIds to be the same
    expect(registered.authUserId).toStrictEqual(loggedIn.authUserId);

    // expect the token to be different
    expect(registered.token).not.toStrictEqual(loggedIn.token);
  });

  test('valid login - multiple', () => {
    const email2 = 'z5444444@ad.unsw.edu.au';
    const password2 = 'password,1';
    const email3 = 'z5333333@ad.unsw.edu.au';
    const password3 = 'COMP2041';

    const res2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: email2,
          password: password2,
          nameFirst: 'Winne',
          nameLast: 'ThePooh',
        }
      }
    );

    const res3 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: email3,
          password: password3,
          nameFirst: 'Andrew',
          nameLast: 'Taylor',
        }
      }
    );

    const login1 = request(
      'POST',
      SERVER_URL + '/auth/login/v2',
      {
        json: {
          email: email,
          password: password
        }
      }
    );
    const login2 = request(
      'POST',
      SERVER_URL + '/auth/login/v2',
      {
        json: {
          email: email2,
          password: password2
        }
      }
    );

    const login3 = request(
      'POST',
      SERVER_URL + '/auth/login/v2',
      {
        json: {
          email: email3,
          password: password3
        }
      }
    );

    // first user login check
    const loggedIn1 = JSON.parse(login1.getBody() as string);

    expect(registered).toStrictEqual(VALID_AUTH_RETURN);
    expect(loggedIn1).toStrictEqual(VALID_AUTH_RETURN);

    // expect the authUserIds to be the same
    expect(registered.authUserId).toStrictEqual(loggedIn1.authUserId);

    // expect the token to be different
    expect(registered.token).not.toStrictEqual(loggedIn1.token);

    // second user login check
    const registered2 = JSON.parse(res2.getBody() as string);
    const loggedIn2 = JSON.parse(login2.getBody() as string);

    expect(registered2).toStrictEqual(VALID_AUTH_RETURN);
    expect(loggedIn2).toStrictEqual(VALID_AUTH_RETURN);

    // expect the authUserIds to be the same
    expect(registered2.authUserId).toStrictEqual(loggedIn2.authUserId);

    // expect the token to be different
    expect(registered2.token).not.toStrictEqual(loggedIn2.token);

    // third user login check
    const registered3 = JSON.parse(res3.getBody() as string);
    const loggedIn3 = JSON.parse(login3.getBody() as string);

    expect(registered3).toStrictEqual(VALID_AUTH_RETURN);
    expect(loggedIn3).toStrictEqual(VALID_AUTH_RETURN);

    // expect the authUserIds to be the same
    expect(registered3.authUserId).toStrictEqual(loggedIn3.authUserId);

    // expect the token to be different
    expect(registered3.token).not.toStrictEqual(loggedIn3.token);

    // check login authUserIds returned are unique
    expect(loggedIn1.authUserId).not.toStrictEqual(loggedIn2.authUserId);
    expect(loggedIn1.authUserId).not.toStrictEqual(loggedIn3.authUserId);
    expect(loggedIn2.authUserId).not.toStrictEqual(loggedIn3.authUserId);

    // check login tokens are unique
    expect(loggedIn1.token).not.toStrictEqual(loggedIn2.token);
    expect(loggedIn1.token).not.toStrictEqual(loggedIn3.token);
    expect(loggedIn2.token).not.toStrictEqual(loggedIn3.token);
  });
});

describe('/auth/logout/v1', () => {
  const email = '5555555@ad.unsw.edu.au';
  const password = 'password';
  const nameFirst = 'Madhav';
  const nameLast = 'Mishra';

  test('invalid token in empty data', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/logout/v1',
      {
        json: {
          token: ''
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  let userObj: AuthRegisterReturn;
  beforeEach(() => {
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
    userObj = JSON.parse(res.getBody() as string);
  });

  test('invalid token in data', () => {
    const logout = request(
      'POST',
      SERVER_URL + '/auth/logout/v1',
      {
        json: {
          token: userObj.token + 'invalid'
        }
      }
    );

    const data = JSON.parse(logout.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('invalid token, user already logged out', () => {
    const logout1 = request(
      'POST',
      SERVER_URL + '/auth/logout/v1',
      {
        json: {
          token: userObj.token
        }
      }
    );
    const data1 = JSON.parse(logout1.getBody() as string);
    expect(data1).toStrictEqual({});

    // logging out with the same token is invalid
    const logout2 = request(
      'POST',
      SERVER_URL + '/auth/logout/v1',
      {
        json: {
          token: userObj.token
        }
      }
    );
    const data2 = JSON.parse(logout2.getBody() as string);
    expect(data2).toStrictEqual(ERROR);
  });

  test('valid logout', () => {
    const logout1 = request(
      'POST',
      SERVER_URL + '/auth/logout/v1',
      {
        json: {
          token: userObj.token
        }
      }
    );
    const data1 = JSON.parse(logout1.getBody() as string);
    expect(data1).toStrictEqual({});
  });

  test('multiple valid logouts from 1 user', () => {
    // logging in the same account registered 2 more instances
    const login2 = request(
      'POST',
      SERVER_URL + '/auth/login/v2',
      {
        json: {
          email: email,
          password: password,
        }
      }
    );
    const login3 = request(
      'POST',
      SERVER_URL + '/auth/login/v2',
      {
        json: {
          email: email,
          password: password,
        }
      }
    );

    const userObj2 = JSON.parse(login2.getBody() as string);
    const userObj3 = JSON.parse(login3.getBody() as string);

    // logging out all instances
    const logout1 = request(
      'POST',
      SERVER_URL + '/auth/logout/v1',
      {
        json: {
          token: userObj.token
        }
      }
    );
    const logout2 = request(
      'POST',
      SERVER_URL + '/auth/logout/v1',
      {
        json: {
          token: userObj2.token
        }
      }
    );
    const logout3 = request(
      'POST',
      SERVER_URL + '/auth/logout/v1',
      {
        json: {
          token: userObj3.token
        }
      }
    );

    // expect 3 valid logouts with the same person
    const data1 = JSON.parse(logout1.getBody() as string);
    expect(data1).toStrictEqual({});

    const data2 = JSON.parse(logout2.getBody() as string);
    expect(data2).toStrictEqual({});

    const data3 = JSON.parse(logout3.getBody() as string);
    expect(data3).toStrictEqual({});
  });

  test('multiple valid logouts various users', () => {
    // register 2 more users
    const email2 = '6666666@ad.unsw.edu.au';
    const password2 = 'password';
    const nameFirst2 = 'John';
    const nameLast2 = 'Doe';
    const register2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: email2,
          password: password2,
          nameFirst: nameFirst2,
          nameLast: nameLast2,
        }
      }
    );
    const userObj2 = JSON.parse(register2.getBody() as string);

    const email3 = '7777777@ad.unsw.edu.au';
    const password3 = 'password';
    const nameFirst3 = 'Jane';
    const nameLast3 = 'Doe';
    const register3 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: email3,
          password: password3,
          nameFirst: nameFirst3,
          nameLast: nameLast3,
        }
      }
    );
    const userObj3 = JSON.parse(register3.getBody() as string);

    // log out all users
    const logout1 = request(
      'POST',
      SERVER_URL + '/auth/logout/v1',
      {
        json: {
          token: userObj.token
        }
      }
    );
    const logout2 = request(
      'POST',
      SERVER_URL + '/auth/logout/v1',
      {
        json: {
          token: userObj2.token
        }
      }
    );
    const logout3 = request(
      'POST',
      SERVER_URL + '/auth/logout/v1',
      {
        json: {
          token: userObj3.token
        }
      }
    );

    // expect 3 valid logouts from 3 different users
    const data1 = JSON.parse(logout1.getBody() as string);
    expect(data1).toStrictEqual({});

    const data2 = JSON.parse(logout2.getBody() as string);
    expect(data2).toStrictEqual({});

    const data3 = JSON.parse(logout3.getBody() as string);
    expect(data3).toStrictEqual({});
  });
});
