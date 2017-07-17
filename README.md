# Frontero

## setting up entire project

1. install docker on your computer
2. run `mak build` in root dir
3. run `make run` in root dir

## setting up infrastructure only and run servers locally

1. install docker on your computer
2. run `make build` in root dir
3. set your local DNS hosts:
    - if you want your local servers to access devices on docker engine
    add the following lines to your /etc/hosts of your host machine:

```
        0.0.0.0 mongo
        0.0.0.0 redis
        0.0.0.0 analytics
        0.0.0.0 api
        0.0.0.0 updater
```

4. run `make run-infra` in root dir
    - this will run only db & analytics stuff
5. now run the servers individually. for example

```
    cd cloud
    npm run api
```

## Analytics
after setting up the project w/ docker, on your host machine:
 1. go to: `http://localhost:3003`
 2. subscribe
 3. create new organization
 4. add new data-source w/ following args: 
    - Open Data Sources from left side menu, then click on Add data source
    - Choose a name for the source and flag it as Default
    - Choose InfluxDB as type
    - Choose direct as access
    - Fill remaining fields as follows and click on Add without altering other fields
        - Url: http://localhost:8086
        - Database:   datasource
        - User: datasource
        - Password:   datasource
5. import dashboard - `Dashboard_Overview.json`
6. go to the `Overview` dashboard and enjoy!