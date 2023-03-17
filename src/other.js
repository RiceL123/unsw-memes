import { getData, setData } from './dataStore.js';
/**
 * Resets the internal data of the application to its initial state
 *
 * @returns {{}} - empty object
 */
function clearV1() {
  const data = getData();

  data.users = [];
  data.channels = [];

  setData(data);

  return {};
}

export { clearV1 };
