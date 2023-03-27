import { Dm, Data, getData, setData } from './dataStore';

function generateDmName(uIds: number[], data: Data) {
  return data
    .users
    .filter(x => uIds.includes(x.uId))
    .map(x => x.handleStr)
    .sort()
    .join(', ');
}

/**
 *
 * @param token
 * @param uIds
 * @returns
 */
function dmCreateV1(token: string, uIds: number[]) {
  const data: Data = getData();

  const creatorObj = data.users.find(x => x.tokens.includes(token));
  if (!creatorObj) {
    return { error: 'invalid token' };
  }

  uIds.push(creatorObj.uId);

  // check every uId in the array references a valid user
  if (!(uIds.every(x => data.users.some(y => y.uId === x)))) {
    return { error: 'invalid uId - does not refer to existing user' };
  }

  // if each uId is not unique
  if (uIds.length !== new Set(uIds).size) {
    return { error: 'invalid uId - contains duplicates' };
  }

  // generate new unique dmId
  let newDmId = 1;
  if (data.dms.length > 0) {
    newDmId = Math.max.apply(null, data.dms.map(x => x.dmId)) + 1;
  }

  // generate dmName
  const newDmName = generateDmName(uIds, data);

  const newDmObj: Dm = {
    dmId: newDmId,
    dmName: newDmName,
    creatorId: creatorObj.uId,
    memberIds: uIds,
    messages: [],
  };

  data.dms.push(newDmObj);

  setData(data);

  return { dmId: newDmId };
}

export { dmCreateV1 };
