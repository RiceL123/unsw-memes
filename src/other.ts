import { Data, getData, setData, getHash, Message } from './dataStore';
import fs from 'fs';
import HTTPError from 'http-errors';
/**
 * Resets the internal data of the application to its initial state
 *
 * @returns {{}} - empty object
 */
function clearV1(): Record<string, never> {
  const data: Data = {
    users: [],
    channels: [],
    dms: [],
  };

  const defaultImage = 'default.jpg';
  const directory = 'profileImages';

  fs.readdirSync(directory).forEach(file => {
    if (file !== defaultImage && file.endsWith('.jpg')) {
      fs.unlinkSync(`${directory}/${file}`);
    }
  });

  setData(data);
  return {};
}

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

  setData(data);
  return { messages };
}

export { clearV1, searchV1 };
