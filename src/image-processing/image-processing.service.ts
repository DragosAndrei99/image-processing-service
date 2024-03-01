import fs from "fs";
import { resolve } from "path";
import sharp from "sharp";
import { Duplex } from "stream";
import { pipeline } from "stream/promises";

import { imagesDirectoryPath } from "../common/constants/image-processing.constants";
import { ImageRetrievalDTO } from "../common/models/image-retrieval.dto";

class ImageProcessing {
  async processImage({
    imageName,
    searchParams,
  }: ImageRetrievalDTO): Promise<Duplex | fs.ReadStream> {
    try {
      const path: string = resolve(`${__dirname}${imagesDirectoryPath}${imageName}`);
      const readStream: fs.ReadStream = fs.createReadStream(path); // change this to async so it catches err in catch block
      if (searchParams.has("resolution")) {
        return await this.resizeImage(searchParams, readStream);
      }
      return readStream;
    } catch (error) {
      console.error("An error occurred while processing the image:", error);
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

  private async resizeImage(
    searchParams: URLSearchParams,
    readStream: fs.ReadStream,
  ): Promise<Duplex> {
    try {
      const { width, height }: {width: number, height: number} = this.getWidthAndHeight(searchParams);
      const transformer: sharp.Sharp = sharp().resize({ width, height });
      await pipeline(readStream, transformer);
      console.log("Resize succesful.");
      return transformer;
    } catch (error) {
      console.error("An error occurred while resizing image", error.message);
      throw new Error(error.message);
    }
  }
}

export const imageProcessingService = new ImageProcessing();
