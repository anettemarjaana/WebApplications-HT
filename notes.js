// HOW I SET THIS WHOLE THING UP:

/* 1. Template engine for Express.js:

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
- Add the user schema
- New buttons and views: sign up, log in and log out
- Support viewing ALL posts in the system
- Support viewing a certain user's posts
- Have delete function only appear on the user's own feed!

- Create a welcome page for login with an animation: https://mdbootstrap.com/docs/jquery/css/animations/
- Create a goodbye page for logout with an animation

1. npm i bcrypt --save
For securing the passwords

EXTRA FUNCTIONS TO CONSIDER AFTER:
- Add access permissions user by user:
    - blog is open to...
        - everyone
        - registered users only
        - to specific users only
        - to myself only
    - Access: "all", "registered", "specified", "me"
    - if "specified", ....
- Support pictures storage and display
- Search function by hashtags? sphinx or elasticsearch?
- Provide data from the application through an API
    * document it through API Blueprint

See after:
- Returning to Rahti
- how to have the environmental variables there?
    * dotenv library + .env file

*/
