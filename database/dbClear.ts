import Database from 'better-sqlite3';
import HTTPError from 'http-errors';

const db = new Database('database/unswmemes.db', { fileMustExist: true });

// delete all rows in the Users, Channels and Dms tables
// As other tables such as Channel_Members or Dm_Messages reference the an existing channel with a foreign key
// and use the ON DELETE CASCADE will automatically be deleted accordingly
function dbClear() {
  try {
    const stmt2 = db.prepare(`DELETE FROM Channels;`);
    stmt2.run();
    const stmt3 = db.prepare(`DELETE FROM Dms;`);
    stmt3.run();
    const stmt1 = db.prepare(`DELETE FROM Users;`);
    stmt1.run();
  } catch (err) {
    throw HTTPError(500, 'Could not clear db');
  }
}

/**
 * dbResetStats resets the statistics of the workspace, clearing all existing data and initializing new entries
 * for the number of channels, DMs, and messages that exist in the workspace. It deletes all entries from the Channels_Exist,
 * Dms_Exist, and Messages_Exist tables, and inserts new entries with a timestamp and value of 0. If the function encounters
 * an error while clearing or resetting the database, it throws an HTTP error with a status code of 500.
 */
function dbResetStats() {
  try {
    const stmt1 = db.prepare(`DELETE FROM Channels_Exist;`);
    stmt1.run();
    const stmt2 = db.prepare(`DELETE FROM Dms_Exist;`);
    stmt2.run();
    const stmt3 = db.prepare(`DELETE FROM Messages_Exist;`);
    stmt3.run();
    const stmt4 = db.prepare(`INSERT INTO Channels_Exist (numChannelsExist, timeStamp) VALUES (0, strftime('%s', 'now'));`);
    stmt4.run();
    const stmt5 = db.prepare(`INSERT INTO Dms_Exist (numDmsExist, timeStamp) VALUES (0, strftime('%s', 'now'));`);
    stmt5.run();
    const stmt6 = db.prepare(`INSERT INTO Messages_Exist (numMessagesExist, timeStamp) VALUES (0, strftime('%s', 'now'));`);
    stmt6.run();
  } catch (err) {
    throw HTTPError(500, 'Could not reset workspace stats');
  }
}

export {
  dbClear,
  dbResetStats
}