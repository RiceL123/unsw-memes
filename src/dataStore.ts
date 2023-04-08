import fs from 'fs';
import crypto from 'crypto';

interface User {
  uId: number;
  nameFirst: string;
  nameLast: string;
  email: string;
  password: string;
  handleStr: string;
  permission: number;
  tokens: string[];
  resetCode: string;
}

interface Message {
  messageId: number;
  uId: number;
  message: string;
  timeSent: number;
}

interface Channel {
  channelId: number;
  channelName: string;
  ownerMembersIds: number[];
  allMembersIds: number[];
  isPublic: boolean;
  messages: Message[];
}

interface Dm {
  dmId: number;
  dmName: string;
  creatorId: number;
  memberIds: number[],
  messages: Message[];
}

interface Data {
  users: User[];
  channels: Channel[];
  dms: Dm[];
}

// this is where the database will maintain the persistence
const dataBasePath = 'src/database.json';

// Use getData() to access the data
function getData(): Data {
  const fileData = fs.readFileSync(dataBasePath, 'utf8');
  return JSON.parse(fileData);
}

// Use set(newData) to pass in the entire data object, with modifications made
// - Only needs to be used if you replace the data store entirely
// - Javascript uses pass-by-reference for objects... read more here: https://stackoverflow.com/questions/13104494/does-javascript-pass-by-reference
// Hint: this function might be useful to edit in iteration 2
function setData(newData: Data): void {
  fs.writeFileSync(dataBasePath, JSON.stringify(newData), { flag: 'w' });
}

const secret = '💀💀💀';

function getHash(string: string): string {
  return crypto.createHmac('sha1', secret).update(string).digest('hex');
}

export { User, Channel, Dm, Message, Data, getData, setData, getHash };
