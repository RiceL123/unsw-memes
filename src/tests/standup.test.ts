import { clear, authRegister, standupActive, standupStart, standupSend, channelMessages, channelsCreate, channelJoin } from './routeRequests';
const EXPECTED_TIME_ERROR_MARGIN = 1;

beforeEach(() => {
  clear();
});

function sleep(ms: number) {
  const start = Date.now();
  while (Date.now() - start < ms);
}

describe('standup/start/v1', () => {
  let userToken: string;
  let userId: number;
  let chanId: number;
  beforeEach(() => {
    const userData = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    userToken = userData.token;
    userId = userData.authUserId;
    chanId = channelsCreate(userToken, 'Coding', true).channelId;
  });

  test('invalid channelId', () => {
    const standupData = standupStart(userToken, chanId + 1, 1);
    expect(standupData).toStrictEqual(400);
  });

  test('invalid length', () => {
    const standupData = standupStart(userToken, chanId, -2);
    expect(standupData).toStrictEqual(400);
  });

  test('standup already active', () => {
    const standupData = standupStart(userToken, chanId, 1);
    const currTime = Math.floor(Date.now() / 1000);
    const standupTimeFinish = currTime + 3000;
    expect(standupData.timeFinish).toBeLessThanOrEqual(standupTimeFinish + EXPECTED_TIME_ERROR_MARGIN);

    const standupData2 = standupStart(userToken, chanId, 1);
    expect(standupData2).toStrictEqual(400);
    sleep(2000);
  });

  test('invalid token', () => {
    const standupData = standupStart(userToken + 1, chanId, 1);
    expect(standupData).toStrictEqual(403);
  });

  test('valid channelId but authorised user is not a member', () => {
    const userData2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon');
    const standupData = standupStart(userData2.token, chanId, 3);
    expect(standupData).toStrictEqual(403);
  });

  test('sending one message into standup', () => {
    const standupData = standupStart(userToken, chanId, 1);
    const currTime = Math.floor(Date.now() / 1000);
    const standupTimeFinish = currTime + 3000;
    expect(standupData.timeFinish).toBeLessThanOrEqual(standupTimeFinish + EXPECTED_TIME_ERROR_MARGIN);

    const sendData = standupSend(userToken, chanId, 'my update is im doing well');
    expect(sendData).toStrictEqual({});

    sleep(1000);

    const messagesData = channelMessages(userToken, chanId, 0);
    expect(messagesData).toStrictEqual({
      messages: [
        {
          isPinned: false,
          messageId: expect.any(Number),
          uId: userId,
          message: 'madhavmishra: my update is im doing well',
          timeSent: expect.any(Number),
          reacts: [],
        }
      ],
      start: 0,
      end: -1,
    });
  });

  test('sending two message into standup same user', () => {
    const standupData = standupStart(userToken, chanId, 1);
    const currTime = Math.floor(Date.now() / 1000);
    const standupTimeFinish = currTime + 3000;
    expect(standupData.timeFinish).toBeLessThanOrEqual(standupTimeFinish + EXPECTED_TIME_ERROR_MARGIN);

    const sendData = standupSend(userToken, chanId, 'my update is im doing well');
    expect(sendData).toStrictEqual({});

    const sendData2 = standupSend(userToken, chanId, 'my update is im doing good');
    expect(sendData2).toStrictEqual({});

    sleep(1000);

    const messagesData = channelMessages(userToken, chanId, 0);
    expect(messagesData).toStrictEqual({
      messages: [
        {
          isPinned: false,
          messageId: expect.any(Number),
          uId: userId,
          message: 'madhavmishra: my update is im doing well\nmadhavmishra: my update is im doing good',
          timeSent: expect.any(Number),
          reacts: [],
        }
      ],
      start: 0,
      end: -1,
    });
  });

  test('working case four messages sent', () => {
    const userData2 = authRegister('z5535555@ad.unsw.edu.au', 'password', 'pat', 'bat');
    const userToken2 = userData2.token;
    channelJoin(userToken2, chanId);

    const userData3 = authRegister('z5555554@ad.unsw.edu.au', 'password', 'pat', 'rat');
    const userToken3 = userData3.token;
    channelJoin(userToken3, chanId);

    const userData4 = authRegister('z5555535@ad.unsw.edu.au', 'password', 'pat', 'cat');
    const userToken4 = userData4.token;
    channelJoin(userToken4, chanId);

    // start standup
    const startData = standupStart(userToken, chanId, 1);
    expect(startData).toStrictEqual({ timeFinish: expect.any(Number) });

    // send four messages into standup
    const message1 = standupSend(userToken, chanId, 'I ate a catfish');
    expect(message1).toStrictEqual({});

    const message2 = standupSend(userToken2, chanId, 'I went to Kmart');
    expect(message2).toStrictEqual({});

    const message3 = standupSend(userToken3, chanId, 'I ate a toaster');
    expect(message3).toStrictEqual({});

    const message4 = standupSend(userToken4, chanId, 'my catfish ate a Kmart toaster');
    expect(message4).toStrictEqual({});

    const messagePackage = 'madhavmishra: I ate a catfish\npatbat: I went to Kmart\npatrat: I ate a toaster\npatcat: my catfish ate a Kmart toaster';

    sleep(1000);

    const messageData = channelMessages(userToken, chanId, 0);
    expect(messageData).toStrictEqual({
      messages: [
        {
          isPinned: false,
          messageId: expect.any(Number),
          uId: userId,
          message: messagePackage,
          timeSent: expect.any(Number),
          reacts: [],
        }
      ],
      start: 0,
      end: -1,
    });
  });

  test('working case one message sent by owner', () => {
    // start standup
    const startData = standupStart(userToken, chanId, 1);
    expect(startData).toStrictEqual({ timeFinish: expect.any(Number) });

    // send messages into standup
    const message1 = standupSend(userToken, chanId, 'I ate a catfish');
    expect(message1).toStrictEqual({});

    const messagePackage = 'madhavmishra: I ate a catfish';

    sleep(1000);

    const messageData = channelMessages(userToken, chanId, 0);
    expect(messageData).toStrictEqual({
      messages: [
        {
          isPinned: false,
          messageId: expect.any(Number),
          uId: userId,
          message: messagePackage,
          timeSent: expect.any(Number),
          reacts: [],
        }
      ],
      start: 0,
      end: -1,
    });
  });

  test('working case one message sent by non owner', () => {
    const userData2 = authRegister('z5395555@ad.unsw.edu.au', 'password', 'pat', 'bat');
    const userToken2 = userData2.token;
    channelJoin(userToken2, chanId);

    // start standup
    const currTime = Math.floor(Date.now() / 1000);
    const startData = standupStart(userToken, chanId, 1);
    const standupTimeFinish = currTime + 3000;
    expect(startData.timeFinish).toBeLessThanOrEqual(standupTimeFinish + EXPECTED_TIME_ERROR_MARGIN);

    // send messages into standup
    const message1 = standupSend(userToken2, chanId, 'I ate a catfish');
    expect(message1).toStrictEqual({});

    const messagePackage = 'patbat: I ate a catfish';

    sleep(1000);

    const messageData = channelMessages(userToken, chanId, 0);
    expect(messageData).toStrictEqual({
      messages: [
        {
          isPinned: false,
          messageId: expect.any(Number),
          uId: userId,
          message: messagePackage,
          timeSent: expect.any(Number),
          reacts: [],
        }
      ],
      start: 0,
      end: -1,
    });
  });

  test('0 messages sent in standup', () => {
    // start standup
    const currTime = Math.floor(Date.now() / 1000);
    const startData = standupStart(userToken, chanId, 1);
    const standupTimeFinish = currTime + 3000;
    expect(startData.timeFinish).toBeLessThanOrEqual(standupTimeFinish + EXPECTED_TIME_ERROR_MARGIN);

    sleep(1000);

    const messageData = channelMessages(userToken, chanId, 0);
    expect(messageData).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('trying to send message after standup has closed', () => {
    // start standup
    const currTime = Math.floor(Date.now() / 1000);
    const startData = standupStart(userToken, chanId, 1);
    const standupTimeFinish = currTime + 3000;
    expect(startData.timeFinish).toBeLessThanOrEqual(standupTimeFinish + EXPECTED_TIME_ERROR_MARGIN);

    sleep(1000);

    const message1 = standupSend(userToken, chanId, 'I ate a catfish');
    expect(message1).toStrictEqual(400);

    const messageData = channelMessages(userToken, chanId, 0);
    expect(messageData).toStrictEqual({
      messages: [],
      start: 0,
      end: -1,
    });
  });

  test('send one message, standup finishes and tries send another', () => {
    const userData2 = authRegister('z5255555@ad.unsw.edu.au', 'password', 'pat', 'bat');
    const userToken2 = userData2.token;
    channelJoin(userToken2, chanId);
    // start standup
    const currTime = Math.floor(Date.now() / 1000);
    const startData = standupStart(userToken, chanId, 1);
    const standupTimeFinish = currTime + 3000;
    expect(startData.timeFinish).toBeLessThanOrEqual(standupTimeFinish + EXPECTED_TIME_ERROR_MARGIN);

    // send message into standup
    const message1 = standupSend(userToken, chanId, 'I ate a catfish');
    expect(message1).toStrictEqual({});

    sleep(1000);
    const message2 = standupSend(userToken2, chanId, 'I ate a chicken');
    expect(message2).toStrictEqual(400);

    const messageData = channelMessages(userToken, chanId, 0);
    expect(messageData).toStrictEqual({
      messages: [
        {
          isPinned: false,
          messageId: expect.any(Number),
          uId: userId,
          message: 'madhavmishra: I ate a catfish',
          timeSent: expect.any(Number),
          reacts: [],
        }
      ],
      start: 0,
      end: -1,
    });
  });
});

describe('standup/active/v1', () => {
  let userToken: string;
  let userId: number;
  let chanId: number;
  beforeEach(() => {
    const userData = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    userToken = userData.token;
    userId = userData.authUserId;
    chanId = channelsCreate(userToken, 'Coding', true).channelId;
  });

  test('invalid token', () => {
    const standupData = standupActive(userToken + 1, chanId);
    expect(standupData).toStrictEqual(403);
  });

  test('invalid channelId', () => {
    const standupData = standupActive(userToken, chanId + 1);
    expect(standupData).toStrictEqual(400);
  });

  test('no standup is active', () => {
    const standupData = standupActive(userToken, chanId);
    expect(standupData).toStrictEqual({
      isActive: false,
      timeFinish: null,
    });
  });

  test('valid channelId but authorised user is not a member', () => {
    const userToken2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon').token;
    standupStart(userToken, chanId, 1);
    const activeData = standupActive(userToken2, chanId);
    expect(activeData).toStrictEqual(403);
  });

  test('working case standup is active', () => {
    const userData2 = authRegister('z5528555@ad.unsw.edu.au', 'password', 'pat', 'bat');
    const userToken2 = userData2.token;
    channelJoin(userToken2, chanId);

    // start standup
    const startData = standupStart(userToken, chanId, 1);
    const currTime = Math.floor(Date.now() / 1000);
    const standupTimeFinish = currTime + 3000;
    expect(startData.timeFinish).toBeLessThanOrEqual(standupTimeFinish + EXPECTED_TIME_ERROR_MARGIN);

    // send four messages into standup
    const message1 = standupSend(userToken, chanId, 'I ate a catfish');
    expect(message1).toStrictEqual({});

    const message2 = standupSend(userToken2, chanId, 'I went to Kmart');
    expect(message2).toStrictEqual({});

    const messagePackage = 'madhavmishra: I ate a catfish\npatbat: I went to Kmart';

    const activeData = standupActive(userToken, chanId);
    expect(activeData).toStrictEqual({
      isActive: true,
      timeFinish: expect.any(Number),
    });

    sleep(2000);

    const messageData = channelMessages(userToken, chanId, 0);
    expect(messageData).toStrictEqual({
      messages: [
        {
          isPinned: false,
          messageId: expect.any(Number),
          uId: userId,
          message: messagePackage,
          timeSent: expect.any(Number),
          reacts: [],
        }
      ],
      start: 0,
      end: -1,
    });
  });

  test('working case standup is not active', () => {
    const userData2 = authRegister('z5552525@ad.unsw.edu.au', 'password', 'pat', 'bat');
    const userToken2 = userData2.token;
    channelJoin(userToken2, chanId);

    // start standup
    const currTime = Math.floor(Date.now() / 1000);
    const startData = standupStart(userToken, chanId, 1);
    const standupTimeFinish = currTime + 3000;
    expect(startData.timeFinish).toBeLessThanOrEqual(standupTimeFinish + EXPECTED_TIME_ERROR_MARGIN);

    // send two messages into standup
    const message1 = standupSend(userToken, chanId, 'I ate a catfish');
    expect(message1).toStrictEqual({});

    const message2 = standupSend(userToken2, chanId, 'I went to Kmart');
    expect(message2).toStrictEqual({});

    const messagePackage = 'madhavmishra: I ate a catfish\npatbat: I went to Kmart';

    const activeData = standupActive(userToken, chanId);
    expect(activeData).toStrictEqual({
      isActive: true,
      timeFinish: expect.any(Number),
    });

    sleep(2000);

    const messageData = channelMessages(userToken, chanId, 0);
    expect(messageData).toStrictEqual({
      messages: [
        {
          isPinned: false,
          messageId: expect.any(Number),
          uId: userId,
          message: messagePackage,
          timeSent: expect.any(Number),
          reacts: [],
        }
      ],
      start: 0,
      end: -1,
    });

    const activeData2 = standupActive(userToken, chanId);
    expect(activeData2).toStrictEqual({
      isActive: false,
      timeFinish: null,
    });
  });
});

describe('standup/send/v1', () => {
  let userToken: string;
  // let userId: number;
  let chanId: number;
  beforeEach(() => {
    const userData = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Madhav', 'Mishra');
    userToken = userData.token;
    // userId = userData.authUserId;
    chanId = channelsCreate(userToken, 'Coding', true).channelId;
  });

  test('invalid channelId', () => {
    const currTime = Math.floor(Date.now() / 1000);
    const startData = standupStart(userToken, chanId, 1);
    const standupTimeFinish = currTime + 3000;
    expect(startData.timeFinish).toBeLessThanOrEqual(standupTimeFinish + EXPECTED_TIME_ERROR_MARGIN);
    sleep(1000);
    const standupSendData = standupSend(userToken, chanId + 1, 'yo slimes');
    expect(standupSendData).toStrictEqual(400);
  });

  test('invalid length', () => {
    const currTime = Math.floor(Date.now() / 1000);
    const startData = standupStart(userToken, chanId, 1);
    const standupTimeFinish = currTime + 3000;
    expect(startData.timeFinish).toBeLessThanOrEqual(standupTimeFinish + EXPECTED_TIME_ERROR_MARGIN);
    sleep(1000);
    const messageLong = Array(1001).fill(undefined).map(() => Math.random().toString(36)[2]).join('');
    const standupSendData = standupSend(userToken, chanId, messageLong);
    expect(standupSendData).toStrictEqual(400);
  });

  test('standup not active', () => {
    const standupSendData = standupSend(userToken, chanId, 'yo wassup');
    expect(standupSendData).toStrictEqual(400);
  });

  test('invalid token', () => {
    const currTime = Math.floor(Date.now() / 1000);
    const startData = standupStart(userToken, chanId, 1);
    const standupTimeFinish = currTime + 3000;
    expect(startData.timeFinish).toBeLessThanOrEqual(standupTimeFinish + EXPECTED_TIME_ERROR_MARGIN);
    sleep(1000);
    const standupSendData = standupSend(userToken + 1, chanId, 'yo wassup');
    expect(standupSendData).toStrictEqual(403);
  });

  test('valid channelId but authorised user is not a member', () => {
    const userToken2 = authRegister('z1111111@ad.unsw.edu.au', 'password', 'Charmander', 'Pokemon').token;
    const currTime = Math.floor(Date.now() / 1000);
    const startData = standupStart(userToken, chanId, 1);
    const standupTimeFinish = currTime + 3000;
    expect(startData.timeFinish).toBeLessThanOrEqual(standupTimeFinish + EXPECTED_TIME_ERROR_MARGIN);
    const standupSendData = standupSend(userToken2, chanId, 'yo wassup');
    expect(standupSendData).toStrictEqual(403);
    sleep(1000);
  });
});
