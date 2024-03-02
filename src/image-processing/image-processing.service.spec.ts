import safeStringify from "fast-safe-stringify";
import fs, { ReadStream } from "fs";
import { ServerResponse } from "http"
import path from "path";
import { Stream } from "stream";
import * as stream_promises from "stream/promises";

import { HttpStatusCode } from "../common/enums/http-status-codes";
import { imageProcessingService } from "./image-processing.service"

const mockSharpStream = new Stream();

jest.mock('fs')
jest.mock('sharp', () => jest.fn(() => ({
    resize: jest.fn().mockReturnValue(mockSharpStream),
    jpeg: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockReturnThis()
})))
jest.mock('stream/promises')
jest.mock('path', () => ({
    resolve: jest.fn()
}))

describe('Image processing service', () => {
    const imageName = 'example-image.jpg'
    const searchParams = new URLSearchParams('resolution=400x400')
    const mockRes = {
        end: jest.fn(),
        writeHead: jest.fn(),
        statusCode: 200,
        setHeader: jest.fn()
    } as unknown as ServerResponse
    let createReadStreamSpy: jest.SpyInstance;
    const mockReadStream = new Stream() as unknown as ReadStream;
    let pipelineSpy: jest.SpyInstance;
    let pathSpy: jest.SpyInstance;
    beforeEach(() => {
        jest.clearAllMocks();
    })
    describe('When called with resolution as a search param', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            createReadStreamSpy = jest.spyOn(fs, 'createReadStream')
            pipelineSpy = jest.spyOn(stream_promises, 'pipeline')
            pathSpy = jest.spyOn(path, 'resolve')
        })
        it('Should pipe resized image stream to response', async () => {
            pathSpy.mockReturnValue('/test')
            createReadStreamSpy.mockReturnValue(mockReadStream)
            pipelineSpy.mockReturnValue({ catch: jest.fn() })
            await imageProcessingService.serveImage(mockRes, { imageName, searchParams })
            expect(createReadStreamSpy).toHaveBeenCalled()
            expect(pipelineSpy).toHaveBeenCalledWith(mockReadStream, mockSharpStream, mockRes)
        })

        it('Should throw error when path resolve fails', async () => {
            try {
                // eslint-disable-next-line max-statements-per-line
                pathSpy.mockImplementation(() => { throw new Error('test') })
                await imageProcessingService.serveImage(mockRes, { imageName, searchParams })
                fail('Never to reach')
            } catch (error) {
                expect(error.message).toEqual('test')
            }
        })

        it('Should throw error when resize image pipeline fails', async () => {
            try {
                pathSpy.mockReturnValue('/test')
                createReadStreamSpy.mockReturnValue(mockReadStream)
                // eslint-disable-next-line max-statements-per-line
                pipelineSpy.mockImplementation(() => { throw new Error('test') })
                await imageProcessingService.serveImage(mockRes, { imageName, searchParams })
                fail('Never to reach')
            } catch (error) {
                expect(error.message).toEqual('test')
            }
        })
    });

    describe('When called without resolution as a search param', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            mockReadStream.removeAllListeners();
            mockSharpStream.removeAllListeners();
            createReadStreamSpy = jest.spyOn(fs, 'createReadStream')
            pipelineSpy = jest.spyOn(stream_promises, 'pipeline')
            pathSpy = jest.spyOn(path, 'resolve')
        })
        it('Should pipe image stream to response', async () => {
            pathSpy.mockReturnValue('/test')
            createReadStreamSpy.mockReturnValue(mockReadStream)
            pipelineSpy.mockReturnValue({ catch: jest.fn() })
            await imageProcessingService.serveImage(mockRes, { imageName, searchParams: new URLSearchParams('') })
            expect(createReadStreamSpy).toHaveBeenCalled();
            expect(pipelineSpy).toHaveBeenCalledWith(mockReadStream, mockRes)
        });

        it.each`
        mockErrMessage | statusCode
        ${"ENOENT: no such file or directory"} | ${HttpStatusCode.NOT_FOUND}
        ${"internal server error"} | ${HttpStatusCode.INTERNAL_SERVER_ERROR}
        `('Should handle emitted error based on error message $mockErrMessage and return $statusCode', async ({ mockErrMessage, statusCode }) => {
            const mockErr = {
                message: mockErrMessage
            }
            pathSpy.mockReturnValue('/test')
            createReadStreamSpy.mockReturnValue(mockReadStream)
            pipelineSpy.mockReturnValue({ catch: jest.fn() })
            await imageProcessingService.serveImage({ ...mockRes, headersSent: false } as unknown as ServerResponse, { imageName, searchParams: new URLSearchParams('') })
            mockReadStream.emit("error", mockErr);
            expect(mockRes.end).toHaveBeenCalledWith(safeStringify({ response: `An error occured: ${mockErr.message}` }))
            expect(mockRes.writeHead).toHaveBeenCalledWith(statusCode, { 'Content-Type': 'application/json' })
        })
    });
})