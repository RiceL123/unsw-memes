import { getAllChannels, getUserChannels } from '../database/dbChannels';
import { getUserDms } from '../database/dbDms';
import { getAllDms } from '../database/dbDms';
import { getAllChannelMessages, getAllDmMessages } from '../database/dbMessages';
import { getAllUsers, getUserWithToken } from '../database/dbUsers';
import { getUserMessagesStats, getUserChannelStats, getUserDmStats, getWorkSpaceMessageStats, getWorkspaceChannelStats, getWorkspaceDmStats, getNumAllUsersJoinedAtLeastOneDmOrChannel } from '../database/dbStats';
import { getHash } from './dataStore';
import HTTPError from 'http-errors';

/**
 * calcInvolvementRate calculates the involvement rate of a user by
 * dividing the total number of channels, direct messages, and messages by the
 * sum of the channels, direct messages, and messages joined, sent, and received by the user.
 *
 * @param {number} uId - the user ID to calculate the involvement rate for.
 *
 * @returns {number} - returns a value between 0 and 1 representing the user's involvement rate.
 */
function calcInvolementRate(uId: number) {
  const numChannels = getAllChannels().length;
  const numDms = getAllDms().length;
  const numMsgs = getAllChannelMessages().length + getAllDmMessages().length;

  const denominator = numChannels + numDms + numMsgs;

  const numChannelsJoined = getUserChannels(uId).length;
  const numDmsJoined = getUserDms(uId).length;
  const numMessagesSent = getUserMessagesStats(uId).length - 1; // don't include the first data point

  let involvementRate = denominator === 0 ? 0 : (numChannelsJoined + numDmsJoined + numMessagesSent) / denominator;

  if (involvementRate > 1) involvementRate = 1;

  return involvementRate;
}

/**
 * calcUtilizationRate calculates the utilization rate of the platform by
 * dividing the number of users who have joined at least one channel or direct message by
 * the total number of users on the platform.
 *
 * @returns {number} - returns a value between 0 and 1 representing the platform's utilization rate.
 */
function calcUtilizationRate() {
  const utilizingUsers = getNumAllUsersJoinedAtLeastOneDmOrChannel();
  const allUsers = getAllUsers().length;
  return utilizingUsers / allUsers;
}

/**
 * userStats retrieves statistics about a user, including the number of channels and direct messages joined,
 * the number of messages sent, and the user's involvement rate.
 *
 * @param {string} token - the token associated with the user.
 *
 * @throws {HTTPError} - if the token is invalid, an HTTPError with status code 403 will be thrown.
 *
 * @returns {Object} - returns an object containing the user's statistics.
 */

function userStats(token: string) {
  token = getHash(token);

  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'invalid token');
  }

  const userStats = {
    channelsJoined: getUserChannelStats(user.id),
    dmsJoined: getUserDmStats(user.id),
    messagesSent: getUserMessagesStats(user.id),
    involvementRate: calcInvolementRate(user.id)
  };

  return { userStats: userStats };
}

/**
 * usersStats retrieves statistics about the workspace, including the number of channels and direct messages,
 * the number of messages, and the workspace's utilization rate.
 *
 * @param {string} token - the token associated with the user.
 *
 * @throws {HTTPError} - if the token is invalid, an HTTPError with status code 403 will be thrown.
 *
 * @returns {Object} - returns an object containing the workspace's statistics.
 */
function usersStats(token: string) {
  token = getHash(token);

  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'invalid token');
  }

  const workspaceStats = {
    channelsExist: getWorkspaceChannelStats(),
    dmsExist: getWorkspaceDmStats(),
    messagesExist: getWorkSpaceMessageStats(),
    utilizationRate: calcUtilizationRate()
  };

  return { workspaceStats: workspaceStats };
}

export { userStats, usersStats };
