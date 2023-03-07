import { clearV1 } from './other.js';
import { channelsCreateV1, channelsListV1 } from './channels.js';
import { authRegisterV1 } from './auth.js';
import { channelJoinV1, channelDetailsV1, channelInviteV1} from './channel.js';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    clearV1();
});

describe('ChannelsCreateV1', () =>{
  test('invalid authUserId', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Bob';
    const nameLast = 'theBuilder';
    const person1 = authRegisterV1(email, password, nameFirst, nameLast);

    const authUserId = person1.authUserId;
    const isPublic = 'false';
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
    const isPublic = 'false';
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
    const isPublic = 'false';
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
    const isPublic = 'false';
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
    const isPublic = 'false';
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
    const isPublic = 'false';
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
    const isPublic = 'true'
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
    const isPublic = 'false'
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
    const isPublic = 'false'
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
    const isPublic = 'false';
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
    const isPublic = 'false';
    const channel = channelsCreateV1(authUserId, name, isPublic);
    const channelId = channel.channelId;

    let channelsArr = [
      {
        channelId: channelId,
        name: 'COMP1531 Crunchie',
      },
    ];
    expect(channelsListV1(authUserId)).toStrictEqual(channelsArr);
  });

  test('individual in multiple channels', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'Bob';
    const nameLast = 'theBuilder';
    const person1 = authRegisterV1(email, password, nameFirst, nameLast);
    const authUserId = person1.authUserId;

    const name = 'COMP1531 Crunchie';
    const isPublic = 'false';
    const channel1 = channelsCreateV1(authUserId, name, isPublic);
    const channel1Id = channel1.channelId;

    const name2 = 'Study Room';
    const isPublic2 = 'true';
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
    expect(channelsListV1(authUserId).sort((a, b) => {a.channelId - b.channelId})).toStrictEqual
    (channelsArr.sort((a,b) => {a.channelId - b.channelId}));
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
    const isPublic = 'false';
    const channelId = channelsCreateV1(authUserId, name, isPublic);

    const name2 = 'Study Room';
    const isPublic2 = 'true';
    const channelId2 = channelsCreateV1(authUserId2, name2, isPublic2);

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
    expect(channelsListV1(authUserId).sort((a, b) => {a.channelId - b.channelId})).toStrictEqual
    (channelsArr.sort((a,b) => {a.channelId - b.channelId}));
  });
});
