function getEnvData(data) {
  const { list, curEnv } = data;
  const userList = [{ name: '正式环境' }];
  list.forEach((user) => {
    if (user.active) {
      user.envList.unshift({ id: '', name: '正式环境' });
      userList.push({
        name: user.name,
        envList: user.envList,
      });
    }
  });

  return { curEnv, userList };
}


export default getEnvData;
