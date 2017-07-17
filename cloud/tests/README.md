# run tests
on root dir command `npm test` to run all tests of this directory

# setup and kill
these tests are to create the setup and kill it when we finish
access to setup via `global.setup` in other tests
# BASIC TESTS
 
## basic operations
test01 until test03 are just to check basic functionallity

## application-level limiters
test04 to test06 are to check application level limiters. each app can 
have its own limiter parameters which is different than brute-force
 limit testing. We assume **HUMAN** is making these operations and not 
 bot. This why we do **SERIES** testing and not **PARALLEL** in these
 tests.
 
## archive
test07 - test the archiving mechanism. Every day, a task goes over all updated 
Apps and cut POSTS, leaving behind `limit.app.maxArchivedPosts` number
of posts (0-level pushes) in each App.

## developer validation
test08

## brute-force protection
tests09 - test11 test bot attacks. 

## developer privacy
we test that one developer can't see, alter or delete any other developer.
make sure all data and transactions are private for each developer account.

## user privacy
user can change only pushes that were created on a certain channel by itself.
no other user can edit or delete pushes that created elsewhere or by someone
else.

## events on channels
when Push is added, edited or deleted an event is spread on that channel. 
Make sure that events are sent to the proper connections alone.

## analytics
test that analytics reporting is functional

# STRESS TESTING
stress tests are done w/ Docker tech.
We start N containers that run a zombie script (find it in ./helpers/zombie)
Each container starts w/ a unique command arguments that tells the zombie
script with what parameters to connect the server and than it starts 
doing actions every <interval> seconds.