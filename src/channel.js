import { getData, setData } from './dataStore.js';

/**
 * 
 * @param {number} authUserId 
 * @param {number} channelId 
 * @returns {{name, isPublic, ownerMembers, allMembers}}
 */
function channelDetailsV1(authUserId, channelId) {
  const data = getData();

  if (!(data.users.some(x => x.uId === authUserId))) {
    return { error: 'authUserId not found' };
  }

  const channelObj = data.channels.find(x => x.channelId === channelId);

  if (channelObj === undefined) {
    return { error: 'channelId not found' };
  }

  // even if the user is a global owner, they still need to be a member
  if (!(channelObj.allMembersIds.includes(authUserId))) {
    return { error: 'authUserId is not a member of the channel' };
  }

  let allMembers = [];
  let ownerMembers = [];

  // loop through all members (owner members is a subset of all members)
  for (const userId of channelObj.allMembersIds) {
    // find the corresponding user in the channel ownerMembers array
    const userObj = data.users.find(x => x.uId === userId);

    // add the relevant details to allMembers array
    if (userObj !== undefined) {
      allMembers.push({
        uId: userObj.uId,
        email: userObj.email,
        nameFirst: userObj.nameFirst,
        nameLast: userObj.nameLast,
        handleStr: userObj.handleStr,
      });
    }

    // add the relevant details to ownerMembers array
    if (userObj !== undefined && channelObj.ownerMembersIds.includes(userObj.authUserId)) {
      ownerMembers.push({
        uId: userObj.uId,
        email: userObj.email,
        nameFirst: userObj.nameFirst,
        nameLast: userObj.nameLast,
        handleStr: userObj.handleStr,
      });
    }
  }

  return {
    name: channelObj.name,
    isPublic: channelObj.isPublic,
    ownerMembers: ownerMembers,
    allMembers: allMembers,
  }
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


export { channelDetailsV1 };