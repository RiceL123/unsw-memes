import { clear, search, authRegister, channelsCreate, channelJoin, messageSend, dmCreate, messageSendDm, channelInvite } from './routeRequests';

const VALID_MESSAGE = { messageId: expect.any(Number) };

interface React {
  reactId: number;
  uIds: number[];
  isThisUserReacted: boolean;
}

interface Message {
  messageId: number;
  uId: number;
  message: string;
  timeSent: number;
  reacts: React[];
  isPinned: boolean;
}
beforeEach(() => {
  clear();
});

describe('/search/v1', () => {
  test('Invalid token', () => {
    const Elon = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Elon', 'Musk');
    const Joe = authRegister('z4444444@ad.unsw.edu.au', 'password', 'Joe', 'Biden');
    const MinecraftServer = channelsCreate(Elon.token, 'Minecraft Server', true).channelId;
    expect(channelJoin(Joe.token, MinecraftServer)).toStrictEqual({});
    expect(messageSend(Joe.token, MinecraftServer, 'Hi Elon')).toStrictEqual(VALID_MESSAGE);
    expect(messageSend(Elon.token, MinecraftServer, 'Hi Joe')).toStrictEqual(VALID_MESSAGE);
    const JoeElonDm = dmCreate(Joe.token, [Elon.authUserId]).dmId;
    expect(messageSendDm(Joe.token, JoeElonDm, 'I dont like Trump')).toStrictEqual(VALID_MESSAGE);
    expect(search(Elon.token + 1, 'Hi')).toStrictEqual(403);
  });

  test('Invalid length of queryStr < 1', () => {
    const Elon = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Elon', 'Musk');
    const Joe = authRegister('z4444444@ad.unsw.edu.au', 'password', 'Joe', 'Biden');
    const MinecraftServer = channelsCreate(Elon.token, 'Minecraft Server', true).channelId;
    expect(channelJoin(Joe.token, MinecraftServer)).toStrictEqual({});
    expect(messageSend(Joe.token, MinecraftServer, 'Hi Elon')).toStrictEqual(VALID_MESSAGE);
    expect(messageSend(Elon.token, MinecraftServer, 'Hi Joe')).toStrictEqual(VALID_MESSAGE);
    const JoeElonDm = dmCreate(Joe.token, [Elon.authUserId]).dmId;
    expect(messageSendDm(Joe.token, JoeElonDm, 'I dont like Trump')).toStrictEqual(VALID_MESSAGE);
    expect(search(Elon.token, '')).toStrictEqual(400);
  });

  test('Invalid length of queryStr > 1000', () => {
    const Elon = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Elon', 'Musk');
    const Joe = authRegister('z4444444@ad.unsw.edu.au', 'password', 'Joe', 'Biden');
    const MinecraftServer = channelsCreate(Elon.token, 'Minecraft Server', true).channelId;
    expect(channelJoin(Joe.token, MinecraftServer)).toStrictEqual({});
    expect(messageSend(Joe.token, MinecraftServer, 'Hi Elon')).toStrictEqual(VALID_MESSAGE);
    expect(messageSend(Elon.token, MinecraftServer, 'Hi Joe')).toStrictEqual(VALID_MESSAGE);
    const JoeElonDm = dmCreate(Joe.token, [Elon.authUserId]).dmId;
    expect(messageSendDm(Joe.token, JoeElonDm, 'I dont like Trump')).toStrictEqual(VALID_MESSAGE);
    expect(search(Elon.token, 'a'.repeat(1001))).toStrictEqual(400);
  });

  test('Valid Search', () => {
    const Elon = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Elon', 'Musk');
    const Joe = authRegister('z4444444@ad.unsw.edu.au', 'password', 'Joe', 'Biden');
    const MinecraftServer = channelsCreate(Elon.token, 'Minecraft Server', true).channelId;
    expect(channelJoin(Joe.token, MinecraftServer)).toStrictEqual({});
    const message1 = messageSend(Joe.token, MinecraftServer, 'Hi Elon');
    const message2 = messageSend(Elon.token, MinecraftServer, 'Hi Joe');
    const JoeElonDm = dmCreate(Joe.token, [Elon.authUserId]).dmId;
    expect(messageSendDm(Joe.token, JoeElonDm, 'I dont like Trump')).toStrictEqual(VALID_MESSAGE);

    const expectMessages: Message[] = [
      {
        messageId: message2.messageId,
        uId: Elon.authUserId,
        message: 'Hi Joe',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
      {
        messageId: message1.messageId,
        uId: Joe.authUserId,
        message: 'Hi Elon',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      },
    ];

    const search1 = search(Elon.token, 'Hi')
    expect(search1).toStrictEqual({
      messages: expect.any(Array),
    });

    expect(search1.messages.sort((a: Message, b: Message) => a.messageId - b.messageId)).toStrictEqual(
      expectMessages.sort((a, b) => a.messageId - b.messageId)
    );

    expect(search(Joe.token, 'Trump')).toStrictEqual({
      messages: [
        {
          messageId: expect.any(Number),
          uId: Joe.authUserId,
          message: 'I dont like Trump',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ],
    });
  });

  test('valid search - channel not joined - only messages in dm returned', () => {
    const Elon = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Elon', 'Musk');
    const Joe = authRegister('z4444444@ad.unsw.edu.au', 'password', 'Joe', 'Biden');
    const MinecraftServer = channelsCreate(Elon.token, 'Minecraft Server', true).channelId;
    expect(messageSend(Elon.token, MinecraftServer, 'hellooo-TRUMP-ooooo')).toStrictEqual(VALID_MESSAGE);
    const dmServer = dmCreate(Elon.token, [Joe.authUserId]).dmId;
    const dmMessage = messageSendDm(Elon.token, dmServer, 'My favourite anime is a silent voice. Trump would agree');
    expect(dmMessage).toStrictEqual(VALID_MESSAGE);
    expect(search(Joe.token, 'tRuMp')).toStrictEqual({
      messages: [
        {
          messageId: dmMessage.messageId,
          uId: Elon.authUserId,
          message: 'My favourite anime is a silent voice. Trump would agree',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ]
    });
  });

  test('valid search - dm not joined - only messages in channel returned', () => {
    const Elon = authRegister('z5555555@ad.unsw.edu.au', 'password', 'Elon', 'Musk');
    const Joe = authRegister('z4444444@ad.unsw.edu.au', 'password', 'Joe', 'Biden');
    const dmServer = dmCreate(Elon.token, []).dmId;
    expect(messageSendDm(Elon.token, dmServer, 'hellooo-TRUMP-ooooo')).toStrictEqual(VALID_MESSAGE);
    const MinecraftServer = channelsCreate(Elon.token, 'Minecraft Server', true).channelId;
    expect(channelInvite(Elon.token, MinecraftServer, Joe.authUserId)).toStrictEqual({});
    const channelMessage = messageSend(Elon.token, MinecraftServer, 'My favourite anime is a silent voice. Trump would agree');
    expect(channelMessage).toStrictEqual(VALID_MESSAGE);
    expect(search(Joe.token, 'tRuMp')).toStrictEqual({
      messages: [
        {
          messageId: channelMessage.messageId,
          uId: Elon.authUserId,
          message: 'My favourite anime is a silent voice. Trump would agree',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        },
      ]
    });
  });
});
