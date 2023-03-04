import { clearV1 } from './other.js';
import { channelsCreateV1} from './channels.js';
import { authRegisterV1 } from './auth.js';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    clearV1();
});

describe('channelsCreateV1', () => {
  test('returning correct channel id', () => {
    // creating user
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password1';
    const nameFirst = 'Madhav';
    const nameLast = 'Mishra';

    const authUserId = authRegisterV1(email, password, nameFirst, nameLast);
    const name = 'channelOne';
    const isPublic = 'true';
    expect(channelsCreateV1(authUserId, name, isPublic)).toStrictEqual({ channelId: expect.any(Number) });
  });

  test('public permissions', () => {


    
  });
})

// possible tests
// public or private
// user who created is part of the channel
// error if wrong parameters
// return error if length of name is less than 1 or more than 20 char
// authID is invalid
// error messages