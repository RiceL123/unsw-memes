import { getData, getHash } from './dataStore';
import HTTPError from 'http-errors';

/**
 * usersAllV2 takes in a token of a current user and then returns an array that stores
 * all the information about all users that are currently on the website
 * @param {string} token - the token of the user
 * @returns { users } - an array of objects of users where it shows their uId, nameFirst
 * nameLast, email and handleStr
 */
function usersAllV2(token: string) {
  const data = getData();
  token = getHash(token);

  const userObj = data.users.find(x => x.tokens.includes(token));

  if (userObj === undefined) {
    throw HTTPError(403, 'invalid token');
  }

  const returnedUsers = [];
  for (const user of data.users) {
    if (user.permission !== 420) {
      const eachUser = {
        uId: user.uId,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        email: user.email,
        handleStr: user.handleStr,
      };

      returnedUsers.push(eachUser);
    }
  }

  return {
    users: returnedUsers
  };
}

export { usersAllV2 };
