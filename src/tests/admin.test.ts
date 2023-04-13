import {
  clear, authRegister, usersAll, userProfile,
  channelsCreate, channelInvite, messageSend, channelMessages, channelDetails, channelJoin,
  dmCreate, dmMessages, messageSendDm, dmDetails, adminUserRemove,
} from './routeRequests';

interface userObj {
  uId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
}

beforeEach(() => {
  clear();
});

describe('/admin/user/remove/v1', () => {
  const email = 'z5555555@ad.unsw.edu.au';
  const password = 'password';
  const nameFirst = 'Madhav';
  const nameLast = 'Mishra';

  const email2 = 'z4444444@ad.unsw.edu.au';
  const password2 = 'password2';
  const nameFirst2 = 'Charmander';
  const nameLast2 = 'Pokemon';

  const email3 = 'z3333333@ad.unsw.edu.au';
  const password3 = 'password3';
  const nameFirst3 = 'Charizard';
  const nameLast3 = 'Pokemon';

  const start = 0;

  test('invalid token', () => {
    const ownerData = authRegister(email, password, nameFirst, nameLast);
    const removee = authRegister(email2, password2, nameFirst2, nameLast2);

    expect(adminUserRemove(ownerData.token + 1, removee.authUserId)).toEqual(403);
  });

  test('invalid uId', () => {
    const ownerData = authRegister(email, password, nameFirst, nameLast);
    const removee = authRegister(email2, password2, nameFirst2, nameLast2);

    expect(adminUserRemove(ownerData.token, removee.authUserId + 1)).toEqual(400);
  });

  test('uId refers to only global owner', () => {
    const ownerData = authRegister(email, password, nameFirst, nameLast);

    expect(adminUserRemove(ownerData.token, ownerData.authUserId)).toEqual(400);
  });

  test('authorised user is not a global owner', () => {
    const ownerData = authRegister(email, password, nameFirst, nameLast);
    const removee = authRegister(email2, password2, nameFirst2, nameLast2);

    expect(adminUserRemove(removee.token, ownerData.authUserId)).toEqual(403);
  });

  test('valid admin remove - removee in no channels, no messages', () => {
    const ownerData = authRegister(email, password, nameFirst, nameLast);
    const removee = authRegister(email2, password2, nameFirst2, nameLast2);

    expect(adminUserRemove(ownerData.token, removee.authUserId)).toStrictEqual({});

    expect(userProfile(ownerData.token, removee.authUserId)).toStrictEqual({
      user: {
        uId: removee.authUserId,
        email: '',
        nameFirst: 'Removed',
        nameLast: 'user',
        handleStr: '',
      },
    });

    const expectedUserAllArray: userObj[] = [
      {
        uId: ownerData.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'madhavmishra'
      },
    ];

    expect(usersAll(ownerData.token).users).toStrictEqual(expectedUserAllArray);

    expect(usersAll(removee.token)).toStrictEqual(403);
  });

  test('valid admin remove - removee in only 1 channel, no messages', () => {
    const ownerData = authRegister(email, password, nameFirst, nameLast);
    const removee = authRegister(email2, password2, nameFirst2, nameLast2);
    const ownerChannel = channelsCreate(ownerData.token, 'COMP', true);

    expect(channelInvite(ownerData.token, ownerChannel.channelId, removee.authUserId)).toStrictEqual({});

    const expectedAllMembersArr: userObj[] = [
      {
        uId: ownerData.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'madhavmishra'
      },
      {
        uId: removee.authUserId,
        email: 'z4444444@ad.unsw.edu.au',
        nameFirst: 'Charmander',
        nameLast: 'Pokemon',
        handleStr: 'charmanderpokemon'
      }
    ];

    const detailData = channelDetails(ownerData.token, ownerChannel.channelId);

    expect(detailData).toStrictEqual({
      name: 'COMP',
      isPublic: true,
      ownerMembers: [
        {
          uId: ownerData.authUserId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
          handleStr: 'madhavmishra'
        }
      ],
      allMembers: expect.any(Array),
    });

    expect(detailData.allMembers.sort((a: userObj, b: userObj) => a.uId - b.uId)).toStrictEqual(
      expectedAllMembersArr.sort((a, b) => a.uId - b.uId)
    );

    expect(adminUserRemove(ownerData.token, removee.authUserId)).toStrictEqual({});

    expect(channelDetails(ownerData.token, ownerChannel.channelId)).toStrictEqual({
      name: 'COMP',
      isPublic: true,
      ownerMembers: [
        {
          uId: ownerData.authUserId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
          handleStr: 'madhavmishra'
        }
      ],
      allMembers: [
        {
          uId: ownerData.authUserId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
          handleStr: 'madhavmishra'
        },
      ]
    });

    const expectedUserAllArray: userObj[] = [
      {
        uId: ownerData.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'madhavmishra'
      },
    ];

    expect(usersAll(ownerData.token).users).toStrictEqual(expectedUserAllArray);

    expect(userProfile(ownerData.token, removee.authUserId)).toStrictEqual({
      user: {
        uId: removee.authUserId,
        email: '',
        nameFirst: 'Removed',
        nameLast: 'user',
        handleStr: '',
      },
    });

    expect(usersAll(removee.token)).toStrictEqual(403);
  });

  test('valid admin remove - removee in only 3 channels, some messages', () => {
    const ownerData = authRegister(email, password, nameFirst, nameLast);
    const removee = authRegister(email2, password2, nameFirst2, nameLast2);
    const random = authRegister(email3, password3, nameFirst3, nameLast3);

    const channel1 = channelsCreate(ownerData.token, 'COMP', true);
    const channel2 = channelsCreate(ownerData.token, 'MATH', true);
    const channel3 = channelsCreate(removee.token, 'COMM', true);

    expect(channelInvite(ownerData.token, channel1.channelId, removee.authUserId)).toStrictEqual({});
    expect(channelInvite(ownerData.token, channel1.channelId, random.authUserId)).toStrictEqual({});
    expect(channelInvite(ownerData.token, channel2.channelId, removee.authUserId)).toStrictEqual({});
    expect(channelJoin(ownerData.token, channel3.channelId)).toStrictEqual({});

    const m1 = messageSend(removee.token, channel1.channelId, 'Hello');
    const m2 = messageSend(removee.token, channel1.channelId, 'Hi');
    const m3 = messageSend(ownerData.token, channel1.channelId, 'Hello World');
    const m4 = messageSend(removee.token, channel2.channelId, 'Im Batman');
    const m5 = messageSend(ownerData.token, channel3.channelId, 'Hello World');
    const m6 = messageSend(ownerData.token, channel3.channelId, 'Goodbye World');
    const m7 = messageSend(removee.token, channel3.channelId, 'Im getting banned');

    expect(adminUserRemove(ownerData.token, removee.authUserId)).toStrictEqual({});

    const expectedAllMembersArr: userObj[] = [
      {
        uId: ownerData.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'madhavmishra'
      },
      {
        uId: random.authUserId,
        email: 'z3333333@ad.unsw.edu.au',
        nameFirst: 'Charizard',
        nameLast: 'Pokemon',
        handleStr: 'charizardpokemon'
      },
    ];

    const detailData = channelDetails(ownerData.token, channel1.channelId);

    expect(detailData).toStrictEqual({
      name: 'COMP',
      isPublic: true,
      ownerMembers: [
        {
          uId: ownerData.authUserId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
          handleStr: 'madhavmishra'
        }
      ],
      allMembers: expect.any(Array)
    });

    expect(detailData.allMembers.sort((a: userObj, b: userObj) => a.uId - b.uId)).toStrictEqual(
      expectedAllMembersArr.sort((a, b) => a.uId - b.uId)
    );

    expect(channelDetails(ownerData.token, channel2.channelId)).toStrictEqual({
      name: 'MATH',
      isPublic: true,
      ownerMembers: [
        {
          uId: ownerData.authUserId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
          handleStr: 'madhavmishra'
        }
      ],
      allMembers: [
        {
          uId: ownerData.authUserId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
          handleStr: 'madhavmishra'
        },
      ]
    });

    expect(channelDetails(ownerData.token, channel3.channelId)).toStrictEqual({
      name: 'COMM',
      isPublic: true,
      ownerMembers: [],
      allMembers: [
        {
          uId: ownerData.authUserId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
          handleStr: 'madhavmishra'
        },
      ]
    });

    expect(channelMessages(ownerData.token, channel1.channelId, start)).toStrictEqual({
      messages: [
        {
          messageId: m3.messageId,
          uId: ownerData.authUserId,
          message: 'Hello World',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: m2.messageId,
          uId: removee.authUserId,
          message: 'Removed user',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: m1.messageId,
          uId: removee.authUserId,
          message: 'Removed user',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });

    expect(channelMessages(ownerData.token, channel2.channelId, start)).toStrictEqual({
      messages: [
        {
          messageId: m4.messageId,
          uId: removee.authUserId,
          message: 'Removed user',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });

    expect(channelMessages(ownerData.token, channel3.channelId, start)).toStrictEqual({
      messages: [
        {
          messageId: m7.messageId,
          uId: removee.authUserId,
          message: 'Removed user',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: m6.messageId,
          uId: ownerData.authUserId,
          message: 'Goodbye World',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: m5.messageId,
          uId: ownerData.authUserId,
          message: 'Hello World',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });

    const expectedUserAllArray: userObj[] = [
      {
        uId: ownerData.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'madhavmishra'
      },
      {
        uId: random.authUserId,
        email: 'z3333333@ad.unsw.edu.au',
        nameFirst: 'Charizard',
        nameLast: 'Pokemon',
        handleStr: 'charizardpokemon'
      },
    ];

    const userData = usersAll(ownerData.token);
    expect(userData.users).toStrictEqual(expectedUserAllArray);

    expect(userData.users.sort((a: userObj, b: userObj) => a.uId - b.uId)).toStrictEqual(
      expectedUserAllArray.sort((a, b) => a.uId - b.uId)
    );

    expect(userProfile(ownerData.token, removee.authUserId)).toStrictEqual({
      user: {
        uId: removee.authUserId,
        email: '',
        nameFirst: 'Removed',
        nameLast: 'user',
        handleStr: '',
      },
    });

    expect(usersAll(removee.token)).toStrictEqual(403);
  });
  test('valid admin remove - removee in 3 dm, some dms', () => {
    const ownerData = authRegister(email, password, nameFirst, nameLast);
    const removee = authRegister(email2, password2, nameFirst2, nameLast2);
    const random = authRegister(email3, password3, nameFirst3, nameLast3);

    const dm1 = dmCreate(ownerData.token, [removee.authUserId]);
    const dm2 = dmCreate(ownerData.token, [removee.authUserId, random.authUserId]);
    const dm3 = dmCreate(removee.token, [ownerData.authUserId]);

    const m1 = messageSendDm(removee.token, dm1.dmId, 'Hello');
    const m2 = messageSendDm(removee.token, dm1.dmId, 'Hi');
    const m3 = messageSendDm(ownerData.token, dm1.dmId, 'Hello World');
    const m4 = messageSendDm(removee.token, dm2.dmId, 'Im Batman');
    const m5 = messageSendDm(ownerData.token, dm3.dmId, 'Hello World');
    const m6 = messageSendDm(ownerData.token, dm3.dmId, 'Goodbye World');
    const m7 = messageSendDm(removee.token, dm3.dmId, 'Im getting banned');

    expect(adminUserRemove(ownerData.token, removee.authUserId)).toStrictEqual({});

    expect(dmDetails(ownerData.token, dm1.dmId)).toStrictEqual({
      name: 'charmanderpokemon, madhavmishra',
      members: [
        {
          uId: ownerData.authUserId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
          handleStr: 'madhavmishra'
        },
      ]
    });

    const expectedUserAllArray1: userObj[] = [
      {
        uId: ownerData.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'madhavmishra'
      },
      {
        uId: random.authUserId,
        email: 'z3333333@ad.unsw.edu.au',
        nameFirst: 'Charizard',
        nameLast: 'Pokemon',
        handleStr: 'charizardpokemon'
      },
    ];

    const detailData = dmDetails(ownerData.token, dm2.dmId);

    expect(detailData).toStrictEqual({
      name: 'charizardpokemon, charmanderpokemon, madhavmishra',
      members: expect.any(Array),
    });

    expect(detailData.members.sort((a: userObj, b: userObj) => a.uId - b.uId)).toStrictEqual(
      expectedUserAllArray1.sort((a, b) => a.uId - b.uId)
    );

    expect(dmDetails(ownerData.token, dm3.dmId)).toStrictEqual({
      name: 'charmanderpokemon, madhavmishra',
      members: [
        {
          uId: ownerData.authUserId,
          email: 'z5555555@ad.unsw.edu.au',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
          handleStr: 'madhavmishra'
        },
      ]
    });

    expect(dmMessages(ownerData.token, dm1.dmId, start)).toStrictEqual({
      messages: [
        {
          messageId: m3.messageId,
          uId: ownerData.authUserId,
          message: 'Hello World',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: m2.messageId,
          uId: removee.authUserId,
          message: 'Removed user',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: m1.messageId,
          uId: removee.authUserId,
          message: 'Removed user',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });

    expect(dmMessages(ownerData.token, dm2.dmId, start)).toStrictEqual({
      messages: [
        {
          messageId: m4.messageId,
          uId: removee.authUserId,
          message: 'Removed user',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });

    expect(dmMessages(ownerData.token, dm3.dmId, start)).toStrictEqual({
      messages: [
        {
          messageId: m7.messageId,
          uId: removee.authUserId,
          message: 'Removed user',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: m6.messageId,
          uId: ownerData.authUserId,
          message: 'Goodbye World',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
        {
          messageId: m5.messageId,
          uId: ownerData.authUserId,
          message: 'Hello World',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
      start: 0,
      end: -1,
    });

    const expectedUserAllArray: userObj[] = [
      {
        uId: ownerData.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'madhavmishra'
      },
      {
        uId: random.authUserId,
        email: 'z3333333@ad.unsw.edu.au',
        nameFirst: 'Charizard',
        nameLast: 'Pokemon',
        handleStr: 'charizardpokemon'
      },
    ];

    const userData = usersAll(ownerData.token);
    expect(userData.users).toStrictEqual(expectedUserAllArray);

    expect(userData.users.sort((a: userObj, b: userObj) => a.uId - b.uId)).toStrictEqual(
      expectedUserAllArray.sort((a, b) => a.uId - b.uId)
    );

    expect(userProfile(ownerData.token, removee.authUserId)).toStrictEqual({
      user: {
        uId: removee.authUserId,
        email: '',
        nameFirst: 'Removed',
        nameLast: 'user',
        handleStr: '',
      },
    });

    expect(usersAll(removee.token)).toStrictEqual(403);
  });
});
