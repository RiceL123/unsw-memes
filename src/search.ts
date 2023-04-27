import { getAllChannelMessagesWhereUserIsMember, getAllDmMessagesWhereUserIsMember } from '../database/dbMessages';
import { getUserWithToken } from '../database/dbUsers';
import { Message, getHash } from './dataStore';
import HTTPError from 'http-errors';

/**
 * Given a query substring, returns a collection of messages in all of the channels/DMs
 * that the user has joined that contain the query (case-insensitive). There is no
 * expected order for these messages.
 *
 * @param {string} token
 * @param {string} queryStr
 * @returns { messages }
 */
function searchV1(token: string, queryStr: string) {
  token = getHash(token);

  const user = getUserWithToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token');
  }

  if (queryStr.length < 1 || queryStr.length > 1000) {
    throw HTTPError(400, 'Invalid query string length');
  }

  const messages: Message[] = [];
  const searchString = queryStr.toLowerCase();

  const channelMessages = getAllChannelMessagesWhereUserIsMember(user.id);

  channelMessages.forEach(x => {
    if (x.message.toLowerCase().includes(searchString)) {
      messages.push(x);
    }
  });

  const dmMessages = getAllDmMessagesWhereUserIsMember(user.id);

  dmMessages.forEach(x => {
    if (x.message.toLowerCase().includes(searchString)) {
      messages.push(x);
    }
  });

  return { messages };
}

export { searchV1 };
