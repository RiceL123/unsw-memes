import HTTPError from 'http-errors';
import { getHash } from './dataStore';
import { getUserWithToken, getUser } from '../database/dbUsers';
import { getChannel, isChannelMember, getChannelMembers, getChannelOwners, insertChannelMember, removeChannelMember, removeChannelOwner, isChannelOwner, insertChannelOwner } from '../database/dbChannels';
import { getChannelMessages } from '../database/dbMessages';

/**
 * channelDetailsV3 passes authUserId, channelId and creates a new
 * array for ownerMembers and channelMembers returning the basic details
 * of the given channelId
 *
 * @param {string} token
 * @param {number} channelId
 *
 * @returns {{name, isPublic, ownerMembers, allMembers}} - returns object with
 * basic details about the channel
 */
function channelDetailsV3(token: string, channelId: number) {
  token = getHash(token);

  const user = getUserWithToken(token);

  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  const channel = getChannel(channelId);

  if (!channel) {
    throw HTTPError(400, 'Invalid channelId');
  }

  if (!isChannelMember(user.id, channelId)) {
    throw HTTPError(403, 'user is not a member of the channel');
  }

  const allMembers = getChannelMembers(channelId).map(x => ({
    uId: x.id,
    email: x.email,
    nameFirst: x.nameFirst,
    nameLast: x.nameLast,
    handleStr: x.handleStr,
    profileImgUrl: x.profileImgUrl,
  }));

  const ownerMembers = getChannelOwners(channelId).map(x => ({
    uId: x.id,
    email: x.email,
    nameFirst: x.nameFirst,
    nameLast: x.nameLast,
    handleStr: x.handleStr,
    profileImgUrl: x.profileImgUrl,
  }));

  return {
    name: channel.name,
    isPublic: !!channel.isPublic,
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
function channelJoinV3(token: string, channelId: number) {
  token = getHash(token);

  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  const channel = getChannel(channelId);

  if (!channel) {
    throw HTTPError(400, 'Invalid channelId');
  }

  if (isChannelMember(user.id, channelId)) {
    throw HTTPError(400, 'AuthUserId is already a member');
  }

  if (!channel.isPublic && user.permission !== 1) {
    throw HTTPError(403, 'Can not join a private channel');
  }

  insertChannelMember(user.id, channelId);

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
function channelInviteV3(token: string, channelId: number, uId: number) {
  token = getHash(token);

  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid uId');
  }

  const userToInvite = getUser({ id: uId });
  if (!userToInvite) {
    throw HTTPError(400, 'Invalid token');
  }

  const channel = getChannel(channelId);
  if (!channel) {
    throw HTTPError(400, 'Invalid channelId');
  }

  if (!isChannelMember(user.id, channelId)) {
    throw HTTPError(403, 'authorized user is not a member of the channel');
  }

  if (isChannelMember(uId, channelId)) {
    throw HTTPError(400, 'uId is already a member');
  }

  insertChannelMember(uId, channelId, user.handleStr, channel.name);

  return {};
}

/**
 * channelMessagesV3 takes an authorised user as well as a channelId to access the messages
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
function channelMessagesV3(token: string, channelId: number, start: number) {
  token = getHash(token);

  const pagination = 50;

  const user = getUserWithToken(token);

  if (!user) {
    throw HTTPError(403, 'invalid token');
  }

  const channel = getChannel(channelId);
  if (!channel) {
    throw HTTPError(400, 'invalid channelId');
  }

  if (!isChannelMember(user.id, channelId)) {
    throw HTTPError(403, 'user is not a member of the channel');
  }

  const messages = getChannelMessages(user.id, channelId);

  if (start < 0 || start > messages.length) {
    throw HTTPError(400, 'Invalid start value');
  }

  const messagesSliced = messages.slice(start, start + pagination);

  const end = start + pagination >= messages.length ? -1 : start + pagination;

  return {
    messages: messagesSliced,
    start: start,
    end: end,
  };
}

/**
 * Removes a the corresponding member from the channel, if they were an owner,
 * remove them as well
 *
 * @param {string} token
 * @param {number} channelId
 *
 * @returns {{}}
 */
function channelLeaveV2(token: string, channelId: number) {
  token = getHash(token);

  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'invalid token');
  }

  const channel = getChannel(channelId);
  if (!channel) {
    throw HTTPError(400, 'invalid channelId');
  }

  if (!isChannelMember(user.id, channelId)) {
    throw HTTPError(403, 'invalid uId - user not apart of channel');
  }

  if (channel.standupOwner === user.id && channel.standupIsActive) {
    throw HTTPError(400, 'Owner of active standup cannot leave');
  }

  removeChannelMember(user.id, channelId);
  removeChannelOwner(user.id, channelId);

  return {};
}

/**
 * Adds uId to ownerMembersIds array
 *
 * @param {string} token
 * @param {number}channelId
 * @param {number} uId
 *
 * @returns {{}}
 */
function channelAddOwnerV2(token: string, channelId: number, uId: number) {
  token = getHash(token);

  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'invalid token');
  }

  const channel = getChannel(channelId);
  if (!channel) {
    throw HTTPError(400, 'invalid channelId');
  }

  if ((!isChannelOwner(user.id, channelId)) && (!(isChannelMember(user.id, channelId) && user.permission === 1))) {
    throw HTTPError(403, 'invaild uId - user is not an owner of the channel');
  }

  if (!getUser({ id: uId })) {
    throw HTTPError(400, 'invalid uId');
  }

  if (!isChannelMember(uId, channelId)) {
    throw HTTPError(400, 'invaild uId - user not apart of channel');
  }

  if (isChannelOwner(uId, channelId)) {
    throw HTTPError(400, 'uId is already an owner of the channel');
  }

  insertChannelOwner(uId, channelId);

  return {};
}

/**
  * channelRemoveOwnerV1 takes in a token, channelId and an uId, and if the uId is an owner
  * a channel, it will remove their owner permission
  *
  * @param {string} token
  * @param {number} channelId
  * @param {number} uId
  *
  * @returns {{}}
*/
function channelRemoveOwnerV2(token: string, channelId: number, uId: number) {
  token = getHash(token);

  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'invalid token');
  }

  const channel = getChannel(channelId);
  if (!channel) {
    throw HTTPError(400, 'invalid channelId');
  }

  if ((!isChannelOwner(user.id, channelId)) && (!(isChannelMember(user.id, channelId) && user.permission === 1))) {
    throw HTTPError(403, 'Invalid uId - user is not an owner of the channel');
  }

  if (!getUser({ id: uId })) {
    throw HTTPError(400, 'invalid uId');
  }

  if (!isChannelOwner(uId, channelId)) {
    throw HTTPError(400, 'Invalid uId - user is not an owner of the channel');
  }

  if (getChannelOwners(channelId).length === 1) {
    throw HTTPError(400, 'invalid uId - user is the only owner of the channel');
  }

  removeChannelOwner(uId, channelId);

  return {};
}

export { channelDetailsV3, channelJoinV3, channelInviteV3, channelMessagesV3, channelLeaveV2, channelAddOwnerV2, channelRemoveOwnerV2 };
