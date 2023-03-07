// channelsCreateV1 function: creates a new channel returning a unique channelId
import { getData, setData } from './dataStore.js';

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

// Sample stub for the channelsListV1 function
// Returns given stub value 

function channelsListV1(authUserId) {
  const data = getData();
  // invalid authUserId error check
  if (!(data.users.some(x => x.uId === authUserId))) {
    return { error: 'error' };
  }
  
  let channelsArr = [];
  for (const channel of data.channels) {
    // if the user is a member of that channel, push to the channel array
    if (channel.allMemberIds.some(x => x === authUserId)) {
      channelsArr.push({
        channelId: channel.channelId,
        name: channel.channelName,
      })
    }
  }

  return channelsArr;
}

// Sample stub for the channelsListAllV1
// Returns given stub object

function channelsListAllV1(authUserId) {
  return {
    channels: [
      {
        channelId: 1,
        name: 'My Channel',
      }
    ], 
  };
}

export { channelsCreateV1, channelsListV1 };

