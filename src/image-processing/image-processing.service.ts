import safeStringify from "fast-safe-stringify";
import fs from "fs";
import { ServerResponse } from "http";
import { resolve } from "path";
import sharp from "sharp";
import { Stream } from "stream";
import { pipeline } from "stream/promises";

import { imagesDirectoryPath } from "../common/constants/image-processing.constants";
import { NO_FILE_OR_DIR } from "../common/constants/server.constants";
import { HttpStatusCode } from "../common/enums/http-status-codes";
import { ImageRetrievalDTO } from "../common/models/image-retrieval.dto";

class ImageProcessing {

  async serveImage(res: ServerResponse, {imageName, searchParams}: ImageRetrievalDTO): Promise<void> {
    const imageStream = imageProcessingService.getImageStream(imageName)
    this.handleEmittedErrors(imageStream, res);

    if (searchParams.has("resolution")) {
      await this.pipeResizedImage(imageStream, res, searchParams);
    } else {
      await pipeline(imageStream, res).catch(this.logPipelineErrors);
    }
  }

  private getImageStream(
    imageName: string): fs.ReadStream {
    try {
      const path: string = resolve(`${__dirname}${imagesDirectoryPath}${imageName}`);
      const readStream: fs.ReadStream = fs.createReadStream(path);
      return readStream;
    } catch (error) {
      console.error("An error occurred while retrieving image path:", error);
      throw new Error(error.message);
    }
  }

  private getWidthAndHeight(searchParams: URLSearchParams): {
    width: number;
    height: number;
  } {
    const resolutionValue: string = searchParams.get("resolution");
    const xIndex: number = resolutionValue.indexOf("x");
    const width: number = Number(resolutionValue.slice(0, xIndex));
    const height: number = Number(
      resolutionValue.slice(xIndex + 1, resolutionValue.length),
    );
    return { width, height };
  }

  private async pipeResizedImage(
    readStream: fs.ReadStream,
    res: ServerResponse,
    searchParams: URLSearchParams,
  ): Promise<void> {
    try {
      const { width, height }: {width: number, height: number} = this.getWidthAndHeight(searchParams);
      const transformer: sharp.Sharp = sharp().resize({ width, height });
      await pipeline(readStream, transformer, res).catch(this.logPipelineErrors);
    } catch (error) {
      console.error("An error occurred while resizing image", error.message);
      throw new Error(error.message);
    }
  }

  private logPipelineErrors(err: Error): void {
    if (err) {
      console.error('Pipeline failed.', err);
    } else {
      console.log('Pipeline succeeded.');
    }
  }

  private handleEmittedErrors(stream: Stream, res:ServerResponse): void {
    stream.on('error', (error) => {
      res.statusCode = error.message.includes(NO_FILE_OR_DIR) ? HttpStatusCode.NOT_FOUND : HttpStatusCode.INTERNAL_SERVER_ERROR;
      res.setHeader('Content-Type', 'application/json') ;
      const response = safeStringify({response: `An error occured: ${error.message}`})
      res.end(response);
    });
  }
}

export const imageProcessingService = new ImageProcessing();
