import fs from 'fs';

import { dbClear, dbResetStats } from '../database/dbClear';

/**
 * Resets the internal data of the application to its initial state
 *
 * @returns {{}} - empty object
 */
function clearV1(): Record<string, never> {
  // reset db data
  dbClear();
  dbResetStats();

  const defaultImage = 'default.jpg';
  const directory = 'profileImages';

  fs.readdirSync(directory).forEach(file => {
    if (file !== defaultImage && file.endsWith('.jpg')) {
      fs.unlinkSync(`${directory}/${file}`);
    }
  });

  return {};
}

export { clearV1 };
