import cluster from 'cluster';
import * as fs from 'fs';
import schedule from 'node-schedule';
import { isMainThread, threadId, Worker } from 'worker_threads';

import { runEvery10Seconds } from '../common/constants/cache.constants';
import { cachedImagesDirectoryPath } from '../common/constants/image-processing.constants';
import { cacheCleanupService } from './cache-cleanup.service';


/* Spawns a worker thread on the main cluster
which schedules a task to be ran for cleaning up cached images */
if (cluster.isPrimary) {
  if (isMainThread) {
    const worker = new Worker(__filename);
    console.log('Worker thread spawned on main cluster.')

    worker.on('error', (error) => {
      console.error('Worker error:', error);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
    });
  } else {
    // task scheduled to run every 10 seconds for demonstration purposes
    schedule.scheduleJob(runEvery10Seconds, (): void => {

      console.log(`Cache cleanup task has started on thread ${threadId}`)
      const dirPath = `${__dirname}${cachedImagesDirectoryPath}`;
      const allImages = fs.readdirSync(dirPath);

      allImages.forEach(file => {
        const filePath = `${dirPath}${file}`
        cacheCleanupService.getImageModifiedTime(filePath)
          .then((modifiedTime) => cacheCleanupService.runImageBatchCleanup(modifiedTime, filePath))
          .catch((err) => {
            console.error('Error has occured when deleting images' + err);
          })
      })
      console.log(`Cache cleanup task finished on thread ${threadId}`)
    })
  }
}


