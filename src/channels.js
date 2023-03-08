// Sample stub for the channelsCreateV1 function
// Returns given stub value 

function channelsCreateV1(authUserId, name, isPublic) {
  return {
    channelId: 1,
  };
}

// Sample stub for the channelsListV1 function
// Returns given stub value 

function channelsListV1(authUserId) {
  return {
    channels: [
      {
        channelId: 1,
        name: 'My Channel',
      }
    ],
  };
}

// Sample stub for the channelsListAllV1
// Returns given stub object

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
