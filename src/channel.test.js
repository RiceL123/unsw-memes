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

  test('valid authUserId is part of the channel', () => {
    const channelObj = channelsCreateV1(authUserObj.authUserId,'COMP1531 Crunchie', false);

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

    const channelObj = channelsCreateV1(authUserObj.authUserId,'COMP1531 Crunchie', true);
    
    expect(channelJoinV1(authUserObj2.authUserId, channelObj.channelId)).toStrictEqual({});

    const channelDetailsObj = channelDetailsV1(authUserObj.authUserId, channelObj.channelId)
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
      allMembers: expect.any(Array), // array needs to account for any permutation
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
    expect(channelDetailsObj.allMembers.sort((a,b) => {a.uId - b.uId})).toStrictEqual(
      expectedArr.sort((a,b) => {a.uId - b.uId})
    );
  });
});