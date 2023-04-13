import { getData, setData, getHash } from './dataStore';
import validator from 'validator';
import HTTPError from 'http-errors';
import request from 'sync-request';
import fs from 'fs';
import sizeOf from 'image-size';
import sharp from 'sharp';
import config from './config.json';

/**
  * userProfileV3 makes an object for a valid user, from authUserId and uId
  * returns information about their user ID, email, first name, last name, and handle

  * @param {string} token - the user calling function
  * @param {string} uId - the user whos information that is being accessed
  *
  * @returns {{ user }} - returns information about their user ID, email, first name, last name, and handle
*/
function userProfileV3(token: string, uId: string) {
  const id = parseInt(uId);
  token = getHash(token);
  const data = getData();

  const userObj = data.users.find(x => x.tokens.includes(token));

  if (userObj === undefined) {
    throw HTTPError(403, 'invalid token');
  }

  const userFind = (data.users.find(x => x.uId === id));
  if ((userFind) === undefined) {
    throw HTTPError(400, 'invalid uID');
  }

  return {
    user: {
      uId: userFind.uId,
      nameFirst: userFind.nameFirst,
      nameLast: userFind.nameLast,
      email: userFind.email,
      handleStr: userFind.handleStr,
      profileImgUrl: userFind.profileImgUrl,
    }
  };
}

/**
  * userProfileSetNameV2 gets the token for a user and also strings for a new first and last name.
  * Then it changes the user's current first and last name to the new first and last name.
  * @param {string} token - the user calling function
  * @param {string} nameFirst - new first name
  * @param {string} nameLast - new last name
  * @returns {} - returns an empty object
*/

function userProfileSetNameV2(token: string, nameFirst: string, nameLast: string) {
  const data = getData();
  token = getHash(token);

  const userObj = data.users.find(x => x.tokens.includes(token));

  if (userObj === undefined) {
    throw HTTPError(403, 'invalid token');
  }

  if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(400, 'nameFirst.length not between 1 and 50 inclusive');
  }

  if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'nameLast.length not between 1 and 50 inclusive');
  }

  const user = data.users.find(x => x.uId === userObj.uId);
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;

  setData(data);
  return {};
}

/**
  * userProfileSetEmailV2 gets the token for a user and also strings for a new email.
  * Then it changes the user's current email to the new email.
  * @param {string} token - the user calling function
  * @param {string} email - new email
  * @returns {} - returns an empty object
*/
function userProfileSetEmailV2(token: string, email: string) {
  const data = getData();
  token = getHash(token);

  const userObj = data.users.find(x => x.tokens.includes(token));

  if (userObj === undefined) {
    throw HTTPError(403, 'invalid token');
  }

  if (validator.isEmail(email) === false) {
    throw HTTPError(400, 'invalid email');
  }

  if (data.users.some(existingUsers => existingUsers.email === email)) {
    throw HTTPError(400, 'email already exists');
  }

  const user = data.users.find(x => x.uId === userObj.uId);
  user.email = email;

  setData(data);
  return {};
}

function isAlphanumeric(str: string) {
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
  * UserProfileSetHandleV2 gets the token for a user and also a string for a new handleStr.
  * Then it changes the user's current handleStr to the new handleStr.
  * @param {string} token - the user calling function
  * @param {string} handleStr - new handleStr
  * @returns {} - returns an empty object
*/
function userProfileSetHandleV2(token: string, handleStr: string) {
  const data = getData();
  token = getHash(token);

  const userObj = data.users.find(x => x.tokens.includes(token));

  if (userObj === undefined) {
    throw HTTPError(403, 'invalid token');
  }

  if (handleStr.length < 3 || handleStr.length > 20) {
    throw HTTPError(400, 'handleStr.length not between 3 and 20 inclusive');
  }

  if (isAlphanumeric(handleStr) === false) {
    throw HTTPError(400, 'handleStr contains characters that are not alphanumeric');
  }

  if (data.users.some(existingUsers => existingUsers.handleStr === handleStr)) {
    throw HTTPError(400, 'handleStr already exists');
  }

  const user = data.users.find(x => x.uId === userObj.uId);
  user.handleStr = handleStr;

  setData(data);
  return {};
}

function checkURL(url: string): boolean {
  const regex = /\.(jpg|jpeg)$/;
  return regex.test(url);
}

/**
 * userProfileUploadPhotoV1 gets a http url that is either a jpg or jpeg. It also takes in
 * the dimensions that the photo will be cropped to and sets it as the user's profile picture
 * @param {string} token - the user changing their profile picture
 * @param {string} imgUrl - url of the jpg image
 * @param {number} xStart - starting x coordinate
 * @param {number} yStart - starting y coordinate
 * @param {number} xEnd - ending x coordinate
 * @param {number} yEnd - ending y coordinate
 * @returns {} - returns nothing
 */
function userProfileUploadPhotoV1(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) {
  sharp.cache(false);

  const data = getData();
  token = getHash(token);

  const userObj = data.users.find(x => x.tokens.includes(token));

  if (userObj === undefined) {
    throw HTTPError(403, 'invalid token');
  }

  if (!checkURL(imgUrl)) {
    throw HTTPError(400, 'imgUrl not a jpg or jpeg');
  }

  // make request
  const PORT: number = parseInt(process.env.PORT || config.port);
  const HOST: string = process.env.IP || 'localhost';

  let res;
  try {
    res = request(
      'GET',
      imgUrl
    );
  } catch (err) {
    throw HTTPError(400, 'Error getting image');
  }

  // save image locally
  const body = res.body;

  // makes a unique url for the profile photo of every user
  const imgPath = `profileImages/${userObj.uId}.jpg`;
  const cropImage = `profileImages/cropped_${userObj.uId}.jpg`;
  fs.writeFileSync(imgPath, body, { flag: 'w' });

  // get dimensions of uploaded image
  const dimensions = sizeOf(imgPath);
  const x = dimensions.width;
  const y = dimensions.height;

  // checks dimension errors
  if (xEnd > x || xStart < 0 || yEnd > y || yStart < 0 || xStart >= xEnd || yStart >= yEnd) {
    throw HTTPError(400, 'invalid image dimensions');
  }

  // crops image to dimensions
  sharp(imgPath).extract({ width: xEnd - xStart, height: yEnd - yStart, left: 0, top: 0 }).toFile(cropImage);

  // set user's profileiImgUrl
  userObj.profileImgUrl = `http://${HOST}:${PORT}/${cropImage}`;

  setData(data);
  return {};
}

export { userProfileV3, userProfileSetNameV2, userProfileSetEmailV2, userProfileSetHandleV2, userProfileUploadPhotoV1 };
