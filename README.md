## Environment

```
Node version 17
NPM version 8
```

## Set up

1. Install modules

    ```
    npm i
    ```

1. Paste this configuration to your .env file. Replace the with your own access token. (you can create Github auth token [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token#creating-a-token))

    ```
    REPO_OWNER=FuixLabs
    DOCUMENT_REPO=DID_Store
    MESSAGE_REPO=Credentials
    AUTH_TOKEN=<token>
    ```

1. For each repository, it should have the "main" branch and create another branch named "empty_branch" which should not have any file under that branch.

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
