import { getData, setData } from './dataStore.js';
import validator from 'validator';

// Stub function for authLoginV1
// Returns authUserId

function authLoginV1(email, password) {
  return {
    authUserId: 1,
  };
}

/**
  * authRegisterV1 makes an object with a new & unique Id generated from uuid
  * and pushes the object into the data.users array locally and then sets it globally
  * 
  * @param {string} email - email that will be verified with validator package
  * @param {string} password - password where 1 <= length <= 50
  * @param {string} nameFirst - nameFirst where 1 <= length <= 50
  * @param {string} nameLast - nameLast where 1 <= length <= 50
  *  
  * @returns {{authUserId: Number}} - description of condition for return
*/
function authRegisterV1(email, password, nameFirst, nameLast) {
  let data = getData();
  
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

  let uId = 1;
  if (data.users.length > 0) {
    uId = Math.max.apply(null, data.users.map(x => x.uId)) + 1;
  }

  // if the newly generated uId already exists, then return error
  if (data.users.some(x => x.uId === uId)) {
    return { error: 'could not generate new authUserId' };
  }

  const newUser = {
    uId: uId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: password
  };

  data.users.push(newUser);

  setData(data);

  return {
    authUserId: uId
  };
}

export { authLoginV1, authRegisterV1 };