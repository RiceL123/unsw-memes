import { Message, getData, setData, getHash } from './dataStore';
import HTTPError from 'http-errors';
import { generateMessageId } from './message';

function sendStandup(uId: number, channelId: number) {
  const data = getData();
  const channelObj = data.channels.find(x => x.channelId === channelId);
  channelObj.standupIsActive = false;
  setData(data);
  // combining all messages sent during standup into one
  if (channelObj.currStandUpQueue.length === 0) {
    return;
  }
  const standupMessage = channelObj.currStandUpQueue.join('\n');
  // packaged message is sent to the channel from the user who started the standup

  const messageId = generateMessageId();
  const newMessage: Message = {
    messageId: messageId,
    uId: uId,
    message: standupMessage,
    timeSent: channelObj.standupTimeFinish,
    reacts: [],
    isPinned: false,
  };

  channelObj.messages.unshift(newMessage);

  channelObj.currStandUpQueue = [];
  channelObj.standupOwner = -1;
  channelObj.standupTimeFinish = 0;
  setData(data);
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
  const data = getData();
  token = getHash(token);
  const currTime = Math.floor(Date.now() / 1000);

  const userObj = data.users.find(x => x.tokens.includes(token));
  if (userObj === undefined) {
    throw HTTPError(403, 'Invalid Token');
  }

  const channelObj = data.channels.find(x => x.channelId === channelId);
  if (channelObj === undefined) {
    throw HTTPError(400, 'Invalid channelId');
  }

  if (channelObj.standupIsActive === true) {
    throw HTTPError(400, 'Standup is currently active');
  }

  if (length < 0) {
    throw HTTPError(400, 'Length cannot be negative');
  }

  if (!(channelObj.allMembersIds.some((x: number) => x === userObj.uId))) {
    throw HTTPError(403, 'Authorised user is not a member of the channel');
  }

  channelObj.standupTimeFinish = currTime + length;
  channelObj.standupOwner = userObj.uId;
  channelObj.standupIsActive = true;
  setData(data);

  // when the standup ends, combine all the messages that were sent into one.
  // send that blob using messages and then clear the standup queue.
  const bufferTime = length * 1000;
  // setTimeout(sendStandup, bufferTime);
  setTimeout(() => sendStandup(userObj.uId, channelId), bufferTime);
  return { timeFinish: channelObj.standupTimeFinish };
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
  const data = getData();
  token = getHash(token);

  // Assuming that users cannot access standup infomation if they are not part of channel
  const userObj = data.users.find(x => x.tokens.includes(token));
  if (userObj === undefined) {
    throw HTTPError(403, 'Invalid Token');
  }

  const channelObj = data.channels.find(x => x.channelId === channelId);
  if (channelObj === undefined) {
    throw HTTPError(400, 'Invalid channelId');
  }

  if (!(channelObj.allMembersIds.some((x: number) => x === userObj.uId))) {
    throw HTTPError(403, 'Authorised user is not a member of the channel');
  }

  if (channelObj.standupIsActive === false) {
    channelObj.standupTimeFinish = null;
  }

  setData(data);
  return {
    isActive: channelObj.standupIsActive,
    timeFinish: channelObj.standupTimeFinish,
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
  const data = getData();
  token = getHash(token);
  console.log(token);
  const userObj = data.users.find(x => x.tokens.includes(token));
  if (userObj === undefined) {
    throw HTTPError(403, 'Invalid Token');
  }

  const channelObj = data.channels.find(x => x.channelId === channelId);
  if (channelObj === undefined) {
    throw HTTPError(400, 'Invalid channelId');
  }

  if (message.length > 1000) {
    throw HTTPError(400, 'Invalid message length');
  }

  if (channelObj.standupIsActive === false) {
    throw HTTPError(400, 'Standup is not currently active');
  }

  if (!(channelObj.allMembersIds.some((x: number) => x === userObj.uId))) {
    throw HTTPError(403, 'Authorised user is not a member of the channel');
  }

  const formattedMessage = userObj.handleStr + ': ' + message;
  channelObj.currStandUpQueue.push(formattedMessage);
  setData(data);

  return {};
}

export { standupStartV1, standupActiveV1, standupSendV1 };
