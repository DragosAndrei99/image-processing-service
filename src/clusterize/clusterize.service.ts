import cluster from 'cluster';
import os from 'os';

const numOfCPUs = os.cpus().length;

interface ClusterizeConfig {
    numberOfWorkers?: number
}

const defaultConfig : ClusterizeConfig = {
    numberOfWorkers: numOfCPUs
}

export class ClusterService {
    readonly config: ClusterizeConfig

    constructor(config: ClusterizeConfig = defaultConfig) {
        this.config = {
            ...defaultConfig,
            ...config
        }
    }

    private getConfig() {
        return this.config
    }

    public async clusterize(callback: Function): Promise<any> {
        let done;
        if(cluster.isPrimary) {
            const numOfWorkers = this.getConfig().numberOfWorkers;
            console.log(`Setting up ${numOfWorkers} workers.`)
            if(numOfWorkers) {
                for(let i = 0; i < numOfWorkers; i++) {
                    cluster.fork();
                }
            }
            cluster.on('exit', this.handleClusterExit)
        } else {
            done = await callback();
        }
        return done;
    }

    private handleClusterExit(worker: any) {
        console.log(`Worker ${worker.process.pid} died.`)
    }

}