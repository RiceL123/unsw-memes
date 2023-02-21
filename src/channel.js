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

