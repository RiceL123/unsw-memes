import { clear, authRegister } from './routeRequests';

describe('/clear/v1', () => {
  test('correct return value', () => {
    expect(clear()).toStrictEqual({});
  });

  test('correctly clears dataStore', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'nameFirst';
    const nameLast = 'Mishra';

    expect(authRegister(email, password, nameFirst, nameLast)).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });

    // unable to register the same user twice
    expect(authRegister(email, password, nameFirst, nameLast)).not.toStrictEqual(200);

    expect(clear()).toStrictEqual({});

    // now the data has been cleared, the same user can sign up again
    expect(authRegister(email, password, nameFirst, nameLast)).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
  });
});
