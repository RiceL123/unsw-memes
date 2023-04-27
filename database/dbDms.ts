import Database from 'better-sqlite3';

import { User } from './dbUsers';

const db = new Database('database/unswmemes.db', { fileMustExist: true });

interface Dm {
  id: number;
  name: string;
}

function insertDm(name: string) {
  const stmt = db.prepare(`INSERT INTO dms (name) VALUES (?)`);
  const info = stmt.run(name);
  return info.lastInsertRowid as number;
}

function removeDm(dmId: number) {
  const stmt = db.prepare(`DELETE FROM dms WHERE id = ?`);
  stmt.run(dmId);
}

function insertDmMember(uId: number, dmId: number, inserterHandle?: string, dmName?: string) {
  const stmt = db.prepare(`INSERT INTO dm_members (user, dm) VALUES (?, ?)`);
  stmt.run(uId, dmId);
  
  // if optional creatorHandle and dmNames are parsed, then notify users
  if (inserterHandle && dmName) {
    const stmt2 = db.prepare(`INSERT INTO Notifications (user, dm, message) VALUES (?, ?, ?)`);
    stmt2.run(uId, dmId, `${inserterHandle} added you to ${dmName}`)
  }
}

function insertDmOwner(uId: number, dmId: number) {
  const stmt = db.prepare(`INSERT INTO dm_owners (user, dm) VALUES (?, ?)`);
  stmt.run(uId, dmId);
}

function removeDmMember(uId: number, dmId: number) {
  const stmt = db.prepare(`DELETE FROM dm_members WHERE user = ? AND dm = ?`);
  stmt.run(uId, dmId);
}

function getDm(dmId: number) {
  const stmt = db.prepare(`SELECT * FROM dms WHERE id = ?`);
  const row = stmt.get(dmId);
  if (!row) {
    return null;
  }

  return row as Dm; 
}

function getAllDms() {
  const stmt = db.prepare(`SELECT * FROM dms`);
  const rows = stmt.all();
  return rows as Dm[];
}

function getUserDms(uId: number) {
  const stmt = db.prepare(`
  SELECT d.id, d.name
  FROM dms AS d
  INNER JOIN dm_members AS dm ON dm.dm = d.id
  WHERE dm.user = ?
  `);
  const dms = stmt.all(uId);
  return dms as Dm[];
}

function isDmMember(uId: number, dmId: number) {
  const stmt = db.prepare(`SELECT * FROM dm_members WHERE user = ? AND dm = ?`)
  const row = stmt.get(uId, dmId);
  if (!row) {
    return false;
  }
  return true;
}

function isDmOwner(uId: number, dmId: number) {
  const stmt = db.prepare(`SELECT * FROM dm_owners WHERE user = ? AND dm = ?`)
  const row = stmt.get(uId, dmId);
  if (!row) {
    return false;
  }
  return true;
}

function getDmMembers(dmId: number) {
  const stmt = db.prepare(`
  SELECT u.id, u.email, u.password, u.nameFirst, u.nameLast, u.handleStr, u.permission, u.resetCode, u.profileImgUrl
  FROM dm_members AS d
  INNER JOIN users AS u ON d.user = u.id
  WHERE d.dm = ?
  `);
  const users = stmt.all(dmId);
  if (!users) {
    return null;
  }
  return users as User[];
}

function removeUserAsMemberOfAllDms(uId: number) {
  const stmt = db.prepare(`DELETE FROM dm_members WHERE user = ?`);
  stmt.run(uId);
}

function removeUserAsOwnerOfAllDms(uId: number) {
  const stmt = db.prepare(`DELETE FROM dm_owners WHERE user = ?`);
  stmt.run(uId);
}


export {
  insertDm,
  removeDm,
  insertDmMember,
  insertDmOwner,
  removeDmMember,
  getDm,
  getAllDms,
  getUserDms,
  isDmMember,
  isDmOwner,
  getDmMembers,
  removeUserAsMemberOfAllDms,
  removeUserAsOwnerOfAllDms
}
