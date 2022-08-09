## Environment

```
Node version 17
NPM version 8
```

## Github Settings

1. Repository for storing DID and Documents: [Fuixlabs/DID_Store](https://github.com/FuixLabs/DID_Store)
1. Repository for storing Credentials: [Fuixlabs/Credentials](https://github.com/FuixLabs/Credentials)

## Set up

1. Install modules

    ```
    npm i
    ```

1. Paste this configuration to your .env file. Replace the `<token>` with Fuixlabs's github access token.

    ```
    REPO_OWNER=FuixLabs
    DOCUMENT_REPO=DID_Store
    CREDENTIAL_REPO=Credentials
    AUTH_TOKEN=<token>
    ```

1. Run server (server will run on port 9000)

    ```
    npm start

    # Run with Nodemon
    npm run start:dev
    ```

1. Run server using Docker

    - Build Docker Container

    ```
    docker build -t <container_name> .
    ```

    - Run docker container

    ```
    docker run -it -p <host_port>:9000 <container_name>
    ```

<br />

## All The API

You can view all the API by visiting the swagger UI [here](http://localhost:9000/api-docs/#/) after start the server.
