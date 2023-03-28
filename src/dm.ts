import { Dm, Data, getData, setData } from './dataStore';

interface Error {
  error: string;
}

interface DmCreateReturn {
  dmId: number;
}

interface DmDetailsReturn {
  name: string;
  members: {
    uId: number;
    email: string;
    nameFirst: string;
    nameLast: string;
    handleStr: string;
  }[];
}

/** given the data of the dataStore and an array of uIds
 * generates a string with handlestrings comma separated in
 * alphabetical order
 *
 * @param {number[]} uIds
 * @param {Data} data
 * @returns
 */
function generateDmName(uIds: number[], data: Data) {
  return data
    .users
    .filter(x => uIds.includes(x.uId))
    .map(x => x.handleStr)
    .sort((a, b) => a.localeCompare(b))
    .join(', ');
}

/** Given an array of uids and the user than calls the function, makes a
 * new dm with the creator and the members in the uIds array
 *
 * @param {string} token
 * @param {number[]} uIds
 *
 * @returns {{ dmId: number }}
 */
function dmCreateV1(token: string, uIds: number[]): Error | DmCreateReturn {
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

function dmRemoveV1(token: string, dmId: number) {
  const data = getData();

  const userObj = data.users.find(x => x.tokens.includes(token));
  if (!userObj) {
    return { error: 'invalid token' };
  }

  const dmObj = data.dms.find(x => x.dmId === dmId);
  if (!dmObj) {
    return { error: 'invalid dmId' };
  }

  if (!dmObj.memberIds.includes(userObj.uId)) {
    return { error: 'invalid uId - no longer in DM' };
  }

  // dmId is valid and the authorised user is not the original DM creator error
  if (dmObj.creatorId !== userObj.uId) {
    return { error: 'user is not DM creator' };
  }

  // IMPLEMENTATION
  data.dms = data.dms.filter(x => x.dmId !== dmObj.dmId);

  setData(data);

  return {};
}

/** Given a dmId that the user is apart of, returns information about the channel's
 * name and the members of that channel
 *
 * @param {string} token
 * @param {number} dmId
 *
 * @returns {{ name: string, members: User[] }}
 */
function dmDetailsV1(token: string, dmId: number): Error | DmDetailsReturn {
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

/** dmLeaveV1 removes the corresponding user to the token argument from
 * the dm
 *
 * @param {string} token
 * @param {number} dmId
 *
 * @returns {{}}
 */
function dmLeaveV1(token: string, dmId: number): Error | Record<string, never> {
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
    return { error: 'invalid uId - not a member' };
  }

  dmObj.memberIds = dmObj.memberIds.filter(x => x !== userObj.uId);

  setData(data);
  return {};
}

/**
 *
 * @param token
 * @returns
 */
function dmListV1(token: string) {
  const data = getData();

  const userObj = data.users.find(x => x.tokens.includes(token));
  if (!userObj) {
    return { error: 'invalid token' };
  }

  const dmsArray = [];

  for (const dm of data.dms) {
    if (dm.memberIds.some((x: number) => x === userObj.uId)) {
      dmsArray.push({
        dmId: dm.dmId,
        name: dm.dmName,
      });
    }
  }

  setData(data);
  return { dms: dmsArray };
}

export { dmCreateV1, dmDetailsV1, dmLeaveV1, dmRemoveV1, dmListV1 };
