import { clearV1 } from './other.js';
import { authRegisterV1 } from './auth.js';
import { channelsCreateV1 } from './channels.js';
import { channelDetailsV1, channelJoinV1, channelMessagesV1, channelInviteV1 } from './channel.js';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clearV1();
});

describe('channelDetailsV1 ', () => {
  let email, password, nameFirst, nameLast, authUserObj;
  beforeEach(() => {
    email = 'z5555555@ad.unsw.edu.au';
    password = 'password';
    nameFirst = 'Snoopy';
    nameLast = 'the Dog';

    authUserObj = authRegisterV1(email, password, nameFirst, nameLast);
  });

  test('authUserId is invalid', () => {
    const channelObj = channelsCreateV1(authUserObj.authUserId + 1, 'COMP1531 Crunchie', false);
    channelJoinV1(authUserObj.authUserId + 1, channelObj.channelId);
    expect(channelDetailsV1(authUserObj.authUserId + 1)).toStrictEqual(ERROR);
  });

  test('channelId is invalid', () => {
    const channelObj = channelsCreateV1(authUserObj.authUserId, 'COMP1531 Crunchie', false);
    expect(channelDetailsV1(authUserObj.authUserId, channelObj.channelId + 1)).toStrictEqual(ERROR);
  });

  test('valid authUserId but not a part of the channel', () => {
    email = 'z4444444@ad.unsw.edu.au';
    password = 'yellowfeathers';
    nameFirst = 'Big';
    nameLast = 'Bird';

    const authUserObj2 = authRegisterV1(email, password, nameFirst, nameLast);

    const channelObj = channelsCreateV1(authUserObj2.authUserId, 'COMP1531 Crunchie', false);
    expect(channelDetailsV1(authUserObj.authUserId, channelObj.channelId)).toStrictEqual(ERROR);
  });

  test('valid authUserId is part of the channel', () => {
    const channelObj = channelsCreateV1(authUserObj.authUserId, 'COMP1531 Crunchie', false);

    expect(channelDetailsV1(authUserObj.authUserId, channelObj.channelId)).toStrictEqual({
      name: 'COMP1531 Crunchie',
      isPublic: false,
      ownerMembers: [
        {
          uId: authUserObj.authUserId,
          email: email,
          nameFirst: nameFirst,
          nameLast: nameLast,
          handleStr: 'snoopythedog'
        }
      ],
      allMembers: [
        {
          uId: authUserObj.authUserId,
          email: email,
          nameFirst: nameFirst,
          nameLast: nameLast,
          handleStr: 'snoopythedog'
        }
      ],
    });
  });

  test('multiple valid authUserIds are a part of the channel', () => {
    const email2 = 'z5444444@ad.unsw.edu.au';
    const password2 = 'password';
    const nameFirst2 = 'Charlie';
    const nameLast2 = 'Brown';
    const authUserObj2 = authRegisterV1(email2, password2, nameFirst2, nameLast2);

    const channelObj = channelsCreateV1(authUserObj.authUserId, 'COMP1531 Crunchie', true);

    expect(channelJoinV1(authUserObj2.authUserId, channelObj.channelId)).toStrictEqual({});

    const channelDetailsObj = channelDetailsV1(authUserObj.authUserId, channelObj.channelId);
    expect(channelDetailsObj).toStrictEqual({
      name: 'COMP1531 Crunchie',
      isPublic: true,
      ownerMembers: [
        {
          uId: authUserObj.authUserId,
          email: email,
          nameFirst: nameFirst,
          nameLast: nameLast,
          handleStr: 'snoopythedog'
        }
      ],
      // array needs to account for any permutation
      allMembers: expect.any(Array),
    });

    const expectedArr = [
      {
        uId: authUserObj.authUserId,
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: 'snoopythedog'
      },
      {
        uId: authUserObj2.authUserId,
        email: email2,
        nameFirst: nameFirst2,
        nameLast: nameLast2,
        handleStr: 'charliebrown'
      }
    ];

    // to account for any permutation of the allMembers array, we sort
    expect(channelDetailsObj.allMembers.sort((a, b) => a.uId - b.uId)).toStrictEqual(
      expectedArr.sort((a, b) => a.uId - b.uId)
    );
  });
});

describe('channelMessagesV1', () => {
  let email, password, nameFirst, nameLast, authUserObj, channelName, channelObj;

  beforeEach(() => {
    email = 'z5555555@ad.unsw.edu.au';
    password = 'password';
    nameFirst = 'Madhav';
    nameLast = 'Mishra';
    authUserObj = authRegisterV1(email, password, nameFirst, nameLast);

    channelName = 'Coding';
    channelObj = channelsCreateV1(authUserObj.authUserId, channelName, true);
  });

  test('invalid channelId', () => {
    const start = 0;

    expect(channelMessagesV1(authUserObj.authUserId, channelObj.channelId + 1, start)).toStrictEqual(ERROR);
  });

  test('invalid authUserId', () => {
    const start = 0;

    expect(channelMessagesV1(authUserObj.authUserId + 1, channelObj.channelId, start)).toStrictEqual(ERROR);
  });

  test('start is greater than total messages in channel', () => {
    const start = 50;

    const messageObj = channelMessagesV1(authUserObj.authUserId, channelObj.channelId, start);

    expect(messageObj).toStrictEqual(ERROR);
  });

  test('start is less than 0', () => {
    const start = -1;

    expect(channelMessagesV1(authUserObj.authUserId, channelObj.channelId, start)).toStrictEqual(ERROR);
  });

  test('valid channelId but authorised user is not a member', () => {
    const email2 = 'z1111111@ad.unsw.edu.au';
    const password2 = 'password';
    const nameFirst2 = 'Charmander';
    const nameLast2 = 'Pokemon';

    const authUserObj2 = authRegisterV1(email2, password2, nameFirst2, nameLast2);

    const start = 0;

    expect(channelMessagesV1(authUserObj2.authUserId, channelObj.channelId, start)).toStrictEqual(ERROR);
  });

  test('valid channelMessagesV1', () => {
    const start = 0;

    const messagesArray = channelMessagesV1(authUserObj.authUserId, channelObj.channelId, start);
    expect(messagesArray).toStrictEqual({
      messages: [],
      start: start,
      end: -1,
    });
  });

  test('multiple valid channelMessagesV1', () => {
    const email2 = 'z5555554@ad.unsw.edu.au';
    const password2 = 'password';
    const nameFirst2 = 'Madhav';
    const nameLast2 = 'Mishra';

    const email3 = 'z5555553@ad.unsw.edu.au';
    const password3 = 'password';
    const nameFirst3 = 'Madhav';
    const nameLast3 = 'Mishra';

    const authUserObj2 = authRegisterV1(email2, password2, nameFirst2, nameLast2);
    const authUserObj3 = authRegisterV1(email3, password3, nameFirst3, nameLast3);

    const channelName2 = 'Maths';
    const channelName3 = 'Commerce';

    const channelObj2 = channelsCreateV1(authUserObj2.authUserId, channelName2, true);
    const channelObj3 = channelsCreateV1(authUserObj3.authUserId, channelName3, true);

    const start = 0;

    const messagesArray = channelMessagesV1(authUserObj.authUserId, channelObj.channelId, start);
    expect(messagesArray).toStrictEqual({
      messages: [],
      start: start,
      end: -1,
    });

    const messagesArray2 = channelMessagesV1(authUserObj2.authUserId, channelObj2.channelId, start);
    expect(messagesArray2).toStrictEqual({
      messages: [],
      start: start,
      end: -1,
    });

    const messagesArray3 = channelMessagesV1(authUserObj3.authUserId, channelObj3.channelId, start);
    expect(messagesArray3).toStrictEqual({
      messages: [],
      start: start,
      end: -1,
    });
  });
});

describe('channelJoinV1', () => {
  // channelJoinV1 Error Tests
  let email, password, nameFirst, nameLast, authUserObj;
  beforeEach(() => {
    email = 'z5555555@ad.unsw.edu.au';
    password = 'password';
    nameFirst = 'Perry';
    nameLast = 'the Platypus';
    authUserObj = authRegisterV1(email, password, nameFirst, nameLast);
  });

  test('invalid channelId', () => {
    expect(channelJoinV1(authUserObj.authUserId, 1)).toStrictEqual(ERROR);
  });

  test('invalid authUserId', () => {
    const channelObj = channelsCreateV1(authUserObj.authUserId, 'coolchannel', true);
    expect(channelJoinV1(authUserObj.authUserId + 1, channelObj.channelId)).toStrictEqual(ERROR);
  });

  test('User is already a member of channel', () => {
    const channelObj = channelsCreateV1(authUserObj.authUserId, 'coolchannel', true);
    expect(channelJoinV1(authUserObj.authUserId, channelObj.channelId)).toStrictEqual(ERROR);
  });

  test('public channel, user is not member or global owner', () => {
    const email1 = 'z5455555@ad.unsw.edu.au';
    const password1 = 'password';
    const nameFirst1 = 'Dr';
    const nameLast1 = 'Doofenshmirtz';
    // Dr user is not a global owner
    const authUserObj1 = authRegisterV1(email1, password1, nameFirst1, nameLast1);
    // Perry user is a global owner and member of a public channel
    const channelObj = channelsCreateV1(authUserObj.authUserId, 'coolPublicChannel', true);
    // Dr user joins Perry's public channel
    expect(channelJoinV1(authUserObj1.authUserId, channelObj.channelId)).toStrictEqual({});
    // Error because Dr is already in Perry's channel
    expect(channelJoinV1(authUserObj1.authUserId, channelObj.channelId)).toStrictEqual(ERROR);
  });

  test('private channel, user is not member or global owner', () => {
    const email1 = 'z5455555@ad.unsw.edu.au';
    const password1 = 'password';
    const nameFirst1 = 'Dr';
    const nameLast1 = 'Doofenshmirtz';
    // Dr user is not a global owner
    const authUserObj1 = authRegisterV1(email1, password1, nameFirst1, nameLast1);
    // Perry user is a global owner and member of private channel
    const channelObj = channelsCreateV1(authUserObj.authUserId, 'coolprivatechannel', false);
    expect(channelJoinV1(authUserObj1.authUserId, channelObj.channelId)).toStrictEqual(ERROR);
  });

  // channelJoinV1 Valid Test
  test('joining a public channel', () => {
    const email1 = 'z5455555@ad.unsw.edu.au';
    const password1 = 'password';
    const nameFirst1 = 'Dr';
    const nameLast1 = 'Doofenshmirtz';
    // Dr user is not a global owner
    const authUserObj1 = authRegisterV1(email1, password1, nameFirst1, nameLast1);
    // Perry user is a global owner and member of private channel
    const channelObj = channelsCreateV1(authUserObj.authUserId, 'coolPublicChannel', true);
    expect(channelJoinV1(authUserObj1.authUserId, channelObj.channelId)).toStrictEqual({});
    const channelDetailsReturn = channelDetailsV1(authUserObj1.authUserId, channelObj.channelId);
    expect(channelDetailsReturn).toStrictEqual({
      name: 'coolPublicChannel',
      isPublic: true,
      ownerMembers: [
        {
          uId: authUserObj.authUserId,
          email: email,
          nameFirst: nameFirst,
          nameLast: nameLast,
          handleStr: 'perrytheplatypus'
        }
      ],
      allMembers: expect.any(Array)
    });

    const expectedArray = [
      {
        uId: authUserObj.authUserId,
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: 'perrytheplatypus'
      },
      {
        uId: authUserObj1.authUserId,
        email: email1,
        nameFirst: nameFirst1,
        nameLast: nameLast1,
        handleStr: 'drdoofenshmirtz'
      }
    ];
    expect(channelDetailsReturn.allMembers.sort((a, b) => a.uId - b.uId)).toStrictEqual(
      expectedArray.sort((a, b) => a.uId - b.uId)
    );
  });

  test('joining a private channel', () => {
    const email1 = 'z5455555@ad.unsw.edu.au';
    const password1 = 'password';
    const nameFirst1 = 'Dr';
    const nameLast1 = 'Doofenshmirtz';
    // Dr is not a global owner but made a private channel
    const authUserObj1 = authRegisterV1(email1, password1, nameFirst1, nameLast1);
    const channelObj = channelsCreateV1(authUserObj1.authUserId, 'edgyPrivateChannel', false);
    // Perry joins a private channel because he is a global owner
    // Global owners can join private channels without an invite
    expect(channelJoinV1(authUserObj.authUserId, channelObj.channelId)).toStrictEqual({});
    const channelDetailsReturn = channelDetailsV1(authUserObj1.authUserId, channelObj.channelId);
    expect(channelDetailsReturn).toStrictEqual({
      name: 'edgyPrivateChannel',
      isPublic: false,
      ownerMembers: [
        {
          uId: authUserObj1.authUserId,
          email: email1,
          nameFirst: nameFirst1,
          nameLast: nameLast1,
          handleStr: 'drdoofenshmirtz'
        }
      ],
      allMembers: expect.any(Array)
    });

    const expectedArray = [
      {
        uId: authUserObj1.authUserId,
        email: email1,
        nameFirst: nameFirst1,
        nameLast: nameLast1,
        handleStr: 'drdoofenshmirtz'
      },
      {
        uId: authUserObj.authUserId,
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: 'perrytheplatypus'
      }
    ];
    expect(channelDetailsReturn.allMembers.sort((a, b) => a.uId - b.uId)).toStrictEqual(
      expectedArray.sort((a, b) => a.uId - b.uId)
    );
  });
});

describe('channelInviteV1', () => {
  // channelInviteV1 Error Tests
  let email, password, nameFirst, nameLast, authUserObj;
  let email1, password1, nameFirst1, nameLast1, authUserObj1;
  beforeEach(() => {
    email = 'z5555555@ad.unsw.edu.au';
    password = 'password';
    nameFirst = 'Alvin';
    nameLast = 'the Chipmunk';
    authUserObj = authRegisterV1(email, password, nameFirst, nameLast);

    email1 = 'z5455555@ad.unsw.edu.au';
    password1 = 'password';
    nameFirst1 = 'Theodore';
    nameLast1 = 'the Chipmunk';
    authUserObj1 = authRegisterV1(email1, password1, nameFirst1, nameLast1);
  });

  // Cool Public Channels
  // no channel created so channelId should be invalid
  test('invalid channelId', () => {
    expect(channelInviteV1(authUserObj.authUserId, 1, authUserObj1.authUserId)).toStrictEqual(ERROR);
  });

  // channel created and invited user is invalid
  test('uId does not refer to a valid user', () => {
    const channelObj = channelsCreateV1(authUserObj.authUserId, 'coolPublicChannel', true);
    expect(channelInviteV1(authUserObj.authUserId, channelObj.channelId, authUserObj1.authUserId + 1)).toStrictEqual(ERROR);
  });

  // channel created and uId is invited and is invited again
  test('uId refers to a member already in the channel', () => {
    const channelObj = channelsCreateV1(authUserObj.authUserId, 'coolPublicChannel', true);
    channelInviteV1(authUserObj.authUserId, channelObj.channelId, authUserObj1.authUserId);
    expect(channelInviteV1(authUserObj.authUserId, channelObj.channelId, authUserObj1.authUserId)).toStrictEqual(ERROR);
  });

  // channel is created by Alvin, Theodore invites Simon but Theodore is not a member of the channel
  test('channelId is valid, authUser is not a member and uId is not a member', () => {
    const email2 = 'z5355555@ad.unsw.edu.au';
    const password2 = 'password';
    const nameFirst2 = 'Simon';
    const nameLast2 = 'the Chipmunk';
    const authUserObj2 = authRegisterV1(email2, password2, nameFirst2, nameLast2);

    const channelObj = channelsCreateV1(authUserObj.authUserId, 'coolPublicChannel', true);
    expect(channelInviteV1(authUserObj1.authUserId, channelObj.channelId, authUserObj2.authUserId)).toStrictEqual(ERROR);
  });

  // Simon tries to invite Theodore, but Simon doesn't even have an account.
  test('authUserId is invalid', () => {
    const channelObj = channelsCreateV1(authUserObj.authUserId, 'coolPublicChannel', true);
    expect(channelInviteV1(authUserObj1.authUserId + 1, channelObj.channelId, authUserObj1.authUserId)).toStrictEqual(ERROR);
  });

  // Edgy Private Channels
  // no channel created so channelId should be invalid
  test('invalid channelId', () => {
    expect(channelInviteV1(authUserObj.authUserId, 1, authUserObj1.authUserId)).toStrictEqual(ERROR);
  });

  // channel created and invited user is invalid
  test('uId does not refer to a valid user', () => {
    const channelObj = channelsCreateV1(authUserObj.authUserId, 'edgyPrivateChannel', false);
    expect(channelInviteV1(authUserObj.authUserId, channelObj.channelId, authUserObj1.authUserId + 1)).toStrictEqual(ERROR);
  });

  // channel created and uId is invited and is invited again
  test('uId refers to a member already in the channel', () => {
    const channelObj = channelsCreateV1(authUserObj.authUserId, 'edgyPrivateChannel', false);
    channelInviteV1(authUserObj.authUserId, channelObj.channelId, authUserObj1.authUserId);
    expect(channelInviteV1(authUserObj.authUserId, channelObj.channelId, authUserObj1.authUserId)).toStrictEqual(ERROR);
  });

  // channel is created by Alvin, Theodore invites Simon but Theodore is not a member of the channel
  test('channelId is valid, authUser is not a member and uId is not a member', () => {
    const email2 = 'z5355555@ad.unsw.edu.au';
    const password2 = 'password';
    const nameFirst2 = 'Simon';
    const nameLast2 = 'the Chipmunk';
    const authUserObj2 = authRegisterV1(email2, password2, nameFirst2, nameLast2);

    const channelObj = channelsCreateV1(authUserObj.authUserId, 'edgyPrivateChannel', false);
    expect(channelInviteV1(authUserObj1.authUserId, channelObj.channelId, authUserObj2.authUserId)).toStrictEqual(ERROR);
  });

  // Simon tries to invite Theodore, but Simon doesn't even have an account.
  test('authUserId is invalid', () => {
    const channelObj = channelsCreateV1(authUserObj.authUserId, 'edgyPrivateChannel', false);
    expect(channelInviteV1(authUserObj1.authUserId + 1, channelObj.channelId, authUserObj1.authUserId)).toStrictEqual(ERROR);
  });

  // channelInviteV1 coolPublicChannel Valid Tests
  test('authUserId invites uId to public channel', () => {
    const channelObj = channelsCreateV1(authUserObj.authUserId, 'coolPublicChannel', true);
    expect(channelInviteV1(authUserObj.authUserId, channelObj.channelId, authUserObj1.authUserId)).toStrictEqual({});

    const channelDetailsReturn = channelDetailsV1(authUserObj.authUserId, channelObj.channelId);
    expect(channelDetailsReturn).toStrictEqual({
      name: 'coolPublicChannel',
      isPublic: true,
      ownerMembers: [
        {
          uId: authUserObj.authUserId,
          email: email,
          nameFirst: nameFirst,
          nameLast: nameLast,
          handleStr: 'alvinthechipmunk'
        }
      ],
      allMembers: expect.any(Array)
    });

    const expectedArray = [
      {
        uId: authUserObj.authUserId,
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: 'alvinthechipmunk'
      },
      {
        uId: authUserObj1.authUserId,
        email: email1,
        nameFirst: nameFirst1,
        nameLast: nameLast1,
        handleStr: 'theodorethechipmunk'
      }
    ];
    // sorting the array to account for different permutations of expected array
    expect(channelDetailsReturn.allMembers.sort((a, b) => a.uId - b.uId)).toStrictEqual(
      expectedArray.sort((a, b) => a.uId - b.uId)
    );
  });

  // channelInviteV1 edgyPrivateChannel Valid Tests
  test('authUserId invites uId to private channel', () => {
    const channelObj = channelsCreateV1(authUserObj.authUserId, 'edgyPrivateChannel', false);
    expect(channelInviteV1(authUserObj.authUserId, channelObj.channelId, authUserObj1.authUserId)).toStrictEqual({});

    const channelDetailsReturn = channelDetailsV1(authUserObj.authUserId, channelObj.channelId);
    expect(channelDetailsReturn).toStrictEqual({
      name: 'edgyPrivateChannel',
      isPublic: false,
      ownerMembers: [
        {
          uId: authUserObj.authUserId,
          email: email,
          nameFirst: nameFirst,
          nameLast: nameLast,
          handleStr: 'alvinthechipmunk'
        }
      ],
      allMembers: expect.any(Array)
    });

    const expectedArray = [
      {
        uId: authUserObj.authUserId,
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: 'alvinthechipmunk'
      },
      {
        uId: authUserObj1.authUserId,
        email: email1,
        nameFirst: nameFirst1,
        nameLast: nameLast1,
        handleStr: 'theodorethechipmunk'
      }
    ];
    // sorting the array to account for different permutations of expected array
    expect(channelDetailsReturn.allMembers.sort((a, b) => a.uId - b.uId)).toStrictEqual(
      expectedArray.sort((a, b) => a.uId - b.uId)
    );
  });
});
