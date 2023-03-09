// channelsCreateV1 function: creates a new channel returning a unique channelId
import { getData, setData } from './dataStore.js';

/**
  * channelsCreateV1, given a channel name and an authUserId makes an object with 
  * a new & unique channelId and pushes the object into the data.channels array locally 
  * and then sets it globally
  * 
  * @param {number} authUserId - unique Id generated from a registered user
  * @param {string} name - name where 1 <= length <= 20
  * @param {boolean} isPublic  - 'true' or 'false' boolean
  *  
  * @returns {{channelId : Number}} - newly generated unique channelId
 */

function channelsCreateV1(authUserId, name, isPublic) {
  const data = getData(); 

  // invalid name length error check
  if (name.length < 1 || name.length > 20 ) {
    return { error: 'error' };
  }

  // invalid authUserId error check
  if (!(data.users.some(x => x.uId === authUserId))) {
    return { error: 'error' };
  }
    
  // creates new channel ID using a +1 mechanism
  let newChannelId = 0;
  if (data.channels.length > 0) {
    newChannelId = Math.max.apply(null, data.channels.map(x => x.channelId)) + 1;
  }

  const newChannel = { 
    channelId: newChannelId,
    channelName: name,
    ownerMembersIds: [authUserId],
    allMembersIds: [authUserId],
    isPublic: isPublic,
    messages: [],
  }
  
  data.channels.push(newChannel);  
  setData(data);

  return { 
    channelId: newChannelId 
  };
}

/**
  * channelsListV1 provides an array of all channels that the
  * authorised user is part of with information about the channelName and channelId.
  * 
  * @param {number} authUserId - unique Id generated from a registered user
  *  
  * @returns {{ channels: [{channelId: Number, name: string} ]}} - Array of objects containing infomation about channelId and channelName
 */
function channelsListV1(authUserId) {
  const data = getData();
  // invalid authUserId error check
  if (!(data.users.some(x => x.uId === authUserId))) {
    return { error: 'error' };
  }
  
  let channelsArr = [];
  for (const channel of data.channels) {
    // if the user is a member of that channel, push to the channel array
    if (channel.allMembersIds.some(x => x === authUserId)) {
      channelsArr.push({
        channelId: channel.channelId,
        name: channel.channelName,
      })
    }
  }

  return channelsArr;
}


/**
 * channelsListAllV1 creates and returns an array of all created channels, 
 * including private channels (and their associated details)
 * @param {integer} authUserId 
 * @returns { allChannels } - returns array of all channels when authUserId valid
 */
function channelsListAllV1(authUserId) {

  if (!(data.users.some(item => item.uId === authUserId))) {
    return { error: 'authUserId does not refer to a valid user' };
  };

  let allChannels = [];
  for (const item of data.channels) {
    let usersChannels = {
      channelId: item.channelId,
      channelName: item.name,
    };
    allChannels.push(usersChannels);
  }

  return { allChannels };
}

export { channelsCreateV1, channelsListV1, channelsListAllV1 };
