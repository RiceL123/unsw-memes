import { Channel, getData, setData } from './dataStore';

/**
  * channelsCreateV2, given a channel name and an token makes an object with
  * a new & unique channelId and pushes the object into the data.channels array locally
  * and then sets it globally
  *
  * @param {string[]} token - unique token generated from a registered user
  * @param {string} name - name where 1 <= length <= 20
  * @param {boolean} isPublic  - 'true' or 'false' boolean
  *
  * @returns {{channelId : Number}} - newly generated unique channelId
 */

function channelsCreateV2(token: string, name: string, isPublic: boolean) {
  const data = getData();

  if (name.length < 1 || name.length > 20) {
    return { error: 'Invalid channel name length' };
  }

  // obtains userId respective to token
  const userObj = data.users.find(x => x.tokens.includes(token));
  if (userObj === undefined) {
    return { error: 'Invalid token' };
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
    messages: [],
  };

  data.channels.push(newChannel);
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
function channelsListV2(token : string) {
  const data = getData();

  // obtains userId respective to token
  const userObj = data.users.find(x => x.tokens.includes(token));

  if (userObj === undefined) {
    return { error: 'Invalid token' };
  }

  const channelsArr = [];
  for (const channel of data.channels) {
    // if the user is a member of that channel, push to the channel array
    if (channel.allMembersIds.some((x: any) => x === userObj.uId)) {
      channelsArr.push({
        channelId: channel.channelId,
        name: channel.channelName,
      });
    }
  }

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
function channelsListAllV2(token: string) {
  const data = getData();

  if (!data.users.some(x => x.tokens.includes(token))) {
    return { error: 'invalid token' };
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

export { channelsCreateV2, channelsListV2, channelsListAllV2 };
