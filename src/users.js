import validator from 'validator';
import { getData, setData } from './dataStore.js';
import { authLoginV1, authRegisterV1 } from './auth.js';

function userProfileV1(authUserId, uId) {
  let data = getData();

  if (!(data.users.some(x => x.uId === uId))) {
    return { error: 'could not generate new authUserId' };
  };


  return {
    uId: 1,
    nameFirst: 'Hayden',
    nameLast: 'Jacobs',
    email: 'example@gmail.com',
    handleStr: 'haydenjacobs',
  }
}

export { userProfileV1 };