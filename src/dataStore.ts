import crypto from 'crypto';

export interface Reacts {
  ReactId: number;
  uIds: number[];
  isThisUserReacted: boolean;
}

export interface Message {
  messageId: number;
  uId: number;
  message: string;
  timeSent: number;
  reacts: Reacts[];
  isPinned: boolean;
}

const secret = '💀💀💀';

function getHash(string: string): string {
  return crypto.createHmac('sha1', secret).update(string).digest('hex');
}

export { getHash };
