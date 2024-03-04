import safeStringify from "fast-safe-stringify";
import { IncomingMessage, ServerResponse } from "http";

import { imageProcessingService } from "../image-processing/image-processing.service";
import { reqListener } from "./request-listener";

jest.mock("../image-processing/image-processing.service");
jest.mock("fast-safe-stringify");

describe("Request listener", () => {
  const imageName = "example-image.jpg";
  const mockReq = {
    method: "GET",
    url: `/images/${imageName}`,
    headers: {
      host: "localhost:3000",
    },
  } as unknown as IncomingMessage;
  const mockRes = {
    end: jest.fn(),
    writeHead: jest.fn(),
  } as unknown as ServerResponse;
  let serveImageSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    serveImageSpy = jest.spyOn(imageProcessingService, "serveImage");
  });
  it("Should serve image when correct url is passed", async () => {
    await reqListener(mockReq, mockRes);
    expect(serveImageSpy).toHaveBeenCalledWith(mockRes, {
      imageName,
      searchParams: new URLSearchParams(),
    });
  });

  it("Should return Not Found when incorrect url is passed", async () => {
    await reqListener(
      { ...mockReq, url: "/invalid" } as unknown as IncomingMessage,
      mockRes,
    );
    expect(serveImageSpy).not.toHaveBeenCalled();
  });

  it("Should return Internal Server Error when image serve fails", async () => {
    const errMessage = "test";
    serveImageSpy.mockRejectedValue(new Error(errMessage));
    await reqListener(mockReq, mockRes);
    expect(mockRes.end).toHaveBeenCalledWith(
      safeStringify({ response: `An error occured ${errMessage}` }),
    );
  });
});
