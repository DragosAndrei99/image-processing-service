import http from 'http';

export async function bootstrap() {

    const PORT = 3000;
    const server = http.createServer((request, response) => {
        let body: any = [];
    request
      .on('data', chunk => {
        body.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(body).toString();
        response.end(body);
      });
    });
    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`)
    })
}