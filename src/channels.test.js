import { clearV1 } from './other.js';
import { channelsCreateV1, channelsListV1, channelsListAllV1 } from './channels.js';
import { authRegisterV1 } from './auth.js';
import { channelJoinV1, channelDetailsV1, channelInviteV1} from './channel.js';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clearV1();
});

// TESTS FOR CHANNELSCREATEV1
describe('channelsCreateV1', () =>{
  test('invalid authUserId', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Bob';
    const nameLast = 'theBuilder';
    const person1 = authRegisterV1(email, password, nameFirst, nameLast);

    const authUserId = person1.authUserId;
    const isPublic = false;
    const name = 'study';
    expect(channelsCreateV1(authUserId + 1, name, isPublic)).toStrictEqual(ERROR); 
  });

  test('invalid channel name.length < 1', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Bob';
    const nameLast = 'theBuilder';
    const person1 = authRegisterV1(email, password, nameFirst, nameLast);

    const authUserId = person1.authUserId;
    const name = '';
    const isPublic = false;
    expect(channelsCreateV1(authUserId, name, isPublic)).toStrictEqual(ERROR)
  });

  test('invalid channel name.length > 20', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Bob';
    const nameLast = 'theBuilder';
    const person1 = authRegisterV1(email, password, nameFirst, nameLast);

    const authUserId = person1.authUserId;
    const name = 'thisnameistwentylongg';
    const isPublic = false;
    expect(channelsCreateV1(authUserId, name, isPublic)).toStrictEqual(ERROR)
  });

  test('valid channel control', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Bob';
    const nameLast = 'theBuilder';
    const person1 = authRegisterV1(email, password, nameFirst, nameLast);

    const authUserId = person1.authUserId;
    const name = 'charmanda';
    const isPublic = false;
    expect(channelsCreateV1(authUserId, name, isPublic)).toStrictEqual({
      channelId: expect.any(Number)
    });
  });

  test('valid channel name.length = 1', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Bob';
    const nameLast = 'theBuilder';
    const person1 = authRegisterV1(email, password, nameFirst, nameLast);

    const authUserId = person1.authUserId;
    const name = 'a';
    const isPublic = false;
    expect(channelsCreateV1(authUserId, name, isPublic)).toStrictEqual({
      channelId: expect.any(Number)
    });
  });

  test('valid channel name.length = 20', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Bob';
    const nameLast = 'theBuilder';
    const person1 = authRegisterV1(email, password, nameFirst, nameLast);

    const authUserId = person1.authUserId;
    const name = 'thisnameistwentylong';
    const isPublic = false;
    expect(channelsCreateV1(authUserId, name, isPublic)).toStrictEqual({
      channelId: expect.any(Number)
    });
  });

  test('valid channel public', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Bob';
    const nameLast = 'theBuilder';
    const person1 = authRegisterV1(email, password, nameFirst, nameLast);

    const authUserId = person1.authUserId;
    const name = 'study';
    const isPublic = true;
    const channelObject = channelsCreateV1(authUserId, name, isPublic);

    // testing if user successfully joins public server
    const email2 = 'z5535555@ad.unsw.edu.au';
    const password2 = 'password';
    const nameFirst2 = 'Jeff';
    const nameLast2 = 'theBuilder';
    const authUserId2 = authRegisterV1(email2, password2, nameFirst2, nameLast2);  
    expect(channelJoinV1(authUserId2.authUserId, channelObject.channelId)).not.toStrictEqual(ERROR);
  });

  test('valid channel private', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Bob';
    const nameLast = 'theBuilder';
    const person1 = authRegisterV1(email, password, nameFirst, nameLast);
    const authUserId = person1.authUserId;
    
    const name = 'study';
    const isPublic = false;
    const channelObject = channelsCreateV1(authUserId, name, isPublic);
    
    // user trying to join
    const email2 = 'z5535555@ad.unsw.edu.au';
    const password2 = 'password';
    const nameFirst2 = 'Jeff';
    const nameLast2 = 'theBuilder';
    const authUserId2 = authRegisterV1(email2, password2, nameFirst2, nameLast2); 
        
    // person 2 cannot join private channel, should output error
    expect(channelJoinV1(authUserId2.authUserId, channelObject.channelId)).toStrictEqual(ERROR);
  });

  test('user who created channel is a member', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Bob';
    const nameLast = 'theBuilder';
    const authUserObject = authRegisterV1(email, password, nameFirst, nameLast);

    const name = 'study';
    const isPublic = false;
    const channelObject = channelsCreateV1(authUserObject.authUserId, name, isPublic);
    // If no error returned, creater is successfully registered as a member upon creation
    expect(channelDetailsV1(authUserObject.authUserId, channelObject.channelId)).not.toStrictEqual(ERROR);
  });

  test('multiple valid channels', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Bob';
    const nameLast = 'theBuilder';
    const person1 = authRegisterV1(email, password, nameFirst, nameLast);
    const authUserId = person1.authUserId;

    const email2 = 'z5555554@ad.unsw.edu.au';
    const password2 = 'password';
    const nameFirst2 = 'Jeff';
    const nameLast2 = 'theBuilder';
    const person2 = authRegisterV1(email2, password2, nameFirst2, nameLast2);
    const authUserId2 = person2.authUserId;

    const name = 'study';
    const isPublic = false;
    // register users to make them valid
    const channel1 = channelsCreateV1(authUserId, name, isPublic);
    const channel2 = channelsCreateV1(authUserId2, name, isPublic);
    expect(channel1).not.toStrictEqual(channel2);
  });
});

// TESTS FOR CHANNELSLISTV1
describe('channelsListV1', () =>{
  test('invalid authUserId', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Bob';
    const nameLast = 'theBuilder';
    const person1 = authRegisterV1(email, password, nameFirst, nameLast);
    const authUserId = person1.authUserId;
    expect(channelsListV1(authUserId + 1)).toStrictEqual(ERROR); 
  });

  test('valid channel control', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Bob';
    const nameLast = 'theBuilder';
    const person1 = authRegisterV1(email, password, nameFirst, nameLast);
    const authUserId = person1.authUserId;

    const name = 'COMP1531 Crunchie';
    const isPublic = false;
    const channel = channelsCreateV1(authUserId, name, isPublic);
    const channelId = channel.channelId;

    let channelsArr = [
      {
        channelId: channelId,
        name: 'COMP1531 Crunchie',
      },
    ];
    expect(channelsListV1(authUserId)).toStrictEqual({ 
      channels: channelsArr
    });
  });

  test('individual in multiple channels', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Bob';
    const nameLast = 'theBuilder';
    const person1 = authRegisterV1(email, password, nameFirst, nameLast);
    const authUserId = person1.authUserId;

    const name = 'COMP1531 Crunchie';
    const isPublic = false;
    const channel1 = channelsCreateV1(authUserId, name, isPublic);
    const channel1Id = channel1.channelId;

    const name2 = 'Study Room';
    const isPublic2 = true;
    const channel2 = channelsCreateV1(authUserId, name2, isPublic2);
    const channel2Id = channel2.channelId;

    let channelsArr = [
      {
        channelId: channel1Id,
        name: 'COMP1531 Crunchie',
      },
      {
        channelId: channel2Id,
        name: 'Study Room',
      }
    ];
    // sorting in test accounts for multiple permutations in the channelsArr so the test is blackbox.
    expect(channelsListV1(authUserId).channels.sort((a, b) => {a.channelId - b.channelId})).toStrictEqual(
      channelsArr.sort((a,b) => {a.channelId - b.channelId})
    );
  });

  test('individual creates a channel, gets added to another', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Bob';
    const nameLast = 'theBuilder';
    const person1 = authRegisterV1(email, password, nameFirst, nameLast);
    const authUserId = person1.authUserId;

    const email2 = 'z5555355@ad.unsw.edu.au';
    const password2 = 'password';
    const nameFirst2 = 'Tim';
    const nameLast2 = 'theBuilder';
    const person2 = authRegisterV1(email2, password2, nameFirst2, nameLast2);
    const authUserId2 = person2.authUserId;

    const name = 'COMP1531 Crunchie';
    const isPublic = false;
    const channel1 = channelsCreateV1(authUserId, name, isPublic);
    const channelId = channel1.channelId

    const name2 = 'Study Room';
    const isPublic2 = true;
    const channel2 = channelsCreateV1(authUserId2, name2, isPublic2);
    const channelId2 = channel2.channelId

    channelInviteV1(authUserId2, channelId2, authUserId);
    // AuthUserId should be part of both channels now.
    let channelsArr = [
      {
        channelId: channelId,
        name: 'COMP1531 Crunchie',
      },
      {
        channelId: channelId2,
        name: 'Study Room',
      }
    ];
    // sorting in test accounts for multiple permutations in the channelsArr so the test is blackbox.
    expect(channelsListV1(authUserId).channels.sort((a, b) => {a.channelId - b.channelId})).toStrictEqual
    (channelsArr.sort((a,b) => {a.channelId - b.channelId}));
  });
});

// TESTS FOR channelsListAllV1
describe('channelsListAllV1 ', () => {
  let email, password, nameFirst, nameLast, authUserObj;
  beforeEach(() => {
    email = 'z5555555@ad.unsw.edu.au';
    password = 'password';
    nameFirst = 'Madhav';
    nameLast = 'Mishra';
    
    authUserObj = authRegisterV1(email, password, nameFirst, nameLast);
  });

  test('authUserId is invalid', () => {
    const channelObj = channelsCreateV1(authUserObj.authUserId,'COMP1531 Crunchie', false);
    expect(channelsListAllV1(authUserObj.authUserId + 1)).toStrictEqual(ERROR)
  });

  test('authUserId is valid and in one channel', () => {
    const channelObj = channelsCreateV1(authUserObj.authUserId,'COMP1531 Crunchie', false);

    expect(channelsListAllV1(authUserObj.authUserId)).toStrictEqual({
      channels: [
        {
          channelId: channelObj.channelId,
          name: 'COMP1531 Crunchie',
        }
      ]
    });
  });

  test('user is part of multiple channels', () => {
    const channelObj = channelsCreateV1(authUserObj.authUserId,'COMP1531 Crunchie', false);
    const channelObj2 = channelsCreateV1(authUserObj.authUserId,'COMP1531 General', true);
    const channelsAllObj = channelsListAllV1(authUserObj.authUserId);

    expect(channelsAllObj).toStrictEqual({channels: expect.any(Array)});
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
    expect(channelsAllObj.channels.sort((a,b) => {a.channelId - b.channelId})).toStrictEqual(
      expectedArr.sort((a,b) => {a.channelId - b.channelId})
    );
  });

  test('user is part of multiple channels', () => {
    const channelObj = channelsCreateV1(authUserObj.authUserId,'COMP1531 Crunchie', false);
    const channelObj2 = channelsCreateV1(authUserObj.authUserId,'COMP1531 General', true);
    const channelObj3 = channelsCreateV1(authUserObj.authUserId,'study room', true);
    const channelsAllObj = channelsListAllV1(authUserObj.authUserId);

    expect(channelsAllObj).toStrictEqual({channels: expect.any(Array)});
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
        name: 'study room',
      }
    ];
    // sorting to account for any permuation of the allChannels array
    expect(channelsAllObj.channels.sort((a,b) => {a.channelId - b.channelId})).toStrictEqual(
      expectedArr.sort((a,b) => {a.channelId - b.channelId})
    );
  });
});