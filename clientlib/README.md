
# Frontero-Core

## intro
**Frontero** is a solution for developers to quickly embed social services in their applications and websites.

**Frontero-Core** (**FC** from now on)  is a Javascript module that interfaces Frontero Users services. 

**Frontero-Team-Core** (**FTC** from now on) is a Javascript module that interfaces Frontero Administrative services. It's called 'TeamCore' because Frontero-team uses it in Dashboards etc.


## Entities

 - **Developer** = A Developer that requires Frontero’s services 
 - **App** = ADeveloper can create many apps. Usually, an App means a webapp or mobile-app that a Developer develops.    
 - **User** = A User that uses an  App 
 -  **Channel** = a socialcontext within an App. Examples: A Channel can be a page, topic or any taggable entity in an App   
 - **Push** = Any data added to a Channel. Usually, a post, message, topic, etc. 
	 - Pushes have *hierarchy*.  
	 - If a Channel is flat (like a standard whatsapp chat), all its pushes have hierarchy-level of 0. 
	 - Other Channels types, for example - like a facebook feed, have
   0-level Pushes (Posts) and 1-level Pushes (Comments). 



## audience

 1. A Developer should use FC in JS projects to use Frontero.
	 - *Channel operations* are to be used to managed Social operations related to a Channel.
 2. Frontero team should use FC to build Dashboards.
	 - *Developer/App operations* are to create/edit/update/delete Developer accounts and App related to them.
 

## usage - Team

### setup

Create an instance of **FronteroTeamCore** class:

	const {FronteroTeamCore} = require('fronteroTeamCore');
	
    let frontero = new FronteroTeamCore({
		    endPoint: `http://localhost:3030`
        });
 
### administrative operations
#### Developer API

Get the Developer API handler:

    let developer = frontero.developer();

Use the following methods:

    developer.create ({
            email: ...,
            username: ...
            password: ...
        }).then( successHandler, errorHandler);
        
    developer.update ({
            email: ...,
            username: ...
            password: ...
        }).then( successHandler, errorHandler);

To use an existing Developer account, just use 

    frontero.authenticate({
                username: ...,
                password: ...
            })
            .then(() => { 
                // success
            }, () => {
                // error
            });
    
You'll have to authenticate Developer that to use the **App API**

List all Developer's Apps:

    developer.getApps()
            .then((apps) => { 
                // success
            }, (err) => {
                // error
            });
    

#### App API

Create a new App:

    developer.createApp ({
                name: ...
            }).then( app => {
                // success
                // app is instance of App class
                // you can access:
                // app.id
                // app.name
                // app.key
                // app.secret
                // and methods
            }, 
            errorHandler);

Use the following methods:

        
    app.update ({
            name: ...
        }).then((res) => { });
    
    app.delete ().then((res) => { }, (err)=>{} );
       

`app._data` holds the actual app data received from Frontero services.

Two very important variables are the `key` and `secret` which can be found:

    let key = app.key;
    let secret = app.secret;

These credentials are used for Channel authentication.
    

## usage - User connection

### setup

Create an instance of **FronteroCore** class:

    const {FronteroCore} = require('fronteroCore');
    
    let frontero = new FronteroCore({
		    endPoint: `http://localhost:3030`
        });
 
### App API


    let app = frontero.app({
                key: key,
                secret: secret,
                user: {
				    username: ...,
				    email: ...,
				    pic: ...
	    		}
         });
         
    app.connect()
        .then(
            (app)=>{ 
                // on success
                // ~~~~~~~~~~~~~~~~~~~~~~~~~~~
                // Do App operations here!
                // ~~~~~~~~~~~~~~~~~~~~~~~~~~~	
            },
            (err)=>{
                // handle error
            }
        );
 
 
**Query** latest Channels:

    channel.send('channel:query', {
	    offset: ..., // default is 0
	    limit: ... // default is 10
	}).then(
         channels=>{ // success
               ...   
         }, err => { // fail
               ...
         });


### Channel API

First, **login** to a Channel w/ specific User information:

    let channel = frontero.channel({
                channelName: ... ,
                key: key,
                secret: secret,
                user: {
				    username: ...,
				    email: ...,
				    pic: ...
	    		}
         });
         
    channel.connect()
        .then(
            (channel)=>{ 
                // on success
                // ~~~~~~~~~~~~~~~~~~~~~~~~~~~
                // Do Channel operations here!
                // ~~~~~~~~~~~~~~~~~~~~~~~~~~~	
            },
            (err)=>{
                // handle error
            }
        );
    
 If you already connected to an app, clientlib remembers
 what key, secret and user information you provided. 
 So, you can just provide channelName:
 
     let channel = frontero.channel({
                 channelName: ... 
          });
          
     channel.connect()
         .then(
             (channel)=>{ 
                 // on success
                 // ~~~~~~~~~~~~~~~~~~~~~~~~~~~
                 // Do Channel operations here!
                 // ~~~~~~~~~~~~~~~~~~~~~~~~~~~	
             },
             (err)=>{
                 // handle error
             }
         );
     

After you get connected, start doing Channel operations:

**Create** simple text **Post**:

    channel.send('push:add', 
    		    'hello world')
    		  .then(
    		    push=>{ // success
                    ...   
                }, err => { // fail
                    ...
                });

This is actually sugar writing for:

    channel.send('push:add', 
            		    {
	            		    data:
		            		    sys: {
									type: 'text',
									value: 'hello world'
								}
					    }).then(
                            push=>{ // success
                                  ...   
                            }, err => { // fail
                                  ...
                            });

**Create** simple text **Comment**:


    // pushPost is assumed to exist
    let parentId = pushPost._id;
    
    channel.send('push:add', {
                parentId: parentId,
                payload: 'thats my comment'
            }).then(
                push=>{ // success
                      ...   
                }, err => { // fail
                      ...
                });

In that example again, payload is a sugar writing for:

    {
    	...
    	payload: {
					data: {
	    		        sys: {
	    					type: 'text',
    						value: 'thats my comment'
    				}
    	}
    	...
    }

**Use this logic to create any kind of Push-hierarchy.** 

**Query** latest Pushes:

    channel.send('push:query', {
	    offset: ..., // default is 0
	    limit: ... // default is 10
	}).then(
         pushes=>{ // success
               ...   
         }, err => { // fail
               ...
         });

**Edit** a Push:

    // push1 was brought by query (for example)
    push1.payload.data.sys.value = ... ;
    channel.send('push:edit', push1)
                .then(
                    push=>{ // success
                          ...   
                    }, err => { // fail
                          ...
                    });

**Delete** a Push:

    channel.send('push:delete', pushId)
        .then(
            pushId=>{ // success
                  ...   
            }, err => { // fail
                  ...
            });


**Query** Users:

    channel.send('user:query', {
	    offset: ..., // default is 0
    	limit: ... // default is 10
	   }).then(
            users=>{ // success
                  ...   
            }, err => { // fail
                  ...
            });


## src
All the source-code sits under `src` directory

## build
 1. Under `clientlib` directory type `webpack`
 2. This should output `dist/fronteroCore.js` and `dist/fronteroTeamCore.js`

