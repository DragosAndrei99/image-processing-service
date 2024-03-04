import safeStringify from "fast-safe-stringify";
import { IncomingMessage, ServerResponse } from "http";

import { HttpStatusCode } from "../common/enums/http-status-codes";
import { imageProcessingService } from "../image-processing/image-processing.service";

export async function reqListener(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const parsedUrl: URL = new URL(req.url, `http://${req.headers.host}`);
  const pathArr: string[] = parsedUrl.pathname.split("/").slice(1);
  try {
    if (req.method === "GET" && pathArr[0] === "images") {
      const imageName = pathArr[1];
      await imageProcessingService.serveImage(res, {
        imageName,
        searchParams: parsedUrl.searchParams,
      });
    } else {
      res.writeHead(HttpStatusCode.NOT_FOUND, {
        "Content-Type": "application/json",
      });
      res.end(safeStringify({ response: "Endpoint does not exist" }));
    }
  } catch (error) {
    console.error("An error occurred:", error);
    res.writeHead(HttpStatusCode.INTERNAL_SERVER_ERROR, {
      "Content-Type": "application/json",
    });
    res.end(safeStringify({ response: `An error occured: ${error.message}` }));
  }
}
