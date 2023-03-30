import request from 'sync-request';

import { port, url } from './config.json';
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
  request(
    'DELETE',
    SERVER_URL + '/clear/v1'
  );
});

describe('channelDetailsV2 ', () => {
  let userId: number;
  let userToken: string;
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
    userId = userData.authUserId;
    userToken = userData.token;
  });

  test('token is invalid', () => {
    const channelRes = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userToken,
          name: 'COMP1531 Crunchie',
          isPublic: false,
        }
      }
    );
    const channelData = JSON.parse(channelRes.getBody() as string);
    const chanId = channelData.channelId;

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
    const channelRes = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userToken,
          name: 'COMP1531 Crunchie',
          isPublic: false,
        }
      }
    );
    const channelData = JSON.parse(channelRes.getBody() as string);
    const chanId = channelData.channelId;

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
      SERVER_URL + '/auth/register/v2',
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

    const channelRes = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userToken,
          name: 'COMP1531 Crunchie',
          isPublic: false,
        }
      }
    );

    const channelData = JSON.parse(channelRes.getBody() as string);
    const chanId = channelData.channelId;

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
    const channelRes = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userToken,
          name: 'COMP1531 Crunchie',
          isPublic: false,
        }
      }
    );

    const channelData = JSON.parse(channelRes.getBody() as string);
    const chanId = channelData.channelId;

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
      SERVER_URL + '/auth/register/v2',
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

    const channelRes = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userToken,
          name: 'COMP1531 Crunchie',
          isPublic: true,
        }
      }
    );

    const channelData = JSON.parse(channelRes.getBody() as string);
    const chanId = channelData.channelId;

    const joinRes = request(
      'POST',
      SERVER_URL + '/channel/join/v2',
      {
        json: {
          token: userData2.token,
          channelId: chanId,
        }
      }
    );

    const joinData = JSON.parse(joinRes.getBody() as string);
    expect(joinData).toStrictEqual({});

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

describe('channelMessagesV2', () => {
  let userToken: string;
  let chanId: number;
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

    const channelRes = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userToken,
          name: 'Coding',
          isPublic: true,
        }
      }
    );
    const channelData = JSON.parse(channelRes.getBody() as string);
    chanId = channelData.channelId;
  });

  test('invalid channelId', () => {
    const messageRes = request(
      'GET',
      SERVER_URL + '/channel/messages/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId + 1,
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
      SERVER_URL + '/channel/messages/v2',
      {
        qs: {
          token: userToken + 1,
          channelId: chanId,
          start: 0,
        }
      }
    );

    const messageData = JSON.parse(messageRes.getBody() as string);

    expect(messageData).toStrictEqual(ERROR);
  });

  test('start is greater than total messages in channel', () => {
    const messageRes = request(
      'GET',
      SERVER_URL + '/channel/messages/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
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
      SERVER_URL + '/channel/messages/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
          start: -1,
        }
      }
    );
    const messageData = JSON.parse(messageRes.getBody() as string);

    expect(messageData).toStrictEqual(ERROR);
  });

  test('valid channelId but authorised user is not a member', () => {
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
      SERVER_URL + '/channel/messages/v2',
      {
        qs: {
          token: userData2.token,
          channelId: chanId,
          start: 0,
        }
      }
    );

    const messageData = JSON.parse(messageRes.getBody() as string);

    expect(messageData).toStrictEqual(ERROR);
  });

  test('valid empty channelMessagesV1', () => {
    const messageRes = request(
      'GET',
      SERVER_URL + '/channel/messages/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
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

  test('multiple valid empty channelMessagesV1', () => {
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

    const channelRes2 = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userData2.token,
          name: 'Maths',
          isPublic: true,
        }
      }
    );

    const channelRes3 = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userData3.token,
          name: 'Commerce',
          isPublic: true,
        }
      }
    );

    const channelData2 = JSON.parse(channelRes2.getBody() as string);
    const channelData3 = JSON.parse(channelRes3.getBody() as string);

    const messageRes = request(
      'GET',
      SERVER_URL + '/channel/messages/v2',
      {
        qs: {
          token: userToken,
          channelId: chanId,
          start: 0,
        }
      }
    );

    const messageRes2 = request(
      'GET',
      SERVER_URL + '/channel/messages/v2',
      {
        qs: {
          token: userData2.token,
          channelId: channelData2.channelId,
          start: 0,
        }
      }
    );

    const messageRes3 = request(
      'GET',
      SERVER_URL + '/channel/messages/v2',
      {
        qs: {
          token: userData3.token,
          channelId: channelData3.channelId,
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

describe('channelJoinV2', () => {
  // channelJoinV1 Error Tests
  let userId: number;
  let userToken: string;
  beforeEach(() => {
    const userRes = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Perry',
          nameLast: 'the Platypus',
        }
      }
    );

    const userData = JSON.parse(userRes.getBody() as string);
    userId = userData.authUserId;
    userToken = userData.token;
  });

  test('invalid channelId', () => {
    const channelRes = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userToken,
          name: 'coolChannel',
          isPublic: true,
        }
      }
    );

    const channelData = JSON.parse(channelRes.getBody() as string);

    const joinRes = request(
      'POST',
      SERVER_URL + '/channel/join/v2',
      {
        json: {
          token: userToken,
          channelId: channelData.channelId + 1,
        }
      }
    );

    const joinData = JSON.parse(joinRes.getBody() as string);
    expect(joinData).toStrictEqual(ERROR);
  });

  test('invalid token', () => {
    const channelRes = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userToken,
          name: 'coolChannel',
          isPublic: true,
        }
      }
    );
    const channelData = JSON.parse(channelRes.getBody() as string);

    const joinRes = request(
      'POST',
      SERVER_URL + '/channel/join/v2',
      {
        json: {
          token: userToken + 1,
          channelId: channelData.channelId,
        }
      }
    );

    const joinData = JSON.parse(joinRes.getBody() as string);
    expect(joinData).toStrictEqual(ERROR);
  });

  test('User is already a member of channel', () => {
    const channelRes = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userToken,
          name: 'coolChannel',
          isPublic: true,
        }
      }
    );
    const channelData = JSON.parse(channelRes.getBody() as string);

    const joinRes = request(
      'POST',
      SERVER_URL + '/channel/join/v2',
      {
        json: {
          token: userToken,
          channelId: channelData.channelId,
        }
      }
    );

    const joinData = JSON.parse(joinRes.getBody() as string);
    expect(joinData).toStrictEqual(ERROR);
  });

  test('public channel, user is not member or global owner', () => {
    const channelRes = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userToken,
          name: 'coolChannel',
          isPublic: true,
        }
      }
    );
    const channelData = JSON.parse(channelRes.getBody() as string);

    const userRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5455555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Dr',
          nameLast: 'Doofenshmirtz',
        }
      }
    );

    // Dr user is not a global owner
    const userData2 = JSON.parse(userRes2.getBody() as string);
    // Dr user is not a global owner
    // Perry user is a global owner and member of a public channel
    const joinRes = request(
      'POST',
      SERVER_URL + '/channel/join/v2',
      {
        json: {
          token: userData2.token,
          channelId: channelData.channelId,
        }
      }
    );

    const joinData = JSON.parse(joinRes.getBody() as string);
    // Dr user joins Perry's public channel
    expect(joinData).toStrictEqual({});

    // Error because Dr is already in Perry's channel
    const joinRes2 = request(
      'POST',
      SERVER_URL + '/channel/join/v2',
      {
        json: {
          token: userData2.token,
          channelId: channelData.channelId,
        }
      }
    );
    const joinData2 = JSON.parse(joinRes2.getBody() as string);
    expect(joinData2).toStrictEqual(ERROR);
  });

  test('private channel, user is not member or global owner', () => {
    const userRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5455555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Dr',
          nameLast: 'Doofenshmirtz',
        }
      }
    );

    const userData2 = JSON.parse(userRes2.getBody() as string);

    const channelRes = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userToken,
          name: 'coolPrivateChannel',
          isPublic: false,
        }
      }
    );

    const channelData = JSON.parse(channelRes.getBody() as string);

    // Dr user is not a global owner
    // Perry user is a global owner and member of private channel
    const joinRes = request(
      'POST',
      SERVER_URL + '/channel/join/v2',
      {
        json: {
          token: userData2.token,
          channelId: channelData.channelId,
        }
      }
    );

    const joinData = JSON.parse(joinRes.getBody() as string);
    expect(joinData).toStrictEqual(ERROR);
  });

  // channelJoinV1 Valid Test
  test('joining a public channel', () => {
    const userRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5455555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Dr',
          nameLast: 'Doofenshmirtz',
        }
      }
    );

    const userData2 = JSON.parse(userRes2.getBody() as string);

    const channelRes2 = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userToken,
          name: 'coolPublicChannel',
          isPublic: true,
        }
      }
    );
    const channelData2 = JSON.parse(channelRes2.getBody() as string);
    // Perry user is a global owner and member of private channel
    const joinRes = request(
      'POST',
      SERVER_URL + '/channel/join/v2',
      {
        json: {
          token: userData2.token,
          channelId: channelData2.channelId,
        }
      }
    );

    const joinData = JSON.parse(joinRes.getBody() as string);
    expect(joinData).toStrictEqual({});

    const detailRes = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: userData2.token,
          channelId: channelData2.channelId,
        }
      }
    );
    const detailData = JSON.parse(detailRes.getBody() as string);

    expect(detailData).toStrictEqual({
      name: 'coolPublicChannel',
      isPublic: true,
      ownerMembers: [
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Perry',
          nameLast: 'the Platypus',
          handleStr: 'perrytheplatypus'
        }
      ],
      allMembers: expect.any(Array)
    });

    const expectedArray: channelObjUser[] = [
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Perry',
        nameLast: 'the Platypus',
        handleStr: 'perrytheplatypus'
      },
      {
        uId: userData2.authUserId,
        email: 'z5455555@ad.unsw.edu.au',
        nameFirst: 'Dr',
        nameLast: 'Doofenshmirtz',
        handleStr: 'drdoofenshmirtz'
      }
    ];
    expect(detailData.allMembers.sort((a: channelObjUser, b: channelObjUser) => a.uId - b.uId)).toStrictEqual(
      expectedArray.sort((a, b) => a.uId - b.uId)
    );
  });

  test('joining a private channel', () => {
    const userRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5455555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Dr',
          nameLast: 'Doofenshmirtz',
        }
      }
    );

    const userData2 = JSON.parse(userRes2.getBody() as string);

    // Dr is not a global owner but made a private channel
    const channelRes2 = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userData2.token,
          name: 'edgyPrivateChannel',
          isPublic: false,
        }
      }
    );
    const channelData2 = JSON.parse(channelRes2.getBody() as string);

    // Perry joins a private channel because he is a global owner
    const joinRes = request(
      'POST',
      SERVER_URL + '/channel/join/v2',
      {
        json: {
          token: userToken,
          channelId: channelData2.channelId,
        }
      }
    );

    // Global owners can join private channels without an invite
    const joinData = JSON.parse(joinRes.getBody() as string);
    expect(joinData).toStrictEqual({});

    const detailRes = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: userData2.token,
          channelId: channelData2.channelId,
        }
      }
    );
    const detailData = JSON.parse(detailRes.getBody() as string);

    expect(detailData).toStrictEqual({
      name: 'edgyPrivateChannel',
      isPublic: false,
      ownerMembers: [
        {
          uId: userData2.authUserId,
          email: 'z5455555@ad.unsw.edu.au',
          nameFirst: 'Dr',
          nameLast: 'Doofenshmirtz',
          handleStr: 'drdoofenshmirtz'
        }
      ],
      allMembers: expect.any(Array)
    });

    const expectedArray: channelObjUser[] = [
      {
        uId: userData2.authUserId,
        email: 'z5455555@ad.unsw.edu.au',
        nameFirst: 'Dr',
        nameLast: 'Doofenshmirtz',
        handleStr: 'drdoofenshmirtz'
      },
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Perry',
        nameLast: 'the Platypus',
        handleStr: 'perrytheplatypus'
      }
    ];
    expect(detailData.allMembers.sort((a: channelObjUser, b: channelObjUser) => a.uId - b.uId)).toStrictEqual(
      expectedArray.sort((a, b) => a.uId - b.uId)
    );
  });
});

describe('channelInviteV2', () => {
  // channelInviteV1 Error Tests
  let userId: number;
  let userId2: number;
  let userToken: string;
  let userToken2: string;
  let chanId: number;
  beforeEach(() => {
    const userRes = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
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
      SERVER_URL + '/auth/register/v2',
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

    const channelRes = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userToken,
          name: 'coolPublicChannel',
          isPublic: true,
        }
      }
    );
    const channelData = JSON.parse(channelRes.getBody() as string);
    chanId = channelData.channelId;
  });

  // Cool Public Channels
  // no channel created so channelId should be invalid
  test('invalid channelId', () => {
    const inviteRes = request(
      'POST',
      SERVER_URL + '/channel/invite/v2',
      {
        json: {
          token: userToken,
          channelId: chanId + 1,
          uId: userId2,
        }
      }
    );
    const inviteData = JSON.parse(inviteRes.getBody() as string);
    expect(inviteData).toStrictEqual(ERROR);
  });

  // channel created and invited user is invalid
  test('uId does not refer to a valid user', () => {
    const inviteRes = request(
      'POST',
      SERVER_URL + '/channel/invite/v2',
      {
        json: {
          token: userToken,
          channelId: chanId,
          uId: userId2 + 1,
        }
      }
    );
    const inviteData = JSON.parse(inviteRes.getBody() as string);
    expect(inviteData).toStrictEqual(ERROR);
  });

  // channel created and uId is invited and is invited again
  test('uId refers to a member already in the channel', () => {
    const inviteRes = request(
      'POST',
      SERVER_URL + '/channel/invite/v2',
      {
        json: {
          token: userToken,
          channelId: chanId,
          uId: userId2,
        }
      }
    );
    const inviteData = JSON.parse(inviteRes.getBody() as string);
    expect(inviteData).toStrictEqual({});

    const inviteRes2 = request(
      'POST',
      SERVER_URL + '/channel/invite/v2',
      {
        json: {
          token: userToken,
          channelId: chanId,
          uId: userId2,
        }
      }
    );
    const inviteData2 = JSON.parse(inviteRes2.getBody() as string);
    expect(inviteData2).toStrictEqual(ERROR);
  });

  // channel is created by Alvin, Theodore invites Simon but Theodore is not a member of the channel
  test('channelId is valid, authUser is not a member and uId is not a member', () => {
    const userRes3 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
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

    const inviteRes = request(
      'POST',
      SERVER_URL + '/channel/invite/v2',
      {
        json: {
          token: userToken2,
          channelId: chanId,
          uId: userData3.authUserId,
        }
      }
    );
    const inviteData = JSON.parse(inviteRes.getBody() as string);
    expect(inviteData).toStrictEqual(ERROR);
  });

  // Simon tries to invite Theodore, but Simon doesn't even have an account.
  test('invalid token', () => {
    const inviteRes = request(
      'POST',
      SERVER_URL + '/channel/invite/v2',
      {
        json: {
          token: userToken2 + 1,
          channelId: chanId,
          uId: userId2,
        }
      }
    );
    const inviteData = JSON.parse(inviteRes.getBody() as string);

    expect(inviteData).toStrictEqual(ERROR);
  });

  // channelInviteV1 coolPublicChannel Valid Tests
  test('authUserId invites uId to public channel', () => {
    const inviteRes = request(
      'POST',
      SERVER_URL + '/channel/invite/v2',
      {
        json: {
          token: userToken,
          channelId: chanId,
          uId: userId2,
        }
      }
    );
    const inviteData = JSON.parse(inviteRes.getBody() as string);
    expect(inviteData).toStrictEqual({});

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
      name: 'coolPublicChannel',
      isPublic: true,
      ownerMembers: [
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk'
        }
      ],
      allMembers: expect.any(Array)
    });

    const expectedArray: channelObjUser[] = [
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
    ];
    // sorting the array to account for different permutations of expected array
    expect(detailData.allMembers.sort((a: channelObjUser, b: channelObjUser) => a.uId - b.uId)).toStrictEqual(
      expectedArray.sort((a, b) => a.uId - b.uId)
    );
  });

  // channelInviteV1 edgyPrivateChannel Valid Tests
  test('authUserId invites uId to private channel', () => {
    const channelRes2 = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userToken,
          name: 'edgyPrivateChannel',
          isPublic: false,
        }
      }
    );
    const channelData2 = JSON.parse(channelRes2.getBody() as string);

    const inviteRes = request(
      'POST',
      SERVER_URL + '/channel/invite/v2',
      {
        json: {
          token: userToken,
          channelId: channelData2.channelId,
          uId: userId2,
        }
      }
    );
    const inviteData = JSON.parse(inviteRes.getBody() as string);
    expect(inviteData).toStrictEqual({});

    const detailRes = request(
      'GET',
      SERVER_URL + '/channel/details/v2',
      {
        qs: {
          token: userToken,
          channelId: channelData2.channelId,
        }
      }
    );
    const detailData = JSON.parse(detailRes.getBody() as string);

    expect(detailData).toStrictEqual({
      name: 'edgyPrivateChannel',
      isPublic: false,
      ownerMembers: [
        {
          uId: userId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Alvin',
          nameLast: 'the Chipmunk',
          handleStr: 'alvinthechipmunk'
        }
      ],
      allMembers: expect.any(Array)
    });

    const expectedArray: channelObjUser[] = [
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
    ];
    // sorting the array to account for different permutations of expected array
    expect(detailData.allMembers.sort((a: channelObjUser, b: channelObjUser) => a.uId - b.uId)).toStrictEqual(
      expectedArray.sort((a, b) => a.uId - b.uId)
    );
  });
});

describe('/channel/leave/v1', () => {
  let userObj: UserRegisterReturn;
  let channelObj: ChannelCreateReturn;
  beforeEach(() => {
    const registerUser = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
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

    const channelCreate = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userObj.token,
          name: 'chanel',
          isPublic: true
        }
      }
    );
    channelObj = JSON.parse(channelCreate.getBody() as string);
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
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
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
      SERVER_URL + '/auth/register/v2',
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

    const channelJoin = request(
      'POST',
      SERVER_URL + '/channel/join/v2',
      {
        json: {
          token: userObj2.token,
          channelId: channelObj.channelId,
        }
      }
    );
    const channelJoinObj = JSON.parse(channelJoin.getBody() as string);
    expect(channelJoinObj).toStrictEqual({});

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
      SERVER_URL + '/auth/register/v2',
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

    const channelJoin = request(
      'POST',
      SERVER_URL + '/channel/join/v2',
      {
        json: {
          token: userObj2.token,
          channelId: channelObj.channelId,
        }
      }
    );
    const channelJoinObj = JSON.parse(channelJoin.getBody() as string);
    expect(channelJoinObj).toStrictEqual({});

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
      SERVER_URL + '/auth/register/v2',
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
      SERVER_URL + '/auth/register/v2',
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

    const channelRes = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userToken,
          name: 'coolPublicChannel',
          isPublic: true,
        }
      }
    );
    const channelData = JSON.parse(channelRes.getBody() as string);
    chanId = channelData.channelId;

    const inviteRes = request(
      'POST',
      SERVER_URL + '/channel/invite/v2',
      {
        json: {
          token: userToken,
          channelId: chanId,
          uId: userId2,
        }
      }
    );
    const inviteData = JSON.parse(inviteRes.getBody() as string);
    expect(inviteData).toStrictEqual({});
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
      SERVER_URL + '/auth/register/v2',
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
      SERVER_URL + '/auth/register/v2',
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
      SERVER_URL + '/auth/register/v2',
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
      SERVER_URL + '/auth/register/v2',
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

    const channelRes = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: userToken,
          name: 'edgyPrivateChannel',
          isPublic: false,
        }
      }
    );
    const channelData = JSON.parse(channelRes.getBody() as string);
    chanId = channelData.channelId;

    const inviteRes = request(
      'POST',
      SERVER_URL + '/channel/invite/v2',
      {
        json: {
          token: userToken,
          channelId: chanId,
          uId: userId2,
        }
      }
    );
    const inviteData = JSON.parse(inviteRes.getBody() as string);
    expect(inviteData).toStrictEqual({});
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
      SERVER_URL + '/auth/register/v2',
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
      SERVER_URL + '/auth/register/v2',
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
      SERVER_URL + '/auth/register/v2',
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

    const inviteRes = request(
      'POST',
      SERVER_URL + '/channel/invite/v2',
      {
        json: {
          token: userToken,
          channelId: chanId,
          uId: userId3,
        }
      }
    );
    const inviteData = JSON.parse(inviteRes.getBody() as string);
    expect(inviteData).toStrictEqual({});

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
});
