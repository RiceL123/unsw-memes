import { removeUserAsMemberOfAllChannels, removeUserAsOwnerOfAllChannels } from '../database/dbChannels';
import { removeUserAsMemberOfAllDms, removeUserAsOwnerOfAllDms } from '../database/dbDms';
import { updateUserChannelMessages, updateUserDmMessages } from '../database/dbMessages';
import { getUserWithToken, getUser, getAllUsersWithPermission, updateUserInfo, removeAllUserSessions } from '../database/dbUsers';
import { getHash } from './dataStore';
import HTTPError from 'http-errors';

/**
  * adminUserRemoveV1 takes in a valid user and removes them from UNSWMemes, this includes
  * all channels, dm and the users list. All messages their sent are also changed to
  * "Removed user".
  * @param {string} token - the token of the global owner
  * @param {number} uId - the user being removed
  * @returns {} - returns nothing
*/
function adminUserRemoveV1(token: string, uId: number) {
  token = getHash(token);

  const user = getUserWithToken(token);

  if (!user) {
    throw HTTPError(403, 'invalid token');
  }

  const userFind = getUser({ id: uId });
  if (!userFind) {
    throw HTTPError(400, 'Invalid uId');
  }

  if (user.permission !== 1) {
    throw HTTPError(403, 'Invalid authUserId, authorised user is not a global owner');
  }

  const globalOwners = getAllUsersWithPermission(1);

  if (uId === user.id && globalOwners.length === 1) {
    throw HTTPError(400, 'uId refers to the only global owner');
  }

  removeUserAsMemberOfAllChannels(uId);
  removeUserAsOwnerOfAllChannels(uId);
  removeUserAsMemberOfAllDms(uId);
  removeUserAsOwnerOfAllDms(uId);

  updateUserChannelMessages(uId, 'Removed user');
  updateUserDmMessages(uId, 'Removed user');

  updateUserInfo(uId, { nameFirst: 'Removed', nameLast: 'user', email: '', handleStr: '', permission: 420, resetCode: '' });

  removeAllUserSessions(uId);

  return {};
}

/**
  * adminUserPermissionChangeV1 takes a valid global owner and then changes the permission of
  * another valid user to either a global owner or global member
  * @param {string} token - the user changing the other user's permission
  * @param {string} uId - the user receiving the permission change
  * @param {string} permissionId - the level of permission to change to
  * @returns {} - returns nothing
*/
function adminUserPermissionChangeV1(token: string, uId: number, permissionId: number) {
  token = getHash(token);

  const user = getUserWithToken(token);

  if (!user) {
    throw HTTPError(403, 'invalid token');
  }

  const userFind = getUser({ id: uId });
  if (!userFind) {
    throw HTTPError(400, 'Invalid uId');
  }

  if (user.permission !== 1) {
    throw HTTPError(403, 'Invalid authUserId, authorised user is not a global owner');
  }

  const globalOwners = getAllUsersWithPermission(1);

  // a user cannot demote themselves from global owner if they are the only global owner
  if (uId === user.id && permissionId !== 1 && globalOwners.length === 1) {
    throw HTTPError(400, 'uId refers to the only global owner');
  }

  if (permissionId !== 1 && permissionId !== 2 && permissionId !== 420) {
    throw HTTPError(400, 'Invalid permissionId');
  }

  if (userFind.permission === permissionId) {
    throw HTTPError(400, 'user already has that level of permission');
  }

  updateUserInfo(uId, { permission: permissionId });

  return {};
}

export { adminUserRemoveV1, adminUserPermissionChangeV1 };
