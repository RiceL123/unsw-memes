import request from 'sync-request';

import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;

const ERROR = { error: expect.any(String) };
const VALID_CHANNELS_CREATE = { channelId: expect.any(Number) };

interface channelObject {
  channelId: number
  name: string
}

beforeEach(() => {
  request(
    'DELETE',
    SERVER_URL + '/clear/v1'
  );
});

// HTTP TESTS FOR channelsCreateV2
describe('channelsCreateV2', () => {
  test('invalid token', () => {
    // registering a person
    const tokenRes = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Bob',
          nameLast: 'theBuilder',
        }
      }
    );

    const tokenData = JSON.parse(tokenRes.getBody() as string);
    const tokenId = tokenData.token;

    const res = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: tokenId + 1,
          name: 'study',
          isPublic: false,
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('invalid channel name.length < 1', () => {
    // registering a person
    const tokenRes = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Bob',
          nameLast: 'theBuilder',
        }
      }
    );

    const tokenData = JSON.parse(tokenRes.getBody() as string);
    const tokenId = tokenData.token;

    const res = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: tokenId,
          name: '',
          isPublic: false,
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('invalid channel name.length > 20', () => {
    // registering a person
    const tokenRes = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Bob',
          nameLast: 'theBuilder',
        }
      }
    );

    const tokenData = JSON.parse(tokenRes.getBody() as string);
    const tokenId = tokenData.token;

    const res = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: tokenId,
          name: 'thisnameistwentylongg',
          isPublic: false,
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('valid channel control', () => {
    // registering a person
    const tokenRes = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Bob',
          nameLast: 'theBuilder',
        }
      }
    );

    const tokenData = JSON.parse(tokenRes.getBody() as string);
    const tokenId = tokenData.token;

    const res = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: tokenId,
          name: 'charmanda',
          isPublic: false,
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(VALID_CHANNELS_CREATE);
  });

  test('valid channel name.length = 1', () => {
    // registering a person
    const tokenRes = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Bob',
          nameLast: 'theBuilder',
        }
      }
    );

    const tokenData = JSON.parse(tokenRes.getBody() as string);
    const tokenId = tokenData.token;

    const res = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: tokenId,
          name: 'a',
          isPublic: false,
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(VALID_CHANNELS_CREATE);
  });

  test('valid channel name.length = 20', () => {
    // registering a person
    const tokenRes = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Bob',
          nameLast: 'theBuilder',
        }
      }
    );

    const tokenData = JSON.parse(tokenRes.getBody() as string);
    const tokenId = tokenData.token;

    const res = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: tokenId,
          name: 'thisnameistwentylong',
          isPublic: false,
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(VALID_CHANNELS_CREATE);
  });

  test('valid channel public', () => {
    // registering a person
    const tokenRes = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Bob',
          nameLast: 'theBuilder',
        }
      }
    );

    const tokenData = JSON.parse(tokenRes.getBody() as string);
    const tokenId = tokenData.token;

    const res = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: tokenId,
          name: 'study',
          isPublic: true,
        }
      }
    );

    const channelData = JSON.parse(res.getBody() as string);
    const channelId = channelData.channelId;

    // registering another person
    const tokenRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5535555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Jeff',
          nameLast: 'theBuilder',
        }
      }
    );

    const tokenData2 = JSON.parse(tokenRes2.getBody() as string);
    const tokenId2 = tokenData2.token;

    const channelJoin = request(
      'POST',
      SERVER_URL + '/channel/join/v2',
      {
        json: {
          token: tokenId2,
          channelId: channelId,
        }
      }
    );

    const join = JSON.parse(channelJoin.getBody() as string);
    expect(join).not.toStrictEqual(ERROR);
  });

  test('valid channel private', () => {
    // registering a person
    const tokenRes = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Bob',
          nameLast: 'theBuilder',
        }
      }
    );

    const tokenData = JSON.parse(tokenRes.getBody() as string);
    const tokenId = tokenData.token;

    const res = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: tokenId,
          name: 'study',
          isPublic: false,
        }
      }
    );

    const channelData = JSON.parse(res.getBody() as string);
    const channelId = channelData.channelId;

    // registering another person
    const tokenRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5535555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Jeff',
          nameLast: 'theBuilder',
        }
      }
    );

    const tokenData2 = JSON.parse(tokenRes2.getBody() as string);
    const tokenId2 = tokenData2.token;

    const channelJoin = request(
      'POST',
      SERVER_URL + '/channel/join/v2',
      {
        json: {
          token: tokenId2,
          channelId: channelId,
        }
      }
    );

    // person 2 cannot join private channel, should output error
    const join = JSON.parse(channelJoin.getBody() as string);
    expect(join).toStrictEqual(ERROR);
  });

  test('user who created channel is a member', () => {
    // registering a person
    const tokenRes = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Bob',
          nameLast: 'theBuilder',
        }
      }
    );

    const tokenData = JSON.parse(tokenRes.getBody() as string);
    const tokenId = tokenData.token;

    const res = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: tokenId,
          name: 'study',
          isPublic: false,
        }
      }
    );

    const channelData = JSON.parse(res.getBody() as string);
    const channelId = channelData.channelId;

    const channelJoin = request(
      'GET',
      SERVER_URL + '/channel/Details/v2',
      {
        qs: {
          token: tokenId,
          channelId: channelId,
        },
      }
    );

    const join = JSON.parse(channelJoin.getBody() as string);
    expect(join).not.toStrictEqual(ERROR);
  });

  test('multiple valid channels', () => {
    // registering a person
    const tokenRes = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Bob',
          nameLast: 'theBuilder',
        }
      }
    );

    const tokenData = JSON.parse(tokenRes.getBody() as string);
    const tokenId = tokenData.token;

    const res = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: tokenId,
          name: 'study',
          isPublic: true,
        }
      }
    );

    const channelData = JSON.parse(res.getBody() as string);
    const channelId = channelData.channelId;

    // registering another person
    const tokenRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5535555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Jeff',
          nameLast: 'theBuilder',
        }
      }
    );

    const tokenData2 = JSON.parse(tokenRes2.getBody() as string);
    const tokenId2 = tokenData2.token;

    const res2 = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: tokenId2,
          name: 'study2',
          isPublic: true,
        }
      }
    );

    const channelData2 = JSON.parse(res2.getBody() as string);
    const channelId2 = channelData2.channelId;

    expect(channelId2).not.toStrictEqual(channelId);
  });
});

// TESTS FOR CHANNELSLISTV2
describe('channelsListV2', () => {
  test('invalid authUserId', () => {
    // registering a person
    const tokenRes = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Bob',
          nameLast: 'theBuilder',
        }
      }
    );

    const tokenData = JSON.parse(tokenRes.getBody() as string);
    const tokenId = tokenData.token;

    const res = request(
      'GET',
      SERVER_URL + '/channels/list/v2',
      {
        qs: {
          token: tokenId + 1,
        },
      }
    );
    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('valid channel control', () => {
    // registering a person
    const tokenRes = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Bob',
          nameLast: 'theBuilder',
        }
      }
    );

    const tokenData = JSON.parse(tokenRes.getBody() as string);
    const tokenId = tokenData.token;

    const res = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: tokenId,
          name: 'COMP1531 Crunchie',
          isPublic: false,
        }
      }
    );

    const channelData = JSON.parse(res.getBody() as string);
    const channelId = channelData.channelId;

    const channelsArr = [
      {
        channelId: channelId,
        name: 'COMP1531 Crunchie',
      },
    ];

    const listRes = request(
      'GET',
      SERVER_URL + '/channels/list/v2',
      {
        qs: {
          token: tokenId,
        },
      }
    );

    const data = JSON.parse(listRes.getBody() as string);
    expect(data).toStrictEqual({
      channels: channelsArr
    });
  });

  test('individual in multiple channels', () => {
    // registering a person
    const tokenRes = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Bob',
          nameLast: 'theBuilder',
        }
      }
    );

    const tokenData = JSON.parse(tokenRes.getBody() as string);
    const tokenId = tokenData.token;

    const res = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: tokenId,
          name: 'COMP1531 Crunchie',
          isPublic: false,
        }
      }
    );

    const channelData = JSON.parse(res.getBody() as string);
    const channelId = channelData.channelId;

    const res2 = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: tokenId,
          name: 'Study Room',
          isPublic: true,
        }
      }
    );

    const channelData2 = JSON.parse(res2.getBody() as string);
    const channelId2 = channelData2.channelId;

    const channelsArr = [
      {
        channelId: channelId,
        name: 'COMP1531 Crunchie',
      },
      {
        channelId: channelId2,
        name: 'Study Room',
      }
    ];

    const listRes = request(
      'GET',
      SERVER_URL + '/channels/list/v2',
      {
        qs: {
          token: tokenId,
        },
      }
    );

    const listData = JSON.parse(listRes.getBody() as string);

    // sorting in test accounts for multiple permutations in the channelsArr so the test is blackbox.
    expect(listData.channels.sort((a: channelObject, b: channelObject) => a.channelId - b.channelId)).toStrictEqual(
      channelsArr.sort((a, b) => a.channelId - b.channelId)
    );
  });

  test('individual creates a channel, gets added to another', () => {
    // registering a person
    const tokenRes = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Bob',
          nameLast: 'theBuilder',
        }
      }
    );

    const tokenData = JSON.parse(tokenRes.getBody() as string);
    const tokenId = tokenData.token;
    const uId = tokenData.authUserId;

    // registering another person
    const tokenRes2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555355@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Tim',
          nameLast: 'theBuilder',
        }
      }
    );

    const tokenData2 = JSON.parse(tokenRes2.getBody() as string);
    const tokenId2 = tokenData2.token;

    const channelRes1 = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: tokenId,
          name: 'COMP1531 Crunchie',
          isPublic: false,
        }
      }
    );

    const channelData = JSON.parse(channelRes1.getBody() as string);
    const channelId = channelData.channelId;

    const channelRes2 = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: tokenId2,
          name: 'Study Room',
          isPublic: true,
        }
      }
    );

    const channelData2 = JSON.parse(channelRes2.getBody() as string);
    const channelId2 = channelData2.channelId;

    const channelInv = request(
      'POST',
      SERVER_URL + '/channel/invite/v2',
      {
        json: {
          token: tokenId2,
          channelId: channelId2,
          uId: uId,
        }
      }
    );

    const inviteData = JSON.parse(channelInv.getBody() as string);
    expect(inviteData).toStrictEqual({});

    // AuthUserId should be part of both channels now.
    const channelsArr = [
      {
        channelId: channelId,
        name: 'COMP1531 Crunchie',
      },
      {
        channelId: channelId2,
        name: 'Study Room',
      }
    ];

    const listRes = request(
      'GET',
      SERVER_URL + '/channels/list/v2',
      {
        qs: {
          token: tokenId,
        },
      }
    );

    const listData = JSON.parse(listRes.getBody() as string);

    // sorting in test accounts for multiple permutations in the channelsArr so the test is blackbox.
    expect(listData.channels.sort((a: any, b: any) => a.channelId - b.channelId)).toStrictEqual(
      channelsArr.sort((a, b) => a.channelId - b.channelId)
    );
  });
});

// TESTS FOR channelsListAllV2
describe('channelsListAllV2', () => {
  let tokenId = '';
  beforeEach(() => {
    // registering a person
    const tokenRes = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
        }
      }
    );

    const tokenData = JSON.parse(tokenRes.getBody() as string);
    tokenId = tokenData.token;
  });

  test('token is invalid', () => {
    const res = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: tokenId,
          name: 'COMP1531 Crunchie',
          isPublic: false,
        }
      }
    );

    const channelData = JSON.parse(res.getBody() as string);
    const channelId = channelData.channelId;
    expect(channelId).toStrictEqual(expect.any(Number));

    const listRes = request(
      'GET',
      SERVER_URL + '/channels/listall/v2',
      {
        qs: {
          token: tokenId + 1,
        },
      }
    );

    const listData = JSON.parse(listRes.getBody() as string);
    expect(listData).toStrictEqual(ERROR);
  });

  test('authUserId is valid and in one channel', () => {
    const res = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: tokenId,
          name: 'COMP1531 Crunchie',
          isPublic: false,
        }
      }
    );

    const channelData = JSON.parse(res.getBody() as string);
    const channelId = channelData.channelId;
    expect(channelId).toStrictEqual(expect.any(Number));

    const listRes = request(
      'GET',
      SERVER_URL + '/channels/listall/v2',
      {
        qs: {
          token: tokenId,
        },
      }
    );

    const listData = JSON.parse(listRes.getBody() as string);
    expect(listData).toStrictEqual({
      channels: [
        {
          channelId: channelId,
          name: 'COMP1531 Crunchie',
        }
      ]
    });
  });

  test('user is part of multiple channels', () => {
    const res = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: tokenId,
          name: 'COMP1531 Crunchie',
          isPublic: false,
        }
      }
    );

    const channelData = JSON.parse(res.getBody() as string);
    const channelId = channelData.channelId;
    expect(channelId).toStrictEqual(expect.any(Number));

    const res2 = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: tokenId,
          name: 'COMP1531 General',
          isPublic: true,
        }
      }
    );

    const channelData2 = JSON.parse(res2.getBody() as string);
    const channelId2 = channelData2.channelId;
    expect(channelId2).toStrictEqual(expect.any(Number));

    const listRes = request(
      'GET',
      SERVER_URL + '/channels/listall/v2',
      {
        qs: {
          token: tokenId,
        },
      }
    );

    const listData = JSON.parse(listRes.getBody() as string);

    expect(listData).toStrictEqual({ channels: expect.any(Array) });
    const expectedArr = [
      {
        channelId: channelId,
        name: 'COMP1531 Crunchie',
      },
      {
        channelId: channelId2,
        name: 'COMP1531 General',
      }
    ];

    // sorting to account for any permuation of the allChannels array
    expect(listData.channels.sort((a: channelObject, b: channelObject) => a.channelId - b.channelId)).toStrictEqual(
      expectedArr.sort((a, b) => a.channelId - b.channelId)
    );
  });

  test('user is part of multiple channels', () => {
    const res = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: tokenId,
          name: 'COMP1531 Crunchie',
          isPublic: false,
        }
      }
    );

    const channelData = JSON.parse(res.getBody() as string);
    const channelId = channelData.channelId;
    expect(channelId).toStrictEqual(expect.any(Number));

    const res2 = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: tokenId,
          name: 'COMP1531 General',
          isPublic: true,
        }
      }
    );

    const channelData2 = JSON.parse(res2.getBody() as string);
    const channelId2 = channelData2.channelId;
    expect(channelId2).toStrictEqual(expect.any(Number));

    const res3 = request(
      'POST',
      SERVER_URL + '/channels/create/v2',
      {
        json: {
          token: tokenId,
          name: 'study room',
          isPublic: true,
        }
      }
    );

    const channelData3 = JSON.parse(res3.getBody() as string);
    const channelId3 = channelData3.channelId;
    expect(channelId3).toStrictEqual(expect.any(Number));

    const listRes = request(
      'GET',
      SERVER_URL + '/channels/listall/v2',
      {
        qs: {
          token: tokenId,
        },
      }
    );

    const listData = JSON.parse(listRes.getBody() as string);

    expect(listData).toStrictEqual({ channels: expect.any(Array) });
    const expectedArr = [
      {
        channelId: channelId,
        name: 'COMP1531 Crunchie',
      },
      {
        channelId: channelId2,
        name: 'COMP1531 General',
      },
      {
        channelId: channelId3,
        name: 'study room',
      }
    ];
    // sorting to account for any permuation of the allChannels array
    expect(listData.channels.sort((a: channelObject, b: channelObject) => a.channelId - b.channelId)).toStrictEqual(
      expectedArr.sort((a, b) => a.channelId - b.channelId)
    );
  });
});
