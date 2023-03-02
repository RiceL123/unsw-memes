import { clearV1 } from './other.js';
import { authRegisterV1 } from './auth.js';

describe('clearV1', () => {
  test('return value of clearV1 = {}', () => {
    expect(clearV1()).toStrictEqual({});
  });

  test('registering a user, clearing, then registering the same user should be valid', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password'; 
    const nameFirst = 'Madhav';
    const nameLast = 'Mishra';

    expect(authRegisterV1(email, password, nameFirst, nameLast)).toStrictEqual({
      authUserId: expect.any(Number)
    });

    // can't register the same person twice should return error
    expect(authRegisterV1(email, password, nameFirst, nameLast)).toStrictEqual({
      error: expect.any(String)
    });

    // clearing the data
    expect(clearV1()).toStrictEqual({});

    // now that the data has been cleared, you can register the same user again
    expect(authRegisterV1(email, password, nameFirst, nameLast)).toStrictEqual({
      authUserId: expect.any(Number)
    });    
  });
});