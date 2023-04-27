import { getHash } from './dataStore';
import crypto from 'crypto';
import HTTPError from 'http-errors';
import { getUserWithToken } from '../database/dbUsers';
import { getChannel, isChannelMember, isChannelOwner } from '../database/dbChannels';
import { getChannelMessage, getDmMessage, insertChannelMessage, insertChannelMessageReact, insertDmMessage, insertDmMessageReact, isThisUserReactedChannel, isThisUserReactedDm, removeChannelMessage, removeChannelMessageReact, removeDmMessage, removeDmMessageReact, updateChannelMessage, updateDmMessage } from '../database/dbMessages';
import { getDm, isDmMember, isDmOwner } from '../database/dbDms';

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
  token = getHash(token);

  if (message.length > 1000 || message.length < 1) {
    throw HTTPError(400, 'Invalid message length');
  }

  // obtains userId respective to token
  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid Token');
  }

  const channel = getChannel(channelId);
  if (!channel) {
    throw HTTPError(400, 'Invalid channelId');
  }

  if (!isChannelMember(user.id, channelId)) {
    throw HTTPError(403, 'Authorised user is not a member of the channel');
  }

  // creates new message ID using a +1 mechanism
  const messageId = generateMessageId();

  insertChannelMessage(messageId, user.id, channelId, message);

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
  token = getHash(token);

  if (message.length > 1000) {
    throw HTTPError(400, 'Invalid message length');
  }

  // obtains userId respective to token
  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  // find the corresponding channel or dm message
  const channelMsg = getChannelMessage(messageId);
  const dmMsg = getDmMessage(messageId);

  // if both channels and dms are undefined, the messageId is invalid else determine
  // if the message was found in a dm or a channel
  if (!dmMsg && !channelMsg) {
    throw HTTPError(400, 'Invalid messageId');
  }

  // if the dmMsg returns null
  if (!dmMsg) {
    // even if you sent the original message, you cannot edit ur own message if you left the channel
    if (!isChannelMember(user.id, channelMsg.channel)) {
      throw HTTPError(403, 'User is not a member or the channel');
    }

    // only if the user is a channel owner or the original person who sent the message, then they can edit the message
    if (!(isChannelOwner(user.id, channelMsg.channel) || channelMsg.user === user.id)) {
      throw HTTPError(403, 'User is not owner or original message sender');
    }

    // if the message is empty remove it, else update the message
    if (message === '') {
      removeChannelMessage(messageId);
    } else {
      updateChannelMessage(messageId, { message: message }, channelMsg.channel, user.handleStr);
    }
  } else {
    // even if you sent the original message, you cannot edit ur own message if you left the dm
    if (!isDmMember(user.id, dmMsg.dm)) {
      throw HTTPError(403, 'User is not a member or the channel');
    }

    // only if the user is the dm owner or the orinal person who sent the message, then they can edit the message
    if (!(isDmOwner(user.id, dmMsg.dm) || dmMsg.user === user.id)) {
      throw HTTPError(403, 'User is not owner or original message sender');
    }

    // if the message is empty delete it else update the message
    if (message === '') {
      removeDmMessage(messageId);
    } else {
      updateDmMessage(messageId, { message: message }, dmMsg.dm, user.handleStr);
    }
  }

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
  token = getHash(token);

  // obtains userId respective to token
  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  // find the corresponding channel or dm message
  const channelMsg = getChannelMessage(messageId);
  const dmMsg = getDmMessage(messageId);

  // if both channels and dms are undefined, the messageId is invalid else determine
  // if the message was found in a dm or a channel
  if (!channelMsg && !dmMsg) {
    throw HTTPError(400, 'Invalid messageId');
  }

  // if the sent message was from a channel
  if (!dmMsg) {
    // even if you sent the original message, you cannot edit ur own message if you left the channel
    if (!isChannelMember(user.id, channelMsg.channel)) {
      throw HTTPError(403, 'User is not a member or the channel');
    }

    // only if the user is a channel owner or the orinal person who sent the message, then they can edit the message
    if (!(isChannelOwner(user.id, channelMsg.channel) || channelMsg.user === user.id)) {
      throw HTTPError(403, 'User is not owner or original message sender');
    }

    removeChannelMessage(messageId);
  } else {
    // even if you sent the original message, you cannot remove ur own message if you left the dm
    if (!isDmMember(user.id, dmMsg.dm)) {
      throw HTTPError(403, 'User is not a member or the channel');
    }

    // only if the user is the dm owner or the orinal person who sent the message, then they can remove the message
    if (!(isDmOwner(user.id, dmMsg.dm) || dmMsg.user === user.id)) {
      throw HTTPError(403, 'User is not owner or original message sender');
    }

    removeDmMessage(messageId);
  }

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
  token = getHash(token);

  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'Invalid message length');
  }

  // obtains userId respective to token
  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  // messageId passed in is not found in the messages that user sent
  // for dms: go into the dms -> memberIds (check if user is part of it)
  // if is, iterate through messageId for the messages and if not found return error
  const dmObj = getDm(dmId);
  if (!dmObj) {
    throw HTTPError(400, 'Invalid dmId');
  }

  if (!isDmMember(user.id, dmId)) {
    throw HTTPError(403, 'Authorised user is not a member of the DM');
  }

  const messageId = generateMessageId();

  insertDmMessage(messageId, user.id, dmId, message);

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
  token = getHash(token);

  const user = getUserWithToken(token);

  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }
  // find the corresponding channel and dm msg
  const channelMsg = getChannelMessage(messageId);
  const dmMsg = getDmMessage(messageId);

  // if both channels and dms are undefined, the messageId is invalid else determine
  // if the message was found in a dm or a channel
  if (!dmMsg && !channelMsg) {
    throw HTTPError(400, 'Invalid messageId');
  }

  // if the dmMsg is null then update the corresponding channel message
  if (!dmMsg) {
    // only if user is channel owner or global owner
    if (!isChannelOwner(user.id, channelMsg.channel) && (user.permission !== 1)) {
      throw HTTPError(403, 'User does not have owner permission');
    }

    // if the message is already pinned throw an error
    if (channelMsg.isPinned) {
      throw HTTPError(400, 'Message is already pinned');
    }

    updateChannelMessage(messageId, { isPinned: +true });
  } else {
    // only if the user is the dm owner
    if (!isDmOwner(user.id, dmMsg.dm)) {
      throw HTTPError(403, 'User does not have owner permissions');
    }

    // if the dm is already pinned throw an error
    if (dmMsg.isPinned) {
      throw HTTPError(400, 'Message is already pinned');
    }

    updateDmMessage(messageId, { isPinned: +true });
  }
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
  token = getHash(token);

  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }
  // find the corresponding channel and dm msg
  const channelMsg = getChannelMessage(messageId);
  const dmMsg = getDmMessage(messageId);

  // if both channels and dms are undefined, the messageId is invalid else determine
  // if the message was found in a dm or a channel
  if (!dmMsg && !channelMsg) {
    throw HTTPError(400, 'Invalid messageId');
  }

  // if the dmMsg is null then update the corresponding channel message
  if (!dmMsg) {
    // only if user is channel owner or global owner
    if (!isChannelOwner(user.id, channelMsg.channel) && (user.permission !== 1)) {
      throw HTTPError(403, 'User does not have owner permission');
    }

    if (!channelMsg.isPinned) {
      throw HTTPError(400, 'Message is unpinned');
    }

    updateChannelMessage(messageId, { isPinned: +false });
  } else {
    // only if the user is the dm owner
    if (!isDmOwner(user.id, dmMsg.dm)) {
      throw HTTPError(403, 'User does not have owner permissions');
    }

    if (!dmMsg.isPinned) {
      throw HTTPError(400, 'Message is unpinned');
    }

    updateDmMessage(messageId, { isPinned: +false });
  }

  return {};
}

function messageShareToChannel(channelId: number, uId: number, messageId: number, message: string) {
  const channel = getChannel(channelId);
  if (!channel) {
    throw HTTPError(400, 'invalid channelId');
  }

  if (!isChannelMember(uId, channelId)) {
    throw HTTPError(403, 'the authorised user has not joined the channel to share to');
  }
  insertChannelMessage(messageId, uId, channelId, message);
}

function messageShareToDm(dmId: number, uId: number, messageId: number, message: string) {
  const dm = getDm(dmId);
  if (!dm) {
    throw HTTPError(400, 'invalid dmId');
  }

  if (!isDmMember(uId, dmId)) {
    throw HTTPError(403, 'the authorised user has not joined the dm to share to');
  }
  insertDmMessage(messageId, uId, dmId, message);
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
  token = getHash(token);

  // nxor - if both / neither are channelId and dmId are equal to -1 then through an error
  if ((channelId === -1) === (dmId === -1)) {
    throw HTTPError(400, 'both / neither channelId and dmId are valid');
  }

  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'invalid token');
  }

  const channelOgMessage = getChannelMessage(ogMessageId);
  const dmOgMessage = getDmMessage(ogMessageId);

  if (!channelOgMessage && !dmOgMessage) {
    throw HTTPError(400, 'ogMessageId does not refer to a valid message within a channel / dm');
  }

  const sharedMessageId = generateMessageId();

  // if channelIf is -1 then share to a corresponding dm
  if (!channelOgMessage) {
    // user must be sharing a message to a dm they are a part of
    if (!isDmMember(user.id, dmOgMessage.dm)) {
      throw HTTPError(403, 'the authorised user has not joined the dm where the og message exists');
    }

    if (message.length > 1000) {
      throw HTTPError(400, 'length of optional message is more than 1000 characters');
    }

    const divider = '\n===================================================';
    const messageToShare = divider + '\n' + dmOgMessage.message + divider;

    const newMessage = message === '' ? messageToShare : message + messageToShare;

    // check where to share to
    if (dmId === -1) {
      messageShareToChannel(channelId, user.id, sharedMessageId, newMessage);
    } else {
      messageShareToDm(dmId, user.id, sharedMessageId, newMessage);
    }

    // if the message is not being shared to dm, its being shared to a channel
  } else {
    if (message.length > 1000) {
      throw HTTPError(400, 'length of optional message is more than 1000 characters');
    }

    if (!isChannelMember(user.id, channelOgMessage.channel)) {
      throw HTTPError(403, 'the authorised user has not joined the channel the where the og message exists');
    }

    const divider = '\n===================================================';
    const messageToShare = divider + '\n' + channelOgMessage.message + divider;

    const newMessage = message === '' ? messageToShare : message + messageToShare;

    // check where to share to
    if (dmId === -1) {
      messageShareToChannel(channelId, user.id, sharedMessageId, newMessage);
    } else {
      messageShareToDm(dmId, user.id, sharedMessageId, newMessage);
    }
  }

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
  token = getHash(token);

  const user = getUserWithToken(token);

  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  if (reactId !== 1) {
    throw HTTPError(400, 'Invalid reactId');
  }

  // find the corresponding channel and dm msg
  const channelMsg = getChannelMessage(messageId);
  const dmMsg = getDmMessage(messageId);

  // if both channels and dms are undefined, the messageId is invalid else determine
  // if the message was found in a dm or a channel
  if (!channelMsg && !dmMsg) {
    throw HTTPError(400, 'Invalid messageId');
  }

  // if the dmMsg is null then edit the channel message reacts accordingly else the dm message reacts
  if (!dmMsg) {
    if (isThisUserReactedChannel(user.id, messageId, reactId)) {
      throw HTTPError(400, 'User has already reacted to message');
    }

    insertChannelMessageReact(user.id, user.handleStr, messageId, reactId, channelMsg.user, channelMsg.channel);
  } else {
    if (isThisUserReactedDm(user.id, messageId, reactId)) {
      throw HTTPError(400, 'User has already reacted to message');
    }

    insertDmMessageReact(user.id, user.handleStr, messageId, reactId, dmMsg.user, dmMsg.dm);
  }

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
  const currentTimestamp = Math.floor(Date.now() / 1000);
  token = getHash(token);

  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'Invalid message length');
  }

  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  const channel = getChannel(channelId);
  if (!channel) {
    throw HTTPError(400, 'Invalid channelId');
  }

  if (!isChannelMember(user.id, channelId)) {
    throw HTTPError(403, 'Authorised user is not a member of the channel');
  }

  if (timeSent < currentTimestamp) {
    throw HTTPError(400, 'timeSent is in the past');
  }

  const messageId = generateMessageId();

  setTimeout(() => {
    insertChannelMessage(messageId, user.id, channelId, message);
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
  const currentTimestamp = Math.floor(Date.now() / 1000);
  token = getHash(token);

  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'Invalid message length');
  }

  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  const dm = getDm(dmId);
  if (!dm) {
    throw HTTPError(400, 'Invalid dmId');
  }

  if (!isDmMember(user.id, dmId)) {
    throw HTTPError(403, 'Authorised user is not a member of the channel');
  }

  if (timeSent < currentTimestamp) {
    throw HTTPError(400, 'timeSent is in the past');
  }

  const messageId = generateMessageId();
  setTimeout(() => {
    insertDmMessage(messageId, user.id, dmId, message);
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
  token = getHash(token);

  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  if (reactId !== 1) {
    throw HTTPError(400, 'Invalid reactId');
  }
  // find the corresponding channel and dm
  const channelMsg = getChannelMessage(messageId);
  const dmMsg = getDmMessage(messageId);

  // if both channels and dms are undefined, the messageId is invalid else determine
  // if the message was found in a dm or a channel
  if (!channelMsg && !dmMsg) {
    throw HTTPError(400, 'Invalid messageId');
  }

  if (!dmMsg) {
    if (!isThisUserReactedChannel(user.id, messageId, reactId)) {
      throw HTTPError(400, 'User cannot unreact to message they have not reacted to');
    }

    removeChannelMessageReact(user.id, messageId, reactId);
  } else {
    if (!isThisUserReactedDm(user.id, messageId, reactId)) {
      throw HTTPError(400, 'User cannot unreact to message they have not reacted to');
    }

    removeDmMessageReact(user.id, messageId, reactId);
  }

  return {};
}
export { generateMessageId, messageSendV3, messageEditV3, messageRemoveV3, messageSendDmV2, messagePinV1, messageUnpinV1, messageShareV1, messageReactV1, messageUnreactV1, messageSendLaterV1, messageSendLaterDmV1 };
