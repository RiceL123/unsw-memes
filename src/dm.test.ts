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

describe('/dm/remove/v1', () => {
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
    const dmRemove = request(
      'DELETE',
      SERVER_URL + '/dm/remove/v1',
      {
        json: {
          token: userObj.token + 'invalid',
          dmId: dmObj.dmId
        }
      }
    );
    const data = JSON.parse(dmRemove.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('dmId does not refer to valid DM', () => {
    const dmRemove = request(
      'DELETE',
      SERVER_URL + '/dm/remove/v1',
      {
        qs: {
          token: userObj.token,
          dmId: dmObj.dmId + 1
        }
      }
    );
    const dmRemoveObj = JSON.parse(dmRemove.getBody() as string);
    expect(dmRemoveObj).toStrictEqual(ERROR);
  });

  test('dmId valid, authId not creator of DM', () => {
    const res2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z4444444@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Miguel',
          nameLast: 'Guthridge',
        }
      }
    );
    const userObj2 = JSON.parse(res2.getBody() as string);
    expect(userObj2).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });
    const dmRemove = request(
      'DELETE',
      SERVER_URL + '/dm/remove/v1',
      {
        qs: {
          token: userObj2.token,
          dmId: dmObj.dmId
        }
      }
    );

    const dmRemoveObj = JSON.parse(dmRemove.getBody() as string);
    expect(dmRemoveObj).toStrictEqual(ERROR);
  });

  test('dmId valid, authId no longer in DM', () => {
    const res2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z4444444@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Miguel',
          nameLast: 'Guthridge',
        }
      }
    );
    const userObj2 = JSON.parse(res2.getBody() as string);

    const dmRemove = request(
      'DELETE',
      SERVER_URL + '/dm/remove/v1',
      {
        qs: {
          token: userObj2.token,
          dmId: dmObj.dmId
        }
      }
    );
    const dmRemoveObj = JSON.parse(dmRemove.getBody() as string);
    expect(dmRemoveObj).toStrictEqual(ERROR);
  });

  test('dmId valid, DM with just owner is deleted', () => {
    const dmRemove = request(
      'DELETE',
      SERVER_URL + '/dm/remove/v1',
      {
        qs: {
          token: userObj.token,
          dmId: dmObj.dmId
        }
      }
    );
    const dmRemoveObj = JSON.parse(dmRemove.getBody() as string);
    expect(dmRemoveObj).toStrictEqual({});
  });

  test('dmId valid, DM with one other member is deleted', () => {
    const res2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z4444444@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Miguel',
          nameLast: 'Guthridge',
        }
      }
    );
    const userObj2 = JSON.parse(res2.getBody() as string);

    const dmCreate = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: [userObj2.authUserId]
        }
      }
    );
    const dmObj2 = JSON.parse(dmCreate.getBody() as string);

    const dmRemove = request(
      'DELETE',
      SERVER_URL + '/dm/remove/v1',
      {
        qs: {
          token: userObj.token,
          dmId: dmObj2.dmId
        }
      }
    );

    const dmRemoveObj = JSON.parse(dmRemove.getBody() as string);
    expect(dmRemoveObj).toStrictEqual({});
  });

  test('dmId valid, DM with multiple members is deleted', () => {
    const res2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z4444444@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Miguel',
          nameLast: 'Guthridge',
        }
      }
    );
    const userObj2 = JSON.parse(res2.getBody() as string);

    const res3 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z3333333@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Timmy',
          nameLast: 'Huang',
        }
      }
    );
    const userObj3 = JSON.parse(res3.getBody() as string);

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
    const dmObj2 = JSON.parse(dmCreate.getBody() as string);

    const dmRemove = request(
      'DELETE',
      SERVER_URL + '/dm/remove/v1',
      {
        qs: {
          token: userObj.token,
          dmId: dmObj2.dmId
        }
      }
    );
    const dmRemoveObj = JSON.parse(dmRemove.getBody() as string);
    expect(dmRemoveObj).toStrictEqual({});
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

describe('/dm/leave/v1', () => {
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
    const dmLeave = request(
      'POST',
      SERVER_URL + '/dm/leave/v1',
      {
        json: {
          token: userObj.token + 'invalid',
          dmId: dmObj.dmId
        }
      }
    );
    const dmLeaveObj = JSON.parse(dmLeave.getBody() as string);
    expect(dmLeaveObj).toStrictEqual(ERROR);
  });

  test('invalid dmId', () => {
    const dmLeave = request(
      'POST',
      SERVER_URL + '/dm/leave/v1',
      {
        json: {
          token: userObj.token,
          dmId: dmObj.dmId + 1
        }
      }
    );
    const dmLeaveObj = JSON.parse(dmLeave.getBody() as string);
    expect(dmLeaveObj).toStrictEqual(ERROR);
  });

  test('invalid token - user not a member of the dm', () => {
    // second user is not a part of the dm
    const register2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5444444@ad.unsw.edu.au',
          password: 'password1',
          nameFirst: 'Electro',
          nameLast: 'Wizard',
        }
      }
    );
    const userObj2 = JSON.parse(register2.getBody() as string);

    const dmLeave = request(
      'POST',
      SERVER_URL + '/dm/leave/v1',
      {
        json: {
          token: userObj2.token,
          dmId: dmObj.dmId
        }
      }
    );
    const dmLeaveObj = JSON.parse(dmLeave.getBody() as string);
    expect(dmLeaveObj).toStrictEqual(ERROR);
  });

  test('valid dm leave', () => {
    const dmLeave = request(
      'POST',
      SERVER_URL + '/dm/leave/v1',
      {
        json: {
          token: userObj.token,
          dmId: dmObj.dmId
        }
      }
    );
    const dmLeaveObj = JSON.parse(dmLeave.getBody() as string);
    expect(dmLeaveObj).toStrictEqual({});

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

    // as all members have been removed madhav is not a valid member of dm
    expect(dmDetailsObj).toStrictEqual(ERROR);
  });

  test('multiple valid leaves', () => {
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

    const dmLeave1 = request(
      'POST',
      SERVER_URL + '/dm/leave/v1',
      {
        json: {
          token: userObj.token,
          dmId: dmObj.dmId
        }
      }
    );

    const dmLeaveObj1 = JSON.parse(dmLeave1.getBody() as string);
    expect(dmLeaveObj1).toStrictEqual({});

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

    // madhav left and is now no longer a member of the dm
    const dmDetailsObj = JSON.parse(dmDetails1.getBody() as string);
    expect(dmDetailsObj).toStrictEqual(ERROR);

    const dmLeave2 = request(
      'POST',
      SERVER_URL + '/dm/leave/v1',
      {
        json: {
          token: userObj.token,
          dmId: dmCreateObj2.dmId
        }
      }
    );
    const dmLeaveObj2 = JSON.parse(dmLeave2.getBody() as string);
    expect(dmLeaveObj2).toStrictEqual({});

    const dmDetails2 = request(
      'GET',
      SERVER_URL + '/dm/details/v1',
      {
        qs: {
          token: userObj2.token,
          dmId: dmCreateObj2.dmId,
        }
      }
    );

    // expect madhav to leave the dm leaving only clive
    const dmDetailsObj2 = JSON.parse(dmDetails2.getBody() as string);
    expect(dmDetailsObj2).toStrictEqual({
      name: 'clivepalmer, madhavmishra',
      members: [
        {
          uId: userObj2.authUserId,
          email: 'z5444444@ad.unsw.edu.au',
          nameFirst: 'Clive',
          nameLast: 'Palmer',
          handleStr: 'clivepalmer',
        }
      ]
    });

    // two separate leaves from 1 dm
    const dmLeave31 = request(
      'POST',
      SERVER_URL + '/dm/leave/v1',
      {
        json: {
          token: userObj2.token,
          dmId: dmCreateObj3.dmId
        }
      }
    );

    const dmLeave32 = request(
      'POST',
      SERVER_URL + '/dm/leave/v1',
      {
        json: {
          token: userObj3.token,
          dmId: dmCreateObj3.dmId
        }
      }
    );

    const dmLeaveObj31 = JSON.parse(dmLeave31.getBody() as string);
    const dmLeaveObj32 = JSON.parse(dmLeave32.getBody() as string);
    expect(dmLeaveObj31).toStrictEqual({});
    expect(dmLeaveObj32).toStrictEqual({});

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

    // as both pauline and clive were removed, only madhav should remain
    const dmDetailsObj3 = JSON.parse(dmDetails3.getBody() as string);
    expect(dmDetailsObj3).toStrictEqual({
      name: 'clivepalmer, madhavmishra, paulinehanson',
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
});

describe('/dm/list/v1', () => {
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

  // testing for invalid token
  test('invalid token', () => {
    const dmList = request(
      'GET',
      SERVER_URL + '/dm/list/v1',
      {
        qs: {
          token: userObj.token + 'invalid',
        }
      }
    );
    const data = JSON.parse(dmList.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('user is member of no dms', () => {
    const dmList = request(
      'GET',
      SERVER_URL + '/dm/list/v1',
      {
        qs: {
          token: userObj.token
        }
      }
    );

    const data = JSON.parse(dmList.getBody() as string);
    expect(data).toStrictEqual(
      {
        dms: []
      }
    );
  });

  test('user is only member of a dm as owner', () => {
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
    const dmDataObj = JSON.parse(dmCreate.getBody() as string);

    // empty uId array indicates owner is only member of dm
    const dmList = request(
      'GET',
      SERVER_URL + '/dm/list/v1',
      {
        qs: {
          token: userObj.token
        }
      }
    );

    const data = JSON.parse(dmList.getBody() as string);
    expect(data).toStrictEqual(
      {
        dms: [
          {
            dmId: dmDataObj.dmId,
            name: 'madhavmishra'
          }
        ]
      }
    );
  });

  test('user is member of multiple dms as the owner', () => {
    const dmCreate1 = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: []
        }
      }
    );

    const dmCreate2 = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: []
        }
      }
    );
    const dmData1 = JSON.parse(dmCreate1.getBody() as string);
    const dmData2 = JSON.parse(dmCreate2.getBody() as string);

    const dmList = request(
      'GET',
      SERVER_URL + '/dm/list/v1',
      {
        qs: {
          token: userObj.token
        }
      }
    );
    const dmListObj = JSON.parse(dmList.getBody() as string);
    expect(dmListObj).toStrictEqual(
      {
        dms: [
          {
            dmId: dmData1.dmId,
            name: 'madhavmishra'
          },
          {
            dmId: dmData2.dmId,
            name: 'madhavmishra'
          }
        ]
      }
    );
  });

  test('user is member of multiple dms as the recipient', () => {
    // creating second user
    const res2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z4444444@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Miguel',
          nameLast: 'Guthridge',
        }
      }
    );

    const userObj2 = JSON.parse(res2.getBody() as string);

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
    const dmData1 = JSON.parse(dmCreate1.getBody() as string);

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
    const dmData2 = JSON.parse(dmCreate2.getBody() as string);

    const dmCreate3 = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: [userObj2.authUserId]
        }
      }
    );
    const dmData3 = JSON.parse(dmCreate3.getBody() as string);

    const dmList = request(
      'GET',
      SERVER_URL + '/dm/list/v1',
      {
        qs: {
          token: userObj2.token
        }
      }
    );
    const dmListObj = JSON.parse(dmList.getBody() as string);

    expect(dmListObj).toStrictEqual(
      {
        dms: [
          {
            dmId: dmData1.dmId,
            name: 'madhavmishra, miguelguthridge'
          },
          {
            dmId: dmData2.dmId,
            name: 'madhavmishra, miguelguthridge'
          },
          {
            dmId: dmData3.dmId,
            name: 'madhavmishra, miguelguthridge'
          }
        ]
      }
    );
  });

  test('user is recipient of multiple dms which have multiple recipients', () => {
    const res2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z4444444@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Miguel',
          nameLast: 'Guthridge',
        }
      }
    );
    const userObj2 = JSON.parse(res2.getBody() as string);

    const res3 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z3333333@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Timmy',
          nameLast: 'Huang',
        }
      }
    );
    const userObj3 = JSON.parse(res3.getBody() as string);

    const res4 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z2222222@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Sandeep',
          nameLast: 'Das',
        }
      }
    );
    const userObj4 = JSON.parse(res4.getBody() as string);

    // CREATING DMS
    const dmCreate1 = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: [userObj2.authUserId, userObj3.authUserId]
        }
      }
    );
    const dmData1 = JSON.parse(dmCreate1.getBody() as string);

    const dmCreate2 = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: [userObj3.authUserId, userObj4.authUserId]
        }
      }
    );
    const dmData2 = JSON.parse(dmCreate2.getBody() as string);

    const dmCreate3 = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: [userObj2.authUserId, userObj3.authUserId, userObj4.authUserId]
        }
      }
    );
    const dmData3 = JSON.parse(dmCreate3.getBody() as string);

    const dmCreate4 = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: [userObj2.authUserId, userObj4.authUserId]
        }
      }
    );
    const dmData4 = JSON.parse(dmCreate4.getBody() as string);
    expect(dmData4).toStrictEqual({ dmId: expect.any(Number) });

    const dmList = request(
      'GET',
      SERVER_URL + '/dm/list/v1',
      {
        qs: {
          token: userObj3.token
        }
      }
    );

    const dmListObj = JSON.parse(dmList.getBody() as string);

    expect(dmListObj).toStrictEqual(
      {
        dms: [
          {
            dmId: dmData1.dmId,
            name: 'madhavmishra, miguelguthridge, timmyhuang'
          },
          {
            dmId: dmData2.dmId,
            name: 'madhavmishra, sandeepdas, timmyhuang'
          },
          {
            dmId: dmData3.dmId,
            name: 'madhavmishra, miguelguthridge, sandeepdas, timmyhuang'
          }
        ]
      }
    );
  });

  test('user is member of multiple dms as the owner and recipient', () => {
    const res2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z4444444@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Miguel',
          nameLast: 'Guthridge',
        }
      }
    );
    const userObj2 = JSON.parse(res2.getBody() as string);

    const res3 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z3333333@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Timmy',
          nameLast: 'Huang',
        }
      }
    );
    const userObj3 = JSON.parse(res3.getBody() as string);

    const res4 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z2222222@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Sandeep',
          nameLast: 'Das',
        }
      }
    );
    const userObj4 = JSON.parse(res4.getBody() as string);

    const dmCreate1 = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: [userObj2.authUserId, userObj3.authUserId]
        }
      }
    );
    const dmData1 = JSON.parse(dmCreate1.getBody() as string);

    const dmCreate2 = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj.token,
          uIds: [userObj3.authUserId, userObj4.authUserId]
        }
      }
    );
    const dmData2 = JSON.parse(dmCreate2.getBody() as string);

    const dmCreate3 = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj2.token,
          uIds: [userObj3.authUserId, userObj4.authUserId]
        }
      }
    );
    const dmData3 = JSON.parse(dmCreate3.getBody() as string);

    const dmCreate4 = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj3.token,
          uIds: [userObj.authUserId, userObj2.authUserId, userObj4.authUserId]
        }
      }
    );
    const dmData4 = JSON.parse(dmCreate4.getBody() as string);

    const dmCreate5 = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userObj2.token,
          uIds: [userObj.authUserId]
        }
      }
    );
    const dmData5 = JSON.parse(dmCreate5.getBody() as string);

    const dmList = request(
      'GET',
      SERVER_URL + '/dm/list/v1',
      {
        qs: {
          token: userObj2.token
        }
      }
    );
    const dmListObj = JSON.parse(dmList.getBody() as string);

    expect(dmData2).toStrictEqual({ dmId: expect.any(Number) });
    expect(dmListObj).toStrictEqual(
      {
        dms: [
          {
            dmId: dmData1.dmId,
            name: 'madhavmishra, miguelguthridge, timmyhuang'
          },
          {
            dmId: dmData3.dmId,
            name: 'miguelguthridge, sandeepdas, timmyhuang'
          },
          {
            dmId: dmData4.dmId,
            name: 'madhavmishra, miguelguthridge, sandeepdas, timmyhuang'
          },
          {
            dmId: dmData5.dmId,
            name: 'madhavmishra, miguelguthridge'
          }
        ]
      }
    );
  });
});

describe('dmMessagesV1', () => {
  let userToken: string;
  let dmId: number;
  beforeEach(() => {
    const userRes = request(
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

    const userData = JSON.parse(userRes.getBody() as string);
    userToken = userData.token;

    const dmRes = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userToken,
          uIds: []
        }
      }
    );
    const dmData = JSON.parse(dmRes.getBody() as string);
    dmId = dmData.dmId;
  });

  test('invalid dmId', () => {
    const messageRes = request(
      'GET',
      SERVER_URL + '/dm/messages/v1',
      {
        qs: {
          token: userToken,
          dmId: dmId + 1,
          start: 0,
        }
      }
    );

    const messageData = JSON.parse(messageRes.getBody() as string);

    expect(messageData).toStrictEqual(ERROR);
  });

  test('invalid token', () => {
    const messageRes = request(
      'GET',
      SERVER_URL + '/dm/messages/v1',
      {
        qs: {
          token: userToken + 1,
          dmId: dmId,
          start: 0,
        }
      }
    );

    const messageData = JSON.parse(messageRes.getBody() as string);

    expect(messageData).toStrictEqual(ERROR);
  });

  test('start is greater than total messages in dm', () => {
    const messageRes = request(
      'GET',
      SERVER_URL + '/dm/messages/v1',
      {
        qs: {
          token: userToken,
          dmId: dmId,
          start: 50,
        }
      }
    );

    const messageData = JSON.parse(messageRes.getBody() as string);

    expect(messageData).toStrictEqual(ERROR);
  });

  test('start is less than 0', () => {
    const messageRes = request(
      'GET',
      SERVER_URL + '/dm/messages/v1',
      {
        qs: {
          token: userToken,
          dmId: dmId,
          start: -1,
        }
      }
    );
    const messageData = JSON.parse(messageRes.getBody() as string);

    expect(messageData).toStrictEqual(ERROR);
  });

  test('valid dmId but authorised user is not a member', () => {
    const userRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z1111111@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Charmander',
          nameLast: 'Pokemon',
        }
      }
    );

    const userData2 = JSON.parse(userRes2.getBody() as string);

    const messageRes = request(
      'GET',
      SERVER_URL + '/dm/messages/v1',
      {
        qs: {
          token: userData2.token,
          dmId: dmId,
          start: 0,
        }
      }
    );

    const messageData = JSON.parse(messageRes.getBody() as string);

    expect(messageData).toStrictEqual(ERROR);
  });

  test('valid empty dmMessagesV1', () => {
    const messageRes = request(
      'GET',
      SERVER_URL + '/dm/messages/v1',
      {
        qs: {
          token: userToken,
          dmId: dmId,
          start: 0,
        }
      }
    );

    const messageData = JSON.parse(messageRes.getBody() as string);

    expect(messageData).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('multiple valid empty dmMessagesV1', () => {
    const userRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z1111111@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Charmander',
          nameLast: 'Pokemon',
        }
      }
    );

    const userRes3 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z2222222@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Charizard',
          nameLast: 'Pokemon',
        }
      }
    );

    const userData2 = JSON.parse(userRes2.getBody() as string);
    const userData3 = JSON.parse(userRes3.getBody() as string);

    const dmRes2 = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userData2.token,
          uIds: []
        }
      }
    );

    const dmRes3 = request(
      'POST',
      SERVER_URL + '/dm/create/v1',
      {
        json: {
          token: userData3.token,
          uIds: []
        }
      }
    );

    const dmData2 = JSON.parse(dmRes2.getBody() as string);
    const dmData3 = JSON.parse(dmRes3.getBody() as string);

    const messageRes = request(
      'GET',
      SERVER_URL + '/dm/messages/v1',
      {
        qs: {
          token: userToken,
          dmId: dmId,
          start: 0,
        }
      }
    );

    const messageRes2 = request(
      'GET',
      SERVER_URL + '/dm/messages/v1',
      {
        qs: {
          token: userData2.token,
          dmId: dmData2.dmId,
          start: 0,
        }
      }
    );

    const messageRes3 = request(
      'GET',
      SERVER_URL + '/dm/messages/v1',
      {
        qs: {
          token: userData3.token,
          dmId: dmData3.dmId,
          start: 0,
        }
      }
    );
    const messageData = JSON.parse(messageRes.getBody() as string);
    expect(messageData).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });

    const messageData2 = JSON.parse(messageRes2.getBody() as string);
    expect(messageData2).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });

    const messageData3 = JSON.parse(messageRes3.getBody() as string);
    expect(messageData3).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });
});
