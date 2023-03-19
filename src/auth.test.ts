import request from 'sync-request';

import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

const ERROR = { error: expect.any(String) };
const VALID_AUTH_REGISTER = { token: expect.any(String), authUserId: expect.any(Number) };

beforeEach(() => {
  request(
    'DELETE',
    SERVER_URL + '/clear/v1'
  );
});

describe('/auth/register/v2', () => {
  test('invalid email - no @', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'invalidEmail',
          password: 'password',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('invalid email - two @', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'invalid@Email@',
          password: 'password',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('invalid email already used by another user', () => {
    const res1 = request(
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

    const data1 = JSON.parse(res1.getBody() as string);
    expect(data1).not.toStrictEqual(ERROR);

    const res2 = request(
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

    const data2 = JSON.parse(res2.getBody() as string);
    expect(data2).toStrictEqual(ERROR);
  });

  test('invalid password - password.length < 6', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: '12345',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('invalid nameFirst - nameFirst.length < 1', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: '',
          nameLast: 'Mishra',
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('invalid nameFirst - nameFirst.length > 50', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: '12345',
          nameFirst: '123456789012345678901234567890123456789012345678901',
          nameLast: 'Mishra',
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('invalid nameLast - nameLast.length < 1', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: '12345',
          nameFirst: 'Madhav',
          nameLast: '',
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('invalid nameLast - nameLast.length > 50', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: '12345',
          nameFirst: 'Madhav',
          nameLast: '123456789012345678901234567890123456789012345678901',
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(ERROR);
  });

  test('valid user - control test', () => {
    const res = request(
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

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(VALID_AUTH_REGISTER);
  });

  test('valid user - nameFirst.length = 1', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: '1',
          nameLast: 'Mishra',
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(VALID_AUTH_REGISTER);
  });

  test('valid user - nameFirst.length = 50', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: '12345678901234567890123456789012345678901234567890',
          nameLast: 'Mishra',
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(VALID_AUTH_REGISTER);
  });

  test('valid user - nameLast.length = 1', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Madhav',
          nameLast: '1',
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(VALID_AUTH_REGISTER);
  });

  test('valid user - nameLast.length = 50', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'Madhav',
          nameLast: '12345678901234567890123456789012345678901234567890',
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(VALID_AUTH_REGISTER);
  });

  test('valid user - password.length = 6', () => {
    const res = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5555555@ad.unsw.edu.au',
          password: '123456',
          nameFirst: 'Madhav',
          nameLast: 'Mishra',
        }
      }
    );

    const data = JSON.parse(res.getBody() as string);
    expect(data).toStrictEqual(VALID_AUTH_REGISTER);
  });

  test('multiple valid users', () => {
    const res1 = request(
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

    const res2 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5444444@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'John',
          nameLast: 'Smith',
        }
      }
    );

    const res3 = request(
      'POST',
      SERVER_URL + '/auth/register/v2',
      {
        json: {
          email: 'z5333333@ad.unsw.edu.au',
          password: 'password',
          nameFirst: 'John',
          nameLast: 'Smith',
        }
      }
    );

    const data1 = JSON.parse(res1.getBody() as string);
    const data2 = JSON.parse(res2.getBody() as string);
    const data3 = JSON.parse(res3.getBody() as string);

    expect(data1).toStrictEqual(VALID_AUTH_REGISTER);
    expect(data2).toStrictEqual(VALID_AUTH_REGISTER);
    expect(data3).toStrictEqual(VALID_AUTH_REGISTER);

    // check uniqueness of users
    expect(data1).not.toStrictEqual(data2);
    expect(data1).not.toStrictEqual(data3);
    expect(data2).not.toStrictEqual(data3);
  });
});
