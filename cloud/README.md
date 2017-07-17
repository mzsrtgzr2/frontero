
# Frontero Cloud 

## api server

the .cloud/src/api/ dir holds the code of an HTTP server that serves:
 - express routes
 - socketio connections

 we setup the HTTP server on app.js and doing the following steps:

 1. setting up loggers, configs etc (peripherials)
 2. settings up Mongoose DB
 3. settings up Passport authentication strategies
 4. settings up Bruteforce protection policies
 5. settings up Channel socketio connections
 6. setting up REST api for all entities
 7. settings up CRON tasks

### controllers

 Every controller exports a `router` function for Express-router setup of all the REST routes.

 The Channel controller is a special one because it also exports `socketSetup` - contains all socketio setup.

### Authentication -

 we have Passport for authentication. and we declare two jwt-based strategies for our 2 levels of connections:
 - developers
 - users

 - the passport strategy called `jwt-developers` is for developers authentication.
    - will be used in REST calls
 - the passport strategy called `jwt-apps` is for users to connect to an App through a Channel.
    - will be used in socketio connections

### bruteforce policies

 in app.js we defind an Object called bgPolicies which users the ratelimiter.io library
 and takes the rules from the configuration file under `limit.bruteforce`. We construct
 this Object on-the-fly using methods from `security.js` helper file. The contents of 
 the bgPolicies obj are actually express middleware, socket.io-events middleware and 
 generic ratelimiter middleware. 

 - tokenDeveloper: protect `/api/token-developer` against bot bf attacks
 - tokenApp: protect `/api/token-app` against bot bf attacks
 - team: protect against team operations for urls `/api/developer`, `/api/app` and more
 - socket: protect against operations AFTER socket has come-up for different kinds of operaitons.
 - channel/users-creations: everytime we bring a channel up (with token-app) we will need to create 
 a new user and new channel in the DB if not exist. We need to limit these db operations. 
   

### channels/socketio

 in channel.js we see the socketio setup.
 we setup authentication handling.
 we setup middleware for
 - sugar writing
 - validation
 - limiters

### limit num of open socket connections
even when a user has a valid token-app and may open many connections with socketio. 
we limit the number of open connections with a simple socket.io-events middleware 
that "catches" the requests and allow connections if maximum wasn't reached. 
we keep `socketManager` instance that remembers number of open connections per App.
Upon each connection we update the count with `sockManager.addChannelConnection` 
and we check if its allowed to open another connection 
with `sockManager.isAppAllowedNewConnection`. 

### Analytics
We send data to InfluxDB for analytics. Using CRON task to send global data. And also we forward client 
generated analytics reports from channel.operations.

## Updater

updater receives 0mq pulls and broadcast socket.io messages.

## testing 

### basic tests suite

  `npm run test:basic`

### stress tests suite

  `npm run test:stress`


## run server ##

   `npm run api`
   
   `npm run updater`






