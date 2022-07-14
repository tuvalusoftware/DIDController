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

1. Config in .env file (you can create Github auth token [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token#creating-a-token))
   There are 2 repositories required: One for saving Document and One for saving Message (notification).

    ```
    REPO_OWNER=kazCTU1077
    DOCUMENT_REPO=Fuixlabs_Document
    MESSAGE_REPO=FuixLabs_Message
    AUTH_TOKEN=<token>
    ```

1. For each repository, it should have the "main" branch and create another branch named "empty_branch" which should not have any file under that branch.

1. Run server (server will run on port 9000)

    ```
    npm start

    <!-- Run with Nodemon -->
    npm run start:dev
    ```

<br />

## All The API

You can view all the API by visiting the swagger UI [here](http://localhost:9000/api-docs/#/) after start the server.
