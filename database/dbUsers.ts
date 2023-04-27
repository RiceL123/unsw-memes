import Database from 'better-sqlite3';
import HTTPError from 'http-errors';

const db = new Database('database/unswmemes.db', { fileMustExist: true });

export interface User {
  id: number;
  email: string;
  password: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
  permission: number;
  resetCode: string;
  profileImgUrl: string;
}

/** Insert User makes a new instance of a User in unswmems
 *  If the email or handleStr is not unique, the user will not be inserted into the db
 * 
 * 
 * @param {string} email 
 * @param {string} password 
 * @param {string} nameFirst 
 * @param {string} nameLast 
 * @param {string} handleStr 
 * @param {number} permission 
 * @param {string} resetCode 
 * @param {string} profileImgUrl 
 * @returns {number} - Returns the id of the newly inserted user (sqlite automatically generates it)
 */
function insertUser(email: string, password: string, nameFirst: string, nameLast: string, handleStr: string, permission: number, profileImgUrl: string) {
  try {
    const stmt = db.prepare(`
        INSERT INTO users (email, password, nameFirst, nameLast, handleStr, permission, profileImgUrl)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
    const info = stmt.run(email, password, nameFirst, nameLast, handleStr, permission, profileImgUrl);
    return info.lastInsertRowid as number;
  } catch (err) {
    throw HTTPError(400, 'could not insert user [handle or email already in use]');
  }
}
/** Inserts a new login session into the database with the specified user ID and token.
 * 
 * @param {number} uId - The user ID to associate with the session.
 * @param {string} token - The token to use for the session.
 * @throws {HTTPError} - Throws an HTTP error with a status code of 400 and a message of 'could not make new login session with token' if the insert fails.
*/
function insertUserSession(uId: number, token: string) {
  try {
    const stmt = db.prepare(`INSERT INTO user_tokens (user, token) VALUES (?, ?)`);
    stmt.run(uId, token);
  } catch (err) {
    throw HTTPError(400, 'could not make new login session with token');
  }
}

/** Removes the user session associated with the given token by deleting it from the 'user_tokens' table in the database.
 * 
 * @param {string} token - The session token to remove.
 * @throws {HTTPError} - If an error occurs while deleting the user session.
*/
function removeUserSession(token: string) {
  try {
    const stmt = db.prepare(`DELETE FROM user_tokens where token = ?`);
    stmt.run(token);
  } catch (err) {
    throw HTTPError(400, 'could not make new login session with token');
  }
}

/** Removes all sessions associated with a given user ID from the user_tokens table in the database.
 * 
 * @param {number} uId - the ID of the user whose sessions are to be removed
 * @throws {HTTPError} - if the deletion operation fails for any reason
*/
function removeAllUserSessions(uId: number) {
  try {
    const stmt = db.prepare(`DELETE FROM user_tokens where user = ?`);
    stmt.run(uId);
  } catch (err) {
    throw HTTPError(400, 'could not make new login session with token');
  }
}

/** Retrieves a user object from the database based on a given login token.
 * The function performs an SQL join to match the token with the corresponding
 * user id, and returns the user object associated with that id.
 * 
 * @param {string} token - The login token to match with a user id in the database.
 * @returns {User|null} - A user object containing the user's information, or null
 * if the token is invalid or no user is associated with it.
*/
function getUserWithToken(token: string): User | null {
  const stmt = db.prepare(`
    SELECT u.id, u.email, u.password, u.nameFirst, u.nameLast, u.handleStr, u.permission, u.resetCode, u.profileImgUrl
    FROM Users AS u
    INNER JOIN User_Tokens AS ut ON u.id = ut.user
    WHERE ut.token = ?
  `);
  const row = stmt.get(token);
  if (!row) {
    return null;
  }
  return row as User;
}

interface UserOptions {
  id?: number;
  email?: string;
  password?: string;
  nameFirst?: string;
  nameLast?: string;
  handleStr?: string;
  permission?: number;
  resetCode?: string;
  profileImgUrl?: string;
}

/** getUser searches the database for a user based on the provided property in the options object.
 * The options object should have only one property.
 * getUser will only return 1 user. If multiple users need to be return use getUsers() instead
 * 
 * @param {Object} options - an object with optional properties
 * @returns {User | null} - returns the found user object or null if not found
 * @throws {HTTPError} - throws an error if options object has more than one property
 */
function getUser(options: UserOptions) {
  const keys = Object.keys(options)
  if (keys.length !== 1) {
    throw HTTPError(405, 'function only accepts 1 option');
  }

  const stmt = db.prepare(`SELECT * FROM users WHERE ${keys[0]} = ?`);
  const row = stmt.get(options[keys[0]]);
  if (!row) {
    return null;
  }
  return row as User; 
}

/** Updates the user information for the specified user by userId with the provided options.
 * At least one option must be provided in the options object.
 * Constructs a SQL UPDATE statement based on the provided options, and then executes the statement using the specified userId.
 * 
 * @param {number} userId - The ID of the user to update
 * @param {UserOptions} options - An object containing options to update user information
 * @param {number} - Returns the number of rows updated in the users table
 * @throws {HTTPError} Throws a 405 HTTPError if no update options are provided
 */
function updateUserInfo(userId: number, options: UserOptions) {
  const keys = Object.keys(options);
  if (keys.length === 0) {
    throw HTTPError(405, 'At least one update option must be provided');
  }

  const setClauses = keys.map((key) => `${key} = ?`);
  const values = keys.map((key) => options[key as keyof UserOptions]);
  values.push(userId);

  const setClause = setClauses.join(', ');
  const stmt = db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`);

  try {
    const info = stmt.run(...values);
    return info.changes;
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw HTTPError(400, 'Email or handle already exists');
    }
  }
}

/** getAllUsers returns all the users in the db
 * 
 * @returns {User[]} - all the users in the db
 */
function getAllUsers() {
  const stmt = db.prepare(`SELECT * FROM Users`);
  const users = stmt.all();
  return users as User[];
}

/** function that finds all the users with a specific permission
 * 
 * @param {number} permission - permission of the query 
 */
function getAllUsersWithPermission(permission: number) {
  const stmt = db.prepare(`SELECT * FROM Users WHERE permission = ?`);
  const users = stmt.all(permission);
  return users as User[];
}

export {
  insertUser,
  insertUserSession,
  removeUserSession,
  removeAllUserSessions,
  updateUserInfo,
  getUserWithToken,
  getUser,
  getAllUsers,
  getAllUsersWithPermission
}
