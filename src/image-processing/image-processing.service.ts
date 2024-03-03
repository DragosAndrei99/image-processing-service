import safeStringify from "fast-safe-stringify";
import fs from "fs";
import { access } from "fs/promises";
import { ServerResponse } from "http";
import { parse, resolve } from "path";
import sharp from "sharp";
import { Stream } from "stream";
import { pipeline } from "stream/promises";

import { cachedImagesDirectoryPath, imagesDirectoryPath } from "../common/constants/image-processing.constants";
import { NO_FILE_OR_DIR } from "../common/constants/server.constants";
import { HttpStatusCode } from "../common/enums/http-status-codes";
import { ImageRetrievalDTO } from "../common/models/image-retrieval.dto";

class ImageProcessing {

  async serveImage(res: ServerResponse, { imageName, searchParams }: ImageRetrievalDTO): Promise<void> {
    try {
      const imageStream = imageProcessingService.getImageStream(imageName, imagesDirectoryPath)
      this.handleEmittedErrors(imageStream, res);

      if (searchParams.has("resolution")) {
        await this.pipeResizedImage(imageStream, res, { imageName, searchParams });
      } else {
        await pipeline(imageStream, res).catch(this.logPipelineErrors);
      }
      console.log('Pipeline succesful.') // TODO: to be removed
    } catch (error) {
      console.error("An error occurred while serving image:", error);
      throw new Error(error.message);
    }
  }

  private getImageStream(
    imageName: string,
    dirPath: string): fs.ReadStream {
    try {
      const path: string = resolve(`${__dirname}${dirPath}${imageName}`);
      const readStream: fs.ReadStream = fs.createReadStream(path);
      return readStream;
    } catch (error) {
      console.error("An error occurred while retrieving image path:", error);
      throw new Error(error.message);
    }
  }

  private async isCachedImage(imageName: string, { width, height }: { width: number, height: number }): Promise<boolean> {
    try {
      await access(`${__dirname}${cachedImagesDirectoryPath}${parse(imageName).name}_${width}_${height}.jpg`, fs.constants.F_OK)
      return true;
    } catch (error) {
      return false;
    }
  }

  private async pipeResizedImage(
    readStream: fs.ReadStream,
    res: ServerResponse,
    { imageName, searchParams }: ImageRetrievalDTO,
  ): Promise<void> {
    try {
      const { width, height }: { width: number, height: number } = this.getWidthAndHeight(searchParams);
      /* Moved cache control logic to be executed here because did not want to always call isCachedImage method in the serveImage method since
      if NO search param provided means that user is looking for original image that should either exist or not ( nothing to do with cached images )
      TODO: Might want to rethink this by taking in account how expensive is fs.promises.access call vs creating a readStream and destroying it after */
      if (await this.isCachedImage(imageName, { width, height })) {
        console.log('Trying to use cached image...')
        const cachedReadStream = this.getImageStream(`${parse(imageName).name}_${width}_${height}.jpg`, cachedImagesDirectoryPath)
        await pipeline(cachedReadStream, res).catch(this.logPipelineErrors);
        readStream.destroy();
      } else {
        console.log('Trying to resize image and caching it...')
        const transformer: sharp.Sharp = sharp().resize({ width, height });
        this.handleEmittedErrors(transformer, res);
        await pipeline(readStream, transformer, res).catch(this.logPipelineErrors);
        // saving image in memory
        transformer.toFile(`images/cached/${parse(imageName).name}_${width}_${height}.jpg`) 
      }
    } catch (error) {
      console.error("An error occurred while resizing image", error.message);
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

  private logPipelineErrors(err: Error): void {
    if (err) {
      console.error('Pipeline failed.', err);
    }
  }

  private handleEmittedErrors(stream: Stream, res: ServerResponse): void {
    stream.on('error', (error) => {
      if (!res.headersSent) {
        const statusCode = error.message.includes(NO_FILE_OR_DIR) ? HttpStatusCode.NOT_FOUND : HttpStatusCode.INTERNAL_SERVER_ERROR;
        res.writeHead(statusCode, { 'Content-Type': 'application/json' })
        const response = safeStringify({ response: `An error occured: ${error.message}` })
        res.end(response);
      }
    });
  }
}

export const imageProcessingService = new ImageProcessing();
