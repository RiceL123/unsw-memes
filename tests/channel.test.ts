import { clear, authRegister, channelsCreate, channelDetails, channelMessages, channelJoin, channelLeave, messageSend, channelInvite, channelRemoveOwner, channelAddOwner } from './routeRequests';

import { url, port } from '../src/config.json';
const SERVER_URL = `${url}:${port}`;

const VALID_CHANNELS_CREATE = { channelId: expect.any(Number) };

interface UserDetails {
  uId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
  profileImgUrl: string;
}

beforeEach(() => {
  clear();
});

describe('channelDetailsV3 ', () => {
  const email = 'z5555555@ad.unsw.edu.au';
  const password = 'password';
  const nameFirst = 'Madhav';
  const nameLast = 'Mishra';

  test('invalid token', () => {
    const person1Data = authRegister(email, password, nameFirst, nameLast);
    const channelName = 'COMP1531 Crunchie';
    const channelObj = channelsCreate(person1Data.token, channelName, false);
    expect(channelObj).toStrictEqual(VALID_CHANNELS_CREATE);

    expect(channelDetails(person1Data.token + 1, channelObj.channelId)).toEqual(403);
  });

  test('channelId is invalid', () => {
    const person1Data = authRegister(email, password, nameFirst, nameLast);
    const channelName = 'COMP1531 Crunchie';
    const channelObj = channelsCreate(person1Data.token, channelName, false);
    expect(channelObj).toStrictEqual(VALID_CHANNELS_CREATE);

    const detailObj = channelDetails(person1Data.token, channelObj.channelId + 1);
    expect(detailObj).toStrictEqual(400);
  });

  test('valid authUserId but not a part of the channel', () => {
    const email2 = 'z4444444@ad.unsw.edu.au';
    const password2 = 'yellowfeathers';
    const nameFirst2 = 'Big';
    const nameLast2 = 'Bird';

    const person1Data = authRegister(email, password, nameFirst, nameLast);
    const person2Data = authRegister(email2, password2, nameFirst2, nameLast2);
    const channelName = 'COMP1531 Crunchie';
    const channelObj = channelsCreate(person1Data.token, channelName, false);
    expect(channelObj).toStrictEqual(VALID_CHANNELS_CREATE);

    const detailObj = channelDetails(person2Data.token, channelObj.channelId);
    expect(detailObj).toStrictEqual(403);
  });

  test('valid authUserId is part of the channel', () => {
    const person1Data = authRegister(email, password, nameFirst, nameLast);
    const channelName = 'COMP1531 Crunchie';
    const channelObj = channelsCreate(person1Data.token, channelName, false);
    expect(channelObj).toStrictEqual(VALID_CHANNELS_CREATE);

    const detailObj = channelDetails(person1Data.token, channelObj.channelId);
    expect(detailObj).toStrictEqual({
      name: 'COMP1531 Crunchie',
      isPublic: false,
      ownerMembers: [
        {
          uId: person1Data.authUserId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
          handleStr: 'madhavmishra',
          profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
        }
      ],
      allMembers: [
        {
          uId: person1Data.authUserId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
          handleStr: 'madhavmishra',
          profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
        }
      ],
    });
  });

  test('multiple valid authUserIds are a part of the channel', () => {
    const email2 = 'z4444444@ad.unsw.edu.au';
    const password2 = 'yellowfeathers';
    const nameFirst2 = 'Big';
    const nameLast2 = 'Bird';

    const person1Data = authRegister(email, password, nameFirst, nameLast);
    const person2Data = authRegister(email2, password2, nameFirst2, nameLast2);

    const channelName = 'COMP1531 Crunchie';
    const channelObj = channelsCreate(person1Data.token, channelName, true);

    const joinObj = channelJoin(person2Data.token, channelObj.channelId);
    expect(joinObj).toStrictEqual({});

    const detailObj = channelDetails(person1Data.token, channelObj.channelId);
    expect(detailObj).toStrictEqual({
      name: 'COMP1531 Crunchie',
      isPublic: true,
      ownerMembers: [
        {
          uId: person1Data.authUserId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
          handleStr: 'madhavmishra',
          profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
        },
      ],
      // array needs to account for any permutation
      allMembers: expect.any(Array),
    });

    const expectedArr: UserDetails[] = [
      {
        uId: person1Data.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'madhavmishra',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: person2Data.authUserId,
        email: 'z4444444@ad.unsw.edu.au',
        nameFirst: 'Big',
        nameLast: 'Bird',
        handleStr: 'bigbird',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      }
    ];

    // to account for any permutation of the allMembers array, we sort
    expect(detailObj.allMembers.sort((a: UserDetails, b: UserDetails) => a.uId - b.uId)).toStrictEqual(
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
          reacts: [],
          isPinned: false,
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
          reacts: [],
          isPinned: false,
        },
        {
          messageId: m2,
          uId: sender.authUserId,
          message: 'Im Batman',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: m1,
          uId: sender.authUserId,
          message: 'Hello World',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
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

    expect(channelInvite(data.token, channelObj.channelId, sender.authUserId)).toStrictEqual({});

    const messageIdArray = [];
    for (let i = 0; i < 52; i++) {
      messageIdArray.push(messageSend(sender.token, channelObj.channelId, 'a').messageId);
    }

    const set = new Set(messageIdArray);

    expect(set.size).toBe(52);

    const expectMessages = [];
    for (let i = 0; i < 52; i++) {
      expectMessages.unshift({
        messageId: messageIdArray[i],
        uId: sender.authUserId,
        message: 'a',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      });
    }

    expect(channelMessages(data.token, channelObj.channelId, start)).toStrictEqual({
      messages: expectMessages.slice(0, 50),
      start: 0,
      end: 50,
    });

    const newStart = 50;
    expect(channelMessages(data.token, channelObj.channelId, newStart)).toStrictEqual({
      messages: expectMessages.slice(50, 52),
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
    expect(channelInvite(Alvin.token, DavesHouse.channelId, Alvin.authUserId)).toEqual(400);
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

describe('/channel/leave/v2', () => {
  const email1 = 'z5555555@ad.unsw.edu.au';
  const password1 = 'password';
  const nameFirst1 = 'Madhav';
  const nameLast1 = 'Mishra';

  const email2 = 'z1111111@ad.unsw.edu.au';
  const password2 = 'password';
  const nameFirst2 = 'Patrick';
  const nameLast2 = 'Galea';

  const channelSEM113 = 'SEM113';

  test('invalid token', () => {
    const Madhav = authRegister(email1, password1, nameFirst1, nameLast1);
    const SEM113 = channelsCreate(Madhav.token, channelSEM113, true);

    expect(channelLeave(Madhav.token + 1, SEM113.channelId)).toEqual(403);
  });

  test('invalid channelId', () => {
    const Madhav = authRegister(email1, password1, nameFirst1, nameLast1);
    const SEM113 = channelsCreate(Madhav.token, channelSEM113, true);

    expect(channelLeave(Madhav.token, SEM113.channelId + 1)).toEqual(400);
  });

  test('invalid - user is not a member of channel', () => {
    const Madhav = authRegister(email1, password1, nameFirst1, nameLast1);
    const Patrick = authRegister(email2, password2, nameFirst2, nameLast2);
    const SEM113 = channelsCreate(Madhav.token, channelSEM113, true);

    expect(channelLeave(Patrick.token, SEM113.channelId)).toEqual(403);
  });

  test('channel member leaves', () => {
    const Madhav = authRegister(email1, password1, nameFirst1, nameLast1);
    const Patrick = authRegister(email2, password2, nameFirst2, nameLast2);
    const SEM113 = channelsCreate(Madhav.token, channelSEM113, true);

    expect(channelJoin(Patrick.token, SEM113.channelId)).toStrictEqual({});
    expect(channelJoin(Patrick.token, SEM113.channelId)).toEqual(400);
    expect(channelLeave(Patrick.token, SEM113.channelId)).toEqual({});
    expect(channelJoin(Madhav.token, SEM113.channelId)).toStrictEqual(400);
    expect(channelLeave(Patrick.token, SEM113.channelId)).toEqual(403);
  });

  test('channel owner leaves', () => {
    const Madhav = authRegister(email1, password1, nameFirst1, nameLast1);
    const Patrick = authRegister(email2, password2, nameFirst2, nameLast2);
    const SEM113 = channelsCreate(Madhav.token, channelSEM113, true);

    expect(channelJoin(Patrick.token, SEM113.channelId)).toStrictEqual({});
    expect(channelLeave(Madhav.token, SEM113.channelId)).toEqual({});
    expect(channelJoin(Patrick.token, SEM113.channelId)).toStrictEqual(400);
    expect(channelLeave(Madhav.token, SEM113.channelId)).toEqual(403);
  });
});

describe('/channel/addowner/v2 Public Channel Tests', () => {
  let userId: number;
  let userId2: number;
  let userToken: string;
  let userToken2: string;
  let chanId: number;
  beforeEach(() => {
    const userData = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Alvin', 'the Chipmunk');
    userId = userData.authUserId;
    userToken = userData.token;
    const userData2 = authRegister('z5455555@ad.unsw.edu.au', 'password', 'Theodore', 'the Chipmunk');
    userId2 = userData2.authUserId;
    userToken2 = userData2.token;

    chanId = channelsCreate(userToken, 'coolPublicChannel', true).channelId;

    expect(channelInvite(userToken, chanId, userId2)).toStrictEqual({});
  });

  // channelId does not refer to a valid channel
  test('channelId is invalid', () => {
    const addOwnerData = channelAddOwner(userToken, chanId + 1, userId2);
    expect(addOwnerData).toStrictEqual(400);
  });

  // uId does not refer to a valid user
  test('uId is invalid', () => {
    const addOwnerData = channelAddOwner(userToken, chanId, userId + userId2 + 1);
    expect(addOwnerData).toStrictEqual(400);
  });

  // uId does not refer to a member of the channel
  test('uId does not refer to member of channel', () => {
    const userData3 = authRegister('z5355555@ad.unsw.edu.au', 'password', 'Simon', 'the Chipmunk');
    const userId3 = userData3.authUserId;

    const addOwnerData = channelAddOwner(userToken, chanId, userId3);
    expect(addOwnerData).toStrictEqual(400);
  });

  // uId refers to a user who is already an owner
  test('uId is already an owner', () => {
    const addOwnerData = channelAddOwner(userToken, chanId, userId);
    expect(addOwnerData).toStrictEqual(400);
  });

  // AuthUser does not have permissions to add owners
  test('Authorised user does not have owner permissions in this channel', () => {
    const userData3 = authRegister('z5355555@ad.unsw.edu.au', 'password', 'Simon', 'the Chipmunk');
    const userId3 = userData3.authUserId;

    const addOwnerData = channelAddOwner(userToken2, chanId, userId3);
    expect(addOwnerData).toStrictEqual(403);
  });

  // Token is invalid
  test('AuthUser / token is invalid', () => {
    const addOwnerData = channelAddOwner(userToken + userToken2 + 1, chanId, userId);
    expect(addOwnerData).toStrictEqual(403);
  });

  test('valid addOwner test', () => {
    const userData3 = authRegister('z5355555@ad.unsw.edu.au', 'password', 'Simon', 'the Chipmunk');
    const userId3 = userData3.authUserId;
    const userToken3 = userData3.token;

    expect(channelInvite(userToken, chanId, userId3)).toStrictEqual({});

    const addOwnerData = channelAddOwner(userToken, chanId, userId3);
    expect(addOwnerData).toStrictEqual({});

    const addOwnerData2 = channelAddOwner(userToken3, chanId, userId2);
    expect(addOwnerData2).toStrictEqual({});

    const expectedOwners: UserDetails[] = [
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Alvin',
        nameLast: 'the Chipmunk',
        handleStr: 'alvinthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId2,
        email: 'z5455555@ad.unsw.edu.au',
        nameFirst: 'Theodore',
        nameLast: 'the Chipmunk',
        handleStr: 'theodorethechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId3,
        email: 'z5355555@ad.unsw.edu.au',
        nameFirst: 'Simon',
        nameLast: 'the Chipmunk',
        handleStr: 'simonthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
    ];

    const expectedMembers = [
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Alvin',
        nameLast: 'the Chipmunk',
        handleStr: 'alvinthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId2,
        email: 'z5455555@ad.unsw.edu.au',
        nameFirst: 'Theodore',
        nameLast: 'the Chipmunk',
        handleStr: 'theodorethechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId3,
        email: 'z5355555@ad.unsw.edu.au',
        nameFirst: 'Simon',
        nameLast: 'the Chipmunk',
        handleStr: 'simonthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
    ];

    const detailData = channelDetails(userToken, chanId);
    expect(detailData).toStrictEqual({
      name: 'coolPublicChannel',
      isPublic: true,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array)
    });

    expect(detailData.ownerMembers.sort((a: UserDetails, b: UserDetails) => a.uId - b.uId)).toStrictEqual(
      expectedOwners.sort((a, b) => a.uId - b.uId)
    );

    expect(detailData.allMembers.sort((a: UserDetails, b: UserDetails) => a.uId - b.uId)).toStrictEqual(
      expectedMembers.sort((a, b) => a.uId - b.uId)
    );
  });

  // Alvin is Global owner (permission = 1).
  // Simon makes a second public channel, invites Alvin
  // Alvin invites Theodore, and makes him owner
  // Alvin is still not an owner
  test('valid globalOwner addOwner test', () => {
    const userData3 = authRegister('z5355555@ad.unsw.edu.au', 'password', 'Simon', 'the Chipmunk');
    const userId3 = userData3.authUserId;
    const userToken3 = userData3.token;

    const chanId2 = channelsCreate(userToken3, 'chipmunksOnlyChannel', true).channelId;

    // Simon invites Alvin
    expect(channelInvite(userToken3, chanId2, userId)).toStrictEqual({});

    // Alvin invites Theodore
    expect(channelInvite(userToken, chanId2, userId2)).toStrictEqual({});

    // Alvin makes Theodore owner
    const addOwnerData = channelAddOwner(userToken, chanId2, userId2);
    expect(addOwnerData).toStrictEqual({});

    const expectedOwners: UserDetails[] = [
      {
        uId: userId3,
        email: 'z5355555@ad.unsw.edu.au',
        nameFirst: 'Simon',
        nameLast: 'the Chipmunk',
        handleStr: 'simonthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId2,
        email: 'z5455555@ad.unsw.edu.au',
        nameFirst: 'Theodore',
        nameLast: 'the Chipmunk',
        handleStr: 'theodorethechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
    ];

    const expectedMembers: UserDetails[] = [
      {
        uId: userId3,
        email: 'z5355555@ad.unsw.edu.au',
        nameFirst: 'Simon',
        nameLast: 'the Chipmunk',
        handleStr: 'simonthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Alvin',
        nameLast: 'the Chipmunk',
        handleStr: 'alvinthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId2,
        email: 'z5455555@ad.unsw.edu.au',
        nameFirst: 'Theodore',
        nameLast: 'the Chipmunk',
        handleStr: 'theodorethechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
    ]
    const detailData = channelDetails(userToken, chanId2);
    expect(detailData).toStrictEqual({
      name: 'chipmunksOnlyChannel',
      isPublic: true,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array)
    });

    expect(detailData.ownerMembers.sort((a: UserDetails, b: UserDetails) => a.uId - b.uId)).toStrictEqual(
      expectedOwners.sort((a, b) => a.uId - b.uId)
    );

    expect(detailData.allMembers.sort((a: UserDetails, b: UserDetails) => a.uId - b.uId)).toStrictEqual(
      expectedMembers.sort((a, b) => a.uId - b.uId)
    );
  });
});

describe('channel/addowner/v2 Private Channel Tests', () => {
  let userId: number;
  let userId2: number;
  let userToken: string;
  let userToken2: string;
  let chanId: number;
  beforeEach(() => {
    const userData = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Alvin', 'the Chipmunk');
    userId = userData.authUserId;
    userToken = userData.token;
    const userData2 = authRegister('z5455555@ad.unsw.edu.au', 'password', 'Theodore', 'the Chipmunk');
    userId2 = userData2.authUserId;
    userToken2 = userData2.token;

    chanId = channelsCreate(userToken, 'edgyPrivateChannel', false).channelId;

    expect(channelInvite(userToken, chanId, userId2)).toStrictEqual({});
  });

  // channelId does not refer to a valid channel
  test('channelId is invalid', () => {
    const addOwnerData = channelAddOwner(userToken, chanId + 1, userId2);
    expect(addOwnerData).toStrictEqual(400);
  });

  // uId does not refer to a valid user
  test('uId is invalid', () => {
    const addOwnerData = channelAddOwner(userToken, chanId, userId2 + userId + 1);
    expect(addOwnerData).toStrictEqual(400);
  });

  // uId does not refer to a member of the channel
  test('uId is not a member of channel', () => {
    const userData3 = authRegister('z5355555@ad.unsw.edu.au', 'password', 'Simon', 'the Chipmunk');
    const userId3 = userData3.authUserId;

    const addOwnerData = channelAddOwner(userToken, chanId, userId3);
    expect(addOwnerData).toStrictEqual(400);
  });

  // uId refers to a user who is already an owner
  test('uId is already an owner', () => {
    const addOwnerData = channelAddOwner(userToken, chanId, userId);
    expect(addOwnerData).toStrictEqual(400);
  });

  // AuthUser does not have permissions to add owners
  test('Authorised user does not have owner permissions in this channel', () => {
    const userData3 = authRegister('z5355555@ad.unsw.edu.au', 'password', 'Simon', 'the Chipmunk');
    const userId3 = userData3.authUserId;

    const addOwnerData = channelAddOwner(userToken2, chanId, userId3);
    expect(addOwnerData).toStrictEqual(403);
  });

  // Token is invalid
  test('AuthUser / token is invalid', () => {
    const addOwnerData = channelAddOwner(userToken + userToken2, chanId, userId);
    expect(addOwnerData).toStrictEqual(403);
  });

  test('valid addOwner test', () => {
    const userData3 = authRegister('z5355555@ad.unsw.edu.au', 'password', 'Simon', 'the Chipmunk');
    const userId3 = userData3.authUserId;
    const userToken3 = userData3.token;

    expect(channelInvite(userToken, chanId, userId3)).toStrictEqual({});

    const addOwnerData = channelAddOwner(userToken, chanId, userId3);
    expect(addOwnerData).toStrictEqual({});

    const addOwnerData2 = channelAddOwner(userToken3, chanId, userId2);
    expect(addOwnerData2).toStrictEqual({});

    const expectedOwners: UserDetails[] = [
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Alvin',
        nameLast: 'the Chipmunk',
        handleStr: 'alvinthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId2,
        email: 'z5455555@ad.unsw.edu.au',
        nameFirst: 'Theodore',
        nameLast: 'the Chipmunk',
        handleStr: 'theodorethechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId3,
        email: 'z5355555@ad.unsw.edu.au',
        nameFirst: 'Simon',
        nameLast: 'the Chipmunk',
        handleStr: 'simonthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
    ];

    const expectedMembers: UserDetails[] = [
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Alvin',
        nameLast: 'the Chipmunk',
        handleStr: 'alvinthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId2,
        email: 'z5455555@ad.unsw.edu.au',
        nameFirst: 'Theodore',
        nameLast: 'the Chipmunk',
        handleStr: 'theodorethechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId3,
        email: 'z5355555@ad.unsw.edu.au',
        nameFirst: 'Simon',
        nameLast: 'the Chipmunk',
        handleStr: 'simonthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
    ];

    const detailData = channelDetails(userToken, chanId);
    expect(detailData).toStrictEqual({
      name: 'edgyPrivateChannel',
      isPublic: false,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array)
    });

    expect(detailData.ownerMembers.sort((a: UserDetails, b: UserDetails) => a.uId - b.uId)).toStrictEqual(
      expectedOwners.sort((a, b) => a.uId - b.uId)
    );

    expect(detailData.allMembers.sort((a: UserDetails, b: UserDetails) => a.uId - b.uId)).toStrictEqual(
      expectedMembers.sort((a, b) => a.uId - b.uId)
    );
  });

  // Alvin is Global owner (permission = 1).
  // Simon makes a second private channel, invites Theodore
  // Theodore tries to make himself owner but fails, Simon and makes him owner
  // Theodore then invites Alvin, and Alvin makes himself owner
  test('valid globalOwner addOwner test', () => {
    const userData3 = authRegister('z5355555@ad.unsw.edu.au', 'password', 'Simon', 'the Chipmunk');
    const userId3 = userData3.authUserId;
    const userToken3 = userData3.token;

    // Simon makes a second private channel, invites Theodore
    const chanId2 = channelsCreate(userToken3, 'chipmunksOnlyChannel', false).channelId;

    expect(channelInvite(userToken3, chanId2, userId2)).toStrictEqual({});

    // Theodore tries to make himself owner but fails not global owner
    const addOwnerDataErr = channelAddOwner(userToken2, chanId2, userId2);
    expect(addOwnerDataErr).toStrictEqual(403);

    // Theodore is only successfully made as owner through simon
    const addOwnerData = channelAddOwner(userToken3, chanId2, userId2);
    expect(addOwnerData).toStrictEqual({});

    expect(channelInvite(userToken2, chanId2, userId)).toStrictEqual({});

    // and Alvin makes himself owner - is global owner
    const addOwnerData2 = channelAddOwner(userToken, chanId2, userId);
    expect(addOwnerData2).toStrictEqual({});

    const expectedOwners: UserDetails[] = [
      {
        uId: userId3,
        email: 'z5355555@ad.unsw.edu.au',
        nameFirst: 'Simon',
        nameLast: 'the Chipmunk',
        handleStr: 'simonthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId2,
        email: 'z5455555@ad.unsw.edu.au',
        nameFirst: 'Theodore',
        nameLast: 'the Chipmunk',
        handleStr: 'theodorethechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Alvin',
        nameLast: 'the Chipmunk',
        handleStr: 'alvinthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
    ];

    const expectedMembers: UserDetails[] = [
      {
        uId: userId3,
        email: 'z5355555@ad.unsw.edu.au',
        nameFirst: 'Simon',
        nameLast: 'the Chipmunk',
        handleStr: 'simonthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId2,
        email: 'z5455555@ad.unsw.edu.au',
        nameFirst: 'Theodore',
        nameLast: 'the Chipmunk',
        handleStr: 'theodorethechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Alvin',
        nameLast: 'the Chipmunk',
        handleStr: 'alvinthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
    ];

    const detailData = channelDetails(userToken, chanId2);
    expect(detailData).toStrictEqual({
      name: 'chipmunksOnlyChannel',
      isPublic: false,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array)
    });

    expect(detailData.ownerMembers.sort((a: UserDetails, b: UserDetails) => a.uId - b.uId)).toStrictEqual(
      expectedOwners.sort((a, b) => a.uId - b.uId)
    );

    expect(detailData.allMembers.sort((a: UserDetails, b: UserDetails) => a.uId - b.uId)).toStrictEqual(
      expectedMembers.sort((a, b) => a.uId - b.uId)
    );
  });
});

describe('/channel/removeowner/v1', () => {
  let userId: number;
  let userId2: number;
  let userToken: string;
  let userToken2: string;
  let chanId: number;
  beforeEach(() => {
    const userObj = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Alvin', 'the Chipmunk');
    userId = userObj.authUserId;
    userToken = userObj.token;
    const userObj2 = authRegister('z5455555@ad.unsw.edu.au', 'password', 'Theodore', 'the Chipmunk');
    userId2 = userObj2.authUserId;
    userToken2 = userObj2.token;

    chanId = channelsCreate(userObj.token, 'CoolChannel', true).channelId;

    expect(channelInvite(userToken, chanId, userId2)).toStrictEqual({});
  });

  test('invalid token', () => {
    const removeData = channelRemoveOwner(userToken2 + userToken, chanId, userId2);

    expect(removeData).toStrictEqual(403);
  });

  test('invalid channelId', () => {
    const removeData = channelRemoveOwner(userToken, chanId + 1, userId2);

    expect(removeData).toStrictEqual(400);
  });

  test('invalid uId', () => {
    const removeData = channelRemoveOwner(userToken, chanId, userId2 + userId);

    expect(removeData).toStrictEqual(400);
  });

  test('user is not the owner of the channel ', () => {
    const removeData = channelRemoveOwner(userToken, chanId, userId2);

    expect(removeData).toStrictEqual(400);
  });

  test('user is a only owner in the channel', () => {
    const removeData = channelRemoveOwner(userToken, chanId, userId);

    expect(removeData).toStrictEqual(400);
  });

  test('valid channelId, authorised user is not an owner', () => {
    const userData3 = authRegister('z5355555@ad.unsw.edu.au', 'password', 'Simon', 'the Chipmunk');
    const userToken3 = userData3.token;

    const removeData = channelRemoveOwner(userToken3, chanId, userId2);

    expect(removeData).toStrictEqual(403);
  });

  test('valid remove owner - control', () => {
    const addOwnerData = channelAddOwner(userToken, chanId, userId2);
    expect(addOwnerData).toStrictEqual({});

    const expectedOwners: UserDetails[] = [
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Alvin',
        nameLast: 'the Chipmunk',
        handleStr: 'alvinthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId2,
        email: 'z5455555@ad.unsw.edu.au',
        nameFirst: 'Theodore',
        nameLast: 'the Chipmunk',
        handleStr: 'theodorethechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
    ];

    const expectedMembers: UserDetails[] = [
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Alvin',
        nameLast: 'the Chipmunk',
        handleStr: 'alvinthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId2,
        email: 'z5455555@ad.unsw.edu.au',
        nameFirst: 'Theodore',
        nameLast: 'the Chipmunk',
        handleStr: 'theodorethechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
    ];

    const detailData = channelDetails(userToken, chanId);
    expect(detailData).toStrictEqual({
      name: 'CoolChannel',
      isPublic: true,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array)
    });
    
    expect(detailData.ownerMembers.sort((a: UserDetails, b: UserDetails) => a.uId - b.uId)).toStrictEqual(
      expectedOwners.sort((a, b) => a.uId - b.uId)
    );

    expect(detailData.allMembers.sort((a: UserDetails, b: UserDetails) => a.uId - b.uId)).toStrictEqual(
      expectedMembers.sort((a, b) => a.uId - b.uId)
    );

    const removeData = channelRemoveOwner(userToken, chanId, userId2);

    expect(removeData).toStrictEqual({});

    const detailData2 = channelDetails(userToken, chanId);
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
          profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
        }
      ],
      allMembers: expect.any(Array)
    });

    expect(detailData2.allMembers.sort((a: UserDetails, b: UserDetails) => a.uId - b.uId)).toStrictEqual(
      expectedMembers.sort((a, b) => a.uId - b.uId)
    );
  });

  test('valid remove owner - multiple', () => {
    const userData3 = authRegister('z5355555@ad.unsw.edu.au', 'password', 'Simon', 'the Chipmunk');
    const userId3 = userData3.authUserId;
    const userToken3 = userData3.token;

    expect(channelInvite(userToken, chanId, userId3)).toStrictEqual({});

    const addOwnerData = channelAddOwner(userToken, chanId, userId3);
    expect(addOwnerData).toStrictEqual({});

    const addOwnerData2 = channelAddOwner(userToken3, chanId, userId2);
    expect(addOwnerData2).toStrictEqual({});

    const expectedOwners: UserDetails[] = [
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Alvin',
        nameLast: 'the Chipmunk',
        handleStr: 'alvinthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId2,
        email: 'z5455555@ad.unsw.edu.au',
        nameFirst: 'Theodore',
        nameLast: 'the Chipmunk',
        handleStr: 'theodorethechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId3,
        email: 'z5355555@ad.unsw.edu.au',
        nameFirst: 'Simon',
        nameLast: 'the Chipmunk',
        handleStr: 'simonthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
    ];

    const expectedMembers: UserDetails[] = [
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Alvin',
        nameLast: 'the Chipmunk',
        handleStr: 'alvinthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId2,
        email: 'z5455555@ad.unsw.edu.au',
        nameFirst: 'Theodore',
        nameLast: 'the Chipmunk',
        handleStr: 'theodorethechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId3,
        email: 'z5355555@ad.unsw.edu.au',
        nameFirst: 'Simon',
        nameLast: 'the Chipmunk',
        handleStr: 'simonthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
    ];

    const detailData = channelDetails(userToken, chanId);
    expect(detailData).toStrictEqual({
      name: 'CoolChannel',
      isPublic: true,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array)
    });

    expect(detailData.ownerMembers.sort((a: UserDetails, b: UserDetails) => a.uId - b.uId)).toStrictEqual(
      expectedOwners.sort((a, b) => a.uId - b.uId)
    );

    expect(detailData.allMembers.sort((a: UserDetails, b: UserDetails) => a.uId - b.uId)).toStrictEqual(
      expectedMembers.sort((a, b) => a.uId - b.uId)
    );

    const removeData = channelRemoveOwner(userToken2, chanId, userId3);

    expect(removeData).toStrictEqual({});

    const expectedOwners2: UserDetails[] = [
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Alvin',
        nameLast: 'the Chipmunk',
        handleStr: 'alvinthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId2,
        email: 'z5455555@ad.unsw.edu.au',
        nameFirst: 'Theodore',
        nameLast: 'the Chipmunk',
        handleStr: 'theodorethechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
    ];

    const detailData2 = channelDetails(userToken, chanId);
    expect(detailData2).toStrictEqual({
      name: 'CoolChannel',
      isPublic: true,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array)
    });

    expect(detailData2.ownerMembers.sort((a: UserDetails, b: UserDetails) => a.uId - b.uId)).toStrictEqual(
      expectedOwners2.sort((a, b) => a.uId - b.uId)
    );

    expect(detailData2.allMembers.sort((a: UserDetails, b: UserDetails) => a.uId - b.uId)).toStrictEqual(
      expectedMembers.sort((a, b) => a.uId - b.uId)
    );

    const removeData2 = channelRemoveOwner(userToken2, chanId, userId);

    expect(removeData2).toStrictEqual({});

    const detailData3 = channelDetails(userToken, chanId);
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
          profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
        },
      ],
      allMembers: expect.any(Array)
    });

    expect(detailData3.allMembers.sort((a: UserDetails, b: UserDetails) => a.uId - b.uId)).toStrictEqual(
      expectedMembers.sort((a, b) => a.uId - b.uId)
    );
  });

  // Simon makes a channel, and invites Theodore and Alvin
  // Simon makes Theodore channelOwner,
  // Alvin who is globalOwner changes Theodore so he is no longer an owner
  // on Alvin's channel he makes Theodore an Owner, then removes himself as Owner
  test('valid globalOwner removeOwner test', () => {
    const userData3 = authRegister('z5355555@ad.unsw.edu.au', 'password', 'Simon', 'the Chipmunk');
    const userId3 = userData3.authUserId;
    const userToken3 = userData3.token;

    const chanId2 = channelsCreate(userToken3, 'CoolerChannel', true).channelId;

    // inviting alvin
    expect(channelInvite(userToken3, chanId2, userId)).toStrictEqual({});

    // theodore is not a member -> cannot be removed from owner
    expect(channelRemoveOwner(userToken3, chanId2, userId2)).toStrictEqual(400);

    // inviting theodore
    expect(channelInvite(userToken3, chanId2, userId2)).toStrictEqual({});

    // theodore is not a owner (despite being a member) and cannot remove Simon from being owner
    expect(channelRemoveOwner(userToken2, chanId2, userId3)).toStrictEqual(403);

    const addOwnerData = channelAddOwner(userToken3, chanId2, userId2);
    expect(addOwnerData).toStrictEqual({});

    const expectedOwners: UserDetails[] = [
      {
        uId: userId3,
        email: 'z5355555@ad.unsw.edu.au',
        nameFirst: 'Simon',
        nameLast: 'the Chipmunk',
        handleStr: 'simonthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId2,
        email: 'z5455555@ad.unsw.edu.au',
        nameFirst: 'Theodore',
        nameLast: 'the Chipmunk',
        handleStr: 'theodorethechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
    ];

    const expectedMembers: UserDetails[] = [
      {
        uId: userId3,
        email: 'z5355555@ad.unsw.edu.au',
        nameFirst: 'Simon',
        nameLast: 'the Chipmunk',
        handleStr: 'simonthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Alvin',
        nameLast: 'the Chipmunk',
        handleStr: 'alvinthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId2,
        email: 'z5455555@ad.unsw.edu.au',
        nameFirst: 'Theodore',
        nameLast: 'the Chipmunk',
        handleStr: 'theodorethechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
    ];

    const detailData = channelDetails(userToken, chanId2);
    expect(detailData).toStrictEqual({
      name: 'CoolerChannel',
      isPublic: true,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array)
    });

    expect(detailData.ownerMembers.sort((a: UserDetails, b: UserDetails) => a.uId - b.uId)).toStrictEqual(
      expectedOwners.sort((a, b) => a.uId - b.uId)
    );

    expect(detailData.allMembers.sort((a: UserDetails, b: UserDetails) => a.uId - b.uId)).toStrictEqual(
      expectedMembers.sort((a, b) => a.uId - b.uId)
    );

    const removeData2 = channelRemoveOwner(userToken, chanId2, userId2);
    expect(removeData2).toStrictEqual({});

    const detailData2 = channelDetails(userToken, chanId2);
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
          profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
        },
      ],
      allMembers: expect.any(Array)
    });

    expect(detailData2.allMembers.sort((a: UserDetails, b: UserDetails) => a.uId - b.uId)).toStrictEqual(
      expectedMembers.sort((a, b) => a.uId - b.uId)
    );

    const addOwnerData2 = channelAddOwner(userToken, chanId2, userId);
    expect(addOwnerData2).toStrictEqual({});
    
    const expectedOwners2: UserDetails[] = [
      {
        uId: userId3,
        email: 'z5355555@ad.unsw.edu.au',
        nameFirst: 'Simon',
        nameLast: 'the Chipmunk',
        handleStr: 'simonthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Alvin',
        nameLast: 'the Chipmunk',
        handleStr: 'alvinthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
    ];

    const detailData3 = channelDetails(userToken, chanId2);
    expect(detailData3).toStrictEqual({
      name: 'CoolerChannel',
      isPublic: true,
      ownerMembers: expect.any(Array),
      allMembers: expect.any(Array)
    });

    expect(detailData3.ownerMembers.sort((a: UserDetails, b: UserDetails) => a.uId - b.uId)).toStrictEqual(
      expectedOwners2.sort((a, b) => a.uId - b.uId)
    );

    expect(detailData3.allMembers.sort((a: UserDetails, b: UserDetails) => a.uId - b.uId)).toStrictEqual(
      expectedMembers.sort((a, b) => a.uId - b.uId)
    );

    const expectedMembers2: UserDetails[] = [
      {
        uId: userId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Alvin',
        nameLast: 'the Chipmunk',
        handleStr: 'alvinthechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: userId2,
        email: 'z5455555@ad.unsw.edu.au',
        nameFirst: 'Theodore',
        nameLast: 'the Chipmunk',
        handleStr: 'theodorethechipmunk',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
    ];

    const detailData4 = channelDetails(userToken, chanId);
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
          profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
        },
      ],
      allMembers: expect.any(Array)
    });

    expect(detailData4.allMembers.sort((a: UserDetails, b: UserDetails) => a.uId - b.uId)).toStrictEqual(
      expectedMembers2.sort((a, b) => a.uId - b.uId)
    );

    const addOwnerData3 = channelAddOwner(userToken, chanId, userId2);
    expect(addOwnerData3).toStrictEqual({});

    const removeData3 = channelRemoveOwner(userToken, chanId, userId);
    expect(removeData3).toStrictEqual({});

    const detailData5 = channelDetails(userToken, chanId);
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
          profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
        },
      ],
      allMembers: expect.any(Array)
    });
    expect(detailData5.allMembers.sort((a: UserDetails, b: UserDetails) => a.uId - b.uId)).toStrictEqual(
      expectedMembers2.sort((a, b) => a.uId - b.uId)
    );
  });
});
