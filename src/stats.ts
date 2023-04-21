import { Data, Stats, getData, getHash } from './dataStore';
import HTTPError from 'http-errors';

function calcInvolementRate(data: Data, userStats: Stats) {
  const numChannels = data.channels.length;
  const numDms = data.dms.length;
  const numMsgs = data.channels.flatMap(x => x.messages).length + data.dms.flatMap(x => x.messages).length;

  const denominator = numChannels + numDms + numMsgs;

  const numChannelsJoined = userStats.channels.at(-1).numChannelsJoined;
  const numDmsJoined = userStats.channels.at(-1).numChannelsJoined;
  const numMessagesSent = userStats.messages.at(-1).numMessagesSent;

  let involvementRate = denominator === 0 ? 0 : (numChannelsJoined + numDmsJoined + numMessagesSent) / denominator;

  if (involvementRate > 1) involvementRate = 1;

  return involvementRate;
}

function calcUtilizationRate(data: Data) {
  const utilizingUsers = data.users.filter(x => data.channels.some(y => y.allMembersIds.includes(x.uId)) || data.dms.some(y => y.memberIds.includes(x.uId))).length;
  return utilizingUsers / data.users.length;
}

function userStats(token: string) {
  const data = getData();
  token = getHash(token);

  const userObj = data.users.find(x => x.tokens.includes(token));
  if (!userObj) {
    throw HTTPError(403, 'invalid token');
  }

  const involvementRate = calcInvolementRate(data, userObj.stats);

  const userStats = {
    channelsJoined: userObj.stats.channels,
    dmsJoined: userObj.stats.dms,
    messagesSent: userObj.stats.messages,
    involvementRate: involvementRate
  };

  return { userStats: userStats };
}

function usersStats(token: string) {
  const data = getData();
  token = getHash(token);

  const userObj = data.users.find(x => x.tokens.includes(token));
  if (!userObj) {
    throw HTTPError(403, 'invalid token');
  }

  const utilizationRate = calcUtilizationRate(data);

  const workspaceStats = {
    channelsExist: data.workspaceStats.channels,
    dmsExist: data.workspaceStats.dms,
    messagesExist: data.workspaceStats.messages,
    utilizationRate: utilizationRate
  };

  return { workspaceStats: workspaceStats };
}

export { userStats, usersStats };
