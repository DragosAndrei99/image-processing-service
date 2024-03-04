import fs, { ReadStream } from "fs";
import { Server } from "net";
import path from "path";
import { Stream } from "stream";
const stream_promises = require("stream/promises");
import * as fs_promises from "fs/promises";
import request from "supertest";

import { HttpStatusCode } from "../../src/common/enums/http-status-codes";
import { bootstrap } from "../../src/server";
import { clearExpectations } from "../utils/mock-server";

const mockSharpStream = new Stream();
mockSharpStream["toFile"] = jest.fn();

jest.mock("fs");
jest.mock("fs/promises");
jest.mock("sharp", () =>
  jest.fn(() => ({
    resize: jest.fn().mockReturnValue(mockSharpStream),
    jpeg: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockReturnThis(),
  })),
);
jest.mock("path", () => ({
  resolve: jest.fn(),
  parse: jest.fn().mockImplementation(() => ({
    name: "image",
  })),
}));

describe("Serves images", () => {
  const mockReadStream = new Stream() as unknown as ReadStream;

  let app: Server;
  let pipelineSpy: jest.SpyInstance;
  let createReadStreamSpy: jest.SpyInstance;
  let pathResolveSpy: jest.SpyInstance;
  let fsAccessSpy: jest.SpyInstance;

  beforeAll(async () => {
    app = await bootstrap();
  });

  afterAll(() => {
    app.close();
  });

  beforeEach(() => {
    pipelineSpy = jest.spyOn(stream_promises, "pipeline");
    createReadStreamSpy = jest.spyOn(fs, "createReadStream");
    pathResolveSpy = jest.spyOn(path, "resolve");
    fsAccessSpy = jest.spyOn(fs_promises, "access");
  });

  afterEach(async () => {
    mockReadStream.removeAllListeners();
    mockSharpStream.removeAllListeners();
    jest.clearAllMocks();
    await clearExpectations();
  });

  test("Should retrieve original image", async () => {
    pathResolveSpy.mockReturnValue("/test");
    createReadStreamSpy.mockReturnValue(mockReadStream);
    pipelineSpy.mockImplementation((...streams) => {
      streams[streams.length - 1].end();
      return { catch: jest.fn() };
    });

    await request(app)
      .get("/images/image1.jpg")
      .set({})
      .expect(HttpStatusCode.OK);
  });

  test("Should retrieve image, resize it and pipe it to response", async () => {
    pathResolveSpy.mockReturnValue("/test");
    createReadStreamSpy.mockReturnValue(mockReadStream);
    fsAccessSpy.mockImplementation(() => {
      throw new Error("signaling that file has not been found");
    });
    pipelineSpy.mockImplementation((...streams) => {
      streams[streams.length - 1].end();
      return { catch: jest.fn() };
    });

    await request(app)
      .get("/images/image1.jpg?resolution=400x400")
      .set({})
      .expect(HttpStatusCode.OK);
    expect(mockSharpStream["toFile"]).toHaveBeenCalledWith(
      "images/cached/image_400_400.jpg",
    );
  });

  test("Should retrieve cached image and pipe it to response", async () => {
    pathResolveSpy.mockReturnValue("/test");
    mockReadStream["destroy"] = jest.fn();
    createReadStreamSpy.mockReturnValue(mockReadStream);
    fsAccessSpy.mockReturnValue(null);
    pipelineSpy.mockImplementation((...streams) => {
      streams[streams.length - 1].end();
      return { catch: jest.fn() };
    });
    await request(app)
      .get("/images/image1.jpg?resolution=400x400")
      .set({})
      .expect(HttpStatusCode.OK);
    expect(mockReadStream["destroy"]).toHaveBeenCalledTimes(1);
  });

  test("Should return Not Found if endpoint is not valid", async () => {
    await request(app).get("/invalid").set({}).expect(HttpStatusCode.NOT_FOUND);
  });

  test("Should return Internal Server Error if resolving path for image fails", async () => {
    pathResolveSpy.mockImplementationOnce(() => {
      throw new Error("test");
    });
    await request(app)
      .get("/images/image1.jpg")
      .set({})
      .expect(HttpStatusCode.INTERNAL_SERVER_ERROR);
  });

  test("Should return Internal Server Error if piping resized image fails", async () => {
    pathResolveSpy.mockReturnValue("/test");
    createReadStreamSpy.mockReturnValue(mockReadStream);
    fsAccessSpy.mockImplementation(() => {
      throw new Error("signaling that file has not been found");
    });
    pipelineSpy.mockImplementation(() => {
      throw new Error("test");
    });
    await request(app)
      .get("/images/image1.jpg?resolution=400x400")
      .set({})
      .expect(HttpStatusCode.INTERNAL_SERVER_ERROR);
  });
});
