import { clearV1 } from './other.js';
import { authLoginV1, authRegisterV1 } from './auth.js';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    clearV1();
});

describe('authLoginV1', () => {
  test('valid email & password in empty data', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    expect(authLoginV1(email, password)).toStrictEqual(ERROR)
  });

  test('invalid email', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Madhav';
    const nameLast = 'Mishra';
    
    // add the user into the data
    authRegisterV1(email, password, nameFirst, nameLast);

    expect(authLoginV1('wrong_email', password)).toStrictEqual(ERROR);
  });

  test('invalid password with valid email', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Madhav';
    const nameLast = 'Mishra';
    
    // add the user into the data
    authRegisterV1(email, password, nameFirst, nameLast);

    expect(authLoginV1(email, 'wrong_password')).toStrictEqual(ERROR);
  });

  test('valid email and password', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Madhav';
    const nameLast = 'Mishra';
    
    // add the user into the data
    const authUserObj = authRegisterV1(email, password, nameFirst, nameLast);

    expect(authLoginV1(email, password)).toStrictEqual({
      authUserId: authUserObj.authUserId
    });
  });

  test(' multiple valid users', () => {
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
    }

    // add the user into the data
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

    expect(authLoginV1(user3.email, user2.password)).toStrictEqual({
      authUserId: authUserObj3.authUserId
    });
  });
});

describe('authRegisterV1', () => {
  test('invalid email', () => {
    const email = 'InvalidEmail';
    const password = 'password';
    const nameFirst = 'Madhav';
    const nameLast = 'Mishra';

    expect(authRegisterV1(email, password, nameFirst, nameLast)).toStrictEqual(ERROR);
  });

  test('invalid email', () => {
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
    const nameFirst = '111111111100000000001111111111000000000011111111110000000000';
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
    const nameLast = '111111111100000000001111111111000000000011111111110000000000';

    expect(authRegisterV1(email, password, nameFirst, nameLast)).toStrictEqual(ERROR);
  });

  test('valid user', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password'; 
    const nameFirst = 'Madhav';
    const nameLast = '111111111100000000001111111111000000000011111111110000000000';

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
    }

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
