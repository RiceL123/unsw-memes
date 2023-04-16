import { getData, getHash, Message } from './dataStore';
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
  const data = getData();
  token = getHash(token);

  const userObj = data.users.find(x => x.tokens.includes(token));
  if (!userObj) {
    throw HTTPError(403, 'Invalid token');
  }

  if (queryStr.length < 1 || queryStr.length > 1000) {
    throw HTTPError(400, 'Invalid query string length');
  }

  const messages: Message[] = [];
  const searchString = queryStr.toLowerCase();

  data.channels.forEach(channel => {
    if (channel.allMembersIds.includes(userObj.uId)) {
      channel.messages.forEach(message => {
        if (message.message.toLowerCase().includes(searchString)) {
          messages.unshift(message);
        }
      });
    }
  });

  data.dms.forEach(dm => {
    if (dm.memberIds.includes(userObj.uId)) {
      dm.messages.forEach(message => {
        if (message.message.toLowerCase().includes(searchString)) {
          messages.unshift(message);
        }
      });
    }
  });

  return { messages };
}

export { searchV1 };
