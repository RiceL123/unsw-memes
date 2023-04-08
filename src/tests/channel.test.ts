import { clear, authRegister, channelsCreate, channelMessages, messageSend, channelInvite, channelJoin } from './routeRequests';

import request from 'sync-request';

import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;

const ERROR = { error: expect.any(String) };

interface UserRegisterReturn {
  token: string;
  authUserId: number;
}

interface ChannelCreateReturn {
  channelId: number;
}

interface channelObjUser {
  uId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
}

beforeEach(() => {
  clear();
});

describe('channelDetailsV2 ', () => {
  let userId: number;
  let userToken: string;
  beforeEach(() => {
    const userRes = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
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
    userId = userData.authUserId;
    userToken = userData.token;
  });

  test('token is invalid', () => {
    // const channelRes = request(
    //   'POST',
    //   SERVER_URL + '/channels/create/v2',
    //   {
    //     json: {
    //       token: userToken,
    //       name: 'COMP1531 Crunchie',
    //       isPublic: false,
    //     }
    //   }
    // );
    // const channelData = JSON.parse(channelRes.getBody() as string);
    // const chanId = channelData.channelId;

    const chanId = channelsCreate(userToken, 'COMP1531 Crunchie', false);

    const detailRes = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: userToken + 1,
          channelId: chanId,
        }
      }
    );
    const detailData = JSON.parse(detailRes.getBody() as string);
    // channelJoinV1(authUserObj.authUserId + 1, channelObj.channelId);
    expect(detailData).toStrictEqual(ERROR);
  });

  test('channelId is invalid', () => {
    // const channelRes = request(
    //   'POST',
    //   SERVER_URL + '/channels/create/v2',
    //   {
    //     json: {
    //       token: userToken,
    //       name: 'COMP1531 Crunchie',
    //       isPublic: false,
    //     }
    //   }
    // );
    // const channelData = JSON.parse(channelRes.getBody() as string);
    // const chanId = channelData.channelId;

    const chanId = channelsCreate(userToken, 'COMP1531 Crunchie', false);

    const detailRes = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId + 1,
        }
      }
    );
    const detailData = JSON.parse(detailRes.getBody() as string);
    expect(detailData).toStrictEqual(ERROR);
  });

  test('valid authUserId but not a part of the channel', () => {
    const userRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z4444444@ad.unsw.edu.au',
          password: 'yellowfeathers',
          nameFirst: 'Big',
          nameLast: 'Bird',
        }
      }
    );

    const userData2 = JSON.parse(userRes2.getBody() as string);
    const userToken2 = userData2.token;

    // const channelRes = request(
    //   'POST',
    //   SERVER_URL + '/channels/create/v2',
    //   {
    //     json: {
    //       token: userToken,
    //       name: 'COMP1531 Crunchie',
    //       isPublic: false,
    //     }
    //   }
    // );

    // const channelData = JSON.parse(channelRes.getBody() as string);
    // const chanId = channelData.channelId;

    const chanId = channelsCreate(userToken, 'COMP1531 Crunchie', false);

    const detailRes = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: userToken2,
          channelId: chanId,
        }
      }
    );
    const detailData = JSON.parse(detailRes.getBody() as string);
    expect(detailData).toStrictEqual(ERROR);
  });

  test('valid authUserId is part of the channel', () => {
    // const channelRes = request(
    //   'POST',
    //   SERVER_URL + '/channels/create/v2',
    //   {
    //     json: {
    //       token: userToken,
    //       name: 'COMP1531 Crunchie',
    //       isPublic: false,
    //     }
    //   }
    // );

    // const channelData = JSON.parse(channelRes.getBody() as string);
    // const chanId = channelData.channelId;

    const chanId = channelsCreate(userToken, 'COMP1531 Crunchie', false).channelId;

    const detailRes = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
        }
      }
    );

    const detailData = JSON.parse(detailRes.getBody() as string);
    expect(detailData).toStrictEqual({
      name: 'COMP1531 Crunchie',
      isPublic: false,
      ownerMembers: [
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
          handleStr: 'madhavmishra'
        }
      ],
      allMembers: [
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
          handleStr: 'madhavmishra'
        }
      ],
    });
  });

  test('multiple valid authUserIds are a part of the channel', () => {
    const userRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z4444444@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Snoop',
          nameLast: 'Dogg',
        }
      }
    );

    const userData2 = JSON.parse(userRes2.getBody() as string);

    // const channelRes = request(
    //   'POST',
    //   SERVER_URL + '/channels/create/v2',
    //   {
    //     json: {
    //       token: userToken,
    //       name: 'COMP1531 Crunchie',
    //       isPublic: true,
    //     }
    //   }
    // );

    // const channelData = JSON.parse(channelRes.getBody() as string);
    // const chanId = channelData.channelId;

    const chanId = channelsCreate(userToken, 'COMP1531 Crunchie', true).channelId;

    expect(channelJoin(userData2.token, chanId)).toStrictEqual({});

    const detailRes = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
        }
      }
    );
    const detailData = JSON.parse(detailRes.getBody() as string);

    expect(detailData).toStrictEqual({
      name: 'COMP1531 Crunchie',
      isPublic: true,
      ownerMembers: [
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
          handleStr: 'madhavmishra'
        }
      ],
      // array needs to account for any permutation
      allMembers: expect.any(Array),
    });

    const expectedArr: channelObjUser[] = [
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'madhavmishra'
      },
      {
        uId: userData2.authUserId,
        email: 'z4444444@ad.unsw.edu.au',
        nameFirst: 'Snoop',
        nameLast: 'Dogg',
        handleStr: 'snoopdogg'
      }
    ];

    // to account for any permutation of the allMembers array, we sort
    expect(detailData.allMembers.sort((a: channelObjUser, b: channelObjUser) => a.uId - b.uId)).toStrictEqual(
      expectedArr.sort((a, b) => a.uId - b.uId)
    );
  });
});

describe('/channel/messages/v3', () => {
  const email = 'z5555555@ad.unsw.edu.au';
  const password = 'password';
  const nameFirst = 'Madhav';
  const nameLast = 'Mishra';

  const channelName = 'Coding';

  test('invalid channelId', () => {
    const data = authRegister(email, password, nameFirst, nameLast);
    const channelObj = channelsCreate(data.token, channelName, true);

    const start = 0;

    expect(channelMessages(data.token, channelObj.channelId + 1, start)).toEqual(400);
  });

  test('invalid token', () => {
    const data = authRegister(email, password, nameFirst, nameLast);
    const channelObj = channelsCreate(data.token, channelName, true);

    const start = 0;

    expect(channelMessages(data.token + 1, channelObj.channelId, start)).toEqual(403);
  });

  test('start is greater than total messages in channel', () => {
    const data = authRegister(email, password, nameFirst, nameLast);
    const channelObj = channelsCreate(data.token, channelName, true);

    const start = 50;

    expect(channelMessages(data.token, channelObj.channelId, start)).toEqual(400);
  });

  test('start is less than 0', () => {
    const data = authRegister(email, password, nameFirst, nameLast);
    const channelObj = channelsCreate(data.token, channelName, true);

    const start = -1;

    expect(channelMessages(data.token, channelObj.channelId, start)).toEqual(400);
  });

  test('valid channelId but authorised user is not a member', () => {
    const data = authRegister(email, password, nameFirst, nameLast);
    const data2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const channelObj = channelsCreate(data.token, channelName, true);

    const start = 0;

    expect(channelMessages(data2.token, channelObj.channelId, start)).toEqual(403);
  });

  test('valid empty channelMessagesV1', () => {
    const data = authRegister(email, password, nameFirst, nameLast);
    const channelObj = channelsCreate(data.token, channelName, true);

    const start = 0;

    expect(channelMessages(data.token, channelObj.channelId, start)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('multiple valid empty channelMessagesV1', () => {
    const data = authRegister(email, password, nameFirst, nameLast);
    const data2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const data3 = authRegister('z2222222@ad.unsw.edu.au', 'password', 'Charizard', 'Pokemon');

    const channelObj = channelsCreate(data.token, channelName, true);
    const channelObj2 = channelsCreate(data2.token, 'Maths', true);
    const channelObj3 = channelsCreate(data3.token, 'Commerce', true);

    const start = 0;

    expect(channelMessages(data.token, channelObj.channelId, start)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });

    expect(channelMessages(data2.token, channelObj2.channelId, start)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });

    expect(channelMessages(data3.token, channelObj3.channelId, start)).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('valid channelMessagesV1 - 1 messages', () => {
    const data = authRegister(email, password, nameFirst, nameLast);
    const sender = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const channelObj = channelsCreate(data.token, channelName, true);
    const start = 0;

    expect(channelInvite(data.token, channelObj.channelId, sender.authUserId)).toStrictEqual({});

    const m1 = messageSend(sender.token, channelObj.channelId, 'Hello World').messageId;
    expect(m1).toStrictEqual(expect.any(Number));

    expect(channelMessages(data.token, channelObj.channelId, start)).toStrictEqual({
      messages: [
        {
          messageId: m1,
          uId: sender.authUserId,
          message: 'Hello World',
          timeSent: expect.any(Number),
        }
      ],
      start: 0,
      end: -1,
    });
  });

  test('valid channelMessagesV1 - 3 messages', () => {
    const data = authRegister(email, password, nameFirst, nameLast);
    const sender = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const channelObj = channelsCreate(data.token, channelName, true);
    const start = 0;

    expect(channelInvite(data.token, channelObj.channelId, sender.authUserId)).toStrictEqual({});

    const m1 = messageSend(sender.token, channelObj.channelId, 'Hello World').messageId;
    const m2 = messageSend(sender.token, channelObj.channelId, 'Im Batman').messageId;
    const m3 = messageSend(sender.token, channelObj.channelId, 'Goodbye World').messageId;

    expect(m1).toStrictEqual(expect.any(Number));
    expect(m2).toStrictEqual(expect.any(Number));
    expect(m3).toStrictEqual(expect.any(Number));

    expect(m1).not.toStrictEqual(m2);
    expect(m1).not.toStrictEqual(m3);
    expect(m2).not.toStrictEqual(m3);

    expect(channelMessages(data.token, channelObj.channelId, start)).toStrictEqual({
      messages: [
        {
          messageId: m3,
          uId: sender.authUserId,
          message: 'Goodbye World',
          timeSent: expect.any(Number),
        },
        {
          messageId: m2,
          uId: sender.authUserId,
          message: 'Im Batman',
          timeSent: expect.any(Number),
        },
        {
          messageId: m1,
          uId: sender.authUserId,
          message: 'Hello World',
          timeSent: expect.any(Number),
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('valid channelMessagesV1 - 10 messages', () => {
    const data = authRegister(email, password, nameFirst, nameLast);
    const sender = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const channelObj = channelsCreate(data.token, channelName, true);

    expect(channelInvite(data.token, channelObj.channelId, sender.authUserId)).toStrictEqual({});

    const start = 0;

    const m1 = messageSend(sender.token, channelObj.channelId, 'Hello World').messageId;
    const m2 = messageSend(sender.token, channelObj.channelId, 'Im Batman').messageId;
    const m3 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m4 = messageSend(sender.token, channelObj.channelId, 'b').messageId;
    const m5 = messageSend(sender.token, channelObj.channelId, 'c').messageId;
    const m6 = messageSend(sender.token, channelObj.channelId, 'd').messageId;
    const m7 = messageSend(sender.token, channelObj.channelId, 'e').messageId;
    const m8 = messageSend(sender.token, channelObj.channelId, 'f').messageId;
    const m9 = messageSend(sender.token, channelObj.channelId, 'g').messageId;
    const m10 = messageSend(sender.token, channelObj.channelId, 'h').messageId;

    expect(m1).toStrictEqual(expect.any(Number));
    expect(m2).toStrictEqual(expect.any(Number));
    expect(m3).toStrictEqual(expect.any(Number));
    expect(m4).toStrictEqual(expect.any(Number));
    expect(m5).toStrictEqual(expect.any(Number));
    expect(m6).toStrictEqual(expect.any(Number));
    expect(m7).toStrictEqual(expect.any(Number));
    expect(m8).toStrictEqual(expect.any(Number));
    expect(m9).toStrictEqual(expect.any(Number));
    expect(m10).toStrictEqual(expect.any(Number));

    const set = new Set([m1, m2, m3, m4, m5, m6, m7, m8, m9, m10]);

    expect(set.size).toBe(10);

    expect(channelMessages(data.token, channelObj.channelId, start)).toStrictEqual({
      messages: [
        {
          messageId: m10,
          uId: sender.authUserId,
          message: 'h',
          timeSent: expect.any(Number),
        },
        {
          messageId: m9,
          uId: sender.authUserId,
          message: 'g',
          timeSent: expect.any(Number),
        },
        {
          messageId: m8,
          uId: sender.authUserId,
          message: 'f',
          timeSent: expect.any(Number),
        },
        {
          messageId: m7,
          uId: sender.authUserId,
          message: 'e',
          timeSent: expect.any(Number),
        },
        {
          messageId: m6,
          uId: sender.authUserId,
          message: 'd',
          timeSent: expect.any(Number),
        },
        {
          messageId: m5,
          uId: sender.authUserId,
          message: 'c',
          timeSent: expect.any(Number),
        },
        {
          messageId: m4,
          uId: sender.authUserId,
          message: 'b',
          timeSent: expect.any(Number),
        },
        {
          messageId: m3,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m2,
          uId: sender.authUserId,
          message: 'Im Batman',
          timeSent: expect.any(Number),
        },
        {
          messageId: m1,
          uId: sender.authUserId,
          message: 'Hello World',
          timeSent: expect.any(Number),
        },
      ],
      start: 0,
      end: -1,
    });
  });

  test('valid channelMessagesV1 - 50 messages', () => {
    const data = authRegister(email, password, nameFirst, nameLast);
    const sender = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const channelObj = channelsCreate(data.token, channelName, true);
    const start = 0;

    expect(channelInvite(data.token, channelObj.channelId, sender.authUserId)).toStrictEqual({});

    const m1 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m2 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m3 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m4 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m5 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m6 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m7 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m8 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m9 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m10 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m11 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m12 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m13 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m14 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m15 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m16 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m17 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m18 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m19 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m20 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m21 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m22 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m23 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m24 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m25 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m26 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m27 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m28 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m29 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m30 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m31 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m32 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m33 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m34 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m35 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m36 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m37 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m38 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m39 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m40 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m41 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m42 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m43 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m44 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m45 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m46 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m47 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m48 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m49 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m50 = messageSend(sender.token, channelObj.channelId, 'a').messageId;

    expect(m1).toStrictEqual(expect.any(Number));
    expect(m2).toStrictEqual(expect.any(Number));
    expect(m3).toStrictEqual(expect.any(Number));
    expect(m4).toStrictEqual(expect.any(Number));
    expect(m5).toStrictEqual(expect.any(Number));
    expect(m6).toStrictEqual(expect.any(Number));
    expect(m7).toStrictEqual(expect.any(Number));
    expect(m8).toStrictEqual(expect.any(Number));
    expect(m9).toStrictEqual(expect.any(Number));
    expect(m10).toStrictEqual(expect.any(Number));
    expect(m11).toStrictEqual(expect.any(Number));
    expect(m12).toStrictEqual(expect.any(Number));
    expect(m13).toStrictEqual(expect.any(Number));
    expect(m14).toStrictEqual(expect.any(Number));
    expect(m15).toStrictEqual(expect.any(Number));
    expect(m16).toStrictEqual(expect.any(Number));
    expect(m17).toStrictEqual(expect.any(Number));
    expect(m18).toStrictEqual(expect.any(Number));
    expect(m19).toStrictEqual(expect.any(Number));
    expect(m20).toStrictEqual(expect.any(Number));
    expect(m21).toStrictEqual(expect.any(Number));
    expect(m22).toStrictEqual(expect.any(Number));
    expect(m23).toStrictEqual(expect.any(Number));
    expect(m24).toStrictEqual(expect.any(Number));
    expect(m25).toStrictEqual(expect.any(Number));
    expect(m26).toStrictEqual(expect.any(Number));
    expect(m27).toStrictEqual(expect.any(Number));
    expect(m28).toStrictEqual(expect.any(Number));
    expect(m29).toStrictEqual(expect.any(Number));
    expect(m30).toStrictEqual(expect.any(Number));
    expect(m31).toStrictEqual(expect.any(Number));
    expect(m32).toStrictEqual(expect.any(Number));
    expect(m33).toStrictEqual(expect.any(Number));
    expect(m34).toStrictEqual(expect.any(Number));
    expect(m35).toStrictEqual(expect.any(Number));
    expect(m36).toStrictEqual(expect.any(Number));
    expect(m37).toStrictEqual(expect.any(Number));
    expect(m38).toStrictEqual(expect.any(Number));
    expect(m39).toStrictEqual(expect.any(Number));
    expect(m40).toStrictEqual(expect.any(Number));
    expect(m41).toStrictEqual(expect.any(Number));
    expect(m42).toStrictEqual(expect.any(Number));
    expect(m43).toStrictEqual(expect.any(Number));
    expect(m44).toStrictEqual(expect.any(Number));
    expect(m45).toStrictEqual(expect.any(Number));
    expect(m46).toStrictEqual(expect.any(Number));
    expect(m47).toStrictEqual(expect.any(Number));
    expect(m48).toStrictEqual(expect.any(Number));
    expect(m49).toStrictEqual(expect.any(Number));
    expect(m50).toStrictEqual(expect.any(Number));

    const set = new Set([m1, m2, m3, m4, m5, m6, m7, m8, m9, m10,
      m11, m12, m13, m14, m15, m16, m17, m18, m19, m20,
      m21, m22, m23, m24, m25, m26, m27, m28, m29, m30,
      m31, m32, m33, m34, m35, m36, m37, m38, m39, m40,
      m41, m42, m43, m44, m45, m46, m47, m48, m49, m50]);

    expect(set.size).toBe(50);

    expect(channelMessages(data.token, channelObj.channelId, start)).toStrictEqual({
      messages: [
        {
          messageId: m50,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m49,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m48,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m47,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m46,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m45,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m44,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m43,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m42,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m41,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m40,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m39,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m38,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m37,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m36,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m35,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m34,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m33,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m32,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m31,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m30,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m29,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m28,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m27,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m26,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m25,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m24,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        }, {
          messageId: m23,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m22,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m21,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m20,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m19,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m18,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m17,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m16,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m15,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m14,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m13,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m12,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m11,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m10,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m9,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m8,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m7,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m6,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m5,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m4,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m3,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m2,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m1,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },

      ],
      start: 0,
      end: -1,
    });
  });

  test('valid channelMessagesV1 - 52 messages', () => {
    const data = authRegister(email, password, nameFirst, nameLast);
    const sender = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const channelObj = channelsCreate(data.token, channelName, true);
    const start = 0;

    // const Time = Math.floor((new Date()).getTime() / 1000);

    expect(channelInvite(data.token, channelObj.channelId, sender.authUserId)).toStrictEqual({});

    const m1 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m2 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m3 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m4 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m5 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m6 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m7 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m8 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m9 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m10 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m11 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m12 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m13 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m14 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m15 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m16 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m17 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m18 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m19 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m20 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m21 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m22 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m23 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m24 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m25 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m26 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m27 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m28 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m29 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m30 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m31 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m32 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m33 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m34 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m35 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m36 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m37 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m38 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m39 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m40 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m41 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m42 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m43 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m44 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m45 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m46 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m47 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m48 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m49 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m50 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m51 = messageSend(sender.token, channelObj.channelId, 'a').messageId;
    const m52 = messageSend(sender.token, channelObj.channelId, 'a').messageId;

    expect(m1).toStrictEqual(expect.any(Number));
    expect(m2).toStrictEqual(expect.any(Number));
    expect(m3).toStrictEqual(expect.any(Number));
    expect(m4).toStrictEqual(expect.any(Number));
    expect(m5).toStrictEqual(expect.any(Number));
    expect(m6).toStrictEqual(expect.any(Number));
    expect(m7).toStrictEqual(expect.any(Number));
    expect(m8).toStrictEqual(expect.any(Number));
    expect(m9).toStrictEqual(expect.any(Number));
    expect(m10).toStrictEqual(expect.any(Number));
    expect(m11).toStrictEqual(expect.any(Number));
    expect(m12).toStrictEqual(expect.any(Number));
    expect(m13).toStrictEqual(expect.any(Number));
    expect(m14).toStrictEqual(expect.any(Number));
    expect(m15).toStrictEqual(expect.any(Number));
    expect(m16).toStrictEqual(expect.any(Number));
    expect(m17).toStrictEqual(expect.any(Number));
    expect(m18).toStrictEqual(expect.any(Number));
    expect(m19).toStrictEqual(expect.any(Number));
    expect(m20).toStrictEqual(expect.any(Number));
    expect(m21).toStrictEqual(expect.any(Number));
    expect(m22).toStrictEqual(expect.any(Number));
    expect(m23).toStrictEqual(expect.any(Number));
    expect(m24).toStrictEqual(expect.any(Number));
    expect(m25).toStrictEqual(expect.any(Number));
    expect(m26).toStrictEqual(expect.any(Number));
    expect(m27).toStrictEqual(expect.any(Number));
    expect(m28).toStrictEqual(expect.any(Number));
    expect(m29).toStrictEqual(expect.any(Number));
    expect(m30).toStrictEqual(expect.any(Number));
    expect(m31).toStrictEqual(expect.any(Number));
    expect(m32).toStrictEqual(expect.any(Number));
    expect(m33).toStrictEqual(expect.any(Number));
    expect(m34).toStrictEqual(expect.any(Number));
    expect(m35).toStrictEqual(expect.any(Number));
    expect(m36).toStrictEqual(expect.any(Number));
    expect(m37).toStrictEqual(expect.any(Number));
    expect(m38).toStrictEqual(expect.any(Number));
    expect(m39).toStrictEqual(expect.any(Number));
    expect(m40).toStrictEqual(expect.any(Number));
    expect(m41).toStrictEqual(expect.any(Number));
    expect(m42).toStrictEqual(expect.any(Number));
    expect(m43).toStrictEqual(expect.any(Number));
    expect(m44).toStrictEqual(expect.any(Number));
    expect(m45).toStrictEqual(expect.any(Number));
    expect(m46).toStrictEqual(expect.any(Number));
    expect(m47).toStrictEqual(expect.any(Number));
    expect(m48).toStrictEqual(expect.any(Number));
    expect(m49).toStrictEqual(expect.any(Number));
    expect(m50).toStrictEqual(expect.any(Number));
    expect(m51).toStrictEqual(expect.any(Number));
    expect(m52).toStrictEqual(expect.any(Number));

    const set = new Set([m1, m2, m3, m4, m5, m6, m7, m8, m9, m10,
      m11, m12, m13, m14, m15, m16, m17, m18, m19, m20,
      m21, m22, m23, m24, m25, m26, m27, m28, m29, m30,
      m31, m32, m33, m34, m35, m36, m37, m38, m39, m40,
      m41, m42, m43, m44, m45, m46, m47, m48, m49, m50,
      m51, m52]);

    expect(set.size).toBe(52);

    expect(channelMessages(data.token, channelObj.channelId, start)).toStrictEqual({
      messages: [
        {
          messageId: m52,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m51,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m50,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m49,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m48,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m47,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m46,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m45,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m44,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m43,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m42,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m41,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m40,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m39,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m38,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m37,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m36,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m35,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m34,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m33,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m32,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m31,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m30,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m29,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m28,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m27,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m26,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m25,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m24,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        }, {
          messageId: m23,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m22,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m21,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m20,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m19,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m18,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m17,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m16,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m15,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m14,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m13,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m12,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m11,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m10,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m9,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m8,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m7,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m6,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m5,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m4,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m3,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
      ],
      start: 0,
      end: 50,
    });

    const newStart = 50;
    expect(channelMessages(data.token, channelObj.channelId, newStart)).toStrictEqual({
      messages: [
        {
          messageId: m2,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
        {
          messageId: m1,
          uId: sender.authUserId,
          message: 'a',
          timeSent: expect.any(Number),
        },
      ],
      start: 50,
      end: -1,
    });
  });
});

describe('/channel/join/v3', () => {
  // channelJoinV1 Error Tests
  const email1 = 'z5555555@ad.unsw.edu.au';
  const password1 = 'password';
  const nameFirst1 = 'Perry';
  const nameLast1 = 'the Platypus';

  const email2 = 'z1111111@ad.unsw.edu.au';
  const password2 = 'password';
  const nameFirst2 = 'Dr';
  const nameLast2 = 'Doofenshmirtz';

  const email3 = 'z2222222@ad.unsw.edu.au';
  const password3 = 'password';
  const nameFirst3 = 'Phineas';
  const nameLast3 = 'Flynn';

  const channelName1 = 'Phineas and Ferb';
  const channelName2 = 'Evil Incorporated';

  test('invalid channelId', () => {
    const perry = authRegister(email1, password1, nameFirst1, nameLast1);
    const perryChannel = channelsCreate(perry.token, channelName1, true);

    expect(channelJoin(perry.token, perryChannel.channelId + 1)).toEqual(400);
  });

  test('invalid token', () => {
    const perry = authRegister(email1, password1, nameFirst1, nameLast1);
    const perryChannel = channelsCreate(perry.token, channelName1, true);

    expect(channelJoin(perry.token + 1, perryChannel.channelId)).toEqual(403);
  });

  test('User is already a member of channel', () => {
    const perry = authRegister(email1, password1, nameFirst1, nameLast1);
    const perryChannel = channelsCreate(perry.token, channelName1, true);

    expect(channelJoin(perry.token, perryChannel.channelId)).toEqual(400);
  });

  test('public channel, user is not member or global owner', () => {
    // Dr user joins Perry's public channel
    const perry = authRegister(email1, password1, nameFirst1, nameLast1);
    const doofenshmirtz = authRegister(email2, password2, nameFirst2, nameLast2);
    const perryChannel = channelsCreate(perry.token, channelName1, true);

    expect(channelJoin(doofenshmirtz.token, perryChannel.channelId)).toStrictEqual({});
    expect(channelJoin(doofenshmirtz.token, perryChannel.channelId)).toEqual(400);
  });

  test('private channel, user is not member or global owner', () => {
    const doofenshmirtz = authRegister(email2, password2, nameFirst2, nameLast2);
    const phineas = authRegister(email3, password3, nameFirst3, nameLast3);
    const drChannel = channelsCreate(doofenshmirtz.token, channelName2, false);

    expect(channelJoin(phineas.token, drChannel.channelId)).toEqual(403);
  });

  // channelJoinV1 Valid Test
  test('joining a public channel', () => {
    // Perry owns a public channel
    const perry = authRegister(email1, password1, nameFirst1, nameLast1);
    const doofenshmirtz = authRegister(email2, password2, nameFirst2, nameLast2);
    const phineas = authRegister(email3, password3, nameFirst3, nameLast3);
    const perryChannel = channelsCreate(perry.token, channelName1, true);

    // Doofenshmirtz and Phineas both join the channel
    expect(channelJoin(doofenshmirtz.token, perryChannel.channelId)).toStrictEqual({});
    expect(channelJoin(phineas.token, perryChannel.channelId)).toStrictEqual({});

    expect(channelJoin(doofenshmirtz.token, perryChannel.channelId)).toEqual(400);
    expect(channelJoin(phineas.token, perryChannel.channelId)).toEqual(400);
  });

  // Global owners can join private channels without an invite
  test('joining a private channel', () => {
    // Dr is not a global owner but made a private channel
    const perry = authRegister(email1, password1, nameFirst1, nameLast1);
    const doofenshmirtz = authRegister(email2, password2, nameFirst2, nameLast2);
    const phineas = authRegister(email3, password3, nameFirst3, nameLast3);
    const drChannel = channelsCreate(doofenshmirtz.token, channelName2, false);

    // Perry joins a private channel because he is a global owner
    expect(channelJoin(phineas.token, drChannel.channelId)).toEqual(403);
    expect(channelJoin(perry.token, drChannel.channelId)).toStrictEqual({});
    expect(channelJoin(perry.token, drChannel.channelId)).toEqual(400);
    expect(channelJoin(doofenshmirtz.token, drChannel.channelId)).toEqual(400);
  });
});

describe('channelInviteV3', () => {
  // channelInviteV3 Error Tests
  const email1 = 'z5555555@ad.unsw.edu.au';
  const password1 = 'password';
  const nameFirst1 = 'Alvin';
  const nameLast1 = 'the Chipmunk';

  const email2 = 'z1111111@ad.unsw.edu.au';
  const password2 = 'password';
  const nameFirst2 = 'Simon';
  const nameLast2 = 'the Chipmunk';

  const email3 = 'z2222222@ad.unsw.edu.au';
  const password3 = 'password';
  const nameFirst3 = 'Theodore';
  const nameLast3 = 'the Chipmunk';

  const channelName1 = "Dave Seville's House";
  const channelName2 = "Ian Hawke's House";

  // Cool Public Channels
  // no channel created so channelId should be invalid
  // Simon tries to invite Theodore, but Simon doesn't even have an account.
  test('invalid token', () => {
    const Alvin = authRegister(email1, password1, nameFirst1, nameLast1);
    const Simon = authRegister(email2, password2, nameFirst2, nameLast2);
    const DavesHouse = channelsCreate(Alvin.token, channelName1, true);

    expect(channelInvite(Alvin.token + 1, DavesHouse.channelId, Simon.authUserId)).toEqual(403);
  });

  test('invalid channelId', () => {
    const Alvin = authRegister(email1, password1, nameFirst1, nameLast1);
    const Simon = authRegister(email2, password2, nameFirst2, nameLast2);
    const DavesHouse = channelsCreate(Alvin.token, channelName1, false);

    expect(channelInvite(Alvin.token, DavesHouse.channelId + 1, Simon.authUserId)).toEqual(400);
  });

  // channel created and invited user is invalid
  test('uId does not refer to a valid user', () => {
    const Alvin = authRegister(email1, password1, nameFirst1, nameLast1);
    const Simon = authRegister(email2, password2, nameFirst2, nameLast2);
    const DavesHouse = channelsCreate(Alvin.token, channelName1, true);

    expect(channelInvite(Alvin.token, DavesHouse.channelId, Simon.authUserId + 1)).toEqual(400);
  });

  // channel created and uId is invited and is invited again
  test('uId refers to a member already in the channel', () => {
    const Alvin = authRegister(email1, password1, nameFirst1, nameLast1);
    const Simon = authRegister(email2, password2, nameFirst2, nameLast2);
    const DavesHouse = channelsCreate(Alvin.token, channelName1, false);

    expect(channelInvite(Alvin.token, DavesHouse.channelId, Alvin.authUserId)).toEqual(400);
    expect(channelInvite(Alvin.token, DavesHouse.channelId, Simon.authUserId)).toStrictEqual({});
    expect(channelInvite(Alvin.token, DavesHouse.channelId, Simon.authUserId)).toEqual(400);
  });

  // channel is created by Alvin, Theodore invites Simon but Theodore is not a member of the channel
  test('channelId is valid, authUser is not a member and uId is not a member', () => {
    const Alvin = authRegister(email1, password1, nameFirst1, nameLast1);
    const Simon = authRegister(email2, password2, nameFirst2, nameLast2);
    const Theodore = authRegister(email3, password3, nameFirst3, nameLast3);
    const DavesHouse = channelsCreate(Alvin.token, channelName1, true);

    expect(channelInvite(Theodore.token, DavesHouse.channelId, Simon.authUserId)).toEqual(403);
    expect(channelInvite(Theodore.token, DavesHouse.channelId, Alvin.authUserId)).toEqual(400);
  });

  // channelInviteV1 coolPublicChannel Valid Tests
  test('authUserId invites uId to public channel', () => {
    const Alvin = authRegister(email1, password1, nameFirst1, nameLast1);
    const Simon = authRegister(email2, password2, nameFirst2, nameLast2);
    const Theodore = authRegister(email3, password3, nameFirst3, nameLast3);
    const DavesHouse = channelsCreate(Alvin.token, channelName1, false);

    expect(channelInvite(Alvin.token, DavesHouse.channelId, Simon.authUserId)).toStrictEqual({});
    expect(channelInvite(Alvin.token, DavesHouse.channelId, Theodore.authUserId)).toStrictEqual({});
    expect(channelInvite(Alvin.token, DavesHouse.channelId, Simon.authUserId)).toEqual(400);
    expect(channelInvite(Alvin.token, DavesHouse.channelId, Theodore.authUserId)).toEqual(400);
  });

  // channelInviteV3 edgyPrivateChannel Valid Tests
  test('any member can invite uId to private channel', () => {
    const Alvin = authRegister(email1, password1, nameFirst1, nameLast1);
    const Simon = authRegister(email2, password2, nameFirst2, nameLast2);
    const Theodore = authRegister(email3, password3, nameFirst3, nameLast3);
    const IansHouse = channelsCreate(Alvin.token, channelName2, false);

    expect(channelInvite(Alvin.token, IansHouse.channelId, Simon.authUserId)).toStrictEqual({});
    expect(channelInvite(Simon.token, IansHouse.channelId, Theodore.authUserId)).toStrictEqual({});
    expect(channelInvite(Alvin.token, IansHouse.channelId, Simon.authUserId)).toEqual(400);
    expect(channelInvite(Alvin.token, IansHouse.channelId, Theodore.authUserId)).toEqual(400);
  });

  test('globalOwner cannot invite themselves to private channel', () => {
    const Alvin = authRegister(email1, password1, nameFirst1, nameLast1);
    const Simon = authRegister(email2, password2, nameFirst2, nameLast2);
    const Theodore = authRegister(email3, password3, nameFirst3, nameLast3);
    const IansHouse = channelsCreate(Simon.token, channelName2, true);

    expect(channelInvite(Alvin.token, IansHouse.channelId, Alvin.authUserId)).toEqual(403);
    expect(channelInvite(Alvin.token, IansHouse.channelId, Theodore.authUserId)).toEqual(403);
    expect(channelInvite(Simon.token, IansHouse.channelId, Theodore.authUserId)).toStrictEqual({});
    expect(channelInvite(Simon.token, IansHouse.channelId, Theodore.authUserId)).toEqual(400);
  });
});

describe('/channel/leave/v1', () => {
  let userObj: UserRegisterReturn;
  let channelObj: ChannelCreateReturn;
  beforeEach(() => {
    const registerUser = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password1',
          nameFirst: 'Madhav',
          nameLast: 'Mishra'
        }
      }
    );
    userObj = JSON.parse(registerUser.getBody() as string);
    // const channelCreate = request(
    //   'POST',
    //   SERVER_URL + '/channels/create/v2',
    //   {
    //     json: {
    //       token: userObj.token,
    //       name: 'chanel',
    //       isPublic: true
    //     }
    //   }
    // );
    // channelObj = JSON.parse(channelCreate.getBody() as string);
    channelObj = channelsCreate(userObj.token, 'chanel', true);
  });

  test('invalid token', () => {
    const channelLeave = request(
      'POST',
      SERVER_URL + '/channel/leave/v1',
      {
        json: {
          token: userObj.token + 'invalid',
          channelId: channelObj.channelId
        }
      }
    );

    const channelLeaveObj = JSON.parse(channelLeave.getBody() as string);
    expect(channelLeaveObj).toStrictEqual(ERROR);
  });

  test('invalid channelId', () => {
    const channelLeave = request(
      'POST',
      SERVER_URL + '/channel/leave/v1',
      {
        json: {
          token: userObj.token,
          channelId: channelObj.channelId + 1
        }
      }
    );

    const channelLeaveObj = JSON.parse(channelLeave.getBody() as string);
    expect(channelLeaveObj).toStrictEqual(ERROR);
  });

  test('invalid - user is not a member of channel', () => {
    const registerUser2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z5444444@ad.unsw.edu.au',
          password: 'password1',
          nameFirst: 'Madhav',
          nameLast: 'Mishra'
        }
      }
    );
    const userObj2 = JSON.parse(registerUser2.getBody() as string);

    const channelLeave = request(
      'POST',
      SERVER_URL + '/channel/leave/v1',
      {
        json: {
          token: userObj2.token,
          channelId: channelObj.channelId
        }
      }
    );

    const channelLeaveObj = JSON.parse(channelLeave.getBody() as string);
    expect(channelLeaveObj).toStrictEqual(ERROR);
  });

  test('channel member leaves', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z5444444@ad.unsw.edu.au',
          password: 'password1',
          nameFirst: 'Jephthah',
          nameLast: 'Benjamin'
        }
      }
    );

    const userObj2 = JSON.parse(res.getBody() as string);

    expect(channelJoin(userObj2.token, channelObj.channelId)).toStrictEqual({});

    const channelLeave = request(
      'POST',
      SERVER_URL + '/channel/leave/v1',
      {
        json: {
          token: userObj2.token,
          channelId: channelObj.channelId
        }
      }
    );

    const channelLeaveObj = JSON.parse(channelLeave.getBody() as string);
    expect(channelLeaveObj).toStrictEqual({});

    const channelDetails = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: userObj.token,
          channelId: channelObj.channelId
        }
      }
    );
    const channelDetailsObj = JSON.parse(channelDetails.getBody() as string);
    expect(channelDetailsObj).toStrictEqual({
      name: 'chanel',
      isPublic: true,
      ownerMembers: [
        {
          uId: userObj.authUserId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
          handleStr: 'madhavmishra'
        }
      ],
      allMembers: [
        {
          uId: userObj.authUserId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
          handleStr: 'madhavmishra'
        }
      ]
    });
  });

  test('channel owner leaves', () => {
    const registerUser2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z5444444@ad.unsw.edu.au',
          password: 'password1',
          nameFirst: 'Jephthah',
          nameLast: 'Benjamin'
        }
      }
    );
    const userObj2: UserRegisterReturn = JSON.parse(registerUser2.getBody() as string);

    expect(channelJoin(userObj2.token, channelObj.channelId)).toStrictEqual({});

    const channelLeave = request(
      'POST',
      SERVER_URL + '/channel/leave/v1',
      {
        json: {
          token: userObj.token,
          channelId: channelObj.channelId
        }
      }
    );

    const channelLeaveObj = JSON.parse(channelLeave.getBody() as string);
    expect(channelLeaveObj).toStrictEqual({});

    const channelDetails = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: userObj2.token,
          channelId: channelObj.channelId
        }
      }
    );
    const channelDetailsObj = JSON.parse(channelDetails.getBody() as string);
    expect(channelDetailsObj).toStrictEqual({
      name: 'chanel',
      isPublic: true,
      ownerMembers: [],
      allMembers: [
        {
          uId: userObj2.authUserId,
          email: 'z5444444@ad.unsw.edu.au',
          nameFirst: 'Jephthah',
          nameLast: 'Benjamin',
          handleStr: 'jephthahbenjamin'
        }
      ]
    });
  });
});

describe('channelAddOwnerV1 Public Channel Tests', () => {
  let userId: number;
  let userId2: number;
  let userToken: string;
  let userToken2: string;
  let chanId: number;
  beforeEach(() => {
    const userRes = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
        }
      }
    );

    const userRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z5455555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',

        }
      }
    );

    const userData = JSON.parse(userRes.getBody() as string);
    userId = userData.authUserId;
    userToken = userData.token;
    const userData2 = JSON.parse(userRes2.getBody() as string);
    userId2 = userData2.authUserId;
    userToken2 = userData2.token;

    // const channelRes = request(
    //   'POST',
    //   SERVER_URL + '/channels/create/v2',
    //   {
    //     json: {
    //       token: userToken,
    //       name: 'coolPublicChannel',
    //       isPublic: true,
    //     }
    //   }
    // );
    // const channelData = JSON.parse(channelRes.getBody() as string);
    // chanId = channelData.channelId;

    chanId = channelsCreate(userToken, 'coolPublicChannel', true).channelId;

    expect(channelInvite(userToken, chanId, userId2)).toStrictEqual({});
  });

  // channelId does not refer to a valid channel
  test('channelId is invalid', () => {
    const addOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken,
          channelId: chanId + 1,
          uId: userId2,
        }
      }
    );
    const addOwnerData = JSON.parse(addOwnerRes.getBody() as string);
    expect(addOwnerData).toStrictEqual(ERROR);
  });

  // uId does not refer to a valid user
  test('uId is invalid', () => {
    const addOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          uId: userId2 + 1,
        }
      }
    );
    const addOwnerData = JSON.parse(addOwnerRes.getBody() as string);
    expect(addOwnerData).toStrictEqual(ERROR);
  });

  // uId does not refer to a member of the channel
  test('channelId is invalid', () => {
    const userRes3 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z5355555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',

        }
      }
    );

    const userData3 = JSON.parse(userRes3.getBody() as string);
    const userId3 = userData3.authUserId;

    const addOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          uId: userId3,
        }
      }
    );
    const addOwnerData = JSON.parse(addOwnerRes.getBody() as string);
    expect(addOwnerData).toStrictEqual(ERROR);
  });

  // uId refers to a user who is already an owner
  test('uId is already an owner', () => {
    const addOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          uId: userId,
        }
      }
    );
    const addOwnerData = JSON.parse(addOwnerRes.getBody() as string);
    expect(addOwnerData).toStrictEqual(ERROR);
  });

  // AuthUser does not have permissions to add owners
  test('Authorised user does not have owner permissions in this channel', () => {
    const userRes3 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z5355555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',

        }
      }
    );

    const userData3 = JSON.parse(userRes3.getBody() as string);
    const userId3 = userData3.authUserId;
    const addOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken2,
          channelId: chanId,
          uId: userId3,
        }
      }
    );
    const addOwnerData = JSON.parse(addOwnerRes.getBody() as string);
    expect(addOwnerData).toStrictEqual(ERROR);
  });

  // Token is invalid
  test('AuthUser / token is invalid', () => {
    const addOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken + 1,
          channelId: chanId,
          uId: userId,
        }
      }
    );
    const addOwnerData = JSON.parse(addOwnerRes.getBody() as string);
    expect(addOwnerData).toStrictEqual(ERROR);
  });

  test('valid addOwner test', () => {
    const userRes3 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z5355555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',

        }
      }
    );

    const userData3 = JSON.parse(userRes3.getBody() as string);
    const userId3 = userData3.authUserId;
    const userToken3 = userData3.token;

    expect(channelInvite(userToken, chanId, userId3)).toStrictEqual({});

    const addOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          uId: userId3,
        }
      }
    );
    const addOwnerData = JSON.parse(addOwnerRes.getBody() as string);
    expect(addOwnerData).toStrictEqual({});

    const addOwnerRes2 = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken3,
          channelId: chanId,
          uId: userId2,
        }
      }
    );
    const addOwnerData2 = JSON.parse(addOwnerRes2.getBody() as string);
    expect(addOwnerData2).toStrictEqual({});

    const channeldetailRes = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
        }
      }
    );

    const detailData = JSON.parse(channeldetailRes.getBody() as string);
    expect(detailData).toStrictEqual({
      name: 'coolPublicChannel',
      isPublic: true,
      ownerMembers: [
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk',
        },
        {
          uId: userId2,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',
          handleStr: 'theodorethechipmunk',
        },
        {
          uId: userId3,
          email: 'z5355555@ad.unsw.edu.au',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',
          handleStr: 'simonthechipmunk',
        },
      ],
      allMembers: [
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk',
        },
        {
          uId: userId2,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',
          handleStr: 'theodorethechipmunk',
        },
        {
          uId: userId3,
          email: 'z5355555@ad.unsw.edu.au',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',
          handleStr: 'simonthechipmunk',
        },
      ]
    });
  });

  // Alvin is Global owner (permission = 1).
  // Simon makes a second public channel, invites Alvin
  // Alvin invites Theodore, and makes him owner
  // Alvin is still not an owner
  test('valid globalOwner addOwner test', () => {
    const userRes3 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z5355555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',

        }
      }
    );

    const userData3 = JSON.parse(userRes3.getBody() as string);
    const userId3 = userData3.authUserId;
    const userToken3 = userData3.token;

    // const channelRes2 = request(
    //   'POST',
    //   SERVER_URL + '/channels/create/v2',
    //   {
    //     json: {
    //       token: userToken3,
    //       name: 'chipmunksOnlyChannel',
    //       isPublic: true,
    //     }
    //   }
    // );
    // const channelData2 = JSON.parse(channelRes2.getBody() as string);
    // const chanId2 = channelData2.channelId;

    const chanId2 = channelsCreate(userToken3, 'chipmunksOnlyChannel', true).channelId;

    // Simon invites Alvin
    expect(channelInvite(userToken3, chanId2, userId)).toStrictEqual({});

    // Alvin invites Theodore
    expect(channelInvite(userToken, chanId2, userId2)).toStrictEqual({});

    // Alvin makes Theodore owner
    const addOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken,
          channelId: chanId2,
          uId: userId2,
        }
      }
    );
    const addOwnerData = JSON.parse(addOwnerRes.getBody() as string);
    expect(addOwnerData).toStrictEqual({});

    const channeldetailRes = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId2,
        }
      }
    );

    const detailData = JSON.parse(channeldetailRes.getBody() as string);
    expect(detailData).toStrictEqual({
      name: 'chipmunksOnlyChannel',
      isPublic: true,
      ownerMembers: [
        {
          uId: userId3,
          email: 'z5355555@ad.unsw.edu.au',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',
          handleStr: 'simonthechipmunk',
        },
        {
          uId: userId2,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',
          handleStr: 'theodorethechipmunk',
        },
      ],
      allMembers: [
        {
          uId: userId3,
          email: 'z5355555@ad.unsw.edu.au',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',
          handleStr: 'simonthechipmunk',
        },
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk',
        },
        {
          uId: userId2,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',
          handleStr: 'theodorethechipmunk',
        },
      ]
    });
  });
});

describe('channelAddOwnerV1 Private Channel Tests', () => {
  let userId: number;
  let userId2: number;
  let userToken: string;
  let userToken2: string;
  let chanId: number;
  beforeEach(() => {
    const userRes = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
        }
      }
    );

    const userRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z5455555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',

        }
      }
    );

    const userData = JSON.parse(userRes.getBody() as string);
    userId = userData.authUserId;
    userToken = userData.token;
    const userData2 = JSON.parse(userRes2.getBody() as string);
    userId2 = userData2.authUserId;
    userToken2 = userData2.token;

    // const channelRes = request(
    //   'POST',
    //   SERVER_URL + '/channels/create/v2',
    //   {
    //     json: {
    //       token: userToken,
    //       name: 'edgyPrivateChannel',
    //       isPublic: false,
    //     }
    //   }
    // );
    // const channelData = JSON.parse(channelRes.getBody() as string);
    // chanId = channelData.channelId;

    chanId = channelsCreate(userToken, 'edgyPrivateChannel', false).channelId;

    expect(channelInvite(userToken, chanId, userId2)).toStrictEqual({});
  });

  // channelId does not refer to a valid channel
  test('channelId is invalid', () => {
    const addOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken,
          channelId: chanId + 1,
          uId: userId2,
        }
      }
    );
    const addOwnerData = JSON.parse(addOwnerRes.getBody() as string);
    expect(addOwnerData).toStrictEqual(ERROR);
  });

  // uId does not refer to a valid user
  test('uId is invalid', () => {
    const addOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          uId: userId2 + 1,
        }
      }
    );
    const addOwnerData = JSON.parse(addOwnerRes.getBody() as string);
    expect(addOwnerData).toStrictEqual(ERROR);
  });

  // uId does not refer to a member of the channel
  test('uId is not a member of channel', () => {
    const userRes3 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z5355555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',

        }
      }
    );

    const userData3 = JSON.parse(userRes3.getBody() as string);
    const userId3 = userData3.authUserId;

    const addOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          uId: userId3,
        }
      }
    );
    const addOwnerData = JSON.parse(addOwnerRes.getBody() as string);
    expect(addOwnerData).toStrictEqual(ERROR);
  });

  // uId refers to a user who is already an owner
  test('uId is already an owner', () => {
    const addOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          uId: userId,
        }
      }
    );
    const addOwnerData = JSON.parse(addOwnerRes.getBody() as string);
    expect(addOwnerData).toStrictEqual(ERROR);
  });

  // AuthUser does not have permissions to add owners
  test('Authorised user does not have owner permissions in this channel', () => {
    const userRes3 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z5355555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',

        }
      }
    );

    const userData3 = JSON.parse(userRes3.getBody() as string);
    const userId3 = userData3.authUserId;
    const addOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken2,
          channelId: chanId,
          uId: userId3,
        }
      }
    );
    const addOwnerData = JSON.parse(addOwnerRes.getBody() as string);
    expect(addOwnerData).toStrictEqual(ERROR);
  });

  // Token is invalid
  test('AuthUser / token is invalid', () => {
    const addOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken + 1,
          channelId: chanId,
          uId: userId,
        }
      }
    );
    const addOwnerData = JSON.parse(addOwnerRes.getBody() as string);
    expect(addOwnerData).toStrictEqual(ERROR);
  });

  test('valid addOwner test', () => {
    const userRes3 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z5355555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',

        }
      }
    );

    const userData3 = JSON.parse(userRes3.getBody() as string);
    const userId3 = userData3.authUserId;
    const userToken3 = userData3.token;

    expect(channelInvite(userToken, chanId, userId3)).toStrictEqual({});

    const addOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          uId: userId3,
        }
      }
    );
    const addOwnerData = JSON.parse(addOwnerRes.getBody() as string);
    expect(addOwnerData).toStrictEqual({});

    const addOwnerRes2 = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken3,
          channelId: chanId,
          uId: userId2,
        }
      }
    );
    const addOwnerData2 = JSON.parse(addOwnerRes2.getBody() as string);
    expect(addOwnerData2).toStrictEqual({});

    const channeldetailRes = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
        }
      }
    );

    const detailData = JSON.parse(channeldetailRes.getBody() as string);
    expect(detailData).toStrictEqual({
      name: 'edgyPrivateChannel',
      isPublic: false,
      ownerMembers: [
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk',
        },
        {
          uId: userId2,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',
          handleStr: 'theodorethechipmunk',
        },
        {
          uId: userId3,
          email: 'z5355555@ad.unsw.edu.au',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',
          handleStr: 'simonthechipmunk',
        },
      ],
      allMembers: [
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk',
        },
        {
          uId: userId2,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',
          handleStr: 'theodorethechipmunk',
        },
        {
          uId: userId3,
          email: 'z5355555@ad.unsw.edu.au',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',
          handleStr: 'simonthechipmunk',
        },
      ]
    });
  });

  // Alvin is Global owner (permission = 1).
  // Simon makes a second private channel, invites Theodore
  // Theodore tries to make himself owner but fails, Simon and makes him owner
  // Theodore then invites Alvin, and Alvin makes himself owner
  test('valid globalOwner addOwner test', () => {
    const userRes3 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z5355555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',

        }
      }
    );

    const userData3 = JSON.parse(userRes3.getBody() as string);
    const userId3 = userData3.authUserId;
    const userToken3 = userData3.token;

    // const channelRes2 = request(
    //   'POST',
    //   SERVER_URL + '/channels/create/v2',
    //   {
    //     json: {
    //       token: userToken3,
    //       name: 'chipmunksOnlyChannel',
    //       isPublic: false,
    //     }
    //   }
    // );
    // const channelData2 = JSON.parse(channelRes2.getBody() as string);
    // const chanId2 = channelData2.channelId;
    const chanId2 = channelsCreate(userToken3, 'chipmunksOnlyChannel', false).channelId;

    expect(channelInvite(userToken3, chanId2, userId2)).toStrictEqual({});

    const addOwnerResErr = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken2,
          channelId: chanId2,
          uId: userId2,
        }
      }
    );
    const addOwnerDataErr = JSON.parse(addOwnerResErr.getBody() as string);
    expect(addOwnerDataErr).toStrictEqual(ERROR);

    const addOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken3,
          channelId: chanId2,
          uId: userId2,
        }
      }
    );
    const addOwnerData = JSON.parse(addOwnerRes.getBody() as string);
    expect(addOwnerData).toStrictEqual({});

    expect(channelInvite(userToken2, chanId2, userId)).toStrictEqual({});

    const addOwnerRes2 = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken,
          channelId: chanId2,
          uId: userId,
        }
      }
    );
    const addOwnerData2 = JSON.parse(addOwnerRes2.getBody() as string);
    expect(addOwnerData2).toStrictEqual({});

    const channeldetailRes = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId2,
        }
      }
    );

    const detailData = JSON.parse(channeldetailRes.getBody() as string);
    expect(detailData).toStrictEqual({
      name: 'chipmunksOnlyChannel',
      isPublic: false,
      ownerMembers: [
        {
          uId: userId3,
          email: 'z5355555@ad.unsw.edu.au',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',
          handleStr: 'simonthechipmunk',
        },
        {
          uId: userId2,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',
          handleStr: 'theodorethechipmunk',
        },
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk',
        },
      ],
      allMembers: [
        {
          uId: userId3,
          email: 'z5355555@ad.unsw.edu.au',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',
          handleStr: 'simonthechipmunk',
        },
        {
          uId: userId2,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',
          handleStr: 'theodorethechipmunk',
        },
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk',
        },
      ]
    });
  });
});

describe('/channel/removeowner/v1', () => {
  let userId: number;
  let userId2: number;
  let userToken: string;
  let userToken2: string;
  let chanId: number;
  beforeEach(() => {
    const userRes = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
        }
      }
    );

    const userRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z5455555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',

        }
      }
    );

    const userObj = JSON.parse(userRes.getBody() as string);
    userId = userObj.authUserId;
    userToken = userObj.token;
    const userObj2 = JSON.parse(userRes2.getBody() as string);
    userId2 = userObj2.authUserId;
    userToken2 = userObj2.token;

    // const channelCreate = request(
    //   'POST',
    //   SERVER_URL + '/channels/create/v2',
    //   {
    //     json: {
    //       token: userObj.token,
    //       name: 'CoolChannel',
    //       isPublic: true
    //     }
    //   }
    // );
    // const channelObj = JSON.parse(channelCreate.getBody() as string);
    // chanId = channelObj.channelId;

    chanId = channelsCreate(userObj.token, 'CoolChannel', true).channelId;

    expect(channelInvite(userToken, chanId, userId2)).toStrictEqual({});
  });

  test('invalid token', () => {
    const removeOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/removeowner/v1',
      {
        json: {
          token: userToken2 + 1,
          channelId: chanId,
          uId: userId2,
        }
      }
    );
    const removeData = JSON.parse(removeOwnerRes.getBody() as string);

    expect(removeData).toStrictEqual(ERROR);
  });

  test('invalid channelId', () => {
    const removeOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/removeowner/v1',
      {
        json: {
          token: userToken,
          channelId: chanId + 1,
          uId: userId2,
        }
      }
    );
    const removeData = JSON.parse(removeOwnerRes.getBody() as string);

    expect(removeData).toStrictEqual(ERROR);
  });

  test('invalid uId', () => {
    const removeOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/removeowner/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          uId: userId2 + 1,
        }
      }
    );
    const removeData = JSON.parse(removeOwnerRes.getBody() as string);

    expect(removeData).toStrictEqual(ERROR);
  });

  test('user is not the owner of the channel ', () => {
    const removeOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/removeowner/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          uId: userId2,
        }
      }
    );
    const removeData = JSON.parse(removeOwnerRes.getBody() as string);

    expect(removeData).toStrictEqual(ERROR);
  });

  test('user is a only owner in the channel', () => {
    const removeOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/removeowner/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          uId: userId,
        }
      }
    );
    const removeData = JSON.parse(removeOwnerRes.getBody() as string);

    expect(removeData).toStrictEqual(ERROR);
  });

  test('valid channelId, authorised user is not an owner', () => {
    const userRes3 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z5355555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',

        }
      }
    );

    const userData3 = JSON.parse(userRes3.getBody() as string);
    const userToken3 = userData3.token;

    const removeOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/removeowner/v1',
      {
        json: {
          token: userToken3,
          channelId: chanId,
          uId: userId2,
        }
      }
    );
    const removeData = JSON.parse(removeOwnerRes.getBody() as string);

    expect(removeData).toStrictEqual(ERROR);
  });

  test('valid remove owner - control', () => {
    const addOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          uId: userId2,
        }
      }
    );
    const addOwnerData = JSON.parse(addOwnerRes.getBody() as string);
    expect(addOwnerData).toStrictEqual({});
    const channeldetailRes = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
        }
      }
    );

    const detailData = JSON.parse(channeldetailRes.getBody() as string);
    expect(detailData).toStrictEqual({
      name: 'CoolChannel',
      isPublic: true,
      ownerMembers: [
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk',
        },
        {
          uId: userId2,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',
          handleStr: 'theodorethechipmunk',
        },
      ],
      allMembers: [
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk',
        },
        {
          uId: userId2,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',
          handleStr: 'theodorethechipmunk',
        },
      ]
    });

    const removeOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/removeowner/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          uId: userId2,
        }
      }
    );
    const removeData = JSON.parse(removeOwnerRes.getBody() as string);

    expect(removeData).toStrictEqual({});

    const channeldetailRes2 = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
        }
      }
    );

    const detailData2 = JSON.parse(channeldetailRes2.getBody() as string);
    expect(detailData2).toStrictEqual({
      name: 'CoolChannel',
      isPublic: true,
      ownerMembers: [
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk',
        }
      ],
      allMembers: [
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk',
        },
        {
          uId: userId2,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',
          handleStr: 'theodorethechipmunk',
        }
      ]
    });
  });

  test('valid remove owner - multiple', () => {
    const userRes3 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z5355555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',

        }
      }
    );

    const userData3 = JSON.parse(userRes3.getBody() as string);
    const userId3 = userData3.authUserId;
    const userToken3 = userData3.token;

    expect(channelInvite(userToken, chanId, userId3)).toStrictEqual({});

    const addOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          uId: userId3,
        }
      }
    );
    const addOwnerData = JSON.parse(addOwnerRes.getBody() as string);
    expect(addOwnerData).toStrictEqual({});

    const addOwnerRes2 = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken3,
          channelId: chanId,
          uId: userId2,
        }
      }
    );
    const addOwnerData2 = JSON.parse(addOwnerRes2.getBody() as string);
    expect(addOwnerData2).toStrictEqual({});

    const channeldetailRes = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
        }
      }
    );

    const detailData = JSON.parse(channeldetailRes.getBody() as string);
    expect(detailData).toStrictEqual({
      name: 'CoolChannel',
      isPublic: true,
      ownerMembers: [
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk',
        },
        {
          uId: userId2,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',
          handleStr: 'theodorethechipmunk',
        },
        {
          uId: userId3,
          email: 'z5355555@ad.unsw.edu.au',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',
          handleStr: 'simonthechipmunk',
        },
      ],
      allMembers: [
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk',
        },
        {
          uId: userId2,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',
          handleStr: 'theodorethechipmunk',
        },
        {
          uId: userId3,
          email: 'z5355555@ad.unsw.edu.au',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',
          handleStr: 'simonthechipmunk',
        },
      ]
    });

    const removeOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/removeowner/v1',
      {
        json: {
          token: userToken2,
          channelId: chanId,
          uId: userId3,
        }
      }
    );
    const removeData = JSON.parse(removeOwnerRes.getBody() as string);

    expect(removeData).toStrictEqual({});

    const channeldetailRes2 = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
        }
      }
    );

    const detailData2 = JSON.parse(channeldetailRes2.getBody() as string);
    expect(detailData2).toStrictEqual({
      name: 'CoolChannel',
      isPublic: true,
      ownerMembers: [
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk',
        },
        {
          uId: userId2,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',
          handleStr: 'theodorethechipmunk',
        },
      ],
      allMembers: [
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk',
        },
        {
          uId: userId2,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',
          handleStr: 'theodorethechipmunk',
        },
        {
          uId: userId3,
          email: 'z5355555@ad.unsw.edu.au',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',
          handleStr: 'simonthechipmunk',
        },
      ]
    });
    const removeOwnerRes2 = request(
      'POST',
      SERVER_URL + '/channel/removeowner/v1',
      {
        json: {
          token: userToken2,
          channelId: chanId,
          uId: userId,
        }
      }
    );
    const removeData2 = JSON.parse(removeOwnerRes2.getBody() as string);

    expect(removeData2).toStrictEqual({});

    const channeldetailRes3 = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
        }
      }
    );

    const detailData3 = JSON.parse(channeldetailRes3.getBody() as string);
    expect(detailData3).toStrictEqual({
      name: 'CoolChannel',
      isPublic: true,
      ownerMembers: [
        {
          uId: userId2,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',
          handleStr: 'theodorethechipmunk',
        },
      ],
      allMembers: [
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk',
        },
        {
          uId: userId2,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',
          handleStr: 'theodorethechipmunk',
        },
        {
          uId: userId3,
          email: 'z5355555@ad.unsw.edu.au',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',
          handleStr: 'simonthechipmunk',
        },
      ]
    });
  });

  // Simon makes a channel, and invites Theodore and Alvin
  // Simon makes Theodore channelOwner,
  // Alvin who is globalOwner changes Theodore so he is no longer an owner
  // on Alvin's channel he makes Theodore an Owner, then removes himself as Owner
  test('valid globalOwner removeOwner test', () => {
    const userRes3 = request(
      'POST',
      SERVER_URL + '/auth/register/v3',
      {
        json: {
          email: 'z5355555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',

        }
      }
    );

    const userData3 = JSON.parse(userRes3.getBody() as string);
    const userId3 = userData3.authUserId;
    const userToken3 = userData3.token;

    // const channelCreate2 = request(
    //   'POST',
    //   SERVER_URL + '/channels/create/v2',
    //   {
    //     json: {
    //       token: userToken3,
    //       name: 'CoolerChannel',
    //       isPublic: true
    //     }
    //   }
    // );
    // const channelObj2 = JSON.parse(channelCreate2.getBody() as string);
    const chanId2 = channelsCreate(userToken3, 'CoolerChannel', true).channelId;

    expect(channelInvite(userToken3, chanId2, userId)).toStrictEqual({});

    expect(channelInvite(userToken3, chanId2, userId2)).toStrictEqual({});

    const addOwnerRes = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken3,
          channelId: chanId2,
          uId: userId2,
        }
      }
    );
    const addOwnerData = JSON.parse(addOwnerRes.getBody() as string);
    expect(addOwnerData).toStrictEqual({});

    const channeldetailRes = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId2,
        }
      }
    );

    const detailData = JSON.parse(channeldetailRes.getBody() as string);
    expect(detailData).toStrictEqual({
      name: 'CoolerChannel',
      isPublic: true,
      ownerMembers: [
        {
          uId: userId3,
          email: 'z5355555@ad.unsw.edu.au',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',
          handleStr: 'simonthechipmunk',
        },
        {
          uId: userId2,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',
          handleStr: 'theodorethechipmunk',
        },
      ],
      allMembers: [
        {
          uId: userId3,
          email: 'z5355555@ad.unsw.edu.au',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',
          handleStr: 'simonthechipmunk',
        },
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk',
        },
        {
          uId: userId2,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',
          handleStr: 'theodorethechipmunk',
        },
      ]
    });

    const removeOwnerRes2 = request(
      'POST',
      SERVER_URL + '/channel/removeowner/v1',
      {
        json: {
          token: userToken,
          channelId: chanId2,
          uId: userId2,
        }
      }
    );
    const removeData2 = JSON.parse(removeOwnerRes2.getBody() as string);
    expect(removeData2).toStrictEqual({});

    const channeldetailRes2 = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId2,
        }
      }
    );

    const detailData2 = JSON.parse(channeldetailRes2.getBody() as string);
    expect(detailData2).toStrictEqual({
      name: 'CoolerChannel',
      isPublic: true,
      ownerMembers: [
        {
          uId: userId3,
          email: 'z5355555@ad.unsw.edu.au',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',
          handleStr: 'simonthechipmunk',
        },
      ],
      allMembers: [
        {
          uId: userId3,
          email: 'z5355555@ad.unsw.edu.au',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',
          handleStr: 'simonthechipmunk',
        },
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk',
        },
        {
          uId: userId2,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',
          handleStr: 'theodorethechipmunk',
        },
      ]
    });

    const addOwnerRes2 = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken,
          channelId: chanId2,
          uId: userId,
        }
      }
    );
    const addOwnerData2 = JSON.parse(addOwnerRes2.getBody() as string);
    expect(addOwnerData2).toStrictEqual({});

    const channeldetailRes3 = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId2,
        }
      }
    );

    const detailData3 = JSON.parse(channeldetailRes3.getBody() as string);
    expect(detailData3).toStrictEqual({
      name: 'CoolerChannel',
      isPublic: true,
      ownerMembers: [
        {
          uId: userId3,
          email: 'z5355555@ad.unsw.edu.au',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',
          handleStr: 'simonthechipmunk',
        },
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk',
        },
      ],
      allMembers: [
        {
          uId: userId3,
          email: 'z5355555@ad.unsw.edu.au',
          nameFirst: 'Simon',
          nameLast: 'the Chipmunk',
          handleStr: 'simonthechipmunk',
        },
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk',
        },
        {
          uId: userId2,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',
          handleStr: 'theodorethechipmunk',
        },
      ]
    });

    // second case:
    const channeldetailRes4 = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
        }
      }
    );

    const detailData4 = JSON.parse(channeldetailRes4.getBody() as string);
    expect(detailData4).toStrictEqual({
      name: 'CoolChannel',
      isPublic: true,
      ownerMembers: [
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk',
        },
      ],
      allMembers: [
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk',
        },
        {
          uId: userId2,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',
          handleStr: 'theodorethechipmunk',
        },
      ]
    });

    const addOwnerRes3 = request(
      'POST',
      SERVER_URL + '/channel/addowner/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          uId: userId2,
        }
      }
    );
    const addOwnerData3 = JSON.parse(addOwnerRes3.getBody() as string);
    expect(addOwnerData3).toStrictEqual({});

    const removeOwnerRes3 = request(
      'POST',
      SERVER_URL + '/channel/removeowner/v1',
      {
        json: {
          token: userToken,
          channelId: chanId,
          uId: userId,
        }
      }
    );
    const removeData3 = JSON.parse(removeOwnerRes3.getBody() as string);
    expect(removeData3).toStrictEqual({});

    const channeldetailRes5 = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
        }
      }
    );

    const detailData5 = JSON.parse(channeldetailRes5.getBody() as string);
    expect(detailData5).toStrictEqual({
      name: 'CoolChannel',
      isPublic: true,
      ownerMembers: [
        {
          uId: userId2,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',
          handleStr: 'theodorethechipmunk',
        },
      ],
      allMembers: [
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk',
        },
        {
          uId: userId2,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Theodore',
          nameLast: 'the Chipmunk',
          handleStr: 'theodorethechipmunk',
        },
      ]
    });
  });
});
