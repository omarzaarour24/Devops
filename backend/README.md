# Short Name Search Backend
This is the backend for the Short Name Search application. 

## Modes
There are three possible modes to run this application in. You can run the application is a particular mode by setting the `NODE_ENV` environment variable.

|Mode|Description|
|---|---|
|`development`|This version will use a SQLite database, stored in the file `namesdb.sqlite`. You will have to add names to it by using the `POST /` route. |
|`testing`|This version uses an in-memory SQLite database with 2 sample records in it. This version needs to be used when you want to run the unit tests. Make sure the backend is running, before you are starting the unit tests.   |
|`production`|This version uses the PostgreSQL database. Make sure the environment variables are setup, so that the application is able to connect to the PostgreSQL server.|

## npm run commands
The following commands are available:
|Command|Description|
|---|---|
|`npm install`|Installs all necessary dependencies for this project. |
|`npm run start`|Start the webserver.   |
|`npm run lint`|Lints the application and shows the results in the console.|
|`npm run lintreport`|Lints the application and stores the linting results in the file `lintreport.html`.|
|`npm run test`|Runs the tests and shows the results in the console. Make sure the backend is running in `testing` mode, before starting the tests.|
|`npm run testreport`|Same as `npm run test`, but now the results are stored in the file `testreport.html`.|