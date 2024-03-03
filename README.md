# Image Processing Service

Service for serving images over HTTP and dynamically resize them based on parameters received.

---
## Prerequisites

Follow these instructions to set up and run the image service on your local machine.

### Prerequisites
Node.js installed on your machine (Download Node.js)
Images stored in a directory accessible to the server

## Installation

    $ git clone https://github.com/DragosAndrei99/image-processing-service
    $ cd image-processing-service
    $ npm install

##  Usage

    $ npm run serve:local

The service will start on the configured port (default set to PORT 3000).

### To access images, use the following endpoint:

http://localhost:3000/images/sample.jpg

### To dynamically resize an existing image, use the following endpoint:

http://localhost:3000/images/sample.jpg?resolution=400x400

#### Resolution search params must be integer numbers, bigger than 0 and respect the format: NUMBERxNUMBER


## Available images

autos-214033.jpg \
car-959464.jpg \
chair-1840011.jpg \ 
climbing-824373.jpg \  
cutlery-377700.jpg \
donkey-1639652.jpg \
giraffe-5548270.jpg \
mast-4406294.jpg \
owl-1727370.jpg \
plant-317902.jpg \

### At the moment, this project only supports images with .jpg extension