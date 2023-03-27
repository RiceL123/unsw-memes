import { Dm, Data, getData, setData } from './dataStore';

function generateDmName(uIds: number[], data: Data) {
  return data
    .users
    .filter(x => uIds.includes(x.uId))
    .map(x => x.handleStr)
    .sort((a, b) => a.localeCompare(b))
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

function dmDetailsV1(token: string, dmId: number) {
  const data: Data = getData();

  const userObj = data.users.find(x => x.tokens.includes(token));
  if (!userObj) {
    return { error: 'invalid token' };
  }

  const dmObj = data.dms.find(x => x.dmId === dmId);
  if (!dmObj) {
    return { error: 'invalid dmId' };
  }

  if (!dmObj.memberIds.includes(userObj.uId)) {
    return { error: 'invalid uId - not a member of dm' };
  }

  const members = [];
  for (const memberId of dmObj.memberIds) {
    const userObj = data.users.find(x => x.uId === memberId);

    members.push({
      uId: userObj.uId,
      email: userObj.email,
      nameFirst: userObj.nameFirst,
      nameLast: userObj.nameLast,
      handleStr: userObj.handleStr,
    });
  }

  return {
    name: dmObj.dmName,
    members: members
  };
}

export { dmCreateV1, dmDetailsV1 };
