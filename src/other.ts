import { Data, setData } from './dataStore';
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

  setData(data);

  return {};
}

export { clearV1 };
