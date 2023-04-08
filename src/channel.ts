import HTTPError from 'http-errors';
import { Data, getData, setData, getHash } from './dataStore';

/**
 * channelDetailsV2 passes authUserId, channelId and creates a new
 * array for ownerMembers and channelMembers returning the basic details
 * of the given channelId
 *
 * @param {string} token
 * @param {number} channelId
 *
 * @returns {{name, isPublic, ownerMembers, allMembers}} - returns object with
 * basic details about the channel
 */
function channelDetailsV2(token: string, channelId: string) {
  const data = getData();
  token = getHash(token);

  const id = parseInt(channelId);

  const userObj = data.users.find(x => x.tokens.includes(token));

  if (userObj === undefined) {
    return { error: 'Invalid token' };
  }
  // if (!(data.users.some(x => x.tokens === token))) {
  // return { error: 'Invalid authUserId' };
  // }

  const channelObj = data.channels.find(x => x.channelId === id);

  if (channelObj === undefined) {
    return { error: 'Invalid channelId' };
  }
  // even if the user is a global owner, they still need to be a member
  if ((channelObj.allMembersIds.includes(userObj.uId)) === false) {
    return { error: 'authUserId is not a member of the channel' };
  }

  const allMembers = [];
  const ownerMembers = [];

  // loop through all members (owner members is a subset of all members)
  for (const userId of channelObj.allMembersIds) {
    // find the corresponding user in the array of members
    const userObj = data.users.find(x => x.uId === userId);

    const returnMembersObj = {
      uId: userObj.uId,
      email: userObj.email,
      nameFirst: userObj.nameFirst,
      nameLast: userObj.nameLast,
      handleStr: userObj.handleStr,
    };

    // add the relevant details to allMembers array
    if (userObj !== undefined) {
      allMembers.push(returnMembersObj);
    }

    // add the relevant details to ownerMembers array
    if (userObj !== undefined && channelObj.ownerMembersIds.includes(userObj.uId)) {
      ownerMembers.push(returnMembersObj);
    }
  }

  return {
    name: channelObj.channelName,
    isPublic: channelObj.isPublic,
    ownerMembers: ownerMembers,
    allMembers: allMembers,
  };
}

/**
 * Given a channelId of a channel that the authorised user can join,
 * adds them to that channel. If it is a private channel, only users with
 * permission  = 1, can join that particular channel type
 *
 * @param {string} token
 * @param {number} channelId
 *
 * @returns {{}} - empty object
 */
function channelJoinV3(token: string, channelId: string) {
  const data = getData();
  token = getHash(token);

  const chanId = parseInt(channelId);

  const userObj = data.users.find(x => x.tokens.includes(token));
  if (userObj === undefined) {
    throw HTTPError(403, 'Invalid token');
  }

  const channelFind = (data.channels.find(x => x.channelId === chanId));
  if (channelFind === undefined) {
    throw HTTPError(400, 'Invalid channelId');
  }

  if (channelFind.allMembersIds.includes(userObj.uId) === true) {
    throw HTTPError(400, 'AuthUserId is already a member');
  }

  const user = data.users.find(x => x.uId === userObj.uId);
  if (channelFind.isPublic === false && user.permission !== 1) {
    throw HTTPError(403, 'Can not join a private channel');
  }

  channelFind.allMembersIds.push(userObj.uId);
  setData(data);

  return {};
}

/**
 * Invites a user with ID uId to join a channel with ID channelId.
 * Once invited, the user is added to the channel immediately.
 * In both public and private channels,
 * all members are able to invite users.
 *
 * @param {string} token
 * @param {number} channelId
 * @param {number} uId
 *
 * @returns {{}} - empty object
 */
function channelInviteV3(token: string, channelId: string, uId: string) {
  const data = getData();
  token = getHash(token);

  const chanId = parseInt(channelId);
  const uuId = parseInt(uId);

  const userFind = (data.users.find(x => x.uId === uuId));
  if (userFind === undefined) {
    throw HTTPError(400, 'Invalid uId');
  }

  const userObj = data.users.find(x => x.tokens.includes(token));
  if (userObj === undefined) {
    throw HTTPError(403, 'Invalid token');
  }

  const channel = data.channels.find(x => x.channelId === chanId);
  if (channel === undefined) {
    throw HTTPError(400, 'Invalid channelId');
  }

  if (channel.allMembersIds.find(x => x === uuId)) {
    throw HTTPError(400, 'uId is already a member');
  }

  if (channel.allMembersIds.find(x => x === userObj.uId) === undefined) {
    throw HTTPError(403, 'authorised user is not a member of the channel');
  }

  channel.allMembersIds.push(uuId);
  setData(data);

  return {};
}

/**
 * channelMessagesV2 takes an authorised user as well as a channelId to access the messages
 * stored within that channel and given the start index, it uses pagination to return the messages
 * stored in an array of objects, pagination can return up to 50 messages at a time. If there are
 * no messages, the end index returned is -1 but if there are more messages stored, the end index
 * is "start + 50".
 *
 * @param {string} token - unique Id generated when registering a user
 * @param {string} channelId - unique Id generated when creating a new channel
 * @param {string} start - the index at which we start searching for messages via pagination
 *
 * @returns { messages: [{ messageId, uId, message, timeSent }], start, end } - returns an object
 * that has an array of objects called messages, the start index value as well as a new index for
 * end which either states that there are no more messages or there are more messages waiting.
 */
function channelMessagesV2(token: string, channelId: string, start: string) {
  const data = getData();
  token = getHash(token);

  const chanId = parseInt(channelId);
  const startNum = parseInt(start);

  const pagination = 50;

  const userObj = data.users.find(x => x.tokens.includes(token));

  if (userObj === undefined) {
    throw HTTPError(403, 'invalid token');
  }

  const channelFind = (data.channels.find(x => x.channelId === chanId));
  if (channelFind === undefined) {
    throw HTTPError(400, 'invalid channelId');
  }

  if ((channelFind.allMembersIds.includes(userObj.uId)) === false) {
    throw HTTPError(403, 'Invalid authUserId: channelId is valid, but authorised user is not a member of the channel');
  }

  if (startNum < 0 || startNum > channelFind.messages.length) {
    throw HTTPError(400, 'Invalid start value');
  }

  if (startNum + pagination >= channelFind.messages.length) {
    return {
      messages: channelFind.messages.slice(startNum, channelFind.messages.length),
      start: startNum,
      end: -1,
    };
  } else {
    return {
      messages: channelFind.messages.slice(startNum, startNum + pagination),
      start: startNum,
      end: startNum + pagination,
    };
  }
}

/** Reomves a the corresponding member from the channel, if they were an owner,
 * remove them as well
 *
 * @param {string} token
 * @param {number} channelId
 * @returns {{}}
 */
function channelLeaveV1(token: string, channelId: number) {
  const data: Data = getData();
  token = getHash(token);

  const userObj = data.users.find(x => x.tokens.includes(token));
  if (!userObj) {
    return { error: 'invalid token' };
  }

  const channelObj = data.channels.find(x => x.channelId === channelId);
  if (!channelObj) {
    return { error: 'invalid channelId' };
  }

  if (!channelObj.allMembersIds.includes(userObj.uId)) {
    return { error: 'invalid uId - user not apart of channel' };
  }

  // remove the user from the channel - if the user was an owner, they are removed from there aswell
  channelObj.allMembersIds = channelObj.allMembersIds.filter(x => x !== userObj.uId);
  channelObj.ownerMembersIds = channelObj.ownerMembersIds.filter(x => x !== userObj.uId);

  setData(data);
  return {};
}

/** Adds uId to ownerMembersIds array
 *
 * @param {string} token
 * @param {number}channelId
 * @param {number} uId
 * @returns {{}}
 */
function channelAddOwnerV1(token: string, channelId: number, uId: number) {
  const data: Data = getData();
  token = getHash(token);

  const userObj = data.users.find(x => x.tokens.includes(token));
  if (!userObj) {
    return { error: 'invalid token' };
  }

  const channelObj = data.channels.find(x => x.channelId === channelId);
  if (channelObj === undefined) {
    return { error: 'invalid channelId' };
  }

  if (data.users.find(x => x.uId === undefined)) {
    return { error: 'invalid uId' };
  }

  if (!channelObj.allMembersIds.includes(uId)) {
    return { error: 'invaild uId - user not apart of channel' };
  }

  if (!channelObj.ownerMembersIds.includes(userObj.uId) && userObj.permission !== 1) {
    return { error: 'invaild uId - user is not an owner of the channel' };
  }

  if (channelObj.ownerMembersIds.includes(uId)) {
    return { error: 'uId is already an owner of the channel' };
  }

  // adding the uId to the channel's ownerMembersIds array
  channelObj.ownerMembersIds.push(uId);

  setData(data);
  return {};
}

/**
  * channelRemoveOwnerV1 takes in a token, channelId and an uId, and if the uId is an owner
  * a channel, it will remove their owner permission
  * @param {string} token
  * @param {number} channelId
  * @param {number} uId
  * @returns {}
*/
function channelRemoveOwnerV1(token: string, channelId: number, uId: number) {
  const data: Data = getData();
  token = getHash(token);

  const userObj = data.users.find(x => x.tokens.includes(token));
  if (!userObj) {
    return { error: 'invalid token' };
  }

  const channelObj = data.channels.find(x => x.channelId === channelId);
  if (!channelObj) {
    return { error: 'invalid channelId' };
  }

  if (data.users.find(x => x.uId === uId) === undefined) {
    return { error: 'invalid uId' };
  }

  if (!channelObj.ownerMembersIds.includes(uId)) {
    return { error: 'invalid uId - user is not an owner' };
  }

  if (channelObj.ownerMembersIds.length === 1) {
    return { error: 'invalid uId - user is the only owner of the channel' };
  }

  if (!(channelObj.ownerMembersIds.includes(userObj.uId)) && userObj.permission !== 1) {
    return { error: 'Invalid authUserId - channelId is valid, but authorised user is not a member of the channel' };
  }

  channelObj.ownerMembersIds = channelObj.ownerMembersIds.filter(x => x !== uId);
  setData(data);
  return {};
}

export { channelDetailsV2, channelJoinV3, channelInviteV3, channelMessagesV2, channelLeaveV1, channelAddOwnerV1, channelRemoveOwnerV1 };
