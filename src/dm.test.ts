import request from 'sync-request';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

const ERROR = { error: expect.any(String) };
const VALID_DM_RETURN = { dmId: expect.any(Number) };

interface AuthRegisterReturn {
  token: string;
  authUserId: number;
}

interface DmCreateReturn {
  dmId: number;
}

interface User {
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

describe('/dm/create/v1', () => {
  let userObj: AuthRegisterReturn;

  beforeEach(() => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
        }
      }
    );
    userObj = JSON.parse(res.getBody() as string);
  });

  test('invalid token', () => {
    const dmCreate = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token + 'invalid',
          uIds: []
        }
      }
    );
    const data = JSON.parse(dmCreate.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('invalid uId - does not refer to valid user', () => {
    const dmCreate = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: [userObj.authUserId + 1]
        }
      }
    );

    const data = JSON.parse(dmCreate.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('invalid uId - duplicate uIds', () => {
    const dmCreate = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: [userObj.authUserId]
        }
      }
    );

    const data = JSON.parse(dmCreate.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('valid dm creation - empty uId array', () => {
    const dmCreate = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: []
        }
      }
    );

    const data = JSON.parse(dmCreate.getBody() as string);
    expect(data).toStrictEqual(VALID_DM_RETURN);
  });

  test('valid dm creation - multiple uIds', () => {
    // register another 2 more users
    const res2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5444444@ad.unsw.edu.au',
          password: 'validPassword,1',
          nameFirst: 'Shouko',
          nameLast: 'Nishimiya',
        }
      }
    );

    const res3 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5333333@ad.unsw.edu.au',
          password: 'hearingAidsLmao,1',
          nameFirst: 'shouya',
          nameLast: 'ishida',
        }
      }
    );
    const userObj2 = JSON.parse(res2.getBody() as string);
    const userObj3 = JSON.parse(res3.getBody() as string);

    // creating a dm with three members
    const dmCreate = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: [userObj2.authUserId, userObj3.authUserId]
        }
      }
    );

    const data = JSON.parse(dmCreate.getBody() as string);
    expect(data).toStrictEqual(VALID_DM_RETURN);
  });

  test('multiple dms', () => {
    // register another 2 more users
    const res2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5444444@ad.unsw.edu.au',
          password: 'validPassword,1',
          nameFirst: 'Shouko',
          nameLast: 'Nishimiya',
        }
      }
    );

    const res3 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5333333@ad.unsw.edu.au',
          password: 'hearingAidsLmao,1',
          nameFirst: 'shouya',
          nameLast: 'ishida',
        }
      }
    );
    const userObj2 = JSON.parse(res2.getBody() as string);
    const userObj3 = JSON.parse(res3.getBody() as string);

    // creating multiple dms
    const dmCreate1 = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: [userObj2.authUserId]
        }
      }
    );

    const dmCreate2 = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: [userObj3.authUserId]
        }
      }
    );

    const dmCreate3 = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: [userObj2.authUserId, userObj3.authUserId]
        }
      }
    );

    const data1 = JSON.parse(dmCreate1.getBody() as string);
    expect(data1).toStrictEqual(VALID_DM_RETURN);

    const data2 = JSON.parse(dmCreate2.getBody() as string);
    expect(data2).toStrictEqual(VALID_DM_RETURN);

    const data3 = JSON.parse(dmCreate3.getBody() as string);
    expect(data3).toStrictEqual(VALID_DM_RETURN);

    // expect dmIds to be unique
    expect(data1.dmId).not.toStrictEqual(data2.dmId);
    expect(data1.dmId).not.toStrictEqual(data3.dmId);
    expect(data2.dmId).not.toStrictEqual(data3.dmId);
  });
});

describe('/dm/details/v1', () => {
  let userObj: AuthRegisterReturn;
  let dmObj: DmCreateReturn;
  beforeEach(() => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
        }
      }
    );
    userObj = JSON.parse(res.getBody() as string);

    const dmCreate = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: []
        }
      }
    );
    dmObj = JSON.parse(dmCreate.getBody() as string);
  });

  test('invalid token', () => {
    const dmDetails = request(
      'GET',
      SERVER_URL + '/dm/details/v1',
      {
        qs: {
          token: userObj.token + 'invalid',
          dmId: dmObj.dmId
        }
      }
    );
    const dmDetailsObj = JSON.parse(dmDetails.getBody() as string);
    expect(dmDetailsObj).toStrictEqual(ERROR);
  });

  test('invalid dmId', () => {
    const dmDetails = request(
      'GET',
      SERVER_URL + '/dm/details/v1',
      {
        qs: {
          token: userObj.token,
          dmId: dmObj.dmId + 1
        }
      }
    );
    const dmDetailsObj = JSON.parse(dmDetails.getBody() as string);
    expect(dmDetailsObj).toStrictEqual(ERROR);
  });

  test('invalid - user not a member of dm', () => {
    // register another person however, they are not apart of the dm
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5444444@ad.unsw.edu.au',
          password: 'password1',
          nameFirst: 'Clive',
          nameLast: 'Palmer',
        }
      }
    );
    const userObj2 = JSON.parse(res.getBody() as string);

    const dmDetails = request(
      'GET',
      SERVER_URL + '/dm/details/v1',
      {
        qs: {
          token: userObj2.token,
          dmId: dmObj.dmId
        }
      }
    );
    const dmDetailsObj = JSON.parse(dmDetails.getBody() as string);
    expect(dmDetailsObj).toStrictEqual(ERROR);
  });

  test('valid dm details', () => {
    const dmDetails = request(
      'GET',
      SERVER_URL + '/dm/details/v1',
      {
        qs: {
          token: userObj.token,
          dmId: dmObj.dmId
        }
      }
    );
    const dmDetailsObj = JSON.parse(dmDetails.getBody() as string);
    expect(dmDetailsObj).toStrictEqual({
      name: 'madhavmishra',
      members: [
        {
          uId: userObj.authUserId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
          handleStr: 'madhavmishra',
        }
      ]
    });
  });

  test('multiple dm details', () => {
    const register2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5444444@ad.unsw.edu.au',
          password: 'password1',
          nameFirst: 'Clive',
          nameLast: 'Palmer',
        }
      }
    );
    const register3 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5333333@ad.unsw.edu.au',
          password: 'password2',
          nameFirst: 'Pauline',
          nameLast: 'Hanson',
        }
      }
    );
    const userObj2 = JSON.parse(register2.getBody() as string);
    const userObj3 = JSON.parse(register3.getBody() as string);

    const dmCreate2 = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: [userObj2.authUserId]
        }
      }
    );

    const dmCreate3 = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: [userObj2.authUserId, userObj3.authUserId]
        }
      }
    );

    const dmCreateObj2 = JSON.parse(dmCreate2.getBody() as string);
    const dmCreateObj3 = JSON.parse(dmCreate3.getBody() as string);

    const dmDetails1 = request(
      'GET',
      SERVER_URL + '/dm/details/v1',
      {
        qs: {
          token: userObj.token,
          dmId: dmObj.dmId,
        }
      }
    );

    const dmDetailsObj = JSON.parse(dmDetails1.getBody() as string);
    expect(dmDetailsObj).toStrictEqual({
      name: 'madhavmishra',
      members: [
        {
          uId: userObj.authUserId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
          handleStr: 'madhavmishra',
        }
      ]
    });

    const dmDetails2 = request(
      'GET',
      SERVER_URL + '/dm/details/v1',
      {
        qs: {
          token: userObj.token,
          dmId: dmCreateObj2.dmId,
        }
      }
    );

    const dmDetailsObj2 = JSON.parse(dmDetails2.getBody() as string);
    expect(dmDetailsObj2).toStrictEqual({
      name: 'clivepalmer, madhavmishra',
      members: expect.any(Array)
    });

    const expectedArray2 = [
      {
        uId: userObj.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'madhavmishra',
      },
      {
        uId: userObj2.authUserId,
        email: 'z5444444@ad.unsw.edu.au',
        nameFirst: 'Clive',
        nameLast: 'Palmer',
        handleStr: 'clivepalmer',
      }
    ];

    expect(dmDetailsObj2.members.sort((a: User, b: User) => a.uId - b.uId)).toStrictEqual(
      expectedArray2.sort((a: User, b: User) => a.uId - b.uId)
    );

    const dmDetails3 = request(
      'GET',
      SERVER_URL + '/dm/details/v1',
      {
        qs: {
          token: userObj.token,
          dmId: dmCreateObj3.dmId,
        }
      }
    );

    const dmDetailsObj3 = JSON.parse(dmDetails3.getBody() as string);
    expect(dmDetailsObj3).toStrictEqual({
      name: 'clivepalmer, madhavmishra, paulinehanson',
      members: expect.any(Array)
    });

    const expectedArray3 = [
      {
        uId: userObj.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'madhavmishra',
      },
      {
        uId: userObj2.authUserId,
        email: 'z5444444@ad.unsw.edu.au',
        nameFirst: 'Clive',
        nameLast: 'Palmer',
        handleStr: 'clivepalmer',
      },
      {
        uId: userObj3.authUserId,
        email: 'z5333333@ad.unsw.edu.au',
        nameFirst: 'Pauline',
        nameLast: 'Hanson',
        handleStr: 'paulinehanson',
      }
    ];

    expect(dmDetailsObj3.members.sort((a: User, b: User) => a.uId - b.uId)).toStrictEqual(
      expectedArray3.sort((a: User, b: User) => a.uId - b.uId)
    );
  });
});
