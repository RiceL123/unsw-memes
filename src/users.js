import { getData } from './dataStore.js';

/**
  * userProfileV1 makes an object for a valid user, from authUserId and uId
  * returns information about their user ID, email, first name, last name, and handle

  * @param {number} authUserId - the user calling function
  * @param {number} uId - the user whos information that is being accessed
  * 
  * @returns {{ user }} - returns information about their user ID, email, first name, last name, and handle
*/
function userProfileV1(authUserId, uId) {
  let data = getData();

  if (!(data.users.some(x => x.uId === authUserId))) {
    return { error: 'Invalid authUserId' };
  };

  if (!(data.users.some(x => x.uId === uId))) {
    return { error: 'Invalid uId' };
  };

  const userObj = data.users.find(x => x.uId === uId);

  return {
    user: {
      uId: userObj.uId,
      nameFirst: userObj.nameFirst,
      nameLast: userObj.nameLast,
      email: userObj.email,
      handleStr: userObj.handleStr,
    }
  };
}

export { userProfileV1 };