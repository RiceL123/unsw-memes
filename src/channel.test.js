import { clearV1 } from './other.js';
import { authLoginV1, authRegisterV1 } from './auth.js';
import { channelsCreateV1 } from './channels.js';
import { channelMessagesV1 } from './channel.js'
import { userProfileV1 } from './users.js';

const ERROR = { error: expect.any(String) };

let email, password, nameFirst, nameLast, authUserObj, channelName, channelObj;

beforeEach(() => {
  clearV1();

  email = 'z5555555@ad.unsw.edu.au';
  password = 'password';
  nameFirst = 'Madhav';
  nameLast = 'Mishra';
  authUserObj = authRegisterV1(email, password, nameFirst, nameLast);

  channelName = 'Coding'
  channelObj = channelsCreateV1(authUserObj.authUserId, channelName, true);
});

describe('channelMessagesV1', () => {
  test('invalid channelId, isPublic set to true', () => {
    let start = 0;

    expect(channelMessagesV1(authUserObj.authUserId, channelObj.channelId + 1, start)).toStrictEqual(ERROR);
  });


  test('invalid authUserId, isPublic set to true', () => {
    let start = 0;

    expect(channelMessagesV1(authUserObj.authUserId + 1, channelObj.channelId, start)).toStrictEqual(ERROR);
  });

  test('start is greater than total messages in channel', () => {
    let start = 50;

    let messageObj = channelMessagesV1(authUserObj.authUserId, channelObj.channelId, start);

    expect(messageObj).toStrictEqual(ERROR);
  });

  test('start is less than 0', () => {
    let start = -1;

    expect(channelMessagesV1(authUserObj.authUserId, channelObj.channelId, start)).toStrictEqual(ERROR);
  });


  test('valid channelId but authorised user is not a member', () => {
    const email2 = 'z1111111@ad.unsw.edu.au';
    const password2 = 'password';
    const nameFirst2 = 'Charmander';
    const nameLast2 = 'Pokemon';

    let authUserObj2 = authRegisterV1(email2, password2, nameFirst2, nameLast2);

    let start = 0;

    expect(channelMessagesV1(authUserObj2.authUserId, channelObj.channelId, start)).toStrictEqual(ERROR);
  });

  test('valid channelMessagesV1', () => {

    const start = 0;

    let messagesArray = channelMessagesV1(authUserObj.authUserId, channelObj.channelId, start);
    expect(messagesArray).toStrictEqual({
      messages: [],
      start: start,
      end: -1,
    });
  });

  test('multiple valid channelMessagesV1', () => {
    const email2 = 'z5555554@ad.unsw.edu.au';
    const password2 = 'password';
    const nameFirst2 = 'Madhav';
    const nameLast2 = 'Mishra';

    const email3 = 'z5555553@ad.unsw.edu.au';
    const password3 = 'password';
    const nameFirst3 = 'Madhav';
    const nameLast3 = 'Mishra';

    const authUserObj2 = authRegisterV1(email2, password2, nameFirst2, nameLast2);
    const authUserObj3 = authRegisterV1(email3, password3, nameFirst3, nameLast3);


    const channelName2 = 'Maths'
    const channelName3 = 'Commerce'

    const channelObj2 = channelsCreateV1(authUserObj2.authUserId, channelName2, true);
    const channelObj3 = channelsCreateV1(authUserObj3.authUserId, channelName3, true);


    let start = 0;

    let messagesArray = channelMessagesV1(authUserObj.authUserId, channelObj.channelId, start);
    expect(messagesArray).toStrictEqual({
      messages: [],
      start: start,
      end: -1,
    });

    let messagesArray2 = channelMessagesV1(authUserObj2.authUserId, channelObj2.channelId, start);
    expect(messagesArray2).toStrictEqual({
      messages: [],
      start: start,
      end: -1,
    });

    let messagesArray3 = channelMessagesV1(authUserObj3.authUserId, channelObj3.channelId, start);
    expect(messagesArray3).toStrictEqual({
      messages: [],
      start: start,
      end: -1,
    });

  });
});