// HOW I SET THIS WHOLE THING UP:

/* FUNCTIONALITIES FOR POSTS FIRST:

1. Template engine for Express.js:

npm install ejs --save 
npm install path --save
---> Dependencies: ejs, path
    ---> Used for HTML views

must use HTML and CSS!

    2.
npm i express mongoose
---> express framework and mongoose for database

3. This was cancelled:

{Nodemon allows us to refresh the page every time after
a change made:

npm i --save-dev nodemon

package.json:
scripts: devstart
npm run devstart}

4. Responsive design with Bootstrap: https://getbootstrap.com/

5. Connect posts to mongodb:
- not working yet -> see WA demo videos

6. Express validator: https://express-validator.github.io/docs/
npm install --save express-validator
Used for checking if the inputs are correct before adding in the database

7. REMOVED:
,
    "devstart": "nodemon src/js/index.js"


8. New database connection like in demo
* Promise: npm install bluebird

9. mongodb with Atlas

10. npm i slugify --save
for posts named by their content not their id

11. npm i method-override --save

NOW POST FUNCTIONS ARE READY.





NEXT UP: USER REGISTRATION AND LOGIN.
[x] Add the user schema
[x] New buttons and views: sign up, log in and log out
[x] Support viewing ALL posts in the system
[x] Support viewing a certain user's posts
[x] Have delete function only appear on the user's own feed!

1. Registration:
 npm i bcrypt --save
For securing the passwords

2. Log in:
npm i passport passport-local --save

passport-local is a strategy for authenticating with a username and password:
http://www.passportjs.org/packages/passport-local/

npm i express-session express-flash --save

express-session uses cookies for managing the log in sessions
express-flash shows messages to the user (wrong password etc.)

3. Utilizing sessions for checking if a user is logged in

4. Log out method done

5. Connect postSchema to userSchema by adding a variable "author"
---> Own page becomes own feed
---> Public feed separately
---> Viewing other user's pages

    - added two variables in post model: author and authorSlug
    - creating feeds @ /users/authorSlug
        - Rendering certain user's posts at users/profile and users/feed
        * feed is meant for users other than the req.user
    test users: marja and pekka

------ NEXT UP: --------
[x] Make viewing user's feeds possible even if not logged in 
[x] Add access permissions user by user:
    - blog is open to...
        - everyone
        - registered users only
        - to specific users only
        - to myself only
    - Access: "all", "registered", "specified", "me"
    - if "specified", ....
This means that the access permission is requested withing signing up. Add it
to "Settings" page too. The choice is stored in user-schema. Add a button
for adding a friend and for adding an enemy (blocking). List these choices
as a list in the user-schema.
Then router.get("/:authorSlug"...) function checks if the posts are available to the
current user (isAuthenticated or not). Also posts/index should be changed too.

[x] Settings page: change user info later (not username)
    * like edit post

[] Make it look nice through CSS
    * npm install bootstrap --save
    * require('bootstrap')
    * npm install jquery --save

[] Befriend/Block button functionality for "specified"
[] My blog and Log in/Log out buttons shown depending on req.isAuthenticated()
    * "/"
    * "/posts/index"
    * "/users/feed"

See after:
- Returning to Rahti
- the environmental variables there?
    * dotenv library + .env file


- Logo from: https://www.freelogodesign.org/
*/
