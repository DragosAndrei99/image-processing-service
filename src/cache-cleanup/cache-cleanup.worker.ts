import cluster from "cluster";
import schedule from "node-schedule";
import { isMainThread, Worker } from "worker_threads";

import { runEvery10Seconds } from "../common/constants/cache.constants";
import { cacheCleanupService } from "./cache-cleanup.service";

/* Spawns a worker thread on the main cluster
which schedules a task to be ran for cleaning up cached images */
if (cluster.isPrimary) {
  if (isMainThread) {
    const worker: Worker = new Worker(__filename);
    console.log("Worker thread spawned on main cluster.");

    worker.on("error", (error) => {
      console.error("Worker error:", error);
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`);
      }
    });
  } else {
    // task scheduled to run every 10 seconds for demonstration purposes
    schedule.scheduleJob(runEvery10Seconds, (): void => {
      cacheCleanupService.runImageBatchCleanup();
    });
  }
}
