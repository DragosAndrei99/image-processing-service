import * as http from 'http';

import { bootstrap } from './server'; // Import the function to be tested

jest.mock('http', () => ({
  createServer: jest.fn(() => ({
    listen: jest.fn((_port, callback) => callback())
  }))
}));

describe('bootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a server and listen on the specified port', async () => {
    const PORT = 3000;

    const server = await bootstrap();

    expect(http.createServer).toHaveBeenCalledWith(expect.any(Function));
    expect(server.listen).toHaveBeenCalledWith(PORT, expect.any(Function));
  });

});