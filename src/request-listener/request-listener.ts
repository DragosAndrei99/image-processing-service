import safeStringify from "fast-safe-stringify";
import { IncomingMessage, ServerResponse } from "http";
import path from "path";

import { HttpStatusCode } from "../common/enums/http-status-codes";
import { imageProcessingService } from "../image-processing/image-processing.service";

export async function reqListener(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`)
    const pathName = parsedUrl.pathname
    try {
        if (req.method === "GET" && pathName.startsWith("/images")) { // TODO: add validation for search params (maybe implement as a decorator)
            const imageName = path.basename(pathName)
            await imageProcessingService.serveImage(res, {imageName, searchParams: parsedUrl.searchParams});
        } else {
            res.writeHead(HttpStatusCode.NOT_FOUND, { "Content-Type": "application/json" });
            res.end(safeStringify({response: "Endpoint does not exist"}));
        }
    } catch (error) {
        console.error('An error occurred:', error);
        res.writeHead(HttpStatusCode.INTERNAL_SERVER_ERROR, { "Content-Type": "application/json" });
        const response = safeStringify({response: `An error occured: ${error.message}`})
        res.end(response);
    }
}

