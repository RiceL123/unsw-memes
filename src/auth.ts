import { User, Data, getData, setData } from './dataStore';
import validator from 'validator';

/** generate UniqiueToken uses a trivial method of adding 1 to the
 * current max string integer
 *
 * @param {Data} data
 *
 * @returns {string} - newly generated string token
 */
function generateUniqueToken(data: Data): string {
  let newToken = 1;
  if (data.users.length > 0) {
    newToken = Math.max.apply(null, data.users.map(x => x.tokens).flat().map(y => parseInt(y))) + 1;
  }

  return String(newToken);
}

/**
 * generateHandle passes in nameFirst, nameLast and data
 * it generates a handle by concatenating nameFirst and nameLast
 * it then removes all non-ascii characters and caps the length at 20
 * with the expection of collisions of existing users whereby a number
 * starting from 0 incremented by 1 will be appended
 *
 * @param {string} nameFirst - to be casted to lower-case alphanumeric
 * @param {string} nameLast - to be casted to lower-case alphanumeric
 * @param {object} data - to check if existing users already have the handle
 *
 * @returns {string} - returns casted handle that is unique
 */
function generateHandle(nameFirst: string, nameLast: string, data: Data) {
  let handle = nameFirst + nameLast;

  handle = handle.toLowerCase();

  // handle = handle.replace(/[^\x00-\x7F]|[^a-z0-9]/gu, '');
  handle = handle.replace(/[^a-z0-9]/gu, '');

  if (handle.length > 20) {
    handle = handle.slice(0, 20);
  }

  let numToAppend = 0;
  const concatenatedLength = handle.length;

  // if the handle already exists, create a new handle by appending numToAppend
  while (data.users.some(x => x.handleStr === handle)) {
    handle = handle.slice(0, concatenatedLength);
    handle = handle + numToAppend.toString();
    numToAppend += 1;
  }

  return handle;
}

/**
  * authLoginV1 passes in an email and password. If they match an existing
  * user, the user's id will be returned as value in an object with a key
  * called authUserId
  *
  * @param {string} email - will valid if already exists
  * @param {string} password - will be valid if matches to corresponding email
  *
  * @returns {{authUserId: Number}} - returns the userObj with corresponding ID
*/
function authLoginV2(email: string, password: string) {
  const data: Data = getData();

  const userObj = data.users.find(x => x.email === email);

  if (userObj === undefined) {
    return { error: 'user not found in data' };
  }

  if (userObj.password !== password) {
    return { error: 'password does not match email' };
  }

  const newToken = generateUniqueToken(data);
  userObj.tokens.push(newToken);

  setData(data);

  return {
    authUserId: userObj.uId,
    token: newToken
  };
}

/**
  * authRegisterV1 makes an object with a new & unique Id generated from uuid
  * and pushes the object into the data.users array locally and then sets it
  * globally
  *
  * @param {string} email - email that will be verified with validator package
  * @param {string} password - password where 1 <= length <= 50
  * @param {string} nameFirst - nameFirst where 1 <= length <= 50
  * @param {string} nameLast - nameLast where 1 <= length <= 50
  *
  * @returns {{authUserId: Number}} - description of condition for return
*/
function authRegisterV2(email: string, password: string, nameFirst: string, nameLast: string) {
  const data = getData();

  if (validator.isEmail(email) === false) {
    return { error: 'invalid email' };
  }

  if (password.length < 6) {
    return { error: 'password length < 6' };
  }

  if (nameFirst.length < 1 || nameFirst.length > 50) {
    return { error: 'nameFirst.length not between 1 and 50 inclusive' };
  }

  if (nameLast.length < 1 || nameLast.length > 50) {
    return { error: 'nameLast.length not between 1 and 50 inclusive' };
  }

  if (data.users.some(existingUsers => existingUsers.email === email)) {
    return { error: 'email already exists' };
  }

  // generating a new Id by adding 1 to the current Id
  let uId = 1;
  if (data.users.length > 0) {
    uId = Math.max.apply(null, data.users.map(x => x.uId)) + 1;
  }

  // if the newly generated uId already exists, then return error
  if (data.users.some(x => x.uId === uId)) {
    return { error: 'could not generate new authUserId' };
  }

  const handle = generateHandle(nameFirst, nameLast, data);
  if (!(handle.match(/[a-z0-9]{1,20}\d*/))) {
    return { error: 'could not generate a handle' };
  }

  const newToken = generateUniqueToken(data);

  // users get permission id's of 2 if they are not the first user
  let permission = 2;
  if (data.users.length === 0) {
    permission = 1;
  }

  const newUser: User = {
    uId: uId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: password,
    handleStr: handle,
    permission: permission,
    tokens: [newToken]
  };

  data.users.push(newUser);

  setData(data);

  return {
    authUserId: uId,
    token: newToken,
  };
}

/** authLogout logs out a user with a given token and returns and empty object
 * if successful. If the token is invalid, an error will be returned
 *
 * @param {string} token
 *
 * @returns {{}}
 */
function authLogoutV1(token: string) {
  const data: Data = getData();

  const userObj = data.users.find(x => x.tokens.includes(token));

  if (!userObj) {
    return { error: 'invalid token' };
  }

  userObj.tokens = userObj.tokens.filter(x => x !== token);

  setData(data);

  return {};
}

export { authLoginV2, authRegisterV2, authLogoutV1 };
