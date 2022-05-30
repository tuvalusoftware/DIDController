## Set up

1. Install modules

    ```
    npm i
    ```

1. Config in .env file (you can create Github auth token [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token#creating-a-token))

    ```
    REPO_OWNER=<Repository's Owner (Github username)>
    REPO_NAME=<Repository's Name>
    AUTH_TOKEN=<Github access token>
    ```

1. Run server (server will run on port 9000)

    ```
    npm run server
    ```

<br />

## All The API

You can view all the API by visiting the swagger UI after run the server.

Here is the link to Github Proxy API [http://localhost:8000/api-docs/](http://localhost:8000/api-docs/#/)
