import { getData, setData } from './dataStore.js';

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
    let data = getData();
    
    const user = data.users.find(x => x.uId === authUserId);
    if ((user === undefined)) {
        return { error: 'Invalid authUserId' };
    }
    const channel = data.channels.find(x => x.channelId === channelId);
    if (channel === undefined) {
        return { error: 'Invalid channelId' };
    }
    if (channel.allMembersIds.find(x => x === authUserId)) {
        return { error: 'AuthUserId is already a member' };
    }
    if (channel.isPublic === false && user.permission != 1) {
        return { error: 'Can not join a private channel' };
    }
    
    channel.allMembersIds.push(authUserId);
    setData(data);

    return {};
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