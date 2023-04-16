import { Message, Data, React, getData, setData, getHash } from './dataStore';
import crypto from 'crypto';
import HTTPError from 'http-errors';
import { notificationsSend } from './notifications';

/**
  * generateMessageId, a helper function that generates a unique messageId using a +1 mechanism
  * by checking all the messages in dms and all the messages in channels
  *
  * @param {data} data - extracts data from our data store.
  *
  * @returns {{messageId : Number}} - newly generated unique messageId
 */

function generateMessageId() {
  return crypto.randomInt(0, 281474976710655); // just the max crypto range
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
function messageSendV3(token: string, channelId: number, message: string) {
  const data = getData();
  token = getHash(token);

  if (message.length > 1000 || message.length < 1) {
    throw HTTPError(400, 'Invalid message length');
  }

  // obtains userId respective to token
  const userObj = data.users.find(x => x.tokens.includes(token));
  if (!userObj) {
    throw HTTPError(403, 'Invalid Token');
  }

  const channelObj = data.channels.find(x => x.channelId === channelId);
  if (!channelObj) {
    throw HTTPError(400, 'Invalid channelId');
  }

  if (!(channelObj.allMembersIds.some((x: number) => x === userObj.uId))) {
    throw HTTPError(403, 'Authorised user is not a member of the channel');
  }

  // creates new message ID using a +1 mechanism
  const messageId = generateMessageId();

  const newMessage: Message = {
    messageId: messageId,
    uId: userObj.uId,
    message: message,
    timeSent: Math.floor(Date.now() / 1000),
    reacts: [],
    isPinned: false,
  };

  channelObj.messages.unshift(newMessage);

  // notify all the users who have their handleStr tagged
  const usersToNotify = channelObj.allMembersIds.filter(x => message.includes(data.users.find(y => y.uId === x).handleStr));
  notificationsSend(data, usersToNotify, -1, channelId, userObj.handleStr, channelObj.channelName, message);

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
function messageEditV3(token: string, messageId: number, message: string) {
  const data = getData();
  token = getHash(token);

  if (message.length > 1000) {
    throw HTTPError(400, 'Invalid message length');
  }

  // obtains userId respective to token
  const userObj = data.users.find(x => x.tokens.includes(token));
  if (!userObj) {
    throw HTTPError(403, 'Invalid token');
  }

  // find the corresponding channel and dm
  const channelObj = data.channels.find(x => x.messages.map(y => y.messageId).includes(messageId));
  const dmObj = data.dms.find(x => x.messages.map(y => y.messageId).includes(messageId));

  // if both channels and dms are undefined, the messageId is invalid else determine
  // if the message was found in a dm or a channel
  let flag: string;
  if (!dmObj && !channelObj) {
    throw HTTPError(400, 'Invalid messageId');
  } else {
    flag = !dmObj ? 'messageInChannel' : 'messageInDm';
  }

  if (flag === 'messageInChannel') {
    // find corresponding messageObj in channel
    const channelMsgObj = channelObj.messages.find(x => x.messageId === messageId);

    // even if you sent the original message, you cannot edit ur own message if you left the channel
    if (!channelObj.allMembersIds.includes(userObj.uId)) {
      throw HTTPError(403, 'User is not a member or the channel');
    }

    // only if the user is a channel owner or the original person who sent the message, then they can edit the message
    if (!(channelObj.ownerMembersIds.includes(userObj.uId) || channelMsgObj.uId === userObj.uId)) {
      throw HTTPError(403, 'User is not owner or original message sender');
    }

    // update the message to new message
    channelMsgObj.message = message;

    // the message is empty, then delete the messageObj from the channel
    if (message === '') {
      channelObj.messages = channelObj.messages.filter(x => x.messageId !== messageId);
    }

    // notify all the users who have their handleStr tagged
    const usersToNotify = channelObj.allMembersIds.filter(x => message.includes(data.users.find(y => y.uId === x).handleStr));
    notificationsSend(data, usersToNotify, -1, channelObj.channelId, userObj.handleStr, channelObj.channelName, message);
  } else {
    // find corresponding messageObj in dm
    const dmMsgObj = dmObj.messages.find(x => x.messageId === messageId);

    // even if you sent the original message, you cannot edit ur own message if you left the dm
    if (!dmObj.memberIds.includes(userObj.uId)) {
      throw HTTPError(403, 'User is not a member or the channel');
    }

    // only if the user is the dm owner or the orinal person who sent the message, then they can edit the message
    if (!(dmObj.creatorId === userObj.uId || dmMsgObj.uId === userObj.uId)) {
      throw HTTPError(403, 'User is not owner or original message sender');
    }

    // update the message to new message
    dmMsgObj.message = message;

    // the message is empty, then delete the messageObj from the dm
    if (message === '') {
      dmObj.messages = dmObj.messages.filter(x => x.messageId !== messageId);
    }

    // notify all the users who have their handleStr tagged and are still members
    const usersToNotify = dmObj.memberIds.filter(x => message.includes(data.users.find(y => y.uId === x).handleStr));
    notificationsSend(data, usersToNotify, dmObj.dmId, -1, userObj.handleStr, dmObj.dmName, message);
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
function messageRemoveV3(token: string, messageId: number) {
  const data = getData();
  token = getHash(token);

  // obtains userId respective to token
  const userObj = data.users.find(x => x.tokens.includes(token));
  if (!userObj) {
    throw HTTPError(403, 'Invalid token');
  }

  // find the corresponding channel and dm
  const channelObj = data.channels.find(x => x.messages.map(y => y.messageId).includes(messageId));
  const dmObj = data.dms.find(x => x.messages.map(y => y.messageId).includes(messageId));

  // if both channels and dms are undefined, the messageId is invalid else determine
  // if the message was found in a dm or a channel
  let flag: string;
  if (!dmObj && !channelObj) {
    throw HTTPError(400, 'Invalid messageId');
  } else {
    flag = !dmObj ? 'messageInChannel' : 'messageInDm';
  }

  if (flag === 'messageInChannel') {
    // find corresponding messageObj in channel
    const channelMsgObj = channelObj.messages.find(x => x.messageId === messageId);

    // even if you sent the original message, you cannot edit ur own message if you left the channel
    if (!channelObj.allMembersIds.includes(userObj.uId)) {
      throw HTTPError(403, 'User is not a member or the channel');
    }

    // only if the user is a channel owner or the orinal person who sent the message, then they can edit the message
    if (!(channelObj.ownerMembersIds.includes(userObj.uId) || channelMsgObj.uId === userObj.uId)) {
      throw HTTPError(403, 'User is not owner or original message sender');
    }

    channelObj.messages = channelObj.messages.filter(x => x.messageId !== messageId);
  } else {
    // find corresponding messageObj in dm
    const dmMsgObj = dmObj.messages.find(x => x.messageId === messageId);

    // even if you sent the original message, you cannot remove ur own message if you left the dm
    if (!dmObj.memberIds.includes(userObj.uId)) {
      throw HTTPError(403, 'User is not a member or the channel');
    }

    // only if the user is the dm owner or the orinal person who sent the message, then they can remove the message
    if (!(dmObj.creatorId === userObj.uId || dmMsgObj.uId === userObj.uId)) {
      throw HTTPError(403, 'User is not owner or original message sender');
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
function messageSendDmV2(token: string, dmId: number, message: string) {
  const data = getData();
  token = getHash(token);

  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'Invalid message length');
  }

  // obtains userId respective to token
  const userObj = data.users.find(x => x.tokens.includes(token));
  if (!userObj) {
    throw HTTPError(403, 'Invalid token');
  }

  // messageId passed in is not found in the messages that user sent
  // for dms: go into the dms -> memberIds (check if user is part of it)
  // if is, iterate through messageId for the messages and if not found return error
  const dmObj = data.dms.find(x => x.dmId === dmId);
  if (!dmObj) {
    throw HTTPError(400, 'Invalid dmId');
  }

  // the messageId in message != messageId passed in AND user is not creatorId in DM or in OwnerMemberId
  if (!(dmObj.memberIds.some((x: number) => x === userObj.uId))) {
    throw HTTPError(403, 'Authorised user is not a member of the DM');
  }

  const messageId = generateMessageId();

  const newMessage: Message = {
    messageId: messageId,
    uId: userObj.uId,
    message: message,
    timeSent: Math.floor(Date.now() / 1000),
    reacts: [],
    isPinned: false,
  };

  dmObj.messages.unshift(newMessage);

  // notify all the users who have their handleStr tagged and are still members
  const usersToNotify = dmObj.memberIds.filter(x => message.includes(data.users.find(y => y.uId === x).handleStr));
  notificationsSend(data, usersToNotify, dmId, -1, userObj.handleStr, dmObj.dmName, message);

  setData(data);
  return { messageId: messageId };
}

/**
 * messagePinV1, given a message within a channel or DM, marks it as "pinned".
 * @param {string[]} token
 * @param {number} messageId
 *
 * @returns {{}} - returns empty object if no error
 */
function messagePinV1(token: string, messageId: number) {
  const data = getData();
  token = getHash(token);

  const userObj = data.users.find(x => x.tokens.includes(token));

  if (!userObj) {
    throw HTTPError(403, 'Invalid token');
  }
  // find the corresponding channel and dm
  const channelObj = data.channels.find(x => x.messages.map(y => y.messageId).includes(messageId));
  const dmObj = data.dms.find(x => x.messages.map(y => y.messageId).includes(messageId));

  // if both channels and dms are undefined, the messageId is invalid else determine
  // if the message was found in a dm or a channel
  let flag: string;
  if ((!dmObj) && (!channelObj)) {
    throw HTTPError(400, 'Invalid messageId');
  } else {
    flag = !dmObj ? 'messageInChannel' : 'messageInDm';
  }

  if (flag === 'messageInChannel') {
    // find corresponding messageObj in channel
    const channelMsgObj = channelObj.messages.find(x => x.messageId === messageId);

    if (channelMsgObj.isPinned === true) {
      throw HTTPError(400, 'Message is already pinned');
    }
    // only if user is channel owner or global owner
    if (!channelObj.ownerMembersIds.includes(userObj.uId) && (userObj.permission !== 1)) {
      throw HTTPError(403, 'User does not have owner permission');
    }

    channelMsgObj.isPinned = true;
  } else {
    // find corresponding messageObj in dm
    const dmMsgObj = dmObj.messages.find(x => x.messageId === messageId);

    if (dmMsgObj.isPinned === true) {
      throw HTTPError(400, 'Message is already pinned');
    }
    // only if the user is the dm owner
    if (!(dmObj.creatorId === userObj.uId)) {
      throw HTTPError(403, 'User does not have owner permissions');
    }
    dmMsgObj.isPinned = true;
  }
  setData(data);
  return {};
}

/**
 * messageUnpinV1, given a message within a channel or DM, marks it as "unpinned".
 * @param {string[]} token
 * @param {number} messageId
 *
 * @returns {{}} - returns empty object if no error
 */
function messageUnpinV1(token: string, messageId: number) {
  const data = getData();
  token = getHash(token);

  const userObj = data.users.find(x => x.tokens.includes(token));

  if (!userObj) {
    throw HTTPError(403, 'Invalid token');
  }
  // find the corresponding channel and dm
  const channelObj = data.channels.find(x => x.messages.map(y => y.messageId).includes(messageId));
  const dmObj = data.dms.find(x => x.messages.map(y => y.messageId).includes(messageId));

  // if both channels and dms are undefined, the messageId is invalid else determine
  // if the message was found in a dm or a channel
  let flag: string;
  if ((!dmObj) && (!channelObj)) {
    throw HTTPError(400, 'Invalid messageId');
  } else {
    flag = !dmObj ? 'messageInChannel' : 'messageInDm';
  }

  if (flag === 'messageInChannel') {
    // find corresponding messageObj in channel
    const channelMsgObj = channelObj.messages.find(x => x.messageId === messageId);

    if (channelMsgObj.isPinned === false) {
      throw HTTPError(400, 'Message is unpinned');
    }
    // only if user is channel owner or global owner
    if (!channelObj.ownerMembersIds.includes(userObj.uId) && (userObj.permission !== 1)) {
      throw HTTPError(403, 'User does not have owner permission');
    }

    channelMsgObj.isPinned = false;
  } else {
    // find corresponding messageObj in dm
    const dmMsgObj = dmObj.messages.find(x => x.messageId === messageId);

    if (dmMsgObj.isPinned === false) {
      throw HTTPError(400, 'Message is unpinned');
    }
    // only if the user is the dm owner
    if (!(dmObj.creatorId === userObj.uId)) {
      throw HTTPError(403, 'User does not have owner permissions');
    }
    dmMsgObj.isPinned = false;
  }
  setData(data);
  return {};
}

/** messageShare generates a new message by copying the original message and sending it
 *  in a channel or dm they are a apart of
 *
 * @param {string[]} token
 * @param {number} ogMessageId
 * @param {string} message
 * @param  {number} channelId
 * @param {number} dmId
 * @returns {{ sharedMessageId: number }} returns sharedMessageId
 */
function messageShareV1(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  const data: Data = getData();
  token = getHash(token);

  // nxor - if both / neither are channelId and dmId are equal to -1 then through an error
  if ((channelId === -1) === (dmId === -1)) {
    throw HTTPError(400, 'both / neither channelId and dmId are valid');
  }

  const userObj = data.users.find(x => x.tokens.includes(token));
  if (!userObj) {
    throw HTTPError(403, 'invalid token');
  }

  const channelOgMessageObj = data.channels.flatMap(x => x.messages).find(x => x.messageId === ogMessageId);
  const dmOgMessageObj = data.dms.flatMap(x => x.messages).find(x => x.messageId === ogMessageId);

  const ogMessageObj = !channelOgMessageObj ? dmOgMessageObj : channelOgMessageObj;

  if (!ogMessageObj) {
    throw HTTPError(400, 'ogMessageId does not refer to a valid message within a channel / dm');
  }

  const divider = '===================================================';
  const ogMessage = divider + '\n' + ogMessageObj.message + '\n' + divider;

  const newMessage = message === '' ? ogMessage : message + ogMessage;

  const sharedMessageId = generateMessageId();

  const newMessageObj: Message = {
    messageId: sharedMessageId,
    uId: userObj.uId,
    message: newMessage,
    timeSent: Math.floor(Date.now() / 1000),
    reacts: [],
    isPinned: false,
  };

  // if channelIf is -1 then share to a corresponding dm
  if (channelId === -1) {
    const dmObj = data.dms.find(x => x.dmId === dmId);

    if (!dmObj) {
      throw HTTPError(400, 'invalid dmId');
    }

    if (!dmObj.memberIds.includes(userObj.uId)) {
      throw HTTPError(403, 'the authorised user has not joined the dm');
    }

    if (message.length > 1000) {
      throw HTTPError(400, 'length of optional message is more than 1000 characters');
    }

    dmObj.messages.unshift(newMessageObj);

    // notify all the users who have their handleStr tagged that are members of the dm
    const usersToNotify = dmObj.memberIds.filter(x => message.includes(data.users.find(y => y.uId === x).handleStr));
    notificationsSend(data, usersToNotify, dmId, -1, userObj.handleStr, dmObj.dmName, message);

    // if the message is not being shared to dm, its being shared to a channel
  } else {
    const channelObj = data.channels.find(x => x.channelId === channelId);

    if (!channelObj) {
      throw HTTPError(400, 'invalid channelId');
    }

    if (!channelObj.allMembersIds.includes(userObj.uId)) {
      throw HTTPError(403, 'the authorised user has not joined the dm');
    }

    if (message.length > 1000) {
      throw HTTPError(400, 'length of optional message is more than 1000 characters');
    }

    channelObj.messages.unshift(newMessageObj);

    // notify all the users who have their handleStr tagged that are members of the channel
    const usersToNotify = channelObj.allMembersIds.filter(x => message.includes(data.users.find(y => y.uId === x).handleStr));
    notificationsSend(data, usersToNotify, -1, channelId, userObj.handleStr, channelObj.channelName, message);
  }

  setData(data);
  return {
    sharedMessageId: sharedMessageId
  };
}

/**
 * Given a message within a channel or DM the authorised user is part of,
 * adds a "react" to that particular message.
 *
 * @param {string[]} token
 * @param {number} messageId
 * @param {number} reactId
 *
 * @returns {{}} - returns empty object if successful
 */
function messageReactV1(token: string, messageId: number, reactId: number) {
  const data = getData();
  token = getHash(token);

  const userObj = data.users.find(x => x.tokens.includes(token));

  if (!userObj) {
    throw HTTPError(403, 'Invalid token');
  }

  if (reactId !== 1) {
    throw HTTPError(400, 'Invalid reactId');
  }
  // find the corresponding channel and dm
  const channelObj = data.channels.find(x => x.messages.map(y => y.messageId).includes(messageId));
  const dmObj = data.dms.find(x => x.messages.map(y => y.messageId).includes(messageId));

  // if both channels and dms are undefined, the messageId is invalid else determine
  // if the message was found in a dm or a channel
  let flag: string;
  if ((!dmObj) && (!channelObj)) {
    throw HTTPError(400, 'Invalid messageId');
  } else {
    flag = !dmObj ? 'messageInChannel' : 'messageInDm';
  }

  if (flag === 'messageInChannel') {
    const channelMsgObj = channelObj.messages.find(x => x.messageId === messageId);
    const reactsObj = channelMsgObj.reacts.find(x => x.reactId === reactId);

    // if the reaction already exists then try to push the userId into the uIds array
    if (reactsObj) {
      if (reactsObj.uIds.includes(userObj.uId)) {
        throw HTTPError(400, 'User has already reacted to message');
      }
      reactsObj.uIds.push(userObj.uId);

      // if user didn't react to their own message, and they are a still member, send a notification
      if (userObj.uId !== channelMsgObj.uId && channelObj.allMembersIds.includes(channelMsgObj.uId)) {
        notificationsSend(data, [channelMsgObj.uId], -1, channelObj.channelId, userObj.handleStr, channelObj.channelName, '', 'react');
      }
    } else {
      // if the reaction doesn't already exist then make a new reaction object
      const reactObj: React = {
        reactId: 1,
        uIds: [userObj.uId],
        isThisUserReacted: false,
      };
      // isThisUserReacted defaults to false, becomes true when in a copied array
      // of messages
      channelMsgObj.reacts.push(reactObj);

      // if user didn't react to their own message, and they are a still member, send a notification
      if (userObj.uId !== channelMsgObj.uId && channelObj.allMembersIds.includes(channelMsgObj.uId)) {
        notificationsSend(data, [channelMsgObj.uId], -1, channelObj.channelId, userObj.handleStr, channelObj.channelName, '', 'react');
      }
    }
  } else {
    const dmMsgObj = dmObj.messages.find(x => x.messageId === messageId);
    const reactsObj = dmMsgObj.reacts.find(x => x.reactId === reactId);
    // if the reaction already exists then try to push the userId into the uIds array
    if (reactsObj) {
      if (reactsObj.uIds.includes(userObj.uId)) {
        throw HTTPError(400, 'User has already reacted to message');
      }
      reactsObj.uIds.push(userObj.uId);

      // if user didn't react to their own message, and they are a still member, send a notification
      if (userObj.uId !== dmMsgObj.uId && dmObj.memberIds.includes(dmMsgObj.uId)) {
        notificationsSend(data, [dmMsgObj.uId], dmObj.dmId, -1, userObj.handleStr, dmObj.dmName, '', 'react');
      }

      // if the reaction doesn't already exist then make a new reaction object
    } else {
      const reactObj: React = {
        reactId: 1,
        uIds: [userObj.uId],
        isThisUserReacted: false,
      };
      // isThisUserReacted defaults to false, becomes true when in a copied array
      // of messages
      dmMsgObj.reacts.push(reactObj);

      // if user didn't react to their own message, and they are a still member, send a notification
      if (userObj.uId !== dmMsgObj.uId && dmObj.memberIds.includes(dmMsgObj.uId)) {
        notificationsSend(data, [dmMsgObj.uId], dmObj.dmId, -1, userObj.handleStr, dmObj.dmName, '', 'react');
      }
    }
  }
  setData(data);
  return {};
}
/**
 * Sends a message from the authorised user to the channel specified by channelId
 * automatically at a specified time in the future. The returned messageId will only
 * be considered valid for other actions
 *
 * @param {string} token
 * @param {number} channelId
 * @param {string} message
 * @param {number} timeSent
 * @returns { messageId: messageId }
 */
function messageSendLaterV1(token: string, channelId: number, message: string, timeSent: number) {
  const data: Data = getData();
  token = getHash(token);
  const currentTimestamp = Math.floor(Date.now() / 1000);

  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'Invalid message length');
  }

  const userObj = data.users.find(x => x.tokens.includes(token));
  if (!userObj) {
    throw HTTPError(403, 'Invalid token');
  }

  const channelObj = data.channels.find(x => x.channelId === channelId);
  if (!channelObj) {
    throw HTTPError(400, 'Invalid channelId');
  }

  if (!channelObj.allMembersIds.includes(userObj.uId)) {
    throw HTTPError(403, 'Authorised user is not a member of the channel');
  }

  if (timeSent < currentTimestamp) {
    throw HTTPError(400, 'timeSent is in the past');
  }

  const messageId = generateMessageId();
  setTimeout(() => {
    const data: Data = getData();

    const newMessage: Message = {
      messageId: messageId,
      uId: userObj.uId,
      message: message,
      timeSent: Math.floor(Date.now() / 1000),
      reacts: [],
      isPinned: false,
    };

    const channelObj = data.channels.find(x => x.channelId === channelId);
    channelObj.messages.unshift(newMessage);
    setData(data);
  }, (timeSent - currentTimestamp) * 1000);

  return { messageId: messageId };
}

/**
 *  * Sends a message from the authorised user to the dm specified by dmId
 * automatically at a specified time in the future. The returned messageId will only
 * be considered valid for other actions
 *
 * @param {string} token
 * @param {number} dmId
 * @param {string} message
 * @param {number} timeSent
 * @returns { messageId: messageId }
 */
function messageSendLaterDmV1(token: string, dmId: number, message: string, timeSent: number) {
  const data: Data = getData();
  token = getHash(token);
  const currentTimestamp = Math.floor(Date.now() / 1000);

  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'Invalid message length');
  }

  const userObj = data.users.find(x => x.tokens.includes(token));
  if (!userObj) {
    throw HTTPError(403, 'Invalid token');
  }

  const dmObj = data.dms.find(x => x.dmId === dmId);
  if (!dmObj) {
    throw HTTPError(400, 'Invalid dmId');
  }

  if (!dmObj.memberIds.includes(userObj.uId)) {
    throw HTTPError(403, 'Authorised user is not a member of the channel');
  }

  if (timeSent < currentTimestamp) {
    throw HTTPError(400, 'timeSent is in the past');
  }

  const messageId = generateMessageId();
  setTimeout(() => {
    const data: Data = getData();

    const newMessage: Message = {
      messageId: messageId,
      uId: userObj.uId,
      message: message,
      timeSent: Math.floor(Date.now() / 1000),
      reacts: [],
      isPinned: false,
    };

    const dmObj = data.dms.find(x => x.dmId === dmId);
    dmObj.messages.unshift(newMessage);
    setData(data);
  }, (timeSent - currentTimestamp) * 1000);

  return { messageId: messageId };
}

/**
 * Given a message within a channel or DM the authorised user is part of,
 * removes a "react" to that particular message
 * @param {number} messageId
 * @param {number} reactId
 *
 * @returns {{}} - returns empty object if successful
 */
function messageUnreactV1(token: string, messageId: number, reactId: number) {
  const data = getData();
  token = getHash(token);

  const userObj = data.users.find(x => x.tokens.includes(token));
  if (!userObj) {
    throw HTTPError(403, 'Invalid token');
  }

  if (reactId !== 1) {
    throw HTTPError(400, 'Invalid reactId');
  }
  // find the corresponding channel and dm
  const channelObj = data.channels.find(x => x.messages.map(y => y.messageId).includes(messageId));
  const dmObj = data.dms.find(x => x.messages.map(y => y.messageId).includes(messageId));

  // if both channels and dms are undefined, the messageId is invalid else determine
  // if the message was found in a dm or a channel
  let flag: string;
  if ((!dmObj) && (!channelObj)) {
    throw HTTPError(400, 'Invalid messageId');
  } else {
    flag = !dmObj ? 'messageInChannel' : 'messageInDm';
  }

  if (flag === 'messageInChannel') {
    const channelMsgObj = channelObj.messages.find(x => x.messageId === messageId);
    const reactsObj = channelMsgObj.reacts.find(x => x.reactId === reactId);
    // if the reaction already exists then try to push the userId into the uIds array
    if (!reactsObj) {
      throw HTTPError(400, 'User cannot unreact to message they have not reacted to');
    } else {
      if (!reactsObj.uIds.includes(userObj.uId)) {
        throw HTTPError(400, 'User cannot unreact to message they have not reacted to');
      }
      reactsObj.uIds = reactsObj.uIds.filter(x => x !== userObj.uId);
      if (reactsObj.uIds.length === 0) {
        channelMsgObj.reacts = channelMsgObj.reacts.filter(x => x.reactId !== reactsObj.reactId);
      }
    }
  } else {
    const dmMsgObj = dmObj.messages.find(x => x.messageId === messageId);
    const reactsObj = dmMsgObj.reacts.find(x => x.reactId === reactId);
    if (!reactsObj) {
      throw HTTPError(400, 'User cannot unreact to message they have not reacted to');
    } else {
      if (!reactsObj.uIds.includes(userObj.uId)) {
        throw HTTPError(400, 'User cannot unreact to message they have not reacted to');
      }
      reactsObj.uIds = reactsObj.uIds.filter(x => x !== userObj.uId);
      if (reactsObj.uIds.length === 0) {
        dmMsgObj.reacts = dmMsgObj.reacts.filter(x => x.reactId !== reactsObj.reactId);
      }
    }
  }
  setData(data);
  return {};
}
export { generateMessageId, messageSendV3, messageEditV3, messageRemoveV3, messageSendDmV2, messagePinV1, messageUnpinV1, messageShareV1, messageReactV1, messageUnreactV1, messageSendLaterV1, messageSendLaterDmV1 };
