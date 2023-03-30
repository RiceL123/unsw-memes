import { Message, Data, getData, setData } from './dataStore';

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

function messageSendDmV1(token: string, dmId: number, message: string) {
  const data = getData();
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

export { messageSendDmV1 };
