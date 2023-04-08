import { User, Data, getData, setData, getHash } from './dataStore';
import validator from 'validator';
import { v4 as uuidv4 } from 'uuid';
import HTTPError from 'http-errors';

import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';

const COMPANY_DETAILS = {
  email: 'unswmemest15bcrunchie@gmail.com',
  clientId: '957094224176-2aq890690c1qq8dmn1rau573d8c7cu18.apps.googleusercontent.com',
  clientSecret: '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',
  refreshToken: '1//044BFb_xRQy7MCgYIARAAGAQSNwF-L9IrrbdQztY3bHPOU6o-gSLRzlqtW2zAdTXfksC3IWHn14lM7firMhX4t6ORUr5-b7OPDZY'
};

/** generate UniqiueToken uses uuid's v4 implementation to generate a new user token
 *
 * @param {Data} data
 *
 * @returns {string} - newly generated string token
 */
function generateUniqueToken(): string {
  return uuidv4();
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
  password = getHash(password);

  const userObj = data.users.find(x => x.email === email);

  if (!userObj) {
    throw HTTPError(400, 'user does not exist');
  }

  if (userObj.password !== password) {
    throw HTTPError(400, 'incorrect password for email');
  }

  const newToken = generateUniqueToken();
  userObj.tokens.push(getHash(newToken));

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
    throw HTTPError(400, 'invalid email');
  }

  if (password.length < 6) {
    throw HTTPError(400, 'password length < 6');
  }

  if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(400, 'nameFirst length not between 1 and 50 inclusive');
  }

  if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'nameLast length not between 1 and 50 inclusive');
  }

  if (data.users.some(x => x.email === email)) {
    throw HTTPError(400, 'email already exists');
  }

  // generating a new Id by adding 1 to the current Id
  let uId = 1;
  if (data.users.length > 0) {
    uId = Math.max.apply(null, data.users.map(x => x.uId)) + 1;
  }

  const handle = generateHandle(nameFirst, nameLast, data);

  const newToken = generateUniqueToken();

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
    password: getHash(password),
    handleStr: handle,
    permission: permission,
    tokens: [getHash(newToken)],
    resetCode: ''
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
  token = getHash(token);

  const userObj = data.users.find(x => x.tokens.includes(token));

  if (!userObj) {
    throw HTTPError(403, 'invalid token');
  }

  userObj.tokens = userObj.tokens.filter(x => x !== token);

  setData(data);

  return {};
}

async function sendEmail(email: string, subject: string, message: string) {
  const oauth2Client = new OAuth2Client(
    COMPANY_DETAILS.clientId,
    COMPANY_DETAILS.clientSecret,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: COMPANY_DETAILS.refreshToken,
  });

  const { token } = await oauth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: COMPANY_DETAILS.email,
      clientId: COMPANY_DETAILS.clientId,
      clientSecret: COMPANY_DETAILS.clientSecret,
      refreshToken: COMPANY_DETAILS.refreshToken,
      accessToken: token
    },
  });

  const info = await transporter.sendMail({
    from: COMPANY_DETAILS.email, // sender address
    to: email,
    subject: subject,
    text: message,
  });

  console.log('Message sent: %s', info.messageId);
}

function authPasswordResetRequestV1(email: string) {
  const data: Data = getData();
  const userObj = data.users.find(x => x.email === email);

  // if email doesn't exist don't throw an error, just return {}
  if (!userObj) {
    return {};
  }

  // overwrite previous key-value pair
  userObj.resetCode = uuidv4();

  const subject = `
  Password Reset Request 😱😱😱
  `;

  const message = `
  Hello ${userObj.handleStr}!

  You are an absolute dummy 💀💀💀 -> how did you forget your own password
  Anyways here is a password reset code 
  
  ${userObj.resetCode}

  ~~~///(^v^)\\\\\\~~~ regards,
  UNSW Memes
  `;
  // send email
  sendEmail(userObj.email, subject, message);

  setData(data);

  return {};
}

function authPasswordResetResetV1(resetCode: string, newPassword: string) {
  const data: Data = getData();

  // as resetCode's are initialized as '' - any input resetCodes === '' will be denied
  if (resetCode === '') {
    throw HTTPError(400, 'invalid reset code');
  }

  const userObj = data.users.find(x => x.resetCode === resetCode);

  if (!userObj) {
    throw HTTPError(400, 'invalid reset code');
  }

  if (newPassword.length < 6) {
    throw HTTPError(400, 'invalid password length - minimum 6');
  }
  // logs out all sessions
  userObj.tokens = [];
  userObj.password = getHash(newPassword);
  userObj.resetCode = '';

  setData(data);

  return {};
}

export { authLoginV2, authRegisterV2, authLogoutV1, authPasswordResetRequestV1, authPasswordResetResetV1 };
