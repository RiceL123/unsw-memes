function clearV1() {
  let data = getData();
  
  data.users = [];
  data.channels = [];

  setData(data);

  return {};
}

export { clearV1 };