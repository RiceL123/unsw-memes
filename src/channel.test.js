import { clearV1 } from './other.js';
import { authLoginV1, authRegisterV1 } from './auth.js';
import { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 } from './channel.js';
import { channelsCreateV1, channelsListAllV1 } from './channels.js';

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
        const channelObj = channelsCreateV1(authUserObj.authUserId + 1,'COMP1531 Crunchie', false);
        channelJoinV1(authUserObj.authUserId + 1, channelObj.channelId);
        expect(channelDetailsV1(authUserObj.authUserId + 1)).toStrictEqual(ERROR)
    });

    test('channelId is invalid', () => {
        const channelObj = channelsCreateV1(authUserObj.authUserId,'COMP1531 Crunchie', false);
        expect(channelDetailsV1(authUserObj.authUserId, channelObj.channelId + 1)).toStrictEqual(ERROR)
    });

    test('valid authUserId but not a part of the channel', () => {
        email = 'z4444444@ad.unsw.edu.au';
        password = 'yellowfeathers';
        nameFirst = 'Big';
        nameLast = 'Bird';
        
        let authUserObj2 = authRegisterV1(email, password, nameFirst, nameLast);

        let channelObj = channelsCreateV1(authUserObj2.authUserId,'COMP1531 Crunchie', false);
        expect(channelDetailsV1(authUserObj.authUserId, channelObj.channelId)).toStrictEqual(ERROR)
    });
  });

  test('valid authUserId is part of the channel', () => {
    let channelObj = channelsCreateV1(authUserObj.authUserId,'COMP1531 Crunchie', false);

    expect(channelDetailsV1(authUserObj.authUserId, channelObj.channelId)).toStrictEqual({
      channels: [
        {
          channelId: channelObj.channelId,
          isPublic: false,
          ownerMembers: [
            {
              uId: authUserObj.authUserId,
              email: 'z5555555@ad.unsw.edu.au',
              nameFirst: 'Snoopy',
              nameLast: 'the Dog',
              handleStr: 'snoopythedog'
            }
          ],
          allMembers: [
            {
              uId: authUserObj.authUserId,
              email: 'z5555555@ad.unsw.edu.au',
              nameFirst: 'Snoopy',
              nameLast: 'the Dog',
              handleStr: 'snoopythedog'
            }
          ],
        },
      ]
    });
  });

test('multiple valid authUserIds are a part of the channel', () => {
  let email2 = 'z4444444@ad.unsw.edu.au';
  let password2 = 'password';
  let nameFirst2 = 'Charlie';
  let nameLast2 = 'Brown';
  let authUserObj2 = authRegisterV1(email2, password2, nameFirst2, nameLast2);

  let channelObj = channelsCreateV1(authUserObj.authUserId,'COMP1531 Crunchie', false);

  channelJoinV1(authUserObj2.authUserId, channelObj.channelId);
    
  expect(channelDetailsV1(authUserObj.authUserId, channelObj.channelId)).toStrictEqual({
    channels: [
      {
        channelId: channelObj.channelId,
        isPublic: false,
        ownerMembersIds: [
          {
            uId: authUserObj.authUserId,
            email: 'z5555555@ad.unsw.edu.au',
            nameFirst: 'Snoopy',
            nameLast: 'the Dog',
            handleStr: 'snoopythedog'
          }
        ],
        allMembersIds: [
          {
            uId: authUserObj.authUserId,
            email: 'z5555555@ad.unsw.edu.au',
            nameFirst: 'Snoopy',
            nameLast: 'the Dog',
            handleStr: 'snoopythedog'
          },
          {
            uId: authUserObj2.authUserId,
            email: 'z4444444@ad.unsw.edu.au',
            nameFirst: 'Charlie',
            nameLast: 'Brown',
            handleStr: 'charliebrown'
          }
        ], 
      },
    ]
  });
});
