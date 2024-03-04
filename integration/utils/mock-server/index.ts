const mockServer = require("mockserver-node");

const mockServerClient = require("mockserver-client").mockServerClient;
const MOCK_SERVER_HOST = "localhost";
const MOCK_SERVER_PORT = 3100;

export async function startMockServer(): Promise<void> {
  await mockServer.start_mockserver({
    serverPort: MOCK_SERVER_PORT,
    serverHost: MOCK_SERVER_HOST,
    verbose: true,
  });
}

export async function stopMockServer(): Promise<void> {
  await mockServer.stop_mockserver({
    serverPort: MOCK_SERVER_PORT,
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getMockServerClient() {
  return mockServerClient(MOCK_SERVER_HOST, MOCK_SERVER_PORT);
}

export async function clearExpectations(): Promise<void> {
  await getMockServerClient().reset();
}
