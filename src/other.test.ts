import request from 'sync-request';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

const ERROR = { error: expect.any(String) };

describe('/clear/v1', () => {
  test('correct return value', () => {
    const res = request(
      'DELETE',
      SERVER_URL + '/clear/v1'
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual({});
  });

  test('correctly clears dataStore', () => {
    const email = 'z5555555@ad.unsw.edu.au';
    const password = 'password';
    const nameFirst = 'nameFirst';
    const nameLast = 'Mishra';

    const res1 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast
        }
      }
    );
    // successfully adding user to the dataStore
    const data1 = JSON.parse(res1.getBody() as string);
    expect(data1).not.toStrictEqual(ERROR);

    const res2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast
        }
      }
    );

    // unable to register the same user twice
    const data2 = JSON.parse(res2.getBody() as string);
    expect(data2).toStrictEqual(ERROR);

    const res3 = request(
      'DELETE',
      SERVER_URL + '/clear/v1'
    );

    const data3 = JSON.parse(res3.getBody() as string);
    expect(data3).toStrictEqual({});

    // now data is cleared, same user can be registered once more
    const res4 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: email,
          password: password,
          nameFirst: nameFirst,
          nameLast: nameLast
        }
      }
    );

    const data4 = JSON.parse(res4.getBody() as string);
    expect(data4).not.toStrictEqual(ERROR);
  });
});
