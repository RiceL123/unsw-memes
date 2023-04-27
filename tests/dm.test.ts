import { clear, authRegister, dmCreate, dmDetails, dmRemove, dmLeave, dmList, dmMessages, messageSendDm } from './routeRequests';

import { url, port } from '../src/config.json';
const SERVER_URL = `${url}:${port}`;

const VALID_DM_RETURN = { dmId: expect.any(Number) };

interface AuthRegisterReturn {
  token: string;
  authUserId: number;
}

interface DmCreateReturn {
  dmId: number;
}

interface DmListObj {
  dmId: number;
  name: string;
}

interface User {
  uId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
}

beforeEach(() => {
  clear();
});

describe('/dm/create/v2', () => {
  let userObj: AuthRegisterReturn;

  beforeEach(() => {
    userObj = authRegister('z5555555@ad.unsw.edu.au', 'oassword', 'Madhav', 'Mishra');
  });

  test('invalid token', () => {
    expect(dmCreate(userObj.token + 'invalid', [])).toStrictEqual(403);
  });

  test('invalid uId - does not refer to valid user', () => {
    const userObj2 = authRegister('z5444444@ad.unsw.edu.au', 'oassword', 'Modhav', 'Moshra');
    const invalidId = userObj2.authUserId + userObj.authUserId + 1;
    expect(dmCreate(userObj.token, [invalidId])).toStrictEqual(400);
  });

  test('invalid uId - duplicate uIds', () => {
    expect(dmCreate(userObj.token, [userObj.authUserId])).toStrictEqual(400);
  });

  test('valid dm creation - empty uId array', () => {
    expect(dmCreate(userObj.token, [])).toStrictEqual(VALID_DM_RETURN);
  });

  test('valid dm creation - multiple uIds', () => {
    // register another 2 more users
    const userObj2 = authRegister('z5444444@ad.unsw.edu.au', 'oassword', 'Modhav', 'Moshra');
    const userObj3 = authRegister('z5333333@ad.unsw.edu.au', 'oossword', 'Modhov', 'Moshro');

    expect(dmCreate(userObj.token, [userObj2.authUserId, userObj3.authUserId])).toStrictEqual(VALID_DM_RETURN);
  });

  test('multiple dms', () => {
    // register another 2 more users
    const userObj2 = authRegister('z5444444@ad.unsw.edu.au', 'oassword', 'Modhav', 'Moshra');
    const userObj3 = authRegister('z5333333@ad.unsw.edu.au', 'oossword', 'Modhov', 'Moshro');

    // creating multiple dms
    const data1 = dmCreate(userObj.token, [userObj2.authUserId]);
    const data2 = dmCreate(userObj.token, [userObj3.authUserId]);
    const data3 = dmCreate(userObj.token, [userObj2.authUserId, userObj3.authUserId]);

    expect(data1).toStrictEqual(VALID_DM_RETURN);
    expect(data2).toStrictEqual(VALID_DM_RETURN);
    expect(data3).toStrictEqual(VALID_DM_RETURN);

    // expect dmIds to be unique
    expect(data1.dmId).not.toStrictEqual(data2.dmId);
    expect(data1.dmId).not.toStrictEqual(data3.dmId);
    expect(data2.dmId).not.toStrictEqual(data3.dmId);
  });
});

describe('/dm/remove/v2', () => {
  let userObj: AuthRegisterReturn;
  let dmObj: DmCreateReturn;

  beforeEach(() => {
    userObj = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    dmObj = dmCreate(userObj.token, []);
  });

  test('invalid token', () => {
    expect(dmRemove(userObj.token + 'invalid', dmObj.dmId)).toStrictEqual(403);
  });

  test('dmId does not refer to valid DM', () => {
    expect(dmRemove(userObj.token, dmObj.dmId + 1)).toStrictEqual(400);
  });

  test('invalid - authId not creator of DM', () => {
    const userObj2 = authRegister('z4444444@ad.unsw.edu.au', 'password', 'Miguel', 'Gutheridge');
    expect(userObj2).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });

    // Miguel makes a channel that madhav is not the owner of
    const dmObj2 = dmCreate(userObj2.token, [userObj.authUserId]);

    // as madhav is not the creator expect error 400
    expect(dmRemove(userObj.token, dmObj2.dmId)).toStrictEqual(403);
  });

  test('invalid - authId no longer in DM', () => {
    // madhav leaves the dm
    expect(dmLeave(userObj.token, dmObj.dmId)).toStrictEqual({});

    // as madhav has left, though he was the original creator, cannot remove the dm
    expect(dmRemove(userObj.token, dmObj.dmId)).toStrictEqual(403);
  });

  test('valid - DM with just owner is deleted', () => {
    expect(dmRemove(userObj.token, dmObj.dmId)).toStrictEqual({});
  });

  test('valid - DM with one other member is deleted', () => {
    const userObj2 = authRegister('z4444444@ad.unsw.edu.au', 'password', 'Miguel', 'Gutheridge');

    const dmObj2 = dmCreate(userObj.token, [userObj2.authUserId]);

    expect(dmRemove(userObj.token, dmObj2.dmId)).toStrictEqual({});
  });

  test('valid - DM with multiple members is deleted', () => {
    const userObj2 = authRegister('z4444444@ad.unsw.edu.au', 'password3', 'Miguel', 'Gutheridge');
    const userObj3 = authRegister('z3333333@ad.unsw.edu.au', 'password2', 'Timmyt', 'alkfhqqonn');

    const dmObj2 = dmCreate(userObj.token, [userObj2.authUserId, userObj3.authUserId]);

    expect(dmRemove(userObj.token, dmObj2.dmId)).toStrictEqual({});
  });
});

describe('/dm/details/v2', () => {
  let userObj: AuthRegisterReturn;
  let dmObj: DmCreateReturn;
  beforeEach(() => {
    userObj = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    dmObj = dmCreate(userObj.token, []);
  });

  test('invalid token', () => {
    expect(dmDetails(userObj.token + 'invalid', dmObj.dmId)).toStrictEqual(403);
  });

  test('invalid dmId', () => {
    expect(dmDetails(userObj.token, dmObj.dmId + 1)).toStrictEqual(400);
  });

  test('invalid - user not a member of dm', () => {
    // register another person however, they are not apart of the dm
    const userObj2 = authRegister('z5444444@ad.unsw.edu.au', 'password1', 'Clive', 'Palmer');

    expect(dmDetails(userObj2.token, dmObj.dmId)).toStrictEqual(403);
  });

  test('valid dm details', () => {
    expect(dmDetails(userObj.token, dmObj.dmId)).toStrictEqual({
      name: 'madhavmishra',
      members: [
        {
          uId: userObj.authUserId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
          handleStr: 'madhavmishra',
          profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
        }
      ]
    });
  });

  test('multiple dm details', () => {
    const userObj2 = authRegister('z5444444@ad.unsw.edu.au', 'password1', 'Clive', 'Palmer');
    const userObj3 = authRegister('z5333333@ad.unsw.edu.au', 'password2', 'Pauline', 'Hanson');

    const dmObj2 = dmCreate(userObj.token, [userObj2.authUserId]);
    const dmObj3 = dmCreate(userObj.token, [userObj2.authUserId, userObj3.authUserId]);

    expect(dmDetails(userObj.token, dmObj.dmId)).toStrictEqual({
      name: 'madhavmishra',
      members: [
        {
          uId: userObj.authUserId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
          handleStr: 'madhavmishra',
          profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
        }
      ]
    });

    const dmDetailsObj2 = dmDetails(userObj.token, dmObj2.dmId);
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
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userObj2.authUserId,
        email: 'z5444444@ad.unsw.edu.au',
        nameFirst: 'Clive',
        nameLast: 'Palmer',
        handleStr: 'clivepalmer',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      }
    ];

    expect(dmDetailsObj2.members.sort((a: User, b: User) => a.uId - b.uId)).toStrictEqual(
      expectedArray2.sort((a: User, b: User) => a.uId - b.uId)
    );

    const dmDetailsObj3 = dmDetails(userObj.token, dmObj3.dmId);
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
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userObj2.authUserId,
        email: 'z5444444@ad.unsw.edu.au',
        nameFirst: 'Clive',
        nameLast: 'Palmer',
        handleStr: 'clivepalmer',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userObj3.authUserId,
        email: 'z5333333@ad.unsw.edu.au',
        nameFirst: 'Pauline',
        nameLast: 'Hanson',
        handleStr: 'paulinehanson',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      }
    ];

    expect(dmDetailsObj3.members.sort((a: User, b: User) => a.uId - b.uId)).toStrictEqual(
      expectedArray3.sort((a: User, b: User) => a.uId - b.uId)
    );
  });
});

describe('/dm/leave/v2', () => {
  let userObj: AuthRegisterReturn;
  let dmObj: DmCreateReturn;
  beforeEach(() => {
    userObj = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    dmObj = dmCreate(userObj.token, []);
  });

  test('invalid token', () => {
    expect(dmLeave(userObj.token + 'invalid', dmObj.dmId)).toStrictEqual(403);
  });

  test('invalid dmId', () => {
    expect(dmLeave(userObj.token, dmObj.dmId + 1)).toStrictEqual(400);
  });

  test('invalid token - user not a member of the dm', () => {
    // second user is not a part of the dm
    const userObj2 = authRegister('z5444444@ad.unsw.edu.au', 'password1', 'Electro', 'Wizard');

    expect(dmLeave(userObj2.token, dmObj.dmId)).toStrictEqual(403);
  });

  test('valid dm leave', () => {
    expect(dmLeave(userObj.token, dmObj.dmId)).toStrictEqual({});

    // as madhav has left madhav is not a valid member of dm and cant called details
    expect(dmDetails(userObj.token, dmObj.dmId)).toStrictEqual(403);
  });

  test('multiple valid leaves', () => {
    const userObj2 = authRegister('z5444444@ad.unsw.edu.au', 'password1', 'Clive', 'Palmer');
    const userObj3 = authRegister('z5333333@ad.unsw.edu.au', 'password2', 'Pauline', 'Hanson');

    const dmObj2 = dmCreate(userObj.token, [userObj2.authUserId]);
    const dmObj3 = dmCreate(userObj.token, [userObj2.authUserId, userObj3.authUserId]);

    // madhav leaves the first dmObj
    expect(dmLeave(userObj.token, dmObj.dmId)).toStrictEqual({});

    expect(dmDetails(userObj.token, dmObj.dmId)).toStrictEqual(403);

    // madhav leaves second dmObj - only clive is left
    expect(dmLeave(userObj.token, dmObj2.dmId)).toStrictEqual({});

    expect(dmDetails(userObj2.token, dmObj2.dmId)).toStrictEqual({
      name: 'clivepalmer, madhavmishra',
      members: [
        {
          uId: userObj2.authUserId,
          email: 'z5444444@ad.unsw.edu.au',
          nameFirst: 'Clive',
          nameLast: 'Palmer',
          handleStr: 'clivepalmer',
          profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
        }
      ]
    });

    // clive and pauline leave dmObj3 so only madhav is left
    expect(dmLeave(userObj2.token, dmObj3.dmId)).toStrictEqual({});
    expect(dmLeave(userObj3.token, dmObj3.dmId)).toStrictEqual({});

    expect(dmDetails(userObj.token, dmObj3.dmId)).toStrictEqual({
      name: 'clivepalmer, madhavmishra, paulinehanson',
      members: [
        {
          uId: userObj.authUserId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
          handleStr: 'madhavmishra',
          profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
        }
      ]
    });
  });
});

describe('/dm/list/v2', () => {
  let userObj: AuthRegisterReturn;

  beforeEach(() => {
    userObj = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
  });

  // testing for invalid token
  test('invalid token', () => {
    expect(dmList(userObj.token + 'invalid')).toStrictEqual(403);
  });

  test('user is member of no dms', () => {
    expect(dmList(userObj.token)).toStrictEqual({ dms: [] });
  });

  test('user is member of 1 dm', () => {
    const dmDataObj = dmCreate(userObj.token, []);

    expect(dmList(userObj.token)).toStrictEqual(
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

  test('user is member of multiple', () => {
    const dmData1 = dmCreate(userObj.token, []);
    const dmData2 = dmCreate(userObj.token, []);

    expect(dmList(userObj.token)).toStrictEqual(
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

  test('user is member of dms with multiple people', () => {
    // creating second user
    const userObj2 = authRegister('z4444444@ad.unsw.edu.au', 'password', 'Miguel', 'Guthridge');

    const dmData1 = dmCreate(userObj.token, [userObj2.authUserId]);

    // both madhav and miguel should have the same dmList output since they
    // are apart of 1 dm
    expect(dmList(userObj.token)).toStrictEqual(
      {
        dms: [
          {
            dmId: dmData1.dmId,
            name: 'madhavmishra, miguelguthridge'
          }
        ]
      }
    );

    expect(dmList(userObj2.token)).toStrictEqual(
      {
        dms: [
          {
            dmId: dmData1.dmId,
            name: 'madhavmishra, miguelguthridge'
          }
        ]
      }
    );
  });

  test('user is recipient of multiple dms which have multiple recipients', () => {
    const userObj2 = authRegister('z4444444@ad.unsw.edu.au', 'password', 'Miguel', 'Guthridge');
    const userObj3 = authRegister('z3333333@ad.unsw.edu.au', 'password', 'Timmy', 'Huang');
    const userObj4 = authRegister('z2222222@ad.unsw.edu.au', 'password', 'Sandeep', 'Das');

    const dmData1 = dmCreate(userObj.token, [userObj2.authUserId, userObj3.authUserId]);
    const dmData2 = dmCreate(userObj.token, [userObj3.authUserId, userObj4.authUserId]);
    const dmData3 = dmCreate(userObj.token, [userObj2.authUserId, userObj3.authUserId, userObj4.authUserId]);
    const dmData4 = dmCreate(userObj.token, [userObj2.authUserId, userObj4.authUserId]);

    expect(dmData4).toStrictEqual({ dmId: expect.any(Number) });

    const expectedDmsArray: DmListObj[] = [
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
    ];
    // timmy's dms - dmData4 should not be included as timmy is not a member
    const dmListObj = dmList(userObj3.token);
    expect(dmListObj).toStrictEqual({ dms: expect.any(Array) });

    // accounting for any permutation of the dm's array
    expect(dmListObj.dms.sort((a: DmListObj, b: DmListObj) => a.dmId - b.dmId)).toStrictEqual(
      expectedDmsArray.sort((a: DmListObj, b: DmListObj) => a.dmId - b.dmId)
    );
  });

  test('user is member of multiple dms as the owner and recipient', () => {
    const userObj2 = authRegister('z4444444@ad.unsw.edu.au', 'password', 'Miguel', 'Guthridge');
    const userObj3 = authRegister('z3333333@ad.unsw.edu.au', 'password', 'Timmy', 'Huang');
    const userObj4 = authRegister('z2222222@ad.unsw.edu.au', 'password', 'Sandeep', 'Das');

    const dmData1 = dmCreate(userObj.token, [userObj2.authUserId, userObj3.authUserId]);
    const dmData2 = dmCreate(userObj.token, [userObj3.authUserId, userObj4.authUserId]);
    const dmData3 = dmCreate(userObj2.token, [userObj3.authUserId, userObj4.authUserId]);
    const dmData4 = dmCreate(userObj.token, [userObj2.authUserId, userObj4.authUserId, userObj3.authUserId]);
    const dmData5 = dmCreate(userObj2.token, [userObj.authUserId]);

    expect(dmData2).toStrictEqual({ dmId: expect.any(Number) });

    // Miguel's dms - dmData2 should not be shown as miguel is not a member
    expect(dmList(userObj2.token)).toStrictEqual(
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

describe('dmMessagesV2', () => {
  let userObj: AuthRegisterReturn;
  let dmObj: DmCreateReturn;
  beforeEach(() => {
    userObj = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    dmObj = dmCreate(userObj.token, []);
  });

  test('invalid dmId', () => {
    expect(dmMessages(userObj.token, dmObj.dmId + 1, 0)).toStrictEqual(400);
  });

  test('invalid token', () => {
    expect(dmMessages(userObj.token + 'invalid', dmObj.dmId, 0)).toStrictEqual(403);
  });

  test('start is greater than total messages in dm', () => {
    expect(dmMessages(userObj.token, dmObj.dmId, 1)).toStrictEqual(400);
  });

  test('start is less than 0', () => {
    expect(dmMessages(userObj.token, dmObj.dmId, -1)).toStrictEqual(400);
  });

  test('valid dmId but authorised user is not a member', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    expect(dmMessages(userData2.token, dmObj.dmId, 0)).toStrictEqual(403);
  });

  test('valid empty dmMessagesV1', () => {
    expect(dmMessages(userObj.token, dmObj.dmId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('multiple valid empty dmMessagesV1', () => {
    const userObj2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const userObj3 = authRegister('z2222222@ad.unsw.edu.au', 'password', 'Charizard', 'Pokemon');

    const dmData2 = dmCreate(userObj2.token, []);
    const dmData3 = dmCreate(userObj3.token, [userObj2.authUserId]);

    expect(dmMessages(userObj.token, dmObj.dmId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });

    // charmander is owner of dm
    expect(dmMessages(userObj2.token, dmData2.dmId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });

    // charmander is member of dm
    expect(dmMessages(userObj2.token, dmData3.dmId, 0)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('pagination of 50', () => {
    // sending 51 messages
    for (let i = 0; i < 51; i++) {
      const messageObj = messageSendDm(userObj.token, dmObj.dmId, 'Cool messsage!');
      expect(messageObj).toStrictEqual({ messageId: expect.any(Number) });
    }

    const dmMessagesObj = dmMessages(userObj.token, dmObj.dmId, 0);
    expect(dmMessagesObj).toStrictEqual({
      messages: expect.any(Array),
      start: 0,
      end: 50
    });

    expect(dmMessagesObj.messages.length === 50);
  });
});
