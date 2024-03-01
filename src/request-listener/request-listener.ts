import safeStringify from "fast-safe-stringify";
import { IncomingMessage, ServerResponse } from "http";
import path from "path";
import { pipeline } from "stream/promises";

import { NO_FILE_OR_DIR } from "../common/constants/server.constants";
import { HttpStatusCode } from "../common/enums/http-status-codes";
import { ImageRetrievalDTO } from "../common/models/image-retrieval.dto";
import { imageProcessingService } from "../image-processing/image-processing.service";

export async function reqListener(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`)
    const pathName = parsedUrl.pathname
    try {
        if (req.method === "GET" && pathName.startsWith("/images")) {
            const imageName = path.basename(pathName)
            await serveImage(res, {imageName, searchParams: parsedUrl.searchParams});
        } else {
            res.writeHead(HttpStatusCode.NOT_FOUND, { "Content-Type": "application/json" });
            res.end(safeStringify({response: "Endpoint does not exist"}));
        }
    } catch (error) {
        console.error('An error occurred:', error);
        res.statusCode = error.message.includes(NO_FILE_OR_DIR) ? HttpStatusCode.NOT_FOUND : HttpStatusCode.INTERNAL_SERVER_ERROR;
        res.setHeader('Content-Type', 'application/json') ;
        const response = safeStringify({response: `An error occured: ${error.message}`})
        res.end(response);
    }
}

async function serveImage(res: ServerResponse, {imageName, searchParams}: ImageRetrievalDTO): Promise<void> {
  const imageStream = await imageProcessingService.processImage({imageName, searchParams})
  await pipeline(imageStream, res)
}