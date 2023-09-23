## Environment

```
Node version 17
NPM version 8
```

## Github Settings

1. Repository for storing DID and Documents: [Fuixlabs/DID_Store](https://github.com/FuixLabs/DID_Store)
1. Repository for storing Credentials: [Fuixlabs/Credentials](https://github.com/FuixLabs/Credentials)

## Set up

1. Set up `.env` file.

1. Start mongo server with Docker.

    - Ensure all Mongo configs are set in `.env`.
    - Ensure that no other service is running on the same port as the one configured for MongoDB in the `.env` file. (Use the command below to check if there is any other mongo service run in the same port)
        ```
        sudo lsof -iTCP -sTCP:LISTEN | grep mongo
        ```
    - Start docker

        ```
        docker-compose up -d
        docker ps -a
        ```

1. Install modules

    ```
    npm i
    ```

1. Run server (server will run on port 9000)

    ```
    npm start

    # Run with Nodemon
    npm run start:dev
    ```
