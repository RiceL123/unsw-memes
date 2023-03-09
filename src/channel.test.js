import { clearV1 } from './other.js';
import { authRegisterV1 } from './auth.js';
import { channelsCreateV1 } from './channels.js';
import { channelDetailsV1, channelJoinV1, channelMessagesV1 } from './channel.js';


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

    let authUserObj2 = authRegisterV1(email, password, nameFirst, nameLast);

    let channelObj = channelsCreateV1(authUserObj2.authUserId, 'COMP1531 Crunchie', false);
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
    expect(channelDetailsObj.allMembers.sort((a, b) => { a.uId - b.uId })).toStrictEqual(
      expectedArr.sort((a, b) => { a.uId - b.uId })
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

    channelName = 'Coding'
    channelObj = channelsCreateV1(authUserObj.authUserId, channelName, true);
  });

  test('invalid channelId', () => {
    let start = 0;

    expect(channelMessagesV1(authUserObj.authUserId, channelObj.channelId + 1, start)).toStrictEqual(ERROR);
  });

  test('invalid authUserId', () => {
    let start = 0;

    expect(channelMessagesV1(authUserObj.authUserId + 1, channelObj.channelId, start)).toStrictEqual(ERROR);
  });

  test('start is greater than total messages in channel', () => {
    let start = 50;

    let messageObj = channelMessagesV1(authUserObj.authUserId, channelObj.channelId, start);

    expect(messageObj).toStrictEqual(ERROR);
  });

  test('start is less than 0', () => {
    let start = -1;

    expect(channelMessagesV1(authUserObj.authUserId, channelObj.channelId, start)).toStrictEqual(ERROR);
  });

  test('valid channelId but authorised user is not a member', () => {
    const email2 = 'z1111111@ad.unsw.edu.au';
    const password2 = 'password';
    const nameFirst2 = 'Charmander';
    const nameLast2 = 'Pokemon';

    let authUserObj2 = authRegisterV1(email2, password2, nameFirst2, nameLast2);

    let start = 0;

    expect(channelMessagesV1(authUserObj2.authUserId, channelObj.channelId, start)).toStrictEqual(ERROR);
  });

  test('valid channelMessagesV1', () => {

    const start = 0;

    let messagesArray = channelMessagesV1(authUserObj.authUserId, channelObj.channelId, start);
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

    const channelName2 = 'Maths'
    const channelName3 = 'Commerce'

    const channelObj2 = channelsCreateV1(authUserObj2.authUserId, channelName2, true);
    const channelObj3 = channelsCreateV1(authUserObj3.authUserId, channelName3, true);

    let start = 0;

    let messagesArray = channelMessagesV1(authUserObj.authUserId, channelObj.channelId, start);
    expect(messagesArray).toStrictEqual({
      messages: [],
      start: start,
      end: -1,
    });

    let messagesArray2 = channelMessagesV1(authUserObj2.authUserId, channelObj2.channelId, start);
    expect(messagesArray2).toStrictEqual({
      messages: [],
      start: start,
      end: -1,
    });

    let messagesArray3 = channelMessagesV1(authUserObj3.authUserId, channelObj3.channelId, start);
    expect(messagesArray3).toStrictEqual({
      messages: [],
      start: start,
      end: -1,
    });
  });
});