import fs from "fs";
import { threadId } from "worker_threads";

import { cacheImagesTtl } from "../common/constants/cache.constants";
import { cachedImagesDirectoryPath } from "../common/constants/image-processing.constants";

class CacheCleanupService {
  private cacheImagesTtl: number;
  private cachedDirPath: string;
  constructor(cacheImagesTtl: number, cachedDirPath: string) {
    this.cacheImagesTtl = cacheImagesTtl;
    this.cachedDirPath = cachedDirPath;
  }

  runImageBatchCleanup(): void {
    console.log(`Cache cleanup task has started on thread ${threadId}`);

    const allImages = fs.readdirSync(this.cachedDirPath);
    allImages.forEach((file) => {
      const filePath = `${this.cachedDirPath}${file}`;
      cacheCleanupService
        .getImageModifiedTime(filePath)
        .then((modifiedTime) => {
          const currentTime: number = new Date().getTime();
          const timeElapsed: number =
            currentTime - new Date(modifiedTime).getTime();
          if (timeElapsed >= this.cacheImagesTtl) {
            console.log(
              `Time elapsed for image ${filePath} is ${timeElapsed} and is less than TTL ${this.cacheImagesTtl}`,
            );
            return this.deleteImage(filePath);
          }
        })
        .catch((err) => {
          console.error("Error has occured when deleting images: " + err);
        });
    });
  }

  private getImageModifiedTime(filePath: string): Promise<Date> {
    return new Promise((resolve, reject) => {
      fs.stat(filePath, (err, stats) => {
        if (err) {
          reject(err);
        } else {
          resolve(stats.mtime);
        }
      });
    });
  }

  private deleteImage(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`File ${filePath} has been deleted.`);
          console.log(`Cache cleanup task finished on thread ${threadId}`);
          resolve();
        }
      });
    });
  }
}

export const cacheCleanupService = new CacheCleanupService(
  cacheImagesTtl,
  `${__dirname}${cachedImagesDirectoryPath}`,
);
