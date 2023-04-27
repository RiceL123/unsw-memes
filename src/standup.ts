import { getHash } from './dataStore';
import HTTPError from 'http-errors';
import { generateMessageId } from './message';
import { getUserWithToken } from '../database/dbUsers';
import { getChannel, getStandupMessages, insertStandupMessage, isChannelMember, removeStandupMessages, updateChannel } from '../database/dbChannels';
import { insertChannelMessage } from '../database/dbMessages';

/**
 * sendStandup combines all standup messages sent in a channel during a standup and sends them as a single
 * message to the channel.
 *
 * @param {number} uId - the user ID associated with the standup message.
 * @param {number} channelId - the ID of the channel where the standup message was sent.
 */
function sendStandup(uId: number, channelId: number) {
  updateChannel(channelId, { standupIsActive: +false, standupTimeFinish: 0, standupOwner: null });

  const standupMessages = getStandupMessages(channelId);

  // combining all messages sent during standup into one
  if (standupMessages.length === 0) {
    return;
  }

  // packaged message is sent to the channel from the user who started the standup
  const standupMessage = standupMessages.join('\n');

  const messageId = generateMessageId();

  insertChannelMessage(messageId, uId, channelId, standupMessage);

  // reset the standup queue for the channel
  removeStandupMessages(channelId);
}

/**
  * standupStartV1, given a token, channelId and length, creates a standup
  * period and returns a time finish
  *
  * @param {string[]} token - unique token generated from a registered user
  * @param {number} channelId - unique channel number
  * @param {string} length - time length
  *
  * @returns {timeFinish: number} unique messageId- if no error occurs
*/
function standupStartV1(token: string, channelId: number, length: number) {
  token = getHash(token);
  const currTime = Math.floor(Date.now() / 1000);

  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid Token');
  }

  const channel = getChannel(channelId);
  if (!channel) {
    throw HTTPError(400, 'Invalid channelId');
  }

  if (channel.standupIsActive) {
    throw HTTPError(400, 'Standup is currently active');
  }

  if (length < 0) {
    throw HTTPError(400, 'Length cannot be negative');
  }

  if (!isChannelMember(user.id, channelId)) {
    throw HTTPError(403, 'Authorised user is not a member of the channel');
  }

  const timeFinish = currTime + length;
  updateChannel(channelId, { standupIsActive: +true, standupOwner: user.id, standupTimeFinish: timeFinish });

  // when the standup ends, combine all the messages that were sent into one.
  // send that blob using messages and then clear the standup queue.
  const bufferTime = length * 1000;
  // setTimeout(sendStandup, bufferTime);
  setTimeout(() => sendStandup(user.id, channelId), bufferTime);
  return { timeFinish: timeFinish };
}

/**
  * standupActiveV1, Returns whether a standup is active.
  *
  * @param {number} channelId - unique channel number
  * @param {string} message - a message to be sent into standup
  *
  * @returns {}
  *
*/
function standupActiveV1(token: string, channelId: number) {
  token = getHash(token);

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

  const timeFinish = !channel.standupIsActive ? null : channel.standupTimeFinish;

  return {
    isActive: !!channel.standupIsActive,
    timeFinish: timeFinish,
  };
}

/**
  * standupSendV1, Returns whether a standup is active.
  *
  * @param {string[]} token - unique token generated from a registered user
  * @param {number} channelId - unique channel number
  *
  * @returns {isActive : boolean, timeFinish: number}
  *
*/
function standupSendV1(token: string, channelId: number, message: string) {
  token = getHash(token);

  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid Token');
  }

  const channel = getChannel(channelId);
  if (!channel) {
    throw HTTPError(400, 'Invalid channelId');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'Invalid message length');
  }

  if (!channel.standupIsActive) {
    throw HTTPError(400, 'Standup is not currently active');
  }

  if (!isChannelMember(user.id, channelId)) {
    throw HTTPError(403, 'Authorised user is not a member of the channel');
  }

  const formattedMessage = user.handleStr + ': ' + message;

  insertStandupMessage(channelId, formattedMessage);

  return {};
}

export { standupStartV1, standupActiveV1, standupSendV1 };
