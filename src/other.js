function clear() {
  let data = getData();
  
  data.users = [];
  data.channels = [];

  setData(data);

  return {};
}

export { clear };