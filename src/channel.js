// Sample stub for the channelDetailsV1 function
// Returns sample stub data.
    
function channelDetailsV1(authUserId, channelId) {
    return {
        name: 'Hayden',
        ownerMembers: [
            {
            uId: 1,
            email: 'example@gmail.com',
            nameFirst: 'Hayden',
            nameLast: 'Jacobs',
            handleStr: 'haydenjacobs',
            }
        ],
        allMembers: [
            {
            uId: 1,
            email: 'example@gmail.com',
            nameFirst: 'Hayden',
            nameLast: 'Jacobs',
            handleStr: 'haydenjacobs',
            }
        ],
    };
}

// Sample stub for the channelJoinV1 function
// Returns a blank stub value

function channelJoinV1(authUserId, channelId) {
    return {

    };
}

// Sample stub for the channelInviteV1 function
// Returns a blank stub value

function channelInviteV1(authUserId, channelId, uId) {
    return {

    };
}

// Sample stub for the channelMessagesV1 function
// Returns given stub return value

function channelMessagesV1(authUserId, channelId, start) {
    return {
        messages: [
            {
              messageId: 1,
              uId: 1,
              message: 'Hello world',
              timeSent: 1582426789,
            }
          ],
          start: 0,
          end: 50,
    };
}

export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 };