import request from 'sync-request';

import { port, url } from '../config.json';
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

describe('/user/profile/setname/v1', () => {
  const email = 'z5555555@ad.unsw.edu.au';
  const password = 'password';
  const nameFirst = 'Madhav';
  const nameLast = 'Mishra';
  const newNameFirst = 'Bruce';
  const newNameLast = 'Wayne';

  let userToken: string;
  let userId: number;
  beforeEach(() => {
    const userRequest1 = request(
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

    const data1 = JSON.parse(userRequest1.getBody() as string);
    userToken = data1.token;
    userId = data1.authUserId;
  });

  test('invalid token', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/setname/v1',
      {
        json: {
          token: userToken + 1,
          nameFirst: newNameFirst,
          nameLast: newNameLast,
        },
      }
    );
    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).toStrictEqual(ERROR);
  });

  test('invalid nameFirst - nameFirst.length < 1', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/setname/v1',
      {
        json: {
          token: userToken,
          nameFirst: '',
          nameLast: newNameLast,
        },
      }
    );
    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).toStrictEqual(ERROR);
  });

  test('invalid nameFirst - nameFirst.length > 50', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/setname/v1',
      {
        json: {
          token: userToken,
          nameFirst: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz',
          nameLast: newNameLast,
        },
      }
    );
    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).toStrictEqual(ERROR);
  });

  test('invalid nameLast - nameLast.length < 1', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/setname/v1',
      {
        json: {
          token: userToken,
          nameFirst: newNameFirst,
          nameLast: '',
        },
      }
    );
    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).toStrictEqual(ERROR);
  });

  test('invalid nameLast - nameLast.length > 50', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/setname/v1',
      {
        json: {
          token: userToken,
          nameFirst: newNameFirst,
          nameLast: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz',
        },
      }
    );
    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).toStrictEqual(ERROR);
  });

  test('invalid nameLast - nameLast.length > 50', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/setname/v1',
      {
        json: {
          token: userToken,
          nameFirst: newNameFirst,
          nameLast: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz',
        },
      }
    );
    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).toStrictEqual(ERROR);
  });

  test('valid name change - control', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/setname/v1',
      {
        json: {
          token: userToken,
          nameFirst: newNameFirst,
          nameLast: newNameLast,
        },
      }
    );
    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).toStrictEqual({});

    const viewRes = request(
      'GET',
      SERVER_URL + '/users/all/v1',
      {
        qs: {
          token: userToken,
        },
      }
    );

    const expectedArray: userObj[] = [
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Bruce',
        nameLast: 'Wayne',
        handleStr: 'madhavmishra'
      },
    ];

    const viewData = JSON.parse(viewRes.getBody() as string);
    expect(viewData.users).toStrictEqual(expectedArray);
  });

  test('valid name change - nameFirst.length = 1', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/setname/v1',
      {
        json: {
          token: userToken,
          nameFirst: 'a',
          nameLast: newNameLast,
        },
      }
    );
    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).toStrictEqual({});

    const viewRes = request(
      'GET',
      SERVER_URL + '/users/all/v1',
      {
        qs: {
          token: userToken,
        },
      }
    );

    const expectedArray: userObj[] = [
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'a',
        nameLast: 'Wayne',
        handleStr: 'madhavmishra'
      },
    ];

    const viewData = JSON.parse(viewRes.getBody() as string);
    expect(viewData.users).toStrictEqual(expectedArray);
  });

  test('valid name change - nameFirst.length = 50', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/setname/v1',
      {
        json: {
          token: userToken,
          nameFirst: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwx',
          nameLast: newNameLast,
        },
      }
    );
    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).toStrictEqual({});

    const viewRes = request(
      'GET',
      SERVER_URL + '/users/all/v1',
      {
        qs: {
          token: userToken,
        },
      }
    );

    const expectedArray: userObj[] = [
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwx',
        nameLast: 'Wayne',
        handleStr: 'madhavmishra'
      },
    ];

    const viewData = JSON.parse(viewRes.getBody() as string);
    expect(viewData.users).toStrictEqual(expectedArray);
  });

  test('valid name change - nameLast.length = 1', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/setname/v1',
      {
        json: {
          token: userToken,
          nameFirst: newNameFirst,
          nameLast: 'a',
        },
      }
    );
    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).toStrictEqual({});

    const viewRes = request(
      'GET',
      SERVER_URL + '/users/all/v1',
      {
        qs: {
          token: userToken,
        },
      }
    );

    const expectedArray: userObj[] = [
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Bruce',
        nameLast: 'a',
        handleStr: 'madhavmishra'
      },
    ];

    const viewData = JSON.parse(viewRes.getBody() as string);
    expect(viewData.users).toStrictEqual(expectedArray);
  });

  test('valid name change - nameLast.length = 50', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/setname/v1',
      {
        json: {
          token: userToken,
          nameFirst: newNameFirst,
          nameLast: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwx',
        },
      }
    );
    const setNameData = JSON.parse(setRes.getBody() as string);
    expect(setNameData).toStrictEqual({});

    const viewRes = request(
      'GET',
      SERVER_URL + '/users/all/v1',
      {
        qs: {
          token: userToken,
        },
      }
    );

    const expectedArray: userObj[] = [
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Bruce',
        nameLast: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwx',
        handleStr: 'madhavmishra'
      },
    ];

    const viewData = JSON.parse(viewRes.getBody() as string);
    expect(viewData.users).toStrictEqual(expectedArray);
  });

  test('multiple valid name change', () => {
    const userRequest2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z4444444@ad.unsw.edu.au',
          password: 'password2',
          nameFirst: 'John',
          nameLast: 'Smith',
        }
      }
    );

    const userRequest3 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z3333333@ad.unsw.edu.au',
          password: 'password3',
          nameFirst: 'James',
          nameLast: 'Smith',
        }
      }
    );

    const data2 = JSON.parse(userRequest2.getBody() as string);
    const data3 = JSON.parse(userRequest3.getBody() as string);

    const setRes1 = request(
      'PUT',
      SERVER_URL + '/user/profile/setname/v1',
      {
        json: {
          token: userToken,
          nameFirst: newNameFirst,
          nameLast: newNameLast,
        },
      }
    );

    const setRes2 = request(
      'PUT',
      SERVER_URL + '/user/profile/setname/v1',
      {
        json: {
          token: data2.token,
          nameFirst: 'Barry',
          nameLast: 'Allen',
        },
      }
    );

    const setRes3 = request(
      'PUT',
      SERVER_URL + '/user/profile/setname/v1',
      {
        json: {
          token: data3.token,
          nameFirst: 'Clark',
          nameLast: 'Kent',
        },
      }
    );
    const setNameData1 = JSON.parse(setRes1.getBody() as string);
    const setNameData2 = JSON.parse(setRes2.getBody() as string);
    const setNameData3 = JSON.parse(setRes3.getBody() as string);

    expect(setNameData1).toStrictEqual({});
    expect(setNameData2).toStrictEqual({});
    expect(setNameData3).toStrictEqual({});

    const viewRes = request(
      'GET',
      SERVER_URL + '/users/all/v1',
      {
        qs: {
          token: userToken,
        },
      }
    );

    const expectedArray: userObj[] = [
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Bruce',
        nameLast: 'Wayne',
        handleStr: 'madhavmishra'
      },
      {
        uId: data2.authUserId,
        email: 'z4444444@ad.unsw.edu.au',
        nameFirst: 'Barry',
        nameLast: 'Allen',
        handleStr: 'johnsmith'
      },
      {
        uId: data3.authUserId,
        email: 'z3333333@ad.unsw.edu.au',
        nameFirst: 'Clark',
        nameLast: 'Kent',
        handleStr: 'jamessmith'
      },
    ];

    const viewData = JSON.parse(viewRes.getBody() as string);
    expect(viewData.users).toStrictEqual(expectedArray);

    expect(viewData.users.sort((a: userObj, b: userObj) => a.uId - b.uId)).toStrictEqual(
      expectedArray.sort((a, b) => a.uId - b.uId)
    );
  });
});

describe('/user/profile/setEmail/v1', () => {
  const email = 'z5555555@ad.unsw.edu.au';
  const password = 'password';
  const nameFirst = 'Madhav';
  const nameLast = 'Mishra';
  const newEmail = 'z9999999@ad.unsw.edu.au';

  let userToken: string;
  let userId: number;
  beforeEach(() => {
    const userRequest1 = request(
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

    const data1 = JSON.parse(userRequest1.getBody() as string);
    userToken = data1.token;
    userId = data1.authUserId;
  });

  test('invalid token', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/setemail/v1',
      {
        json: {
          token: userToken + 1,
          email: newEmail,
        },
      }
    );
    const setEmailData = JSON.parse(setRes.getBody() as string);
    expect(setEmailData).toStrictEqual(ERROR);
  });

  test('invalid email - no @', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/setemail/v1',
      {
        json: {
          token: userToken,
          email: 'invalidEmail',
        },
      }
    );
    const setEmailData = JSON.parse(setRes.getBody() as string);
    expect(setEmailData).toStrictEqual(ERROR);
  });

  test('invalid email - two @', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/setemail/v1',
      {
        json: {
          token: userToken,
          email: 'invalid@Email@',
        },
      }
    );
    const setEmailData = JSON.parse(setRes.getBody() as string);
    expect(setEmailData).toStrictEqual(ERROR);
  });

  test('invalid email already used by another user', () => {
    const res2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z1111111@ad.unsw.edu.au',
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast,
        }
      }
    );

    const data2 = JSON.parse(res2.getBody() as string);

    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/setemail/v1',
      {
        json: {
          token: data2.token,
          email: email,
        },
      }
    );
    const setEmailData = JSON.parse(setRes.getBody() as string);
    expect(setEmailData).toStrictEqual(ERROR);
  });

  test('valid email - control', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/setemail/v1',
      {
        json: {
          token: userToken,
          email: newEmail,
        },
      }
    );
    const setEmailData = JSON.parse(setRes.getBody() as string);
    expect(setEmailData).toStrictEqual({});

    const viewRes = request(
      'GET',
      SERVER_URL + '/users/all/v1',
      {
        qs: {
          token: userToken,
        },
      }
    );

    const expectedArray: userObj[] = [
      {
        uId: userId,
        email: 'z9999999@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'madhavmishra'
      },
    ];

    const viewData = JSON.parse(viewRes.getBody() as string);
    expect(viewData.users).toStrictEqual(expectedArray);
  });

  test('valid email - multiple', () => {
    const userRequest2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z4444444@ad.unsw.edu.au',
          password: 'password2',
          nameFirst: 'John',
          nameLast: 'Smith',
        }
      }
    );

    const userRequest3 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z3333333@ad.unsw.edu.au',
          password: 'password3',
          nameFirst: 'James',
          nameLast: 'Smith',
        }
      }
    );

    const data2 = JSON.parse(userRequest2.getBody() as string);
    const data3 = JSON.parse(userRequest3.getBody() as string);

    const setRes1 = request(
      'PUT',
      SERVER_URL + '/user/profile/setemail/v1',
      {
        json: {
          token: userToken,
          email: newEmail,
        },
      }
    );

    const setRes2 = request(
      'PUT',
      SERVER_URL + '/user/profile/setemail/v1',
      {
        json: {
          token: data2.token,
          email: 'z8888888@ad.unsw.edu.au',
        },
      }
    );

    const setRes3 = request(
      'PUT',
      SERVER_URL + '/user/profile/setemail/v1',
      {
        json: {
          token: data3.token,
          email: 'z7777777@ad.unsw.edu.au',
        },
      }
    );
    const setEmailData1 = JSON.parse(setRes1.getBody() as string);
    const setEmailData2 = JSON.parse(setRes2.getBody() as string);
    const setEmailData3 = JSON.parse(setRes3.getBody() as string);
    expect(setEmailData1).toStrictEqual({});
    expect(setEmailData2).toStrictEqual({});
    expect(setEmailData3).toStrictEqual({});

    const viewRes = request(
      'GET',
      SERVER_URL + '/users/all/v1',
      {
        qs: {
          token: userToken,
        },
      }
    );

    const expectedArray: userObj[] = [
      {
        uId: userId,
        email: 'z9999999@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'madhavmishra'
      },
      {
        uId: data2.authUserId,
        email: 'z8888888@ad.unsw.edu.au',
        nameFirst: 'John',
        nameLast: 'Smith',
        handleStr: 'johnsmith'
      },
      {
        uId: data3.authUserId,
        email: 'z7777777@ad.unsw.edu.au',
        nameFirst: 'James',
        nameLast: 'Smith',
        handleStr: 'jamessmith'
      },
    ];

    const viewData = JSON.parse(viewRes.getBody() as string);
    expect(viewData.users).toStrictEqual(expectedArray);

    expect(viewData.users.sort((a: userObj, b: userObj) => a.uId - b.uId)).toStrictEqual(
      expectedArray.sort((a, b) => a.uId - b.uId)
    );
  });
});

describe('/user/profile/sethandle/v1', () => {
  const email = 'z5555555@ad.unsw.edu.au';
  const password = 'password';
  const nameFirst = 'Madhav';
  const nameLast = 'Mishra';
  const newHandle = 'batman';

  let userToken: string;
  let userId: number;
  beforeEach(() => {
    const userRequest1 = request(
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

    const data1 = JSON.parse(userRequest1.getBody() as string);
    userToken = data1.token;
    userId = data1.authUserId;
  });

  test('invalid token', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/sethandle/v1',
      {
        json: {
          token: userToken + 1,
          handleStr: newHandle,
        },
      }
    );
    const setHandleData = JSON.parse(setRes.getBody() as string);
    expect(setHandleData).toStrictEqual(ERROR);
  });

  test('invalid handleStr - handleStr.length < 3, length = 0', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/sethandle/v1',
      {
        json: {
          token: userToken,
          handleStr: '',
        },
      }
    );
    const setHandleData = JSON.parse(setRes.getBody() as string);
    expect(setHandleData).toStrictEqual(ERROR);
  });

  test('invalid handleStr - handleStr.length < 3, length = 1', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/sethandle/v1',
      {
        json: {
          token: userToken,
          handleStr: 'a',
        },
      }
    );
    const setHandleData = JSON.parse(setRes.getBody() as string);
    expect(setHandleData).toStrictEqual(ERROR);
  });

  test('invalid handleStr - handleStr.length < 3, length = 2', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/sethandle/v1',
      {
        json: {
          token: userToken,
          handleStr: 'ab',
        },
      }
    );
    const setHandleData = JSON.parse(setRes.getBody() as string);
    expect(setHandleData).toStrictEqual(ERROR);
  });

  test('invalid handleStr - handleStr.length > 20', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/sethandle/v1',
      {
        json: {
          token: userToken,
          handleStr: 'abcdefghijklmnopqrstuvwxyz',
        },
      }
    );
    const setHandleData = JSON.parse(setRes.getBody() as string);
    expect(setHandleData).toStrictEqual(ERROR);
  });

  test('invalid handleStr - contains non alphanumeric', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/sethandle/v1',
      {
        json: {
          token: userToken,
          handleStr: '!m#aaaAaaa$d%Ha\\v',
        },
      }
    );
    const setHandleData = JSON.parse(setRes.getBody() as string);
    expect(setHandleData).toStrictEqual(ERROR);
  });

  test('invalid handleStr - handleStr already in use', () => {
    const userRequest2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z4444444@ad.unsw.edu.au',
          password: 'password2',
          nameFirst: 'John',
          nameLast: 'Smith',
        }
      }
    );

    const data2 = JSON.parse(userRequest2.getBody() as string);

    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/sethandle/v1',
      {
        json: {
          token: data2.token,
          handleStr: 'madhavmishra',
        },
      }
    );
    const setHandleData = JSON.parse(setRes.getBody() as string);
    expect(setHandleData).toStrictEqual(ERROR);
  });

  test('valid handleStr - control', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/sethandle/v1',
      {
        json: {
          token: userToken,
          handleStr: newHandle,
        },
      }
    );
    const setHandleData = JSON.parse(setRes.getBody() as string);
    expect(setHandleData).toStrictEqual({});

    const viewRes = request(
      'GET',
      SERVER_URL + '/users/all/v1',
      {
        qs: {
          token: userToken,
        },
      }
    );

    const expectedArray: userObj[] = [
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'batman'
      },
    ];

    const viewData = JSON.parse(viewRes.getBody() as string);
    expect(viewData.users).toStrictEqual(expectedArray);
  });

  test('valid handleStr - alphanumeric', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/sethandle/v1',
      {
        json: {
          token: userToken,
          handleStr: '123iamvengeance123',
        },
      }
    );
    const setHandleData = JSON.parse(setRes.getBody() as string);
    expect(setHandleData).toStrictEqual({});

    const viewRes = request(
      'GET',
      SERVER_URL + '/users/all/v1',
      {
        qs: {
          token: userToken,
        },
      }
    );

    const expectedArray: userObj[] = [
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: '123iamvengeance123'
      },
    ];

    const viewData = JSON.parse(viewRes.getBody() as string);
    expect(viewData.users).toStrictEqual(expectedArray);
  });

  test('valid handleStr - handleStr.length = 3', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/sethandle/v1',
      {
        json: {
          token: userToken,
          handleStr: 'abc',
        },
      }
    );
    const setHandleData = JSON.parse(setRes.getBody() as string);
    expect(setHandleData).toStrictEqual({});

    const viewRes = request(
      'GET',
      SERVER_URL + '/users/all/v1',
      {
        qs: {
          token: userToken,
        },
      }
    );

    const expectedArray: userObj[] = [
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'abc'
      },
    ];

    const viewData = JSON.parse(viewRes.getBody() as string);
    expect(viewData.users).toStrictEqual(expectedArray);
  });

  test('valid handleStr - handleStr.length = 20', () => {
    const setRes = request(
      'PUT',
      SERVER_URL + '/user/profile/sethandle/v1',
      {
        json: {
          token: userToken,
          handleStr: 'abcdefghijklmnopqrst',
        },
      }
    );
    const setHandleData = JSON.parse(setRes.getBody() as string);
    expect(setHandleData).toStrictEqual({});

    const viewRes = request(
      'GET',
      SERVER_URL + '/users/all/v1',
      {
        qs: {
          token: userToken,
        },
      }
    );

    const expectedArray: userObj[] = [
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'abcdefghijklmnopqrst'
      },
    ];

    const viewData = JSON.parse(viewRes.getBody() as string);
    expect(viewData.users).toStrictEqual(expectedArray);
  });

  test('valid handleStr - multiple', () => {
    const userRequest2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z4444444@ad.unsw.edu.au',
          password: 'password2',
          nameFirst: 'John',
          nameLast: 'Smith',
        }
      }
    );

    const userRequest3 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z3333333@ad.unsw.edu.au',
          password: 'password3',
          nameFirst: 'James',
          nameLast: 'Smith',
        }
      }
    );

    const data2 = JSON.parse(userRequest2.getBody() as string);
    const data3 = JSON.parse(userRequest3.getBody() as string);

    const setRes1 = request(
      'PUT',
      SERVER_URL + '/user/profile/sethandle/v1',
      {
        json: {
          token: userToken,
          handleStr: newHandle,
        },
      }
    );

    const setRes2 = request(
      'PUT',
      SERVER_URL + '/user/profile/sethandle/v1',
      {
        json: {
          token: data2.token,
          handleStr: 'flash',
        },
      }
    );

    const setRes3 = request(
      'PUT',
      SERVER_URL + '/user/profile/sethandle/v1',
      {
        json: {
          token: data3.token,
          handleStr: 'superman420',
        },
      }
    );
    const setHandleData1 = JSON.parse(setRes1.getBody() as string);
    const setHandleData2 = JSON.parse(setRes2.getBody() as string);
    const setHandleData3 = JSON.parse(setRes3.getBody() as string);

    expect(setHandleData1).toStrictEqual({});
    expect(setHandleData2).toStrictEqual({});
    expect(setHandleData3).toStrictEqual({});

    const viewRes = request(
      'GET',
      SERVER_URL + '/users/all/v1',
      {
        qs: {
          token: userToken,
        },
      }
    );

    const expectedArray: userObj[] = [
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'batman'
      },
      {
        uId: data2.authUserId,
        email: 'z4444444@ad.unsw.edu.au',
        nameFirst: 'John',
        nameLast: 'Smith',
        handleStr: 'flash',
      },
      {
        uId: data3.authUserId,
        email: 'z3333333@ad.unsw.edu.au',
        nameFirst: 'James',
        nameLast: 'Smith',
        handleStr: 'superman420',
      },
    ];

    const viewData = JSON.parse(viewRes.getBody() as string);
    expect(viewData.users).toStrictEqual(expectedArray);

    expect(viewData.users.sort((a: userObj, b: userObj) => a.uId - b.uId)).toStrictEqual(
      expectedArray.sort((a, b) => a.uId - b.uId)
    );
  });
});
