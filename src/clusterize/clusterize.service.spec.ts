import { ClusterizeConfig } from "../common/models/clusterize-config.model";
import { ClusterService } from "./clusterize.service";
const cluster = require("cluster");

const cbVal = "test";
const mockConfig: ClusterizeConfig = {
  numberOfWorkers: 1,
};

describe("Cluster Service", () => {
  let mockCb: Function;
  let loggerSpy: jest.SpyInstance
  beforeAll(() => {
    jest.mock("cluster");
    cluster.on = jest.fn();
    cluster.fork = jest.fn();
  });

  beforeEach(() => {
    loggerSpy = jest.spyOn(global.console, 'log');
    mockCb = jest.fn().mockResolvedValue(cbVal);
  });

  it("Should create workers matching configuration given from master process",async () => {
    cluster.isPrimary = true;
    const clusterService = new ClusterService(mockConfig);
    await clusterService.clusterize(mockCb);
    expect(jest.spyOn(cluster, 'fork')).toHaveBeenCalled()
    expect(clusterService.getConfig().numberOfWorkers).toEqual(1);
  });

  it("Should execute given callback from child processes", async () => {
    cluster.isPrimary = false;
    const clusterService = new ClusterService(mockConfig);
    await clusterService.clusterize(mockCb);
    expect(mockCb).toHaveBeenCalledTimes(1);
  });

  it("Should execute given callback from child processes", () => {
    cluster.isPrimary = true;
    const clusterService = new ClusterService(mockConfig);
    clusterService.handleClusterExit({process: {pid: '123'}});
    expect(loggerSpy).toHaveBeenCalledWith(`Worker 123 died.`)
  });
});
