import { clearV1 } from './other.js';
import { authLoginV1, authRegisterV1 } from './auth.js';
import { userProfileV1 } from './users.js';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clearV1();
});

describe('userProfileV1', () => {
  test('invalid authUserId / uId in empty data', () => {
    expect(userProfileV1(1, 1)).toStrictEqual(ERROR);
  });

  test('invalid authUserId', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Madhav';
    const nameLast = 'Mishra';

    // add the user into the data
    const authUserObj = authRegisterV1(email, password, nameFirst, nameLast);
    expect(userProfileV1(authUserObj.authUserId + 1, authUserObj.authUserId)).toStrictEqual(ERROR);
  });

  test('invalid uId', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Madhav';
    const nameLast = 'Mishra';

    // add the user into the data
    const authUserObj = authRegisterV1(email, password, nameFirst, nameLast);
    expect(userProfileV1(authUserObj.authUserId, authUserObj.authUserId + 1)).toStrictEqual(ERROR);
  });

  test('invalid authUserId with multiple other users', () => {
    let email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Madhav';
    const nameLast = 'Mishra';

    let authUserObj;

    let arrayOfIds = [];
    for (let i = 0; i < 10; i++) {
      email = 'z5555555' + i + '@ad.unsw.edu.au';
      authUserObj = authRegisterV1(email, password, nameFirst, nameLast);

      arrayOfIds.push(authUserObj.authUserId);
    }

    // generate an id that doesn't exist
    let invalidId = Math.max.apply(null, arrayOfIds) + 1;

    expect(userProfileV1(invalidId, invalidId)).toStrictEqual(ERROR);
  });

  test('valid authUserId and uId', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Madhav';
    const nameLast = 'Mishra';

    const authUserObj = authRegisterV1(email, password, nameFirst, nameLast);

    // add the user into the data
    let userProfileObj = userProfileV1(authUserObj.authUserId, authUserObj.authUserId);
    expect(userProfileObj).toStrictEqual(
      {
        user: {
          uId: authUserObj.authUserId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
          handleStr: 'madhavmishra',
        }
      }
    );
  });

  test('multiple valid users', () => {
    const user1 = {
      email: 'charmander@ad.unsw.edu.au',
      password: 'password1',
      nameFirst: 'Charmander',
      nameLast: 'PokemonName1',
    };

    const user2 = {
      email: 'charmeleon@gmail.com',
      password: 'password2',
      nameFirst: 'Charmeleon',
      nameLast: 'PokemonName2',
    };

    const user3 = {
      email: 'charizard@yahoo.com',
      password: 'password3',
      nameFirst: 'Charizard',
      nameLast: 'PokemonName3',
    }

    const authUserObj1 = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast);
    const authUserObj2 = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast);
    const authUserObj3 = authRegisterV1(user3.email, user3.password, user3.nameFirst, user3.nameLast);

    let userProfileObj1 = userProfileV1(authUserObj1.authUserId, authUserObj1.authUserId);
    let userProfileObj2 = userProfileV1(authUserObj2.authUserId, authUserObj2.authUserId);
    let userProfileObj3 = userProfileV1(authUserObj3.authUserId, authUserObj3.authUserId);

    expect(userProfileObj1).toStrictEqual({
      user: {
        uId: authUserObj1.authUserId,
        email: 'charmander@ad.unsw.edu.au',
        nameFirst: 'Charmander',
        nameLast: 'PokemonName1',
        handleStr: 'charmanderpokemonnam',
      },
    });

    expect(userProfileObj2).toStrictEqual({
      user: {
        uId: authUserObj2.authUserId,
        email: 'charmeleon@gmail.com',
        nameFirst: 'Charmeleon',
        nameLast: 'PokemonName2',
        handleStr: 'charmeleonpokemonnam',
      },
    });

    expect(userProfileObj3).toStrictEqual({
      user: {
        uId: authUserObj3.authUserId,
        email: 'charizard@yahoo.com',
        nameFirst: 'Charizard',
        nameLast: 'PokemonName3',
        handleStr: 'charizardpokemonname',
      },
    });
  });
});