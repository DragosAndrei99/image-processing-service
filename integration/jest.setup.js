module.exports = async () => {
  const mockServer = require("./utils/mock-server");
  await mockServer.startMockServer();
};
