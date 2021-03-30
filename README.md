# Syntasso

## C Compilation and Execution Engine [![Build Status](https://travis-ci.com/roshanadh/syntasso-c-engine.svg?token=jtwD19xWMoUy4u3AdP9Q&branch=master)](https://travis-ci.com/roshanadh/syntasso-c-engine)

## Usage

-   Clone the repo and change your working directory
    ```sh
    git clone https://github.com/roshanadh/syntasso-c-engine.git && cd syntasso-c-engine
    ```
-   Install dependencies
    ```sh
    npm install
    ```
-   Create a '.env' file at the root of the project and append environment variables and their values to the file
    ```sh
    touch .env
    ```
-   Run the server
    ```sh
    npm run start:dev
    ```
-   Make requests from the [client](https://github.com/roshanadh/syntasso-c-client.git)

## Build with Docker
After cloning the repo and populating the '.env' file, you can start the engine using Docker.
* Build the image from the Dockerfile inside the project repo
    ```sh
    docker build -t img_c_engine .
    ```
* Create and run the container in detached mode using the built image
    ```sh
    docker run --privileged --name cont_c_engine -d \
    -e DOCKER_TLS_CERTDIR=/certs \
    -v cont_c_engine_certs_ca:/certs/ca \
    -v cont_c_engine_certs_client:/certs/client \
    -p 8081:8081 img_c_engine
    ```
* Start redis-server as a daemon and run the engine server
    ```sh
    docker exec -it cont_c_engine sh -c "redis-server --daemonize yes && npm run start:dev"
    ```
* Make requests from the [client](https://github.com/roshanadh/syntasso-c-client.git)

**_Check [Syntasso C Engine Wiki](https://github.com/roshanadh/syntasso-c-engine/wiki) for Engine API references_**
