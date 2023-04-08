import { clear, authRegister, channelsCreate, channelsListAll, channelJoin, channelDetails, channelsList, channelInvite } from './routeRequests';

const VALID_CHANNELS_CREATE = { channelId: expect.any(Number) };

interface channelObject {
  channelId: number
  name: string
}

beforeEach(() => {
  clear();
});

// HTTP TESTS FOR channelsCreateV3
describe('channelsCreateV3', () => {
  const email = 'z5555555@ad.unsw.edu.au';
  const password = 'password';
  const nameFirst = 'Bob';
  const nameLast = 'theBuilder';
  test('invalid token', () => {
    // registering a person
    const person1Data = authRegister(email, password, nameFirst, nameLast);
    const channelName = 'study';
    const isPublic = false;
    const channel1Data = channelsCreate(person1Data.token + 1, channelName, isPublic);
    expect(channel1Data).toStrictEqual(403);
  });

  test('invalid channel name.length < 1', () => {
    // registering a person
    const person1Data = authRegister(email, password, nameFirst, nameLast);
    const channelName = '';
    const isPublic = false;
    const channel1Data = channelsCreate(person1Data.token, channelName, isPublic);
    expect(channel1Data).toStrictEqual(400);
  });

  test('invalid channel name.length > 20', () => {
    // registering a person
    const person1Data = authRegister(email, password, nameFirst, nameLast);
    const channelName = 'thisnameistwentylongg';
    const isPublic = false;
    const channel1Data = channelsCreate(person1Data.token, channelName, isPublic);
    expect(channel1Data).toStrictEqual(400);
  });

  test('valid channel control', () => {
    // registering a person
    const person1Data = authRegister(email, password, nameFirst, nameLast);
    const channelName = 'charmanda';
    const isPublic = false;
    const channel1Data = channelsCreate(person1Data.token, channelName, isPublic);
    expect(channel1Data).toStrictEqual(VALID_CHANNELS_CREATE);
  });

  test('valid channel name.length = 1', () => {
    // registering a person
    const person1Data = authRegister(email, password, nameFirst, nameLast);
    const channelName = 'a';
    const isPublic = false;
    const channel1Data = channelsCreate(person1Data.token, channelName, isPublic);
    expect(channel1Data).toStrictEqual(VALID_CHANNELS_CREATE);
  });

  test('valid channel name.length = 20', () => {
    // registering a person
    const person1Data = authRegister(email, password, nameFirst, nameLast);
    const channelName = 'thisnameistwentylong';
    const isPublic = false;
    const channel1Data = channelsCreate(person1Data.token, channelName, isPublic);
    expect(channel1Data).toStrictEqual(VALID_CHANNELS_CREATE);
  });

  test('valid channel public', () => {
    // registering a person
    const person1Data = authRegister(email, password, nameFirst, nameLast);

    // creating first channel
    const channelName = 'study';
    const isPublic = true;
    const channel1Data = channelsCreate(person1Data.token, channelName, isPublic);

    // registering a second person
    const email2 = 'z5535555@ad.unsw.edu.au';
    const password2 = 'password';
    const nameFirst2 = 'Jeff';
    const nameLast2 = 'theBuilder';
    const person2Data = authRegister(email2, password2, nameFirst2, nameLast2);

    // attempting to join a public channel
    const channelJoinData = channelJoin(person2Data.token, channel1Data.channelId);
    expect(channelJoinData).not.toStrictEqual(400);
  });

  test('valid channel private', () => {
    // registering a person
    const person1Data = authRegister(email, password, nameFirst, nameLast);

    // creating first channel
    const channelName = 'study';
    const isPublic = false;
    const channel1Data = channelsCreate(person1Data.token, channelName, isPublic);

    // registering a second person
    const email2 = 'z5535555@ad.unsw.edu.au';
    const password2 = 'password';
    const nameFirst2 = 'Jeff';
    const nameLast2 = 'theBuilder';
    const person2Data = authRegister(email2, password2, nameFirst2, nameLast2);

    // attempting to join a public channel
    const channelJoinData = channelJoin(person2Data.token, channel1Data.channelId);
    expect(channelJoinData).toEqual(403);
  });

  test('user who created channel is a member', () => {
    // registering a person
    const person1Data = authRegister(email, password, nameFirst, nameLast);

    // creating first channel
    const channelName = 'study';
    const isPublic = false;
    const channel1Data = channelsCreate(person1Data.token, channelName, isPublic);

    // check if creator is a member
    const channelDetailsData = channelDetails(person1Data.token, channel1Data.channelId);
    expect(channelDetailsData).not.toStrictEqual(400);
  });

  test('multiple valid channels', () => {
    // registering a person
    const person1Data = authRegister(email, password, nameFirst, nameLast);

    // creating first channel
    const channelName = 'study';
    const isPublic = true;
    const channel1Data = channelsCreate(person1Data.token, channelName, isPublic);

    // registering a second person
    const email2 = 'z5535555@ad.unsw.edu.au';
    const password2 = 'password';
    const nameFirst2 = 'Jeff';
    const nameLast2 = 'theBuilder';
    const person2Data = authRegister(email2, password2, nameFirst2, nameLast2);

    // creating second channel
    const channelName2 = 'study2';
    const isPublic2 = true;
    const channel2Data = channelsCreate(person2Data.token, channelName2, isPublic2);
    expect(channel2Data.channelId).not.toStrictEqual(channel1Data.channelId);
  });
});

// TESTS FOR CHANNELSLISTV3
describe('channelsListV3', () => {
  const email = 'z5555555@ad.unsw.edu.au';
  const password = 'password';
  const nameFirst = 'Bob';
  const nameLast = 'theBuilder';
  test('invalid authUserId', () => {
    // registering a person
    const person1Data = authRegister(email, password, nameFirst, nameLast);
    const channelsListData = channelsList(person1Data.token + 1);
    expect(channelsListData).toStrictEqual(403);
  });

  test('valid channel control', () => {
    // registering a person
    const person1Data = authRegister(email, password, nameFirst, nameLast);

    // creating first channel
    const channelName = 'COMP1531 Crunchie';
    const isPublic = false;
    const channel1Data = channelsCreate(person1Data.token, channelName, isPublic);

    const channelsArr = [
      {
        channelId: channel1Data.channelId,
        name: 'COMP1531 Crunchie',
      },
    ];

    const channelsListData = channelsList(person1Data.token);

    expect(channelsListData).toStrictEqual({
      channels: channelsArr
    });
  });

  test('individual in multiple channels', () => {
    // registering a person
    const person1Data = authRegister(email, password, nameFirst, nameLast);

    // creating first channel
    const channelName = 'COMP1531 Crunchie';
    const isPublic = false;
    const channel1Data = channelsCreate(person1Data.token, channelName, isPublic);

    // creating second channel
    const channelName2 = 'Study Room';
    const isPublic2 = true;
    const channel2Data = channelsCreate(person1Data.token, channelName2, isPublic2);

    const channelsArr = [
      {
        channelId: channel1Data.channelId,
        name: 'COMP1531 Crunchie',
      },
      {
        channelId: channel2Data.channelId,
        name: 'Study Room',
      }
    ];

    const channelsListData = channelsList(person1Data.token);

    // sorting in test accounts for multiple permutations in the channelsArr so the test is blackbox.
    expect(channelsListData.channels.sort((a: channelObject, b: channelObject) => a.channelId - b.channelId)).toStrictEqual(
      channelsArr.sort((a, b) => a.channelId - b.channelId)
    );
  });

  test('individual creates a channel, gets added to another', () => {
    // registering a person
    const person1Data = authRegister(email, password, nameFirst, nameLast);

    // registering a second person
    const email2 = 'z5555355@ad.unsw.edu.au';
    const password2 = 'password';
    const nameFirst2 = 'Tim';
    const nameLast2 = 'theBuilder';
    const person2Data = authRegister(email2, password2, nameFirst2, nameLast2);

    // creating first channel
    const channelName = 'COMP1531 Crunchie';
    const isPublic = false;
    const channel1Data = channelsCreate(person1Data.token, channelName, isPublic);

    // creating second channel
    const channelName2 = 'Study Room';
    const isPublic2 = true;
    const channel2Data = channelsCreate(person2Data.token, channelName2, isPublic2);

    const channelInvData = channelInvite(person2Data.token, channel2Data.channelId, person1Data.authUserId);
    expect(channelInvData).toStrictEqual({});

    // AuthUserId should be part of both channels now.
    const channelsArr = [
      {
        channelId: channel1Data.channelId,
        name: 'COMP1531 Crunchie',
      },
      {
        channelId: channel2Data.channelId,
        name: 'Study Room',
      }
    ];

    const listData = channelsList(person1Data.token);

    // sorting in test accounts for multiple permutations in the channelsArr so the test is blackbox.
    expect(listData.channels.sort((a: any, b: any) => a.channelId - b.channelId)).toStrictEqual(
      channelsArr.sort((a, b) => a.channelId - b.channelId)
    );
  });
});

// // TESTS FOR channelsListAllV3
describe('channelsListAllV3', () => {
  const email = 'z5555555@ad.unsw.edu.au';
  const password = 'password';
  const nameFirst = 'Madhav';
  const nameLast = 'Mishra';

  test('invalid token', () => {
    const person1Data = authRegister(email, password, nameFirst, nameLast);
    const channelName = 'COMP1531 Crunchie';
    const channelObj = channelsCreate(person1Data.token, channelName, false);
    expect(channelObj).toStrictEqual(VALID_CHANNELS_CREATE);
    expect(channelsListAll(person1Data.token + 1)).toEqual(403);
  });

  test('authUserId is valid and in one channel', () => {
    const person1Data = authRegister(email, password, nameFirst, nameLast);
    const channelName = 'COMP1531 Crunchie';
    const channelObj = channelsCreate(person1Data.token, channelName, false);
    expect(channelObj).toStrictEqual(VALID_CHANNELS_CREATE);

    const expectedArr = [
      {
        channelId: channelObj.channelId,
        name: 'COMP1531 Crunchie',
      }
    ];

    const listAllObj = channelsListAll(person1Data.token);
    expect(listAllObj).toStrictEqual({
      channels: expectedArr
    });
  });

  test('user is part of multiple channels', () => {
    const person1Data = authRegister(email, password, nameFirst, nameLast);
    const channelName = 'COMP1531 Crunchie';
    const channelObj = channelsCreate(person1Data.token, channelName, false);
    expect(channelObj).toStrictEqual(VALID_CHANNELS_CREATE);

    const channelName2 = 'COMP1531 General';
    const channelObj2 = channelsCreate(person1Data.token, channelName2, true);
    expect(channelObj2).toStrictEqual(VALID_CHANNELS_CREATE);

    const listAllObj = channelsListAll(person1Data.token);
    expect(listAllObj).toStrictEqual({ channels: expect.any(Array) });

    const expectedArr = [
      {
        channelId: channelObj.channelId,
        name: 'COMP1531 Crunchie',
      },
      {
        channelId: channelObj2.channelId,
        name: 'COMP1531 General',
      }
    ];

    // sorting to account for any permuation of the allChannels array
    expect(listAllObj.channels.sort((a: channelObject, b: channelObject) => a.channelId - b.channelId)).toStrictEqual(
      expectedArr.sort((a, b) => a.channelId - b.channelId)
    );
  });

  test('user is part of multiple channels', () => {
    const person1Data = authRegister(email, password, nameFirst, nameLast);
    const channelName = 'COMP1531 Crunchie';
    const channelObj = channelsCreate(person1Data.token, channelName, false);
    expect(channelObj).toStrictEqual(VALID_CHANNELS_CREATE);

    const channelName2 = 'COMP1531 General';
    const channelObj2 = channelsCreate(person1Data.token, channelName2, true);
    expect(channelObj2).toStrictEqual(VALID_CHANNELS_CREATE);

    const channelName3 = 'Study Room';
    const channelObj3 = channelsCreate(person1Data.token, channelName3, true);
    expect(channelObj3).toStrictEqual(VALID_CHANNELS_CREATE);

    const listAllObj = channelsListAll(person1Data.token);
    expect(listAllObj).toStrictEqual({ channels: expect.any(Array) });

    const expectedArr = [
      {
        channelId: channelObj.channelId,
        name: 'COMP1531 Crunchie',
      },
      {
        channelId: channelObj2.channelId,
        name: 'COMP1531 General',
      },
      {
        channelId: channelObj3.channelId,
        name: 'Study Room',
      }
    ];
    // sorting to account for any permuation of the allChannels array
    expect(listAllObj.channels.sort((a: channelObject, b: channelObject) => a.channelId - b.channelId)).toStrictEqual(
      expectedArr.sort((a, b) => a.channelId - b.channelId)
    );
  });
});
