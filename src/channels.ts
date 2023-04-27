import { getUserWithToken } from '../database/dbUsers';
import { getUserChannels, insertChannel, getAllChannels, insertChannelMember, insertChannelOwner } from '../database/dbChannels';
import { getHash } from './dataStore';
import HTTPError from 'http-errors';

/**
  * channelsCreateV3, given a channel name and an token makes an object with
  * a new & unique channelId and pushes the object into the data.channels array locally
  * and then sets it globally
  *
  * @param {string[]} token - unique token generated from a registered user
  * @param {string} name - name where 1 <= length <= 20
  * @param {boolean} isPublic  - 'true' or 'false' boolean
  *
  * @returns {{channelId : Number}} - newly generated unique channelId
 */

function channelsCreateV3(token: string, name: string, isPublic: boolean) {
  token = getHash(token);

  if (name.length < 1 || name.length > 20) {
    throw HTTPError(400, 'Invalid channel name length');
  }

  const user = getUserWithToken(token);

  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  // inserts a new channel - insertChannel generates a new id
  const channelId = insertChannel(name, isPublic);

  insertChannelMember(user.id, channelId);
  insertChannelOwner(user.id, channelId);

  return { channelId: channelId };
}

/**
  * channelsListV1 provides an array of all channels that the
  * authorised user is part of with information about the channelName and channelId.
  *
  * @param {string} token  - unique token generated from a registered user
  *
  * @returns {{ channels: [{channelId: Number, name: string} ]}} - Array of objects containing infomation about channelId and channelName
 */
function channelsListV3(token : string) {
  token = getHash(token);

  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  const channels = getUserChannels(user.id).map(x => ({ channelId: x.id, name: x.name }));

  return { channels: channels };
}

/**
 * channelsListAllV1 creates and returns an array of all created channels,
 * including private channels (and their associated details)
 *
 * @param {integer} authUserId
 *
 * @returns { allChannels } - returns array of all channels when authUserId valid
 */
function channelsListAllV3(token: string) {
  token = getHash(token);

  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid Token');
  }

  const channels = getAllChannels().map(x => ({ channelId: x.id, name: x.name }));

  return { channels: channels };
}

export { channelsCreateV3, channelsListV3, channelsListAllV3 };
