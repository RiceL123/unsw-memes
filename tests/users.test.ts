import { clear, authRegister, usersAll } from './routeRequests';

import { url, port } from '../src/config.json';
const SERVER_URL = `${url}:${port}`;

interface userObj {
  uId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
  profileImgUrl: string;
}

beforeEach(() => {
  clear();
});

describe('/users/all/v2', () => {
  const email = 'z5555555@ad.unsw.edu.au';
  const password = 'password';
  const nameFirst = 'Madhav';
  const nameLast = 'Mishra';

  test('invalid token', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    expect(usersAll(data.token + 1)).toStrictEqual(403);
  });

  test('valid - control', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    const expectedArray: userObj[] = [
      {
        uId: data.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'madhavmishra',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
    ];

    const viewData = usersAll(data.token);
    expect(viewData.users).toStrictEqual(expectedArray);
  });

  test('valid - adding a user', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    const expectedArray: userObj[] = [
      {
        uId: data.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'madhavmishra',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
    ];

    const viewData = usersAll(data.token);
    expect(viewData.users).toStrictEqual(expectedArray);

    const data2 = authRegister('z4444444@ad.unsw.edu.au', 'password1', 'Krusty', 'Krabs');

    const expectedArray2: userObj[] = [
      {
        uId: data.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'madhavmishra',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: data2.authUserId,
        email: 'z4444444@ad.unsw.edu.au',
        nameFirst: 'Krusty',
        nameLast: 'Krabs',
        handleStr: 'krustykrabs',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
    ];

    const viewData2 = usersAll(data2.token);
    expect(viewData2.users).toStrictEqual(expect.arrayContaining(expectedArray2));

    expect(viewData2.users.sort((a: userObj, b: userObj) => a.uId - b.uId)).toStrictEqual(
      expectedArray2.sort((a, b) => a.uId - b.uId)
    );
  });

  test('valid - multiple', () => {
    const data = authRegister(email, password, nameFirst, nameLast);
    const data2 = authRegister('z4444444@ad.unsw.edu.au', 'password1', 'Charmander', 'LastName');
    const data3 = authRegister('z3333333@ad.unsw.edu.au', 'password2', 'Charizard', 'LastName');

    const expectedArray: userObj[] = [
      {
        uId: data.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'madhavmishra',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: data2.authUserId,
        email: 'z4444444@ad.unsw.edu.au',
        nameFirst: 'Charmander',
        nameLast: 'LastName',
        handleStr: 'charmanderlastname',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
      {
        uId: data3.authUserId,
        email: 'z3333333@ad.unsw.edu.au',
        nameFirst: 'Charizard',
        nameLast: 'LastName',
        handleStr: 'charizardlastname',
        profileImgUrl: `${SERVER_URL}/profileImages/default.jpg`,
      },
    ];

    const viewData = usersAll(data.token);
    expect(viewData.users).toStrictEqual(expectedArray);

    expect(viewData.users.sort((a: userObj, b: userObj) => a.uId - b.uId)).toStrictEqual(
      expectedArray.sort((a, b) => a.uId - b.uId)
    );
  });
});
