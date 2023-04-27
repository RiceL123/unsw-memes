import { getHash } from './dataStore';
import validator from 'validator';
import { v4 as uuidv4 } from 'uuid';
import HTTPError from 'http-errors';

import { insertUser, insertUserSession, getUser, getUserWithToken, removeUserSession, removeAllUserSessions, getAllUsers, updateUserInfo } from '../database/dbUsers';

import nodemailer from 'nodemailer';

import config from './config.json';
import fs from 'fs';
import request from 'sync-request';

const EMAIL = 'tb15crunchie@outlook.com';
const PASSWORD = 'imagineMakingASecurePassword!!!1234567890';

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';
const defaultImg = 'https://c8.alamy.com/comp/a8cc3a/java-macaque-monkey-a8cc3a.jpg';
const res = request(
  'GET',
  defaultImg
);
const imgPath = 'profileImages/default.jpg';
fs.writeFileSync(imgPath, res.body, { flag: 'w' });

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
function generateHandle(nameFirst: string, nameLast: string) {
  let handle = (nameFirst + nameLast).toLowerCase().replace(/[^a-z0-9]/gu, '').slice(0, 20);

  // if handles need to be remove non ascii character in from utf8 use code below
  // .replace(/[^\x00-\x7F]|[^a-z0-9]/gu, '')
  const length = handle.length;
  let num = 0;
  // if the handle already exists (getUserWithHandleStr doesn't return null), create a new handle by appending numToAppend
  while (getUser({ handleStr: handle })) {
    handle = handle.slice(0, length);
    handle = handle + num.toString();
    num += 1;
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
  const user = getUser({ email: email });

  if (!user) {
    throw HTTPError(400, 'user does not exist in db');
  }

  password = getHash(password);

  if (password !== user.password) {
    throw HTTPError(400, 'incorrect password or email');
  }

  const newToken = generateUniqueToken();

  insertUserSession(user.id, getHash(newToken));

  return {
    authUserId: user.id,
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

  const handle = generateHandle(nameFirst, nameLast);

  // users get permission id's of 2 if they are not the first user
  let permission = 2;
  if (getAllUsers().length === 0) {
    permission = 1;
  }

  // insertUser insert a user and returns a new id - the db schema will handle duplicate emails with 400 error
  const uId = insertUser(email, getHash(password), nameFirst, nameLast, handle, permission, `http://${HOST}:${PORT}/profileImages/default.jpg`);

  const newToken = generateUniqueToken();
  insertUserSession(uId, getHash(newToken));

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
  token = getHash(token);

  const user = getUserWithToken(token);

  if (!user) {
    throw HTTPError(403, 'invalid token');
  }

  removeUserSession(token);

  return {};
}

/** sendEmail is an async function that sends an email to the specified address using
 * the from the email in the
 *
 * @param {string} email - The email address to send the email to.
 * @param {string} subject - The subject of the email.
 * @param {string} message - The message body of the email.
 * @returns {Promise<void>} - A Promise that resolves when the email has been sent.
*/
async function sendEmail(email: string, subject: string, message: string) {
  const transport = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: EMAIL,
      pass: PASSWORD
    },
  });

  transport.sendMail({
    from: `"YOUR MOTHER" <${EMAIL}>`,
    to: email,
    subject: subject,
    text: message,
  });
}

/** authPasswordResetRequestV1 generates a password reset code for the specified user and sends it to their email address.
 *
 * @param {string} email - The email address of the user requesting the password reset.
 * @returns {object} - An empty object.
*/
function authPasswordResetRequestV1(email: string) {
  const user = getUser({ email: email });
  // if email doesn't exist don't throw an error, just return {}
  if (!user) {
    return {};
  }

  const resetCode = uuidv4();

  updateUserInfo(user.id, { resetCode: resetCode });

  const subject = `
  Password Reset Request 😱😱😱
  `;

  const message = `
  Hello ${user.handleStr}!

  You are an absolute dummy 💀💀💀 -> how did you forget your own password
  Anyways here is a password reset code 
  
  ${resetCode}

  ~~~///(^v^)\\\\\\~~~ regards,
  UNSW Memes
  `;
  // send email
  sendEmail(user.email, subject, message);

  return {};
}

/** authPasswordResetResetV1 resets the password of the user with the specified reset code to the specified new password.
 *
 * @param {string} resetCode - The reset code provided to the user via email to confirm their identity.
 * @param {string} newPassword - The new password to set for the user.
 * @returns {object} - An empty object.
 * @throws {HTTPError} - If the provided reset code is invalid or if the new password is too short.
*/
function authPasswordResetResetV1(resetCode: string, newPassword: string) {
  // as resetCode's are initialized as '' - any input resetCodes === '' will be denied
  if (resetCode === '') {
    throw HTTPError(400, 'invalid reset code');
  }

  if (newPassword.length < 6) {
    throw HTTPError(400, 'invalid password length - minimum 6');
  }

  const user = getUser({ resetCode: resetCode });

  if (!user) {
    throw HTTPError(400, 'invalid reset code');
  }

  // logs out all users sessions
  removeAllUserSessions(user.id);

  // set new password and invalidate their resetCode
  updateUserInfo(user.id, { password: getHash(newPassword), resetCode: '' });

  return {};
}

export { authLoginV2, authRegisterV2, authLogoutV1, authPasswordResetRequestV1, authPasswordResetResetV1 };
