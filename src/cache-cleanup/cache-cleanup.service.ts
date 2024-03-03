import fs from "fs";

import { cacheImagesTtl } from '../common/constants/cache.constants';


class CacheCleanupService {
  private cacheImagesTtl: number;
  constructor(cacheImagesTtl: number) {
    this.cacheImagesTtl = cacheImagesTtl
  }

  runImageBatchCleanup(modifiedTime: Date, filePath: string): Promise<void> {
    const currentTime: number = new Date().getTime();
    const timeElapsed: number = currentTime - new Date(modifiedTime).getTime();

    if (timeElapsed >= cacheImagesTtl) {
      return this.deleteImage(filePath)
    }
  }

  getImageModifiedTime(filePath: string): Promise<Date> {
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

  deleteImage(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`File ${filePath} has been deleted.`)
          resolve();
        }
      });
    });
  }
}

export const cacheCleanupService = new CacheCleanupService(cacheImagesTtl);