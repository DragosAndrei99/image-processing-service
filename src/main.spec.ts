import { ClusterService } from "./clusterize/clusterize.service";

describe("Image Processing Service", () => {
  let serverBootstrapFn: Function;
  let clusterizeSpy: jest.SpyInstance;

  describe("When main script running", () => {
    beforeAll(async () => {
      clusterizeSpy = jest
        .spyOn(ClusterService.prototype, "clusterize")
        .mockImplementation(jest.fn());
      serverBootstrapFn = require("./server").bootstrap = jest.fn();
      await require("./main");
    });
    afterAll(() => {
      jest.resetModules();
    });

    it("Should handle server clusterization", () => {
      expect(clusterizeSpy).toHaveBeenCalledWith(serverBootstrapFn);
    });
  });
});
