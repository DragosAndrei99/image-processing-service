import cluster from "cluster";
import { ClusterizeConfig } from "./clusterize-config.model";
import { ClusterService } from "./clusterize.service";

const cbVal = 'test'
const mockConfig: ClusterizeConfig = {
    numberOfWorkers: 1
}

describe('Cluster Service', () => {
    let mockCb;
    beforeAll(() => {
        jest.mock('cluster');
        cluster.on = jest.fn();
        cluster.fork = jest.fn();
    })

    beforeEach(() => {
        mockCb = jest.fn().mockResolvedValue(cbVal)
    })

    it('Should clusterize', () => {
        const clusterService = new ClusterService(mockConfig)
        expect(clusterService.getConfig().numberOfWorkers).toEqual(mockConfig.numberOfWorkers)
        expect(clusterService.clusterize(mockCb)).toHaveBeenCalledWith(mockCb)
    })
})