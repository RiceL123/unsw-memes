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
        nameFirst = 'Madhav';
        nameLast = 'Mishra';
        
        authUserObj = authRegisterV1(email, password, nameFirst, nameLast);
    });
    // test if authuserid exists
    test('authUserId is invalid', () => {
        const channelObj = channelsCreateV1(authUserObj.authUserId + 1,'COMP1531 Crunchie', false);
        channelJoinV1(authUserObj.authUserId + 1, channelObj.channelId);
        expect(channelDetailsV1(authUserObj.authUserId + 1)).toStrictEqual(ERROR)
    });

    // test if channelid exists
    test('channelId is invalid', () => {
        const channelObj = channelsCreateV1(authUserObj.authUserId,'COMP1531 Crunchie', false);
        channelJoinV1(authUserObj.authUserId, channelObj.channelId + 1);
        expect(channelDetailsV1(authUserObj.authUserId + 1)).toStrictEqual(ERROR)
    });

    // test when user is not part of channel
    test('valid authUserId but not a part of the channel', () => {
        email = 'z5333333@ad.unsw.edu.au';
        password = 'yellowfeathers';
        nameFirst = 'Big';
        nameLast = 'Bird';
        
        authUserObj2 = authRegisterV1(email, password, nameFirst, nameLast);

        const channelObj = channelsCreateV1(authUserObj2.authUserId,'COMP1531 Crunchie', false);
        expect(channelDetailsV1(authUserObj.authUserId)).toStrictEqual(ERROR)
    });

    // test when one user is part of channel 
    test('valid authUserId is part of the channel', () => {
        const channelObj = channelsCreateV1(authUserObj.authUserId,'COMP1531 Crunchie', false);

        channelJoinV1(authUserObj.authUserId, channelObj.channelId);

        expect(channelDetailsV1(authUserObj.authUserId)).toStrictEqual({
            channels: [
                {
                    channelId: channelObj.channelId,
                    isPublic: false,
                    ownerMembersIds: [authUserObj.authUserId],
                    allMembersIds: [authUserObj.authUserId],
                    
                },
            ]
        })
    })

    test('multiple valid authUserIds are a part of the channel', () => {
        const email = 'z5555555@ad.unsw.edu.au';
        const password = 'password';
        const nameFirst = 'Bob';
        const nameLast = 'theBuilder';
        const authUserObj2 = authRegisterV1(email, password, nameFirst, nameLast);
    
        const channelObj = channelsCreateV1(authUserObj.authUserId,'COMP1531 Crunchie', false);

        channelJoinV1(authUserObj.authUserId, channelObj.channelId);
        channelJoinV1(authUserObj2.authUserId, channelObj.channelId);

        expect(channelDetailsV1(authUserObj.authUserId)).toStrictEqual({
            channels: [
                {
                    channelId: channelObj.channelId,
                    isPublic: false,
                    ownerMembersIds: [authUserObj.authUserId],
                    allMembersIds: [authUserObj.authUserId, authUserObj2.authUserId],
                    
                },
            ]
        })
    })
});