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
        nameFirst = 'Madhav';
        nameLast = 'Mishra';
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
        const nameFirst1 = 'Miguel';
        const nameLast1 = 'Guthridge';
        // Miguel user is not a global owner
        const authUserObj1 = authRegisterV1(email1, password1, nameFirst1, nameLast1);
        // Madhav user is a global owner and member of a public channel
        const channelObj = channelsCreateV1(authUserObj.authUserId, 'coolPublicChannel', true);
        // Miguel user joins Madhav's public channel
        channelJoinV1(authUserObj1.authUserId, channelObj.channelId)
        expect(channelJoinV1(authUserObj1.authUserId, channelObj.channelId)).toStrictEqual(ERROR);
    });

    test('private channel, user is not member or global owner', () => {
        const email1 = 'z5455555@ad.unsw.edu.au';
        const password1 = 'password';
        const nameFirst1 = 'Miguel';
        const nameLast1 = 'Guthridge';
        // Miguel user is not a global owner
        const authUserObj1 = authRegisterV1(email1, password1, nameFirst1, nameLast1);
        // Madhav user is a global owner and member of private channel
        const channelObj = channelsCreateV1(authUserObj.authUserId, 'coolprivatechannel', false);
        expect(channelJoinV1(authUserObj1.authUserId, channelObj.channelId)).toStrictEqual(ERROR);
    });

    // channelJoinV1 Valid Test
    test('joining a public channel', () => {
        const email1 = 'z5455555@ad.unsw.edu.au';
        const password1 = 'password';
        const nameFirst1 = 'Miguel';
        const nameLast1 = 'Guthridge';
        // Miguel user is not a global owner
        const authUserObj1 = authRegisterV1(email1, password1, nameFirst1, nameLast1);
        // Madhav user is a global owner and member of private channel
        const channelObj = channelsCreateV1(authUserObj.authUserId, 'coolprivatechannel', true);
        expect(channelJoinV1(authUserObj1.authUserId, channelObj.channelId)).toStrictEqual({});
    });

    test('joining a public channel', () => {
        const email1 = 'z5455555@ad.unsw.edu.au';
        const password1 = 'password';
        const nameFirst1 = 'Miguel';
        const nameLast1 = 'Guthridge';
        // Miguel is not a global owner but made a private channel
        const authUserObj1 = authRegisterV1(email1, password1, nameFirst1, nameLast1);
        const channelObj = channelsCreateV1(authUserObj1.authUserId, 'coolprivatechannel', false);
        // Madhav joins a private channel because he is a global owner
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
        nameFirst = 'Madhav';
        nameLast = 'Mishra';
        authUserObj = authRegisterV1(email, password, nameFirst, nameLast);

        email1 = 'z5455555@ad.unsw.edu.au';
        password1 = 'password';
        nameFirst1 = 'Madhav';
        nameLast1 = 'Mishra';
        authUserObj1 = authRegisterV1(email1, password1, nameFirst1, nameLast1);
    });

    test('invalid channelId', () => {
        expect(channelInviteV1(authUserObj.authUserId, 1, authUserObj1.authUserId)).toStrictEqual(ERROR);
    });
});