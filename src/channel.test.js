import { clearV1 } from './other.js';
import { authLoginV1, authRegisterV1 } from './auth.js';
import { channelsCreateV1 } from './channels.js';
import { userProfileV1 } from './users.js';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    clearV1();
});

describe('channelMessagesV1', () => {
    test('invalid channelId, isPublic set to true', () => {
        const email = 'z5555555@ad.unsw.edu.au';
        const password = 'password';
        const nameFirst = 'Madhav';
        const nameLast = 'Mishra';

        let authUserObj = authRegisterV1(email, password, nameFirst, nameLast);

        const channelName = 'Coding'
        let channelObj = channelsCreateV1(authUserObj.authUserId, channelName, true);

        let start = 0;

        expect(channelMessagesV1(authUserObj.authUserId, channelObj.channelId + 1, start).toStrictEqual(ERROR));
    });

    test('invalid channelId, isPublic set to false', () => {
        const email = 'z5555555@ad.unsw.edu.au';
        const password = 'password';
        const nameFirst = 'Madhav';
        const nameLast = 'Mishra';

        let authUserObj = authRegisterV1(email, password, nameFirst, nameLast);

        const channelName = 'Coding'
        let channelObj = channelsCreateV1(authUserObj.authUserId, channelName, false);

        let start = 0;

        expect(channelMessagesV1(authUserObj.authUserId, channelObj.channelId + 1, start).toStrictEqual(ERROR));
    });

    test('invalid authUserId, isPublic set to true', () => {
        const email = 'z5555555@ad.unsw.edu.au';
        const password = 'password';
        const nameFirst = 'Madhav';
        const nameLast = 'Mishra';

        let authUserObj = authRegisterV1(email, password, nameFirst, nameLast);

        const channelName = 'Coding'
        let channelObj = channelsCreateV1(authUserObj.authUserId, channelName, true);

        let start = 0;

        expect(channelMessagesV1(authUserObj.authUserId + 1, channelObj.channelId, start).toStrictEqual(ERROR));
    });

    test('invalid authUserId, isPublic set to false', () => {
        const email = 'z5555555@ad.unsw.edu.au';
        const password = 'password';
        const nameFirst = 'Madhav';
        const nameLast = 'Mishra';

        let authUserObj = authRegisterV1(email, password, nameFirst, nameLast);

        const channelName = 'Coding'
        let channelObj = channelsCreateV1(authUserObj.authUserId, channelName, false);

        let start = 0;

        expect(channelMessagesV1(authUserObj.authUserId + 1, channelObj.channelId, start).toStrictEqual(ERROR));
    });

    test('start is greater than total messages in channel', () => {
        const email = 'z5555555@ad.unsw.edu.au';
        const password = 'password';
        const nameFirst = 'Madhav';
        const nameLast = 'Mishra';

        let authUserObj = authRegisterV1(email, password, nameFirst, nameLast);

        const channelName = 'Coding'
        let channelObj = channelsCreateV1(authUserObj.authUserId, channelName, true);

        let start = 50;

        let messageObj = channelMessagesV1(authUserObj.authUserId, channelObj.channelId, start);

        expect(messageObj).toStrictEqual(ERROR);
    });

    test('start is less than 0', () => {
        const email = 'z5555555@ad.unsw.edu.au';
        const password = 'password';
        const nameFirst = 'Madhav';
        const nameLast = 'Mishra';

        let authUserObj = authRegisterV1(email, password, nameFirst, nameLast);

        const channelName = 'Coding'
        let channelObj = channelsCreateV1(authUserObj.authUserId, channelName, true);

        let start = -1;

        expect(channelMessagesV1(authUserObj.authUserId, channelObj.channelId, start).toStrictEqual(ERROR));
    });


    test('valid channelId but authorised user is not a member', () => {
        const email = 'z5555555@ad.unsw.edu.au';
        const password = 'password';
        const nameFirst = 'Madhav';
        const nameLast = 'Mishra';

        let authUserObj = authRegisterV1(email, password, nameFirst, nameLast);

        const email2 = 'z1111111@ad.unsw.edu.au';
        const password2 = 'password';
        const nameFirst2 = 'Charmander';
        const nameLast2 = 'Pokemon';

        let authUserObj2 = authRegisterV1(email2, password2, nameFirst2, nameLast2);


        const channelName = 'Coding'
        let channelObj = channelsCreateV1(authUserObj.authUserId, channelName, true);

        let start = 0;

        expect(channelMessagesV1(authUserObj2.authUserId, channelObj.channelId + 1, start).toStrictEqual(ERROR));
    });

    test('valid channelMessagesV1', () => {
        const email = 'z5555555@ad.unsw.edu.au';
        const password = 'password';
        const nameFirst = 'Madhav';
        const nameLast = 'Mishra';

        let authUserObj = authRegisterV1(email, password, nameFirst, nameLast);

        const channelName = 'Coding'
        let channelObj = channelsCreateV1(authUserObj.authUserId, channelName, true);

        let start = 0;

        let messagesArray = channelMessagesV1(authUserObj.authUserId, channelObj.channelId, start);
        expect(messagesArray).toStrictEqual({
            messages: [],
            start: start,
            end: -1,
        });
    });

    test('multiple valid channelMessagesV1', () => {
        const email = 'z5555555@ad.unsw.edu.au';
        const password = 'password';
        const nameFirst = 'Madhav';
        const nameLast = 'Mishra';

        let authUserObj = authRegisterV1(email, password, nameFirst, nameLast);

        const channelName = 'Coding'
        let channelObj = channelsCreateV1(authUserObj.authUserId, channelName, true);

        let start = 0;

        let messagesArray = channelMessagesV1(authUserObj.authUserId, channelObj.channelId, start);
        expect(messagesArray).toStrictEqual({
            messages: [],
            start: start,
            end: -1,
        });

    });
});

