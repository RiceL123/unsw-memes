import { clearV1 } from './other.js';
import { authLoginV1, authRegisterV1 } from './auth.js';
import { userProfileV1 } from './users.js';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clearV1();
});

describe('authLoginV1', () => {
  test('valid email & password in empty data', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    expect(authLoginV1(email, password)).toStrictEqual(ERROR);
  });

  test('invalid email', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Madhav';
    const nameLast = 'Mishra';

    authRegisterV1(email, password, nameFirst, nameLast);

    expect(authLoginV1('wrong_email', password)).toStrictEqual(ERROR);
  });

  test('invalid password with valid email', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Madhav';
    const nameLast = 'Mishra';

    authRegisterV1(email, password, nameFirst, nameLast);

    expect(authLoginV1(email, 'wrong_password')).toStrictEqual(ERROR);
  });

  test('valid email and password', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Madhav';
    const nameLast = 'Mishra';

    const authUserObj = authRegisterV1(email, password, nameFirst, nameLast);

    expect(authLoginV1(email, password)).toStrictEqual({
      authUserId: authUserObj.authUserId
    });
  });

  test('multiple valid users', () => {
    const user1 = {
      email: 'z5555555@ad.unsw.edu.au',
      password: 'password1',
      nameFirst: 'Madhav',
      nameLast: 'Mishra',
    };

    const user2 = {
      email: 'z5555555@gmail.com',
      password: 'password2',
      nameFirst: 'CoolName',
      nameLast: 'CoolLastName',
    };

    const user3 = {
      email: 'z5555555@yahoo.com',
      password: 'password3',
      nameFirst: 'AverageName',
      nameLast: 'AverageLastName',
    };

    const authUserObj1 = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast);
    const authUserObj2 = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast);
    const authUserObj3 = authRegisterV1(user3.email, user3.password, user3.nameFirst, user3.nameLast);

    // Check that they authUserIds generated are not the same / unique
    expect(authUserObj1.authUserId).not.toEqual(authUserObj2.authUserId);
    expect(authUserObj1.authUserId).not.toEqual(authUserObj3.authUserId);
    expect(authUserObj2.authUserId).not.toEqual(authUserObj3.authUserId);

    expect(authLoginV1(user1.email, user1.password)).toStrictEqual({
      authUserId: authUserObj1.authUserId
    });

    expect(authLoginV1(user2.email, user2.password)).toStrictEqual({
      authUserId: authUserObj2.authUserId
    });

    expect(authLoginV1(user3.email, user3.password)).toStrictEqual({
      authUserId: authUserObj3.authUserId
    });
  });
});

describe('authRegisterV1', () => {
  test('invalid email - no @', () => {
    const email = 'InvalidEmail';
    const password = 'password';
    const nameFirst = 'Madhav';
    const nameLast = 'Mishra';

    expect(authRegisterV1(email, password, nameFirst, nameLast)).toStrictEqual(ERROR);
  });

  test('invalid email - two @', () => {
    const email = '@_@';
    const password = 'password';
    const nameFirst = 'Madhav';
    const nameLast = 'Mishra';

    expect(authRegisterV1(email, password, nameFirst, nameLast)).toStrictEqual(ERROR);
  });

  test('invalid email already used by another user', () => {
    const user1 = {
      email: 'z5555555@ad.unsw.edu.au',
      password: 'password1',
      nameFirst: 'Madhav',
      nameLast: 'Mishra',
    };

    const user2 = {
      email: user1.email,
      password: 'password2',
      nameFirst: 'CoolName',
      nameLast: 'CoolLastName',
    };

    expect(authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast)).toStrictEqual({
      authUserId: expect.any(Number)
    });
    expect(authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast)).toStrictEqual(ERROR);
  });

  test('invalid password - password.length < 6', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = '5char';
    const nameFirst = 'Madhav';
    const nameLast = 'Mishra';

    expect(authRegisterV1(email, password, nameFirst, nameLast)).toStrictEqual(ERROR);
  });

  test('invalid nameFirst - nameFirst.length < 1', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = '';
    const nameLast = 'Mishra';

    expect(authRegisterV1(email, password, nameFirst, nameLast)).toStrictEqual(ERROR);
  });

  test('invalid nameFirst - nameFirst.length > 50', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = '111111111100000000001111111111000000000011111111110';
    const nameLast = 'Mishra';

    expect(authRegisterV1(email, password, nameFirst, nameLast)).toStrictEqual(ERROR);
  });

  test('invalid nameLast - nameLast.length < 1', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Madhav';
    const nameLast = '';

    expect(authRegisterV1(email, password, nameFirst, nameLast)).toStrictEqual(ERROR);
  });

  test('invalid nameLast - nameLast.length > 50', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Madhav';
    const nameLast = '111111111100000000001111111111000000000011111111110';

    expect(authRegisterV1(email, password, nameFirst, nameLast)).toStrictEqual(ERROR);
  });

  test('valid user - control test', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Madhav';
    const nameLast = 'Mishra';

    expect(authRegisterV1(email, password, nameFirst, nameLast)).toStrictEqual({
      authUserId: expect.any(Number)
    });
  });

  test('valid user - nameFirst.length = 1', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'M';
    const nameLast = 'Mishra';

    expect(authRegisterV1(email, password, nameFirst, nameLast)).toStrictEqual({
      authUserId: expect.any(Number)
    });
  });

  test('valid user - nameFirst.length = 50', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = '11111111110000000000111111111100000000001111111111';
    const nameLast = 'Mishra';

    expect(authRegisterV1(email, password, nameFirst, nameLast)).toStrictEqual({
      authUserId: expect.any(Number)
    });
  });

  test('valid user - nameLast.length = 1', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Madhav';
    const nameLast = '1';

    expect(authRegisterV1(email, password, nameFirst, nameLast)).toStrictEqual({
      authUserId: expect.any(Number)
    });
  });

  test('valid user - nameLast.length = 50', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Madhav';
    const nameLast = '11111111110000000000111111111100000000001111111111';

    expect(authRegisterV1(email, password, nameFirst, nameLast)).toStrictEqual({
      authUserId: expect.any(Number)
    });
  });

  test('valid user - password.length = 6', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = '123456';
    const nameFirst = 'Madhav';
    const nameLast = 'Mishra';

    expect(authRegisterV1(email, password, nameFirst, nameLast)).toStrictEqual({
      authUserId: expect.any(Number)
    });
  });

  test('multiple valid users', () => {
    const user1 = {
      email: 'madhav@ad.unsw.edu.au',
      password: 'password1',
      nameFirst: 'Madhav',
      nameLast: 'Mishra',
    };

    const user2 = {
      email: 'madhav@gmail.com',
      password: 'password2',
      nameFirst: 'CoolName',
      nameLast: 'CoolLastName',
    };

    const user3 = {
      email: 'madhav@yahoo.com',
      password: 'password3',
      nameFirst: 'AverageName',
      nameLast: 'AverageLastName',
    };

    const authUserObj1 = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast);
    const authUserObj2 = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast);
    const authUserObj3 = authRegisterV1(user3.email, user3.password, user3.nameFirst, user3.nameLast);

    expect(authUserObj1).toStrictEqual({
      authUserId: expect.any(Number)
    });

    expect(authUserObj2).toStrictEqual({
      authUserId: expect.any(Number)
    });

    expect(authUserObj3).toStrictEqual({
      authUserId: expect.any(Number)
    });

    // Check that they authUserIds generated are not the same / unique
    expect(authUserObj1.authUserId).not.toEqual(authUserObj2.authUserId);
    expect(authUserObj1.authUserId).not.toEqual(authUserObj3.authUserId);
    expect(authUserObj2.authUserId).not.toEqual(authUserObj3.authUserId);
  });
});

describe('authRegisterV1 - handleStr generation', () => {
  test('concatenating of nameFirst + nameLast', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'madhav';
    const nameLast = 'mishra';

    const authUserObj = authRegisterV1(email, password, nameFirst, nameLast);

    expect(userProfileV1(authUserObj.authUserId, authUserObj.authUserId)).toStrictEqual({
      user: {
        uId: authUserObj.authUserId,
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: 'madhavmishra'
      }
    });
  });

  test('concatenating of nameFirst + nameLast > 20', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = '1111100000';
    const nameLast = '111110000011111';

    const authUserObj = authRegisterV1(email, password, nameFirst, nameLast);

    expect(userProfileV1(authUserObj.authUserId, authUserObj.authUserId)).toStrictEqual({
      user: {
        uId: authUserObj.authUserId,
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: '11111000001111100000'
      }
    });
  });

  test('changing of Capital Letters to lowercase', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'MADhav';
    const nameLast = 'miSHRA';

    const authUserObj = authRegisterV1(email, password, nameFirst, nameLast);

    expect(userProfileV1(authUserObj.authUserId, authUserObj.authUserId)).toStrictEqual({
      user: {
        uId: authUserObj.authUserId,
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: 'madhavmishra'
      }
    });
  });

  test('removing of other ascii [^a-z0-9] characters', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = '~`!@#$%^&*()_+-=[]|":;\',./<>?  madhav,';
    const nameLast = 'mishra';

    const authUserObj = authRegisterV1(email, password, nameFirst, nameLast);

    expect(userProfileV1(authUserObj.authUserId, authUserObj.authUserId)).toStrictEqual({
      user: {
        uId: authUserObj.authUserId,
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: 'madhavmishra'
      }
    });
  });

  test('removing of non-ascii / utf-8 character', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = '💀҉廖晟辉ඞꁽㅋㅋ�𐂂𒂌madhav';
    const nameLast = 'mishra';

    const authUserObj = authRegisterV1(email, password, nameFirst, nameLast);

    expect(userProfileV1(authUserObj.authUserId, authUserObj.authUserId)).toStrictEqual({
      user: {
        uId: authUserObj.authUserId,
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: 'madhavmishra'
      }
    });
  });

  test('removing of non-ascii / utf-8 character + ascii [^a-z0-9] + changing to lowercase + concatenating to 20', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = '💀ඞ`!@#]|"\\,./ AAAAAaaaaa';
    const nameLast = 'BBBBBbbbbbCCCCCccccc';

    const authUserObj = authRegisterV1(email, password, nameFirst, nameLast);

    expect(userProfileV1(authUserObj.authUserId, authUserObj.authUserId)).toStrictEqual({
      user: {
        uId: authUserObj.authUserId,
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: 'aaaaaaaaaabbbbbbbbbb'
      }
    });
  });

  test('generating unique handle with appended 0', () => {
    const password = 'password';
    const nameFirst = 'madhav';
    const nameLast = 'mishra';

    const authUserObj = authRegisterV1('z5555555@ad.unsw.edu.au', password, nameFirst, nameLast);
    const authUserObj0 = authRegisterV1('z5444444@ad.unsw.edu.au', password, nameFirst, nameLast);

    expect(userProfileV1(authUserObj.authUserId, authUserObj.authUserId)).toStrictEqual({
      user: {
        uId: authUserObj.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: 'madhavmishra'
      }
    });
    expect(userProfileV1(authUserObj0.authUserId, authUserObj0.authUserId)).toStrictEqual({
      user: {
        uId: authUserObj0.authUserId,
        email: 'z5444444@ad.unsw.edu.au',
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: 'madhavmishra0'
      }
    });
  });

  test('generating unique handles with appended 0 after cutting to 20', () => {
    const password = 'password';
    const nameFirst = 'aaaaabbbbb';
    const nameLast = 'aaaaabbbbbaaaaa';

    const authUserObj = authRegisterV1('z5555555@ad.unsw.edu.au', password, nameFirst, nameLast);
    const authUserObj0 = authRegisterV1('z5444444@ad.unsw.edu.au', password, nameFirst, nameLast);

    expect(userProfileV1(authUserObj.authUserId, authUserObj.authUserId)).toStrictEqual({
      user: {
        uId: authUserObj.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: 'aaaaabbbbbaaaaabbbbb'
      }
    });
    expect(userProfileV1(authUserObj0.authUserId, authUserObj0.authUserId)).toStrictEqual({
      user: {
        uId: authUserObj0.authUserId,
        email: 'z5444444@ad.unsw.edu.au',
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: 'aaaaabbbbbaaaaabbbbb0'
      }
    });
  });

  test('generating multiple unique handles with appended numbers from 0 to 100 appropriately', () => {
    const password = 'password';
    const nameFirst = 'madhav';
    const nameLast = 'mishra';

    let authUserObj = authRegisterV1('z5555555@ad.unsw.edu.au', password, nameFirst, nameLast);
    expect(userProfileV1(authUserObj.authUserId, authUserObj.authUserId)).toStrictEqual({
      user: {
        uId: authUserObj.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: 'madhavmishra'
      }
    });

    // loop to check appending of int from 0 is correct
    let email;
    for (let i = 0; i < 100; i++) {
      email = 'z5555555' + i + '@ad.unsw.edu.au';
      authUserObj = authRegisterV1(email, password, nameFirst, nameLast);

      expect(userProfileV1(authUserObj.authUserId, authUserObj.authUserId)).toStrictEqual({
        user: {
          uId: authUserObj.authUserId,
          email: email,
          nameFirst: nameFirst,
          nameLast: nameLast,
          handleStr: 'madhavmishra' + i.toString()
        }
      });
    }
  });

  test('removing [^a-z0-9] characters, changing to lowercase, cutting to length 20 and generating multiple unique handles with appended numbers from 0 to 100 appropriately', () => {
    const password = 'password';
    const nameFirst = '💀ඞ`!@#]|"\\,./ AAAAAaaaaa';
    const nameLast = 'BBBBBbbbbbCCCCCccccc';

    let authUserObj = authRegisterV1('z5555555@ad.unsw.edu.au', password, nameFirst, nameLast);
    expect(userProfileV1(authUserObj.authUserId, authUserObj.authUserId)).toStrictEqual({
      user: {
        uId: authUserObj.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: 'aaaaaaaaaabbbbbbbbbb'
      }
    });

    // loop to check appending of int from 0 is correct
    let email;
    for (let i = 0; i <= 100; i++) {
      email = 'z5555555' + i + '@ad.unsw.edu.au';
      authUserObj = authRegisterV1(email, password, nameFirst, nameLast);
      expect(userProfileV1(authUserObj.authUserId, authUserObj.authUserId)).toStrictEqual({
        user: {
          uId: authUserObj.authUserId,
          email: email,
          nameFirst: nameFirst,
          nameLast: nameLast,
          handleStr: 'aaaaaaaaaabbbbbbbbbb' + i.toString()
        }
      });
    }
  });
});
