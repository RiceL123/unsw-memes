import { Data, WorkspaceStats, setData } from './dataStore';
import fs from 'fs';

/**
 * Resets the internal data of the application to its initial state
 *
 * @returns {{}} - empty object
 */
function clearV1(): Record<string, never> {
  // reset ultilization stats
  const currentTime = Math.floor(Date.now() / 1000);
  const globalStats: WorkspaceStats = {
    channels: [{ numChannelsExist: 0, timeStamp: currentTime }],
    dms: [{ numDmsExist: 0, timeStamp: currentTime }],
    messages: [{ numMessagesExist: 0, timeStamp: currentTime }]
  };

  const data: Data = {
    workspaceStats: globalStats,
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

export { clearV1 };
