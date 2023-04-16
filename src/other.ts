import { Data, setData } from './dataStore';
import fs from 'fs';

/**
 * Resets the internal data of the application to its initial state
 *
 * @returns {{}} - empty object
 */
function clearV1(): Record<string, never> {
  const data: Data = {
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
