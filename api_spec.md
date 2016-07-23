Looks like passport is gonna make auth a lot easier than we thought- after authenticating, it'll store the user in the req.user object until the session expires. Not sure if the facebook/google oauth stuff is still gonna be possible with the api though.

P.S. Make sure you have a persistent session enabled in whatever you're using to make requests.

##Authentication
#### Authentification test [Requires auth]:

`GET hitsthebooks.com/api/authTest`

#### Login:

`POST hitsthebooks.com/api/login`

| key       | type    | required |
| --------- | ------- | -------- |
| username  | string  | yes      |
| password  | string  | yes      |

#### [Logout](http://stackoverflow.com/questions/3521290/logout-get-or-post):

`POST hitsthebooks.com/api/logout`
	
##Schools
#### Get statistics for current school:

`GET hitsthebooks.com/api/schoolStats`
	
##Users
#### Register/create a user:

`POST hitsthebooks.com/api/register`

| key        | type    | required |
| ---------- | ------- | -------- |
| username   | string  | yes      |
| password   | string  | yes      |
| givenName  | string  | yes      |
| familyName | string  | yes      |

#### Verify a user with user ID (logs in if successful):

`GET hitsthebooks.com/api/verify?userID=userID&verifier=verifier`

#### Resend verification link for user with user ID

`POST hitsthebooks.com/api/resendVerification/:id`

#### Request password reset

`POST hitsthebooks.com/api/requestPasswordReset`

| key        | type    | required |
| ---------- | ------- | -------- |
| username   | string  | yes      |

#### Reset password

`GET hitsthebooks.com/api/resetPassword?userID=userID&verifier=verifier`

#### Get current user [Requires auth]: 

`GET hitsthebooks.com/api/user`

#### Update current user [Requires auth]: 

`PUT hitsthebooks.com/api/user`

| key           | type    | required |
| --------------| ------- | -------- |
| bio           | string  | no       |
| gradYear      | number  | no       |
| emailSettings | object  | no       |

emailSettings: {
	     watchlist: boolean,
	     undercut: boolean,
	     updates: boolean
	 }

#### Delete current user account [Requires auth]:

`DELETE hitsthebooks.com/api/user`

#### Get user with user ID:

`GET hitsthebooks.com/api/user/:id`	
	
##Avatars
#### Upload an avatar photo [Requires auth]:

`POST hitsthebooks.com/api/avatar`

| key           | type    | required |
| --------------| ------- | -------- |
| file          | file    | yes      |

##Reports
#### Report a user with user ID [Requires auth]:

`POST hitsthebooks.com/api/report/:id`

| key           | type    | required |
| --------------| ------- | -------- |
| description   | string  | yes      |
	
##Subscriptions
#### Get subscriptions of current user [Requires auth]:

`GET hitsthebooks.com/api/subscriptions`

#### Clear subscriptions of current user [Requires auth]:

`POST hitsthebooks.com/api/subscriptions/clear`

#### Subscribe current user to book with book ID [Requires auth]:

`POST hitsthebooks.com/api/subscriptions/add/:id`

#### Unsubscribe current user from book with book ID [Requires auth]:

`DELETE hitsthebooks.com/api/subscriptions/remove/:id`
	
##Listings
#### Get listings for current user [Requires auth]:

`GET hitsthebooks.com/api/listings` 

#### Add a listing with book ID [Requires auth]:

`POST hitsthebooks.com/api/listings/add/:id`

| key           | type         | required |
| --------------| -------------| -------- |
| sellingPrice  | number 0-100 | *        |
| rentingPrice  | number 0-100 | *        |
| condition     | number 0-3   | yes      |

\* Call must include at least one of these attributes.

#### Get listings for user with user ID: 

`GET hitsthebooks.com/api/listings/user/:id`

#### Get listings for book with book ID:

`GET hitsthebooks.com/api/listings/book/:id`

#### Get listing with listing ID:

`GET hitsthebooks.com/api/listings/:id`

#### Update listing with listing ID [Requires auth]:

`PUT hitsthebooks.com/api/listings/:id`

| key           | type         | required |
| --------------| -------------| -------- |
| sellingPrice  | number 0-100 | *        |
| rentingPrice  | number 0-100 | *        |
| condition     | number 0-3   | yes      |

\* Call must include at least one of these attributes.

#### Remove a listing [Requires auth]:

`DELETE hitsthebooks.com/api/listings/:id`

#### Get previous offer on a listing with listing ID [Requires auth]:

`GET hitsthebooks.com/api/listings/offer/:id`

#### Make an offer on a listing with listing ID [Requires auth]:

`POST hitsthebooks.com/api/listings/offer/:id`

| key           | type    | required |
| --------------| --------| -------- |
| message       | string  | no       |

#### Complete a listing with listing ID [Requires auth]:

`POST hitsthebooks.com/api/listings/complete/:id`
	
##Books
#### Get book with book ID:

`GET hitsthebooks.com/api/book/:id`

#### Update amazon info of book with book ID (temporary):

`POST hitsthebooks.com/api/book/:id`

##Search
#### Search for a book:

`GET hitsthebooks.com/api/search?query=query`

##Errors
#### Report an error:

| key           | type    | required |
| --------------| --------| -------- |
| message       | string  | yes      |

`POST hitsthebooks.com/api/errors`
