import { AddressInfo, Server } from "net";

import { PORT } from "./common/constants/server.constants";


describe('Image Processing Service Server', () => {
    let server: Server;
    let addressInfo: AddressInfo;
    let port: number;
    beforeAll(async () => {
        server = await require('./server').bootstrap();
    })
    afterAll((done) => {
        server.close(done)
        jest.resetModules();
    })

    beforeEach(() => {
        addressInfo = server.address() as AddressInfo;
        port = Number(addressInfo.port)
    })

    it('Should listen on given port', () => {
        expect(port).toEqual(PORT)
    })

})