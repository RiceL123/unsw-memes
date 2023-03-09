import { getData, setData } from './dataStore.js';

/** 
 * channelDetailsV1 passes authUserId, channelId and creates a new 
 * array for ownerMembers and channelMembers returning the basic details
 * of the given channelId
 * 
 * @param {number} authUserId 
 * @param {number} channelId 
 * 
 * @returns {{name, isPublic, ownerMembers, allMembers}} - returns object with 
 * basic details about the channel 
 */
function channelDetailsV1(authUserId, channelId) {
  const data = getData();

  if (!(data.users.some(x => x.uId === authUserId))) {
    return { error: 'Invalid authUserId' };
  }

  const channelObj = data.channels.find(x => x.channelId === channelId);

  if (channelObj === undefined) {
    return { error: 'Invalid channelId' };
  }

  // even if the user is a global owner, they still need to be a member
  if (!(channelObj.allMembersIds.includes(authUserId))) {
    return { error: 'authUserId is not a member of the channel' };
  }

  let allMembers = [];
  let ownerMembers = [];

  // loop through all members (owner members is a subset of all members)
  for (const userId of channelObj.allMembersIds) {
    // find the corresponding user in the array of members
    const userObj = data.users.find(x => x.uId === userId);

    // add the relevant details to allMembers array
    if (userObj !== undefined) {
      allMembers.push({
        uId: userObj.uId,
        email: userObj.email,
        nameFirst: userObj.nameFirst,
        nameLast: userObj.nameLast,
        handleStr: userObj.handleStr,
      });
    }

    // add the relevant details to ownerMembers array
    if (userObj !== undefined && channelObj.ownerMembersIds.includes(userObj.uId)) {
      ownerMembers.push({
        uId: userObj.uId,
        email: userObj.email,
        nameFirst: userObj.nameFirst,
        nameLast: userObj.nameLast,
        handleStr: userObj.handleStr,
      });
    }
  }

  return {
    name: channelObj.channelName,
    isPublic: channelObj.isPublic,
    ownerMembers: ownerMembers,
    allMembers: allMembers,
  }
}

/**
 * Given a channelId of a channel that the authorised user can join,
 * adds them to that channel. If it is a private channel, only users with
 * permission  = 1, can join that particular channel type
 * 
 * @param {number} authUserId 
 * @param {number} channelId 
 * 
 * @returns {{}} - empty object
 */
function channelJoinV1(authUserId, channelId) {
  let data = getData();

  const user = data.users.find(x => x.uId === authUserId);
  if (user === undefined) {
    return { error: 'Invalid authUserId' };
  }

  const channel = data.channels.find(x => x.channelId === channelId);
  if (channel === undefined) {
    return { error: 'Invalid channelId' };
  }

  if (channel.allMembersIds.find(x => x === authUserId)) {
    return { error: 'AuthUserId is already a member' };
  }

  if (channel.isPublic === false && user.permission !== 1) {
    return { error: 'Can not join a private channel' };
  }

  channel.allMembersIds.push(authUserId);
  setData(data);

  return {};
}


/**
 * Invites a user with ID uId to join a channel with ID channelId. 
 * Once invited, the user is added to the channel immediately. 
 * In both public and private channels, 
 * all members are able to invite users.
 * 
 * @param {number} authUserId 
 * @param {number} channelId 
 * @param {number} uId 
 * 
 * @returns {{}} - empty object
 */
function channelInviteV1(authUserId, channelId, uId) {
  let data = getData();

  const authorisedUser = data.users.find(x => x.uId === authUserId);
  if (authorisedUser === undefined) {
    return { error: 'Invalid authUserId' };
  }

  const user = data.users.find(x => x.uId === uId);
  if (user === undefined) {
    return { error: 'Invalid uId' };
  }

  const channel = data.channels.find(x => x.channelId === channelId);
  if (channel === undefined) {
    return { error: 'Invalid channelId' };
  }

  if (channel.allMembersIds.find(x => x === uId)) {
    return { error: 'uId is already a member' };
  }

  if (channel.allMembersIds.find(x => x === authUserId) === undefined) {
    return { error: 'authorised user is not a member of the channel' }
  }

  channel.allMembersIds.push(uId);
  setData(data);

  return {};
}


/**
 * channelMessagesV1 takes an authorised user as well as a channelId to access the messages 
 * stored within that channel and given the start index, it uses pagination to return the messages 
 * stored in an array of objects, pagination can return up to 50 messages at a time. If there are 
 * no messages, the end index returned is -1 but if there are more messages stored, the end index 
 * is "start + 50". 
 * 
 * @param {number} authUserId - unique Id generated when registering a user
 * @param {number} channelId - unique Id generated when creating a new channel
 * @param {number} start - the index at which we start searching for messages via pagination
 * 
 * @returns { messages: [{ messageId, uId, message, timeSent }], start, end } - returns an object 
 * that has an array of objects called messages, the start index value as well as a new index for 
 * end which either states that there are no more messages or there are more messages waiting.
 */
function channelMessagesV1(authUserId, channelId, start) {
  let data = getData();

  const pagination = 50;

  if (!(data.users.some(x => x.uId === authUserId))) {
    return { error: 'Invalid authUserId' };
  }

  if (!(data.channels.some(x => x.channelId === channelId))) {
    return { error: 'Invalid channelId' };
  }

  const channelFind = (data.channels.find(x => x.channelId === channelId));
  if (!(channelFind.allMembersIds.find(y => y === authUserId))) {
    return { error: 'Invalid authUserId: channelId is valid, but authorised user is not a member of the channel' };
  }

  if (start < 0 || start > channelFind.messages.length) {
    return { error: 'Invalid start value' };
  }

  if (start + pagination >= channelFind.messages.length) {
    return {
      messages: channelFind.messages.slice(start, channelFind.messages.length),
      start: start,
      end: -1,
    };
  } else {
    return {
      messages: channelFind.messages.slice(start, start + pagination),
      start: start,
      end: start + pagination,
    };
  }
}


export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 };

