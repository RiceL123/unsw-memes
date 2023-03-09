import { clearV1 } from './other.js';
import { channelsCreateV1, channelsListV1, channelsListAllV1 } from './channels.js';
import { authRegisterV1 } from './auth.js';
import { channelJoinV1, channelDetailsV1, channelInviteV1} from './channel.js';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clearV1();
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
          channelName: 'COMP1531 Crunchie',
          ownerMembersIds: [authUserObj.authUserId],
          allMembersIds: [authUserObj.authUserId],
          isPublic: false,
        }
      ]
    })
  })

  test('user is part of multiple channels', () => {
    const channelObj = channelsCreateV1(authUserObj.authUserId,'COMP1531 Crunchie', false);
    const channelObj2 = channelsCreateV1(authUserObj.authUserId,'COMP1531 General', true);
    const channelsAllObj = channelsListAllV1(authUserObj.authUserId);

    expect(channelsAllObj).toStrictEqual({channels: expect.any(Array)});
    const expectedArr = [
      {
        channelId: channelObj.channelId,
        channelName: 'COMP1531 Crunchie',
        ownerMembersIds: [authUserObj.authUserId],
        allMembersIds: [authUserObj.authUserId],
        isPublic: false,
      },
      {
        channelId: channelObj2.channelId,
        channelName: 'COMP1531 General',
        ownerMembersIds: [authUserObj.authUserId],
        allMembersIds: [authUserObj.authUserId],
        isPublic: true,
      }
    ];
    // sorting to account for any permuation of the allChannels array
    expect(channelsAllObj.channels.sort((a,b) => {a.channelId - b.channelId})).toStrictEqual(
      expectedArr.sort((a,b) => {a.channelId - b.channelId})
    );
  })

  test('user is part of multiple channels', () => {
    const channelObj = channelsCreateV1(authUserObj.authUserId,'COMP1531 Crunchie', false);
    const channelObj2 = channelsCreateV1(authUserObj.authUserId,'COMP1531 General', true);
    const channelObj3 = channelsCreateV1(authUserObj.authUserId,'study room', true);
    const channelsAllObj = channelsListAllV1(authUserObj.authUserId);

    expect(channelsAllObj).toStrictEqual({channels: expect.any(Array)});
    const expectedArr = [
      {
        channelId: channelObj.channelId,
        channelName: 'COMP1531 Crunchie',
        ownerMembersIds: [authUserObj.authUserId],
        allMembersIds: [authUserObj.authUserId],
        isPublic: false,
      },
      {
        channelId: channelObj2.channelId,
        channelName: 'COMP1531 General',
        ownerMembersIds: [authUserObj.authUserId],
        allMembersIds: [authUserObj.authUserId],
        isPublic: true,
      },
      {
        channelId: channelObj3.channelId,
        channelName: 'study room',
        ownerMembersIds: [authUserObj.authUserId],
        allMembersIds: [authUserObj.authUserId],
        isPublic: true,
      }
    ];
    // sorting to account for any permuation of the allChannels array
    expect(channelsAllObj.channels.sort((a,b) => {a.channelId - b.channelId})).toStrictEqual(
      expectedArr.sort((a,b) => {a.channelId - b.channelId})
    );
  })
});





