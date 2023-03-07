import { channel } from 'diagnostics_channel';
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
  return {

  };
}

// Sample stub for the channelInviteV1 function
// Returns a blank stub value

function channelInviteV1(authUserId, channelId, uId) {
  return {

  };
}


/**
 * channelMessagesV1 takes an authorised user as well as a channelId to access the messages stored within that channel
 * and given the start index, it uses pagination to return the messages stored in an array of objects, pagination 
 * can return up to 50 messages at a time. If there are no messages, the end index returned is -1 but if there 
 * are more messages stored, the end index is "start + 50". 
 * 
 * @param {*} authUserId - unique Id generated when registering a user
 * @param {*} channelId - unique Id generated when creating a new channel
 * @param {*} start - the index at which we start searching for messages via pagination
 * @returns { messages: [{ messageId, uId, message, timeSent }], start, end } - returns an object that has an array of objects called messages, 
 * the start index value as well as a new index for end which either states that there are no more messages or there are more messages waiting
 */
function channelMessagesV1(authUserId, channelId, start) {
  let data = getData();

  const pagination = 50;


  if (!(data.users.some(x => x.uId === authUserId))) {
    return { error: 'authUserId is invalid' };
  };

  if (!(data.channels.some(x => x.channelId === channelId))) {
    return { error: 'channelId does not refer to a valid channel' };
  };

  const channelFind = (data.channels.find(x => x.channelId === channelId));
  if (!(channelFind.allMembersIds.find(y => y === authUserId))) {
    return { error: 'channelId is valid, but authorised user is not a member of the channel' };
  }

  if (start < 0 || start > channelFind.messages.length) {
    return { error: 'invalid start value' };
  };

  if (start + pagination >= channelFind.messages.length) {
    return {
      messages: channelFind.messages.slice(start, channelFind.messages.length),
      start: start,
      end: -1,
    }
  } else {
    return {
      messages: channelFind.messages.slice(start, start + pagination),
      start: start,
      end: start + pagination,
    }
  }
}

export { channelMessagesV1 };
