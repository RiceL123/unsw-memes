import { clear, authLogin, authRegister, authLogout, userProfile, authPasswordResetRequest, authPasswordResetReset } from './routeRequests';

const VALID_AUTH_RETURN = { token: expect.any(String), authUserId: expect.any(Number) };

interface AuthRegisterReturn {
  token: string;
  authUserId: number;
}

beforeEach(() => {
  clear();
});

describe('/auth/register/v3', () => {
  const email = 'z5555555@ad.unsw.edu.au';
  const password = 'password';
  const nameFirst = 'Madhav';
  const nameLast = 'Mishra';
  test('invalid email / password / nameFirst / nameLast inputs', () => {
    expect(authRegister('emailATemail.com', password, nameFirst, nameLast)).toStrictEqual(400);
    expect(authRegister('email@@email.com', password, nameFirst, nameLast)).toStrictEqual(400);
    expect(authRegister(email, '12345', nameFirst, nameLast)).toStrictEqual(400);
    expect(authRegister(email, password, '', nameLast)).toStrictEqual(400);
    expect(authRegister(email, password, '123456789012345678901234567890123456789012345678901', nameLast)).toStrictEqual(400);
    expect(authRegister(email, password, nameFirst, '')).toStrictEqual(400);
    expect(authRegister(email, password, nameFirst, '123456789012345678901234567890123456789012345678901')).toStrictEqual(400);
  });

  test('invalid email already used by another user', () => {
    expect(authRegister(email, password, nameFirst, nameLast)).toStrictEqual(VALID_AUTH_RETURN);
    expect(authRegister(email, password, nameFirst, nameLast)).toStrictEqual(400);
  });

  test.each([
    // control
    { email: email, password: password, nameFirst: nameFirst, nameLast: nameLast },
    // minimum nameFirst length = 1
    { email: email, password: password, nameFirst: '1', nameLast: nameLast },
    // maximum nameFirst length = 50
    { email: email, password: password, nameFirst: '12345678901234567890123456789012345678901234567890', nameLast: nameLast },
    // minimum nameLast length = 1
    { email: email, password: password, nameFirst: nameFirst, nameLast: '1' },
    // maximum nameLast length = 50
    { email: email, password: password, nameFirst: nameFirst, nameLast: '12345678901234567890123456789012345678901234567890' },
    // minimum password length = 6
    { email: email, password: '123456', nameFirst: nameFirst, nameLast: nameLast },
  ])('valid email / password / nameFirst / nameLast inputs', ({ email, password, nameFirst, nameLast }) => {
    expect(authRegister(email, password, nameFirst, nameLast)).toStrictEqual(VALID_AUTH_RETURN);
  });

  test('multiple valid users', () => {
    const data1 = authRegister('email1@email.com', 'password1', 'Madhav', 'Mishra');
    const data2 = authRegister('email2@email.com', 'password2', 'John', 'Smith');
    const data3 = authRegister('email3@email.com', 'password3', 'alskdafjg', 'IFAkajshd');

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

describe('/auth/register/v3 - handle generation', () => {
  const email = 'z5555555@ad.unsw.edu.au';
  const password = 'password';
  test.each([
    // concatenating of nameFirst + nameLast
    { email: email, password: password, nameFirst: 'madhav', nameLast: 'mishra', handleStr: 'madhavmishra' },
    // capping handleStrings at 20
    { email: email, password: password, nameFirst: 'maaaaaaadhav', nameLast: 'padmakumar', handleStr: 'maaaaaaadhavpadmakum' },
    // changing uppercase to lowercase
    { email: email, password: password, nameFirst: 'mAdHav', nameLast: 'MiShRa', handleStr: 'madhavmishra' },
    // remove of non-ascii
    { email: email, password: password, nameFirst: '!m#a$d%hav', nameLast: 'm^i&s&hra', handleStr: 'madhavmishra' },
    // removal of non-ascii characters + length > 20 + to lower case
    { email: email, password: password, nameFirst: '!m#aaaAaaa$d%Ha\\v', nameLast: 'P,a.D/m+A k-u)M(a&R', handleStr: 'maaaaaaadhavpadmakum' },
  ])('valid handleStr generation', ({ email, password, nameFirst, nameLast, handleStr }) => {
    const data = authRegister(email, password, nameFirst, nameLast);
    expect(data).toStrictEqual(VALID_AUTH_RETURN);

    const userObj = userProfile(data.token, data.authUserId);

    expect(userObj.user).toHaveProperty('handleStr');
    expect(userObj.user.handleStr).toStrictEqual(handleStr);
  });

  test('multiple users with same handleStr - appended number', () => {
    const data1 = authRegister('z555555@ad.unsw.edu.au', 'password1', 'madhav', 'mishra');
    const data2 = authRegister('z444444@ad.unsw.edu.au', 'password2', 'madhav', 'mishra');
    const data3 = authRegister('z333333@ad.unsw.edu.au', 'password3', 'madhav', 'mishra');

    expect(data1).toStrictEqual(VALID_AUTH_RETURN);
    expect(data2).toStrictEqual(VALID_AUTH_RETURN);
    expect(data3).toStrictEqual(VALID_AUTH_RETURN);

    const userObj1 = userProfile(data1.token, data1.authUserId);
    const userObj2 = userProfile(data2.token, data2.authUserId);
    const userObj3 = userProfile(data3.token, data3.authUserId);

    expect(userObj1.user).toHaveProperty('handleStr');
    expect(userObj1.user.handleStr).toStrictEqual('madhavmishra');

    expect(userObj2.user).toHaveProperty('handleStr');
    expect(userObj2.user.handleStr).toStrictEqual('madhavmishra0');

    expect(userObj3.user).toHaveProperty('handleStr');
    expect(userObj3.user.handleStr).toStrictEqual('madhavmishra1');
  });
});

describe('/auth/login/v3', () => {
  const email = '5555555@ad.unsw.edu.au';
  const password = 'password';
  let registered: AuthRegisterReturn;

  beforeEach(() => {
    registered = authRegister(email, password, 'Madhav', 'Mishra');
  });

  test('invalid email', () => {
    expect(authLogin('invalid' + email, password)).toStrictEqual(400);
  });

  test('invalid password', () => {
    expect(authLogin(email, password + 'invalid')).toStrictEqual(400);
  });

  test('valid login', () => {
    const loggedIn = authLogin(email, password);
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

    const registered2 = authRegister(email2, password2, 'John', 'Smith');
    const registered3 = authRegister(email3, password3, 'dylan', 'hazard');

    const loggedIn1 = authLogin(email, password);
    const loggedIn2 = authLogin(email2, password2);
    const loggedIn3 = authLogin(email3, password3);

    // first user login check
    expect(registered).toStrictEqual(VALID_AUTH_RETURN);
    expect(loggedIn1).toStrictEqual(VALID_AUTH_RETURN);

    expect(registered.authUserId).toStrictEqual(loggedIn1.authUserId);

    expect(registered.token).not.toStrictEqual(loggedIn1.token);

    // second user login check
    expect(registered2).toStrictEqual(VALID_AUTH_RETURN);
    expect(loggedIn2).toStrictEqual(VALID_AUTH_RETURN);

    expect(registered2.authUserId).toStrictEqual(loggedIn2.authUserId);

    expect(registered2.token).not.toStrictEqual(loggedIn2.token);

    // third user login check
    expect(registered3).toStrictEqual(VALID_AUTH_RETURN);
    expect(loggedIn3).toStrictEqual(VALID_AUTH_RETURN);

    expect(registered3.authUserId).toStrictEqual(loggedIn3.authUserId);

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

describe('/auth/logout/v2', () => {
  const email = '5555555@ad.unsw.edu.au';
  const password = 'password';
  const nameFirst = 'Madhav';
  const nameLast = 'Mishra';

  test('invalid token in empty data', () => {
    expect(authLogout('')).toStrictEqual(403);
  });

  let userObj: AuthRegisterReturn;
  beforeEach(() => {
    userObj = authRegister(email, password, nameFirst, nameLast);
  });

  test('invalid token in data', () => {
    expect(authLogout(userObj.token + 'invalid')).toStrictEqual(403);
  });

  test('invalid token, user already logged out', () => {
    expect(authLogout(userObj.token)).toStrictEqual({});
    expect(authLogout(userObj.token)).toStrictEqual(403);
  });

  test('valid logout', () => {
    expect(authLogout(userObj.token)).toStrictEqual({});
  });

  test('multiple valid logouts from 1 user', () => {
    const userObj2 = authLogin(email, password);
    const userObj3 = authLogin(email, password);

    expect(authLogout(userObj.token)).toStrictEqual({});
    expect(authLogout(userObj2.token)).toStrictEqual({});
    expect(authLogout(userObj3.token)).toStrictEqual({});
  });

  test('multiple valid logouts various users', () => {
    // register 2 more users
    const email2 = '6666666@ad.unsw.edu.au';
    const password2 = 'password';
    const nameFirst2 = 'John';
    const nameLast2 = 'Doe';
    const userObj2 = authRegister(email2, password2, nameFirst2, nameLast2);

    const email3 = '7777777@ad.unsw.edu.au';
    const password3 = 'password';
    const nameFirst3 = 'Jane';
    const nameLast3 = 'Doe';
    const userObj3 = authRegister(email3, password3, nameFirst3, nameLast3);

    expect(authLogout(userObj.token)).toStrictEqual({});
    expect(authLogout(userObj2.token)).toStrictEqual({});
    expect(authLogout(userObj3.token)).toStrictEqual({});
  });
});

describe('/auth/passwordreset/request/v1', () => {
  const email = 'z5422235@ad.unsw.edu.au';
  beforeEach(() => {
    authRegister(email, 'password1', 'madhav', 'mishra');
  });
  test('invalid email - not a user in db', () => {
    expect(authPasswordResetRequest('email@email.com')).toStrictEqual({});
  });

  test('valid email', () => {
    expect(authPasswordResetRequest(email)).toStrictEqual({});
  });
});

describe('/auth/passwordreset/reset/v1', () => {
  beforeEach(() => {
    authRegister('z555555@ad.unsw.edu.au', 'password1', 'madhav', 'mishra');
  });

  test('invalid reset code', () => {
    expect(authPasswordResetReset('', 'newPassword')).toStrictEqual(400);
  });

  test('invalid reset code', () => {
    expect(authPasswordResetReset('invalid-reset-code', 'newPassword')).toStrictEqual(400);
  });

  test('invalid password - (code is invalid as well)', () => {
    expect(authPasswordResetReset('', '12345')).toStrictEqual(400);
  });
});
