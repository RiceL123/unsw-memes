import { channelInviteV1, channelJoinV1 } from './channel.js';
import { authRegisterV1 } from './auth.js';
import { clearV1 } from './other.js';
import { channelsCreateV1 } from './channels.js';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    clearV1();
});

describe('channelJoinV1', () => {
    //channelJoinV1 Error Tests
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

    test('private channel, user is not member or global owner', () => {
        const email1 = 'z5455555@ad.unsw.edu.au';
        const password1 = 'password';
        const nameFirst1 = 'Dr';
        const nameLast1 = 'Doofenshmirtz';
        // Dr user is not a global owner
        const authUserObj1 = authRegisterV1(email1, password1, nameFirst1, nameLast1);
        // Perry user is a global owner and member of a public channel
        const channelObj = channelsCreateV1(authUserObj.authUserId, 'coolPublicChannel', true);
        // Dr user joins Perry's public channel
        channelJoinV1(authUserObj1.authUserId, channelObj.channelId)
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
        expect(channelJoinV1(authUserObj.authUserId, channelObj.channelId)).toStrictEqual({});
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
    });

    // channelInviteV1 edgyPrivateChannel Valid Tests
    test('authUserId invites uId to public channel', () => {
        const channelObj = channelsCreateV1(authUserObj.authUserId, 'coolPublicChannel', false);
        expect(channelInviteV1(authUserObj.authUserId, channelObj.channelId, authUserObj1.authUserId)).toStrictEqual({});
    });
});