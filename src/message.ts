import { Message, Data, getData, setData, getHash } from './dataStore';

/**
  * generateMessageId, a helper function that generates a unique messageId using a +1 mechanism
  * by checking all the messages in dms and all the messages in channels
  *
  * @param {data} data - extracts data from our data store.
  *
  * @returns {{messageId : Number}} - newly generated unique messageId
 */
function generateMessageId(data: Data) {
  let uniqueMessageId = 1;
  const messagesIdsinChannels = data.channels.map(x => x.messages.map(y => y.messageId)).flat();
  const messagesIdsinDms = data.dms.map(x => x.messages.map(y => y.messageId)).flat();
  const allMessageIds = messagesIdsinChannels.concat(messagesIdsinDms);
  if (allMessageIds.length > 0) {
    uniqueMessageId = Math.max.apply(null, allMessageIds) + 1;
  }
  return uniqueMessageId;
}

/**
  * messageSendV1, given a token, channelId and message sends a message from the
  * authorised user to the channel specified by channelId
  *
  * @param {string[]} token - unique token generated from a registered user
  * @param {channelId} number - unique channelId number
  * @param {string} message  - with length between 1 and 1000 characters
  *
  * @returns {messageId: messageId} unique messageId- if no error occurs
 */
function messageSendV1(token: string, channelId: number, message: string) {
  const data = getData();
  token = getHash(token);

  if (message.length > 1000 || message.length < 1) {
    return { error: 'Invalid message length' };
  }

  // obtains userId respective to token
  const userObj = data.users.find(x => x.tokens.includes(token));
  if (userObj === undefined) {
    return { error: 'Invalid token' };
  }

  const channelObj = data.channels.find(x => x.channelId === channelId);
  if (channelObj === undefined) {
    return { error: 'Invalid channelId' };
  }

  if (!(channelObj.allMembersIds.some((x: number) => x === userObj.uId))) {
    return { error: 'Authorised user is not a member of the channel' };
  }

  // creates new message ID using a +1 mechanism
  const messageId = generateMessageId(data);

  const newMessage: Message = {
    messageId: messageId,
    uId: userObj.uId,
    message: message,
    timeSent: Math.floor(Date.now() / 1000),
  };

  channelObj.messages.unshift(newMessage);
  setData(data);
  return { messageId: messageId };
}

/**
  * messageEditV1, given a token, messageId and message sends edits a message
  * if user has appropriate permissions to do so. Deletes the message if
  * message given is empty.
  *
  * @param {string[]} token - unique token generated from a registered user
  * @param {number} messageId - unique channelId number
  * @param {string} message  - with length between 1 and 1000 characters
  *
  * @returns {} - if no error occurs
 */
function messageEditV1(token: string, messageId: number, message: string) {
  const data = getData();
  token = getHash(token);

  if (message.length > 1000) {
    return { error: 'Invalid message length' };
  }

  // obtains userId respective to token
  const userObj = data.users.find(x => x.tokens.includes(token));
  if (userObj === undefined) {
    return { error: 'Invalid token' };
  }

  // find the corresponding channel and dm
  const channelObj = data.channels.find(x => x.messages.map(y => y.messageId).includes(messageId));
  const dmObj = data.dms.find(x => x.messages.map(y => y.messageId).includes(messageId));

  // if both channels and dms are undefined, the messageId is invalid else determine
  // if the message was found in a dm or a channel
  let flag: string;
  if (dmObj === undefined && channelObj === undefined) {
    return { error: 'invalid messageId' };
  } else {
    flag = dmObj === undefined ? 'messageInChannel' : 'messageInDm';
  }

  if (flag === 'messageInChannel') {
    // find corresponding messageObj in channel
    const channelMsgObj = channelObj.messages.find(x => x.messageId === messageId);
    if (!channelMsgObj) {
      return { error: 'invalid messageId' };
    }

    // even if you sent the original message, you cannot edit ur own message if you left the channel
    if (!channelObj.allMembersIds.includes(userObj.uId)) {
      return { error: 'invalid uId - user is not a member of the channel' };
    }

    // only if the user is a channel owner or the orinal person who sent the message, then they can edit the message
    if (!(channelObj.ownerMembersIds.includes(userObj.uId) || channelMsgObj.uId === userObj.uId)) {
      return { error: 'user is not a channel owner or original sender' };
    }

    // update the message to new message
    channelMsgObj.message = message;

    // the message is empty, then delete the messageObj from the channel
    if (message === '') {
      channelObj.messages = channelObj.messages.filter(x => x.messageId !== messageId);
    }
  } else if (flag === 'messageInDm') {
    // find corresponding messageObj in dm
    const dmMsgObj = dmObj.messages.find(x => x.messageId === messageId);
    if (!dmMsgObj) {
      return { error: 'invalid messageId' };
    }

    // even if you sent the original message, you cannot edit ur own message if you left the dm
    if (!dmObj.memberIds.includes(userObj.uId)) {
      return { error: 'invalid uId - user is not a member of the channel' };
    }

    // only if the user is the dm owner or the orinal person who sent the message, then they can edit the message
    if (!(dmObj.creatorId === userObj.uId || dmMsgObj.uId === userObj.uId)) {
      return { error: 'user is not a channel owner or original sender' };
    }

    // update the message to new message
    dmMsgObj.message = message;

    // the message is empty, then delete the messageObj from the dm
    if (message === '') {
      dmObj.messages = dmObj.messages.filter(x => x.messageId !== messageId);
    }
  }

  setData(data);
  return {};
}

/**
  * messageRemoveV1, given a token and messageId, deletes the message if
  * user has the appropriate permissions to do so.
  *
  * @param {string[]} token - unique token generated from a registered user
  * @param {number} messageId - unique channelId number
  *
  * @returns {} - if no error occurs
*/
function messageRemoveV1(token: string, messageId: number) {
  const data = getData();
  token = getHash(token);

  // obtains userId respective to token
  const userObj = data.users.find(x => x.tokens.includes(token));
  if (userObj === undefined) {
    return { error: 'Invalid token' };
  }

  // find the corresponding channel and dm
  const channelObj = data.channels.find(x => x.messages.map(y => y.messageId).includes(messageId));
  const dmObj = data.dms.find(x => x.messages.map(y => y.messageId).includes(messageId));

  // if both channels and dms are undefined, the messageId is invalid else determine
  // if the message was found in a dm or a channel
  let flag: string;
  if (dmObj === undefined && channelObj === undefined) {
    return { error: 'invalid messageId' };
  } else {
    flag = dmObj === undefined ? 'messageInChannel' : 'messageInDm';
  }

  if (flag === 'messageInChannel') {
    // find corresponding messageObj in channel
    const channelMsgObj = channelObj.messages.find(x => x.messageId === messageId);
    if (!channelMsgObj) {
      return { error: 'invalid messageId' };
    }

    // even if you sent the original message, you cannot edit ur own message if you left the channel
    if (!channelObj.allMembersIds.includes(userObj.uId)) {
      return { error: 'invalid uId - user is not a member of the channel' };
    }

    // only if the user is a channel owner or the orinal person who sent the message, then they can edit the message
    if (!(channelObj.ownerMembersIds.includes(userObj.uId) || channelMsgObj.uId === userObj.uId)) {
      return { error: 'user is not a channel owner or original sender' };
    }

    channelObj.messages = channelObj.messages.filter(x => x.messageId !== messageId);
  } else if (flag === 'messageInDm') {
    // find corresponding messageObj in dm
    const dmMsgObj = dmObj.messages.find(x => x.messageId === messageId);
    if (!dmMsgObj) {
      return { error: 'invalid messageId' };
    }

    // even if you sent the original message, you cannot edit ur own message if you left the dm
    if (!dmObj.memberIds.includes(userObj.uId)) {
      return { error: 'invalid uId - user is not a member of the channel' };
    }

    // only if the user is the dm owner or the orinal person who sent the message, then they can edit the message
    if (!(dmObj.creatorId === userObj.uId || dmMsgObj.uId === userObj.uId)) {
      return { error: 'user is not a channel owner or original sender' };
    }

    dmObj.messages = dmObj.messages.filter(x => x.messageId !== messageId);
  }

  setData(data);
  return {};
}

/**
  * messageSendDmV1, given a token, dmId and message, adds message to Dm and returns
  * a unique messageId
  *
  * @param {string[]} token - unique token generated from a registered user
  * @param {number} dmId - unique dm number
  * @param {string} message
  *
  * @returns {messageId: messageId} unique messageId- if no error occurs
*/
function messageSendDmV1(token: string, dmId: number, message: string) {
  const data = getData();
  token = getHash(token);

  if (message.length < 1 || message.length > 1000) {
    return { error: 'Invalid message length' };
  }

  // obtains userId respective to token
  const userObj = data.users.find(x => x.tokens.includes(token));
  if (userObj === undefined) {
    return { error: 'Invalid token' };
  }

  // messageId passed in is not found in the messages that user sent
  // for dms: go into the dms -> memberIds (check if user is part of it)
  // if is, iterate through messageId for the messages and if not found return error
  const dmObj = data.dms.find(x => x.dmId === dmId);
  if (dmObj === undefined) {
    return { error: 'Invalid dmId' };
  }

  // the messageId in message != messageId passed in AND user is not creatorId in DM or in OwnerMemberId
  if (!(dmObj.memberIds.some((x: number) => x === userObj.uId))) {
    return { error: 'Authorised user is not a member of the DM' };
  }

  // creates new message ID using a +1 mechanism
  const messageId = generateMessageId(data);

  const newMessage: Message = {
    messageId: messageId,
    uId: userObj.uId,
    message: message,
    timeSent: Math.floor(Date.now() / 1000),
  };

  dmObj.messages.unshift(newMessage);
  setData(data);
  return { messageId: messageId };
}

export { messageSendV1, messageEditV1, messageRemoveV1, messageSendDmV1 };
