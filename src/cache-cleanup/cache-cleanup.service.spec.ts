import * as fs from "fs";

import { cachedImagesDirectoryPath } from "../common/constants/image-processing.constants";
import { cacheCleanupService } from "./cache-cleanup.service";

jest.mock("fs", () => ({
  readdirSync: jest.fn(() => ["image1.jpg", "image2.jpg"]),
  unlink: jest.fn((_filePath, callback) => callback(null)),
  stat: jest.fn((_filePath, callback) =>
    callback(null, { mtime: new Date("2024-03-01T00:00:00Z") }),
  ),
}));

describe("Cache clean up Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should delete image if ttl expired", async () => {
    await cacheCleanupService.runImageBatchCleanup();
    expect(fs.unlink).toHaveBeenCalledWith(
      `${__dirname}${cachedImagesDirectoryPath}image1.jpg`,
      expect.any(Function),
    );
    expect(fs.unlink).toHaveBeenCalledWith(
      `${__dirname}${cachedImagesDirectoryPath}image2.jpg`,
      expect.any(Function),
    );
    expect(fs.stat).toHaveBeenCalledWith(
      `${__dirname}${cachedImagesDirectoryPath}image1.jpg`,
      expect.any(Function),
    );
    expect(fs.stat).toHaveBeenCalledWith(
      `${__dirname}${cachedImagesDirectoryPath}image2.jpg`,
      expect.any(Function),
    );
  });

  it("Should throw error if getting image modified time fails", async () => {
    try {
      (fs.stat as unknown as jest.Mock).mockImplementationOnce(
        (_filePath, callback) => callback(new Error("test")),
      );
      (fs.stat as unknown as jest.Mock).mockImplementationOnce(
        (_filePath, callback) => callback(new Error("test")),
      );
      await cacheCleanupService.runImageBatchCleanup();
      expect(fs.stat).toHaveBeenCalledWith(
        `${__dirname}${cachedImagesDirectoryPath}image1.jpg`,
        expect.any(Function),
      );
      expect(fs.stat).toHaveBeenCalledWith(
        `${__dirname}${cachedImagesDirectoryPath}image2.jpg`,
        expect.any(Function),
      );
      expect(fs.unlink).not.toHaveBeenCalled();
    } catch (error) {
      expect(error.message).toEqual("test");
    }
  });

  it("Should throw error if unlink fails", async () => {
    try {
      (fs.unlink as unknown as jest.Mock).mockImplementationOnce(
        (_filePath, callback) => callback(new Error("test")),
      );
      await cacheCleanupService.runImageBatchCleanup();
      expect(fs.stat).toHaveBeenCalledWith(
        `${__dirname}${cachedImagesDirectoryPath}image1.jpg`,
        expect.any(Function),
      );
      expect(fs.stat).toHaveBeenCalledWith(
        `${__dirname}${cachedImagesDirectoryPath}image2.jpg`,
        expect.any(Function),
      );
      expect(fs.unlink).toHaveBeenCalledWith(
        `${__dirname}${cachedImagesDirectoryPath}image1.jpg`,
        expect.any(Function),
      );
      expect(fs.unlink).toHaveBeenCalledWith(
        `${__dirname}${cachedImagesDirectoryPath}image2.jpg`,
        expect.any(Function),
      );
    } catch (error) {
      expect(error.message).toEqual("test");
    }
  });
});
