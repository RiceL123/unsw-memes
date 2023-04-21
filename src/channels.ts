import { Channel, getData, setData, getHash } from './dataStore';
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
  const data = getData();
  token = getHash(token);

  if (name.length < 1 || name.length > 20) {
    throw HTTPError(400, 'Invalid channel name length');
  }

  // obtains userId respective to token
  const userObj = data.users.find(x => x.tokens.includes(token));
  if (!userObj) {
    throw HTTPError(403, 'Invalid token');
  }

  // creates new channel ID using a +1 mechanism
  let newChannelId = 0;
  if (data.channels.length > 0) {
    newChannelId = Math.max.apply(null, data.channels.map(x => x.channelId)) + 1;
  }

  const newChannel: Channel = {
    channelId: newChannelId,
    channelName: name,
    ownerMembersIds: [userObj.uId],
    allMembersIds: [userObj.uId],
    isPublic: isPublic,
    standupOwner: -1,
    standupIsActive: false,
    standupTimeFinish: 0,
    currStandUpQueue: [],
    messages: [],
  };

  data.channels.push(newChannel);

  // update globalStats
  const numChannelsExist = data.workspaceStats.channels.at(-1).numChannelsExist + 1;
  data.workspaceStats.channels.push({ numChannelsExist: numChannelsExist, timeStamp: Math.floor(Date.now() / 1000) });

  // update user stats of user that created the channel
  const numChannelsJoined = userObj.stats.channels.at(-1).numChannelsJoined + 1;
  userObj.stats.channels.push({ numChannelsJoined: numChannelsJoined, timeStamp: Math.floor(Date.now() / 1000) });

  setData(data);
  return { channelId: newChannelId };
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
  const data = getData();
  token = getHash(token);

  // obtains userId respective to token
  const userObj = data.users.find(x => x.tokens.includes(token));
  if (!userObj) {
    throw HTTPError(403, 'Invalid token');
  }

  const channelsArr = data.channels.filter(x => x.allMembersIds.includes(userObj.uId)).map(y => ({ channelId: y.channelId, name: y.channelName }));

  return { channels: channelsArr };
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
  const data = getData();
  token = getHash(token);

  if (!data.users.some(x => x.tokens.includes(token))) {
    throw HTTPError(403, 'Invalid Token');
  }

  const allChannels = [];
  for (const item of data.channels) {
    const usersChannels = {
      channelId: item.channelId,
      name: item.channelName,
    };
    allChannels.push(usersChannels);
  }

  return { channels: allChannels };
}

export { channelsCreateV3, channelsListV3, channelsListAllV3 };
