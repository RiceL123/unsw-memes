import { getData } from './dataStore';

/**
  * userProfileV1 makes an object for a valid user, from authUserId and uId
  * returns information about their user ID, email, first name, last name, and handle

  * @param {string} token - the user calling function
  * @param {string} uId - the user whos information that is being accessed
  *
  * @returns {{ user }} - returns information about their user ID, email, first name, last name, and handle
*/
function userProfileV2(token: string, uId: string) {
  const id = parseInt(uId);

  const data = getData();

  const userFind = (data.users.find(x => x.uId === id));
  if (!(userFind)) {
    return { error: 'Invalid uId' };
  }

  if (!(userFind.tokens.some(x => x === token))) {
    return { error: 'Invalid token' };
  }

  return {
    user: {
      uId: userFind.uId,
      nameFirst: userFind.nameFirst,
      nameLast: userFind.nameLast,
      email: userFind.email,
      handleStr: userFind.handleStr,
    }
  };
}

export { userProfileV2 };
