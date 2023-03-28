
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
      'DELETE',
      SERVER_URL + '/dm/leave/v1',
      {
        qs: {
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
      'DELETE',
      SERVER_URL + '/dm/leave/v1',
      {
        qs: {
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
      'DELETE',
      SERVER_URL + '/dm/leave/v1',
      {
        qs: {
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
      'DELETE',
      SERVER_URL + '/dm/leave/v1',
      {
        qs: {
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
      'DELETE',
      SERVER_URL + '/dm/leave/v1',
      {
        qs: {
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
      'DELETE',
      SERVER_URL + '/dm/leave/v1',
      {
        qs: {
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
      'DELETE',
      SERVER_URL + '/dm/leave/v1',
      {
        qs: {
          token: userObj2.token,
          dmId: dmCreateObj3.dmId
        }
      }
    );

    const dmLeave32 = request(
      'DELETE',
      SERVER_URL + '/dm/leave/v1',
      {
        qs: {
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
