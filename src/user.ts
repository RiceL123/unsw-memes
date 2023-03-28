import { getData, setData } from './dataStore';
import validator from 'validator';

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

/**
  * userProfileSetEmailV1 gets the token for a user and also strings for a new email.
  * Then it changes the user's current email to the new email.
  * @param {string} token - the user calling function
  * @param {string} email - new email
  * @returns {} - returns an empty object
*/
function userProfileSetEmailV1(token: string, email: string) {
  const data = getData();

  const userObj = data.users.find(x => x.tokens.includes(token));

  if (userObj === undefined) {
    return { error: 'Invalid token' };
  }

  if (validator.isEmail(email) === false) {
    return { error: 'invalid email' };
  }

  if (data.users.some(existingUsers => existingUsers.email === email)) {
    return { error: 'email already exists' };
  }

  const user = data.users.find(x => x.uId === userObj.uId);
  user.email = email;

  setData(data);
  return {};
}

function isAlphanumeric(str: string) {
  return /^[a-zA-Z0-9]+$/.test(str);
}

function userProfileSetHandleV1(token: string, handleStr: string) {
  const data = getData();

  const userObj = data.users.find(x => x.tokens.includes(token));

  if (userObj === undefined) {
    return { error: 'Invalid token' };
  }

  if (handleStr.length < 3 || handleStr.length > 20) {
    return { error: 'handleStr.length not between 3 and 20 inclusive' };
  }

  if (isAlphanumeric(handleStr) === false) {
    return { error: 'handleStr contains characters that are not alphanumeric  ' };
  }

  if (data.users.some(existingUsers => existingUsers.handleStr === handleStr)) {
    return { error: 'handleStr already exists' };
  }

  const user = data.users.find(x => x.uId === userObj.uId);
  user.handleStr = handleStr;

  setData(data);
  return {};
}

export { userProfileV2, userProfileSetNameV1, userProfileSetEmailV1, userProfileSetHandleV1 };
