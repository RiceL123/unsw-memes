import {
  clear, authRegister, usersAll, userProfile, userProfileSetName,
  userProfileSetEmail, userProfileSetHandle, userProfileUploadPhoto
} from './routeRequests';

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

describe('/user/profile/V3', () => {
  const email = 'z5555555@ad.unsw.edu.au';
  const password = 'password';
  const nameFirst = 'Madhav';
  const nameLast = 'Mishra';

  test('invalid token / uId in empty data', () => {
    expect(userProfile('dasdsadas', 1)).toStrictEqual(403);
  });

  test('invalid uId', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    expect(userProfile(data.token, data.authUserId + 1)).toEqual(400);
  });

  test('invalid token', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    expect(userProfile(data.token + 1, data.authUserId)).toEqual(403);
  });

  test('valid uId and token', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    const userData = userProfile(data.token, data.authUserId);

    expect(userData).toStrictEqual(
      {
        user: {
          uId: data.authUserId,
          email: email,
          nameFirst: nameFirst,
          nameLast: nameLast,
          handleStr: 'madhavmishra',
          profileImgUrl: 'http://localhost:3200/profileImages/default.jpg',
        }
      }
    );
  });

  test('multiple valid users', () => {
    const data = authRegister('charmander@ad.unsw.edu.au', 'password1', 'Charmander', 'PokemonName1');
    const data2 = authRegister('charmeleon@gmail.com', 'password2', 'Charmeleon', 'PokemonName2');
    const data3 = authRegister('charizard@yahoo.com', 'password3', 'Charizard', 'PokemonName3');

    expect(userProfile(data.token, data.authUserId)).toStrictEqual({
      user: {
        uId: data.authUserId,
        email: 'charmander@ad.unsw.edu.au',
        nameFirst: 'Charmander',
        nameLast: 'PokemonName1',
        handleStr: 'charmanderpokemonnam',
        profileImgUrl: 'http://localhost:3200/profileImages/default.jpg',
      }
    });

    expect(userProfile(data2.token, data2.authUserId)).toStrictEqual({
      user: {
        uId: data2.authUserId,
        email: 'charmeleon@gmail.com',
        nameFirst: 'Charmeleon',
        nameLast: 'PokemonName2',
        handleStr: 'charmeleonpokemonnam',
        profileImgUrl: 'http://localhost:3200/profileImages/default.jpg',
      },
    });

    expect(userProfile(data3.token, data3.authUserId)).toStrictEqual({
      user: {
        uId: data3.authUserId,
        email: 'charizard@yahoo.com',
        nameFirst: 'Charizard',
        nameLast: 'PokemonName3',
        handleStr: 'charizardpokemonname',
        profileImgUrl: 'http://localhost:3200/profileImages/default.jpg',
      },
    });
  });
});

describe('/user/profile/setname/v1', () => {
  const email = 'z5555555@ad.unsw.edu.au';
  const password = 'password';
  const nameFirst = 'Madhav';
  const nameLast = 'Mishra';
  const newNameFirst = 'Bruce';
  const newNameLast = 'Wayne';

  test('invalid token', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    expect(userProfileSetName(data.token + 1, newNameFirst, newNameLast)).toStrictEqual(403);
  });

  test('invalid nameFirst - nameFirst.length < 1', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    expect(userProfileSetName(data.token, '', newNameLast)).toStrictEqual(400);
  });

  test('invalid nameFirst - nameFirst.length > 50', () => {
    const data = authRegister(email, password, nameFirst, nameLast);
    const invalidNameFirst = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz';

    expect(userProfileSetName(data.token, invalidNameFirst, newNameLast)).toStrictEqual(400);
  });

  test('invalid nameLast - nameLast.length < 1', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    expect(userProfileSetName(data.token, newNameFirst, '')).toStrictEqual(400);
  });

  test('invalid nameLast - nameLast.length > 50', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    const invalidNameLast = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz';
    expect(userProfileSetName(data.token, newNameFirst, invalidNameLast)).toStrictEqual(400);
  });

  test('valid name change - control', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    expect(userProfileSetName(data.token, newNameFirst, newNameLast)).toStrictEqual({});

    const expectedArray: userObj[] = [
      {
        uId: data.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Bruce',
        nameLast: 'Wayne',
        handleStr: 'madhavmishra',
        profileImgUrl: 'http://localhost:3200/profileImages/default.jpg',
      },
    ];

    expect(usersAll(data.token).users).toStrictEqual(expectedArray);
  });

  test('valid name change - nameFirst.length = 1', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    expect(userProfileSetName(data.token, 'a', newNameLast)).toStrictEqual({});

    const expectedArray: userObj[] = [
      {
        uId: data.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'a',
        nameLast: 'Wayne',
        handleStr: 'madhavmishra',
        profileImgUrl: 'http://localhost:3200/profileImages/default.jpg',
      },
    ];

    expect(usersAll(data.token).users).toStrictEqual(expectedArray);
  });

  test('valid name change - nameFirst.length = 50', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    const validNewFirst = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwx';
    expect(userProfileSetName(data.token, validNewFirst, newNameLast)).toStrictEqual({});

    const expectedArray: userObj[] = [
      {
        uId: data.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwx',
        nameLast: 'Wayne',
        handleStr: 'madhavmishra',
        profileImgUrl: 'http://localhost:3200/profileImages/default.jpg',
      },
    ];

    expect(usersAll(data.token).users).toStrictEqual(expectedArray);
  });

  test('valid name change - nameLast.length = 1', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    expect(userProfileSetName(data.token, newNameFirst, 'a')).toStrictEqual({});

    const expectedArray: userObj[] = [
      {
        uId: data.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Bruce',
        nameLast: 'a',
        handleStr: 'madhavmishra',
        profileImgUrl: 'http://localhost:3200/profileImages/default.jpg',
      },
    ];

    expect(usersAll(data.token).users).toStrictEqual(expectedArray);
  });

  test('valid name change - nameLast.length = 50', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    const validNewLast = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwx';
    expect(userProfileSetName(data.token, newNameFirst, validNewLast)).toStrictEqual({});

    const expectedArray: userObj[] = [
      {
        uId: data.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Bruce',
        nameLast: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwx',
        handleStr: 'madhavmishra',
        profileImgUrl: 'http://localhost:3200/profileImages/default.jpg',
      },
    ];

    expect(usersAll(data.token).users).toStrictEqual(expectedArray);
  });

  test('multiple valid name change', () => {
    const data = authRegister(email, password, nameFirst, nameLast);
    const data2 = authRegister('z4444444@ad.unsw.edu.au', 'password2', 'John', 'Smith');
    const data3 = authRegister('z3333333@ad.unsw.edu.au', 'password3', 'James', 'Smith');

    expect(userProfileSetName(data.token, newNameFirst, newNameLast)).toStrictEqual({});
    expect(userProfileSetName(data2.token, 'Barry', 'Allen')).toStrictEqual({});
    expect(userProfileSetName(data3.token, 'Clark', 'Kent')).toStrictEqual({});

    const expectedArray: userObj[] = [
      {
        uId: data.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Bruce',
        nameLast: 'Wayne',
        handleStr: 'madhavmishra',
        profileImgUrl: 'http://localhost:3200/profileImages/default.jpg',
      },
      {
        uId: data2.authUserId,
        email: 'z4444444@ad.unsw.edu.au',
        nameFirst: 'Barry',
        nameLast: 'Allen',
        handleStr: 'johnsmith',
        profileImgUrl: 'http://localhost:3200/profileImages/default.jpg',
      },
      {
        uId: data3.authUserId,
        email: 'z3333333@ad.unsw.edu.au',
        nameFirst: 'Clark',
        nameLast: 'Kent',
        handleStr: 'jamessmith',
        profileImgUrl: 'http://localhost:3200/profileImages/default.jpg',
      },
    ];

    const viewData = usersAll(data.token);
    expect(viewData.users).toStrictEqual(expectedArray);

    expect(viewData.users.sort((a: userObj, b: userObj) => a.uId - b.uId)).toStrictEqual(
      expectedArray.sort((a, b) => a.uId - b.uId)
    );
  });
});

describe('/user/profile/setEmail/v1', () => {
  const email = 'z5555555@ad.unsw.edu.au';
  const password = 'password';
  const nameFirst = 'Madhav';
  const nameLast = 'Mishra';
  const newEmail = 'z9999999@ad.unsw.edu.au';

  test('invalid token', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    expect(userProfileSetEmail(data.token + 1, newEmail)).toStrictEqual(403);
  });

  test('invalid email - no @', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    expect(userProfileSetEmail(data.token, 'invalidEmail')).toStrictEqual(400);
  });

  test('invalid email - two @', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    expect(userProfileSetEmail(data.token, 'invalid@Email@')).toStrictEqual(400);
  });

  test('invalid email already used by another user', () => {
    const data = authRegister(email, password, nameFirst, nameLast);
    const data2 = authRegister('z1111111@ad.unsw.edu.au', password, nameFirst, nameLast);

    expect(data.authUserId).toStrictEqual(expect.any(Number));
    expect(userProfileSetEmail(data2.token, email)).toStrictEqual(400);
  });

  test('valid email - control', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    expect(userProfileSetEmail(data.token, newEmail)).toStrictEqual({});

    const expectedArray: userObj[] = [
      {
        uId: data.authUserId,
        email: 'z9999999@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'madhavmishra',
        profileImgUrl: 'http://localhost:3200/profileImages/default.jpg',
      },
    ];

    expect(usersAll(data.token).users).toStrictEqual(expectedArray);
  });

  test('valid email - multiple', () => {
    const data = authRegister(email, password, nameFirst, nameLast);
    const data2 = authRegister('z4444444@ad.unsw.edu.au', 'password2', 'John', 'Smith');
    const data3 = authRegister('z3333333@ad.unsw.edu.au', 'password3', 'James', 'Smith');

    expect(userProfileSetEmail(data.token, newEmail)).toStrictEqual({});
    expect(userProfileSetEmail(data2.token, 'z8888888@ad.unsw.edu.au')).toStrictEqual({});
    expect(userProfileSetEmail(data3.token, 'z7777777@ad.unsw.edu.au')).toStrictEqual({});

    const expectedArray: userObj[] = [
      {
        uId: data.authUserId,
        email: 'z9999999@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'madhavmishra',
        profileImgUrl: 'http://localhost:3200/profileImages/default.jpg',
      },
      {
        uId: data2.authUserId,
        email: 'z8888888@ad.unsw.edu.au',
        nameFirst: 'John',
        nameLast: 'Smith',
        handleStr: 'johnsmith',
        profileImgUrl: 'http://localhost:3200/profileImages/default.jpg',
      },
      {
        uId: data3.authUserId,
        email: 'z7777777@ad.unsw.edu.au',
        nameFirst: 'James',
        nameLast: 'Smith',
        handleStr: 'jamessmith',
        profileImgUrl: 'http://localhost:3200/profileImages/default.jpg',
      },
    ];

    const viewData = usersAll(data.token);
    expect(viewData.users).toStrictEqual(expectedArray);

    expect(viewData.users.sort((a: userObj, b: userObj) => a.uId - b.uId)).toStrictEqual(
      expectedArray.sort((a, b) => a.uId - b.uId)
    );
  });
});

describe('/user/profile/sethandle/v1', () => {
  const email = 'z5555555@ad.unsw.edu.au';
  const password = 'password';
  const nameFirst = 'Madhav';
  const nameLast = 'Mishra';
  const newHandle = 'batman';

  test('invalid token', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    expect(userProfileSetHandle(data.token + 1, newHandle)).toStrictEqual(403);
  });

  test('invalid handleStr - handleStr.length < 3, length = 0', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    expect(userProfileSetHandle(data.token, '')).toStrictEqual(400);
  });

  test('invalid handleStr - handleStr.length < 3, length = 1', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    expect(userProfileSetHandle(data.token, 'a')).toStrictEqual(400);
  });

  test('invalid handleStr - handleStr.length < 3, length = 2', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    expect(userProfileSetHandle(data.token, 'ab')).toStrictEqual(400);
  });

  test('invalid handleStr - handleStr.length > 20', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    expect(userProfileSetHandle(data.token, 'abcdefghijklmnopqrstuvwxyz')).toStrictEqual(400);
  });

  test('invalid handleStr - contains non alphanumeric', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    expect(userProfileSetHandle(data.token, '!m#aaaAaaa$d%Ha\\v')).toStrictEqual(400);
  });

  test('invalid handleStr - handleStr already in use', () => {
    const data = authRegister(email, password, nameFirst, nameLast);
    const data2 = authRegister('z4444444@ad.unsw.edu.au', 'password2', 'John', 'Smith');

    expect(data.authUserId).toStrictEqual(expect.any(Number));
    expect(userProfileSetHandle(data2.token, 'madhavmishra')).toStrictEqual(400);
  });

  test('valid handleStr - control', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    expect(userProfileSetHandle(data.token, newHandle)).toStrictEqual({});

    const expectedArray: userObj[] = [
      {
        uId: data.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'batman',
        profileImgUrl: 'http://localhost:3200/profileImages/default.jpg',
      },
    ];

    expect(usersAll(data.token).users).toStrictEqual(expectedArray);
  });

  test('valid handleStr - alphanumeric', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    expect(userProfileSetHandle(data.token, '123iamvengeance123')).toStrictEqual({});

    const expectedArray: userObj[] = [
      {
        uId: data.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: '123iamvengeance123',
        profileImgUrl: 'http://localhost:3200/profileImages/default.jpg',
      },
    ];

    expect(usersAll(data.token).users).toStrictEqual(expectedArray);
  });

  test('valid handleStr - handleStr.length = 3', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    expect(userProfileSetHandle(data.token, 'abc')).toStrictEqual({});

    const expectedArray: userObj[] = [
      {
        uId: data.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'abc',
        profileImgUrl: 'http://localhost:3200/profileImages/default.jpg',
      },
    ];

    expect(usersAll(data.token).users).toStrictEqual(expectedArray);
  });

  test('valid handleStr - handleStr.length = 20', () => {
    const data = authRegister(email, password, nameFirst, nameLast);

    expect(userProfileSetHandle(data.token, 'abcdefghijklmnopqrst')).toStrictEqual({});

    const expectedArray: userObj[] = [
      {
        uId: data.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'abcdefghijklmnopqrst',
        profileImgUrl: 'http://localhost:3200/profileImages/default.jpg',
      },
    ];

    expect(usersAll(data.token).users).toStrictEqual(expectedArray);
  });

  test('valid handleStr - multiple', () => {
    const data = authRegister(email, password, nameFirst, nameLast);
    const data2 = authRegister('z4444444@ad.unsw.edu.au', 'password2', 'John', 'Smith');
    const data3 = authRegister('z3333333@ad.unsw.edu.au', 'password3', 'James', 'Smith');

    expect(userProfileSetHandle(data.token, newHandle)).toStrictEqual({});
    expect(userProfileSetHandle(data2.token, 'flash')).toStrictEqual({});
    expect(userProfileSetHandle(data3.token, 'superman420')).toStrictEqual({});

    const expectedArray: userObj[] = [
      {
        uId: data.authUserId,
        email: 'z5555555@ad.unsw.edu.au',
        nameFirst: 'Madhav',
        nameLast: 'Mishra',
        handleStr: 'batman',
        profileImgUrl: 'http://localhost:3200/profileImages/default.jpg',
      },
      {
        uId: data2.authUserId,
        email: 'z4444444@ad.unsw.edu.au',
        nameFirst: 'John',
        nameLast: 'Smith',
        handleStr: 'flash',
        profileImgUrl: 'http://localhost:3200/profileImages/default.jpg',
      },
      {
        uId: data3.authUserId,
        email: 'z3333333@ad.unsw.edu.au',
        nameFirst: 'James',
        nameLast: 'Smith',
        handleStr: 'superman420',
        profileImgUrl: 'http://localhost:3200/profileImages/default.jpg',
      },
    ];

    const viewData = usersAll(data.token);

    expect(viewData.users).toStrictEqual(expectedArray);

    expect(viewData.users.sort((a: userObj, b: userObj) => a.uId - b.uId)).toStrictEqual(
      expectedArray.sort((a, b) => a.uId - b.uId)
    );
  });
});

describe('/user/profile/uploadphoto/v1', () => {
  const email = 'z5555555@ad.unsw.edu.au';
  const password = 'password';
  const nameFirst = 'Madhav';
  const nameLast = 'Mishra';

  // 2000 x 1333 pixels
  const image1Url = 'http://imagesvc.meredithcorp.io/v3/mm/image?url=https%3A%2F%2Fstatic.onecms.io%2Fwp-content%2Fuploads%2Fsites%2F47%2F2021%2F02%2F23%2Fmaltipoo-on-table-390083464-2000.jpg';
  // 799 x 600 pixels
  // const image2 = 'http://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Maltipoo_puppy.jpg/799px-Maltipoo_puppy.jpg?20190729210020';

  test('invalid token', () => {
    const person = authRegister(email, password, nameFirst, nameLast);
    const imgUrl = image1Url;
    const xStart = 0;
    const yStart = 0;
    const xEnd = 1300;
    const yEnd = 1300;

    expect(userProfileUploadPhoto(person.token + 1, imgUrl, xStart, yStart, xEnd, yEnd)).toEqual(403);
  });

  test.each([
    { xStart: -1, yStart: 0, xEnd: 500, yEnd: 500 }, // xStart < 0
    { xStart: 0, yStart: -1, xEnd: 500, yEnd: 500 }, // yStart < 0
    { xStart: 0, yStart: 0, xEnd: 2001, yEnd: 502 }, // xEnd > image
    { xStart: 0, yStart: 0, xEnd: 2000, yEnd: 1400 }, // yEnd > image
    { xStart: 1000, yStart: 100, xEnd: 1000, yEnd: 900 }, // xEnd == xStart
    { xStart: 200, yStart: 300, xEnd: 600, yEnd: 300 }, // yEnd == yStart
    { xStart: 1300, yStart: 100, xEnd: 100, yEnd: 900 }, // xEnd < xStart
    { xStart: 200, yStart: 1300, xEnd: 900, yEnd: 100 }, // yEnd < yStart
  ])('invalid coords: xStart = $xStart, yStart = $yStart, xEnd = $xEnd, yEnd = $yEnd',
    ({ xStart, yStart, xEnd, yEnd }) => {
      const person = authRegister(email, password, nameFirst, nameLast);
      const imgUrl = image1Url;
      expect(userProfileUploadPhoto(person.token, imgUrl, xStart, yStart, xEnd, yEnd)).toEqual(400);
    }
  );

  test.each([
    { url: 'http://maltipoo.jpg' },
    { url: 'http://idontknowhowtogeturls.png' },
    { url: 'https://www.speedtest.net/' },
    { url: 'http://localhost.jpg' },
    { url: 'hiitsme' },
  ])('invalid image, not a jpg', ({ url }) => {
    const person = authRegister(email, password, nameFirst, nameLast);
    const xStart = 0;
    const yStart = 0;
    const xEnd = 500;
    const yEnd = 500;

    expect(userProfileUploadPhoto(person.token, url, xStart, yStart, xEnd, yEnd)).toEqual(400);
  });

  test('valid photo upload - default', () => {
    const person = authRegister(email, password, nameFirst, nameLast);

    expect(userProfile(person.token, person.authUserId)).toStrictEqual({
      user: {
        uId: person.authUserId,
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: 'madhavmishra',
        profileImgUrl: 'http://localhost:3200/profileImages/default.jpg',
      }
    });
  });

  test('valid photo upload - no crop', () => {
    const person = authRegister(email, password, nameFirst, nameLast);
    const imgUrl = image1Url;
    const xStart = 0;
    const yStart = 0;
    const xEnd = 2000;
    const yEnd = 1333;
    expect(userProfileUploadPhoto(person.token, imgUrl, xStart, yStart, xEnd, yEnd)).toStrictEqual({});

    expect(userProfile(person.token, person.authUserId)).toStrictEqual({
      user: {
        uId: person.authUserId,
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: 'madhavmishra',
        profileImgUrl: 'http://localhost:3200/profileImages/cropped_1.jpg',
      }
    });
  });

  test('valid photo upload - crop', () => {
    const person = authRegister(email, password, nameFirst, nameLast);
    const imgUrl = image1Url;
    const xStart = 50;
    const yStart = 200;
    const xEnd = 600;
    const yEnd = 450;
    expect(userProfileUploadPhoto(person.token, imgUrl, xStart, yStart, xEnd, yEnd)).toStrictEqual({});

    expect(userProfile(person.token, person.authUserId)).toStrictEqual({
      user: {
        uId: person.authUserId,
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: 'madhavmishra',
        profileImgUrl: 'http://localhost:3200/profileImages/cropped_1.jpg',
      }
    });
  });

  test('valid photo upload - upload 1, then upload another', () => {
    const person = authRegister(email, password, nameFirst, nameLast);
    const imgUrl = image1Url;
    const xStart = 50;
    const yStart = 200;
    const xEnd = 600;
    const yEnd = 450;
    expect(userProfileUploadPhoto(person.token, imgUrl, xStart, yStart, xEnd, yEnd)).toStrictEqual({});

    expect(userProfile(person.token, person.authUserId)).toStrictEqual({
      user: {
        uId: person.authUserId,
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: 'madhavmishra',
        profileImgUrl: 'http://localhost:3200/profileImages/cropped_1.jpg',
      }
    });

    const imgUrl2 = 'https://thehappypuppysite.com/wp-content/uploads/2020/11/Maltipoo-HP-long.jpg';
    const xStart2 = 10;
    const yStart2 = 0;
    const xEnd2 = 400;
    const yEnd2 = 300;

    expect(userProfileUploadPhoto(person.token, imgUrl2, xStart2, yStart2, xEnd2, yEnd2)).toStrictEqual({});

    expect(userProfile(person.token, person.authUserId)).toStrictEqual({
      user: {
        uId: person.authUserId,
        email: email,
        nameFirst: nameFirst,
        nameLast: nameLast,
        handleStr: 'madhavmishra',
        profileImgUrl: 'http://localhost:3200/profileImages/cropped_1.jpg',
      }
    });
  });
});
