import http, { IncomingMessage, Server, ServerResponse } from "http";

import { PORT } from "./common/constants/server.constants";
import { reqListener } from "./request-listener/request-listener";

export async function bootstrap(): Promise<
  Server<typeof IncomingMessage, typeof ServerResponse>
> {
  const server: Server = http.createServer(reqListener);

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
  return server;
}
