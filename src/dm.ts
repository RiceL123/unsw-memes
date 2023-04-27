import { getHash } from './dataStore';
import HTTPError from 'http-errors';

import { getUser, getUserWithToken } from '../database/dbUsers';
import { insertDm, insertDmOwner, insertDmMember, getDm, isDmMember, isDmOwner, removeDm, getDmMembers, removeDmMember, getUserDms } from '../database/dbDms';
import { getDmMessages } from '../database/dbMessages';
interface Error {
  error: string;
}

interface DmDetailsReturn {
  name: string;
  members: {
    uId: number;
    email: string;
    nameFirst: string;
    nameLast: string;
    handleStr: string;
  }[];
}

/** given the data of the dataStore and an array of uIds
 * generates a string with handlestrings comma separated in
 * alphabetical order
 *
 * @param {number[]} uIds
 * @param {Data} data
 * @returns
 */
function generateDmName(uIds: number[]) {
  return uIds.map(x => getUser({ id: x }).handleStr).sort((a, b) => a.localeCompare(b)).join(', ');
}

/** Given an array of uids and the user than calls the function, makes a
 * new dm with the creator and the members in the uIds array
 *
 * @param {string} token
 * @param {number[]} uIds
 *
 * @returns {{ dmId: number }}
 */
function dmCreateV2(token: string, uIds: number[]) {
  token = getHash(token);

  const creator = getUserWithToken(token);
  if (!creator) {
    throw HTTPError(403, 'invalid token');
  }

  uIds.push(creator.id);

  // check every uId in the array references a valid user
  if (!(uIds.every(x => getUser({ id: x })))) {
    throw HTTPError(400, 'invalid uId - does not refer to existing user');
  }

  // if each uId is not unique
  if (uIds.length !== new Set(uIds).size) {
    throw HTTPError(400, 'invalid uId - cannot contain duplicates');
  }

  // generate dmName
  const newDmName = generateDmName(uIds);

  // insertDm will generate a new unique dmId
  const dmId = insertDm(newDmName);

  insertDmOwner(creator.id, dmId);

  uIds.forEach(x => {
    // notify all non-creator members
    if (x !== creator.id) {
      insertDmMember(x, dmId, creator.handleStr, newDmName);
    } else {
      insertDmMember(x, dmId);
    }
  });

  return { dmId: dmId };
}

/** Given a token of user and dmId, removes an existing DM, so all members are
 * no longer in the DM. This can only be done by the original creator of the DM
 *
 * @param {string} token
 * @param {number} dmId
 * @returns
 */
function dmRemoveV2(token: string, dmId: number) {
  token = getHash(token);

  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'invalid token');
  }

  const dm = getDm(dmId);
  if (!dm) {
    throw HTTPError(400, 'dmId does not refer to a valid DMn');
  }

  if (!isDmMember(user.id, dmId)) {
    throw HTTPError(403, 'The authorised user is not in the DM');
  }

  if (!isDmOwner(user.id, dmId)) {
    throw HTTPError(403, 'The authorised user is not the original DM creator');
  }

  removeDm(dmId);

  return {};
}

/** Given a dmId that the user is apart of, returns information about the channel's
 * name and the members of that channel
 *
 * @param {string} token
 * @param {number} dmId
 *
 * @returns {{ name: string, members: User[] }}
 */
function dmDetailsV2(token: string, dmId: number): Error | DmDetailsReturn {
  token = getHash(token);

  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'invalid token');
  }

  const dm = getDm(dmId);
  if (!dm) {
    throw HTTPError(400, 'dmId does not refer to a valid DM');
  }

  if (!isDmMember(user.id, dmId)) {
    throw HTTPError(403, 'The authorised user is not in the DM');
  }

  const members = getDmMembers(dmId).map(x => ({
    uId: x.id,
    email: x.email,
    nameFirst: x.nameFirst,
    nameLast: x.nameLast,
    handleStr: x.handleStr,
    profileImgUrl: x.profileImgUrl
  }));

  return {
    name: dm.name,
    members: members
  };
}

/** dmLeaveV2 removes the corresponding user to the token argument from
 * the dm
 *
 * @param {string} token
 * @param {number} dmId
 *
 * @returns {{}}
 */
function dmLeaveV2(token: string, dmId: number): Error | Record<string, never> {
  token = getHash(token);

  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'invalid token');
  }

  const dm = getDm(dmId);
  if (!dm) {
    throw HTTPError(400, 'dmId does not refer to a valid DM');
  }

  if (!isDmMember(user.id, dmId)) {
    throw HTTPError(403, 'The authorised user is not in the DM');
  }

  removeDmMember(user.id, dmId);

  return {};
}

/** Given the token of a user, returns the list of DMs that the user is
 * a member of.
 *
 * @param {string} token
 *
 * @returns {{dms}}
 */
function dmListV2(token: string) {
  token = getHash(token);

  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'invalid token');
  }

  const dmsArray = getUserDms(user.id).map(x => ({
    dmId: x.id,
    name: x.name
  }));

  return { dms: dmsArray };
}

/**
 * dmMessagesV2 takes an authorised user as well as a channelId to access the messages
 * stored within that channel and given the start index, it uses pagination to return the messages
 * stored in an array of objects, pagination can return up to 50 messages at a time. If there are
 * no messages, the end index returned is -1 but if there are more messages stored, the end index
 * is "start + 50". Assuming that the messages array in dms is already sorted.
 *
 * @param {string} token - unique Id generated when registering a user
 * @param {number} dmId - unique Id generated when creating a new dm
 * @param {number} start - the index at which we start searching for messages via pagination
 *
 * @returns { messages: [{ messageId, uId, message, timeSent }], start, end } - returns an object
 * that has an array of objects called messages, the start index value as well as a new index for
 * end which either states that there are no more messages or there are more messages waiting.
 */

function dmMessagesV2(token: string, dmId: number, start: number) {
  token = getHash(token);

  const pagination = 50;

  const user = getUserWithToken(token);

  if (!user) {
    throw HTTPError(403, 'invalid token');
  }

  const dm = getDm(dmId);
  if (!dm) {
    throw HTTPError(400, 'dmId does not refer to a valid DM');
  }

  if (!isDmMember(user.id, dmId)) {
    throw HTTPError(403, 'The authorised user is not in the DM');
  }

  const messages = getDmMessages(user.id, dmId);

  if (start < 0 || start > messages.length) {
    throw HTTPError(400, 'invalid start value');
  }

  // if start + pagination > messages.length - slice will slice appropiately according to length
  const messagesSliced = messages.slice(start, start + pagination);

  const end = start + pagination >= messages.length ? -1 : start + pagination;

  return {
    messages: messagesSliced,
    start: start,
    end: end,
  };
}

export { dmCreateV2, dmDetailsV2, dmLeaveV2, dmRemoveV2, dmListV2, dmMessagesV2 };
