import { getData, setData } from './dataStore';

/**
  * userProfileV2 makes an object for a valid user, from authUserId and uId
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

/**
  * userProfileSetNameV1 gets the token for a user and also strings for a new first and last name.
  * Then it changes the user's current first and last name to the new first and last name.
  * @param {string} token - the user calling function
  * @param {string} nameFirst - new first name
  * @param {string} nameLast - new last name
  * @returns {} - returns an empty object
*/

function userProfileSetNameV1(token: string, nameFirst: string, nameLast: string) {
  const data = getData();

  const userObj = data.users.find(x => x.tokens.includes(token));

  if (userObj === undefined) {
    return { error: 'Invalid token' };
  }

  if (nameFirst.length < 1 || nameFirst.length > 50) {
    return { error: 'nameFirst.length not between 1 and 50 inclusive' };
  }

  if (nameLast.length < 1 || nameLast.length > 50) {
    return { error: 'nameLast.length not between 1 and 50 inclusive' };
  }

  const user = data.users.find(x => x.uId === userObj.uId);
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;

  setData(data);
  return {};
}

export { userProfileV2, userProfileSetNameV1 };
