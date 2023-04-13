import { getData, setData, getHash } from './dataStore';
// import { userProfileSetNameV2, userProfileSetEmailV2, userProfileSetHandleV2 } from './user';
import HTTPError from 'http-errors';

/**
  * adminUserRemoveV1 takes in a valid user and removes them from UNSWMemes, this includes
  * all channels, dm and the users list. All messages their sent are also changed to
  * "Removed user".
  * @param {string} token - the token of the global owner
  * @param {number} uId - the user being removed
  * @returns {} - returns nothing
*/
function adminUserRemoveV1(token: string, uId: string) {
  const data = getData();
  const id = parseInt(uId);
  token = getHash(token);

  const userObj = data.users.find(x => x.tokens.includes(token));

  if (userObj === undefined) {
    throw HTTPError(403, 'invalid token');
  }

  const userFind = (data.users.find(x => x.uId === id));
  if (userFind === undefined) {
    throw HTTPError(400, 'Invalid uId');
  }

  if (userObj.permission !== 1) {
    throw HTTPError(403, 'Invalid authUserId, authorised user is not a global owner');
  }

  let ownerCounter = 0;
  for (const user of data.users) {
    if (user.permission === 1) {
      ownerCounter++;
    }
  }

  if (id === userObj.uId && userObj.permission === 1 && ownerCounter === 1) {
    throw HTTPError(400, 'uId refers to the only global owner');
  }

  // remove them from all channels and set messages to "Removed user"
  for (const leaverChannel of data.channels) {
    leaverChannel.allMembersIds = leaverChannel.allMembersIds.filter(x => x !== id);
    leaverChannel.ownerMembersIds = leaverChannel.ownerMembersIds.filter(x => x !== id);
    for (const message of leaverChannel.messages) {
      if (message.uId === id) {
        message.message = 'Removed user';
      }
    }
  }

  // remove them from all dms and set messages to "Removed user"
  for (const leaverDm of data.dms) {
    leaverDm.memberIds = leaverDm.memberIds.filter(x => x !== id);
    for (const dm of leaverDm.messages) {
      if (dm.uId === id) {
        dm.message = 'Removed user';
      }
    }
  }

  // change their nameFirst to "Removed" and nameLast to "user", make email and handleStr reusuable
  userFind.nameFirst = 'Removed';
  userFind.nameLast = 'user';
  userFind.email = '';
  userFind.handleStr = '';
  userFind.permission = 420;

  // logging out of all sessions and invalidating reset code
  userFind.tokens = [];
  userFind.resetCode = '';

  setData(data);
  return {};
}

export { adminUserRemoveV1 };
