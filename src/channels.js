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
  return {
    channels: [
      {
        channelId: 1,
        name: 'My Channel',
      }
    ], 
  };
}
