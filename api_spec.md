Note: Make sure you have a persistent session enabled in whatever you're using to make requests.

##Authentication
#### Authentification test [Requires auth]:

`GET /api/authTest`

#### Login:

`POST /api/login`

| key       | type    | required |
| --------- | ------- | -------- |
| username  | string  | yes      |
| password  | string  | yes      |

#### [Logout](http://stackoverflow.com/questions/3521290/logout-get-or-post):

`POST /api/logout`
	
##Schools
#### Get statistics for current school:

`GET /api/schoolStats`
	
##Users
#### Register/create a user:

`POST /api/register`

| key        | type    | required |
| ---------- | ------- | -------- |
| username   | string  | yes      |
| password   | string  | yes      |
| givenName  | string  | yes      |
| familyName | string  | yes      |

#### Verify a user with user ID (logs in if successful):

`GET /api/verify?userID=userID&verifier=verifier`

#### Resend verification link for user

`POST /api/resendVerification/`

| key        | type    | required |
| ---------- | ------- | -------- |
| username   | string  | yes      |

#### Request password reset

`POST /api/requestPasswordReset`

| key        | type    | required |
| ---------- | ------- | -------- |
| username   | string  | yes      |

#### Reset password

`GET /api/resetPassword?userID=userID&verifier=verifier`

#### Get current user [Requires auth]: 

`GET /api/user`

#### Update current user [Requires auth]: 

`PUT /api/user`

| key           | type    | required |
| --------------| ------- | -------- |
| bio           | string  | no       |
| gradYear      | number  | no       |
| emailSettings | object  | no       |
| familyName    | string  | no       |
| givenName     | string  | no       |
| password      | string  | no       |
| oldPassword   | string  | * 			 |

\* oldPassword is required if password is included

emailSettings: {
	     watchlist: boolean,
	     undercut: boolean,
	     updates: boolean
	 }

#### Delete current user account [Requires auth]:

`DELETE /api/user`

#### Get user with user ID:

`GET /api/user/:id`	
	
##Avatars
#### Upload an avatar photo [Requires auth]:

`POST /api/avatar`

| key           | type    | required |
| --------------| ------- | -------- |
| file          | file    | yes      |

##Reports
#### Report a user with user ID [Requires auth]:

`POST /api/report/:id`

| key           | type    | required |
| --------------| ------- | -------- |
| description   | string  | yes      |
	
##Subscriptions
#### Get subscriptions of current user [Requires auth]:

`GET /api/subscriptions`

#### Clear subscriptions of current user [Requires auth]:

`POST /api/subscriptions/clear`

#### Subscribe current user to book with book ID [Requires auth]:

`POST /api/subscriptions/add/:id`

#### Unsubscribe current user from book with book ID [Requires auth]:

`DELETE /api/subscriptions/remove/:id`
	
##Listings
#### Get listings for current user [Requires auth]:

`GET /api/listings` 

#### Add a listing with book ID [Requires auth]:

`POST /api/listings/add/:id`

| key           | type         | required |
| --------------| -------------| -------- |
| sellingPrice  | number 0-100 | *        |
| rentingPrice  | number 0-100 | *        |
| condition     | number 0-3   | yes      |

\* Call must include at least one of these attributes.

#### Get listings for user with user ID: 

`GET /api/listings/user/:id`

#### Get listings for book with book ID:

`GET /api/listings/book/:id`

#### Get listing with listing ID:

`GET /api/listings/:id`

#### Update listing with listing ID [Requires auth]:

`PUT /api/listings/:id`

| key           | type         | required |
| --------------| -------------| -------- |
| sellingPrice  | number 0-100 | *        |
| rentingPrice  | number 0-100 | *        |
| condition     | number 0-3   | yes      |

\* Call must include at least one of these attributes.

#### Remove a listing [Requires auth]:

`DELETE /api/listings/:id`

#### Get previous offer on a listing with listing ID [Requires auth]:

`GET /api/listings/offer/:id`

#### Make an offer on a listing with listing ID [Requires auth]:

`POST /api/listings/offer/:id`

| key           | type    | required |
| --------------| --------| -------- |
| message       | string  | no       |

#### Complete a listing with listing ID [Requires auth]:

`POST /api/listings/complete/:id`
	
##Books
#### Get book with book ID:

`GET /api/book/:id`

#### Update amazon info of book with book ID (temporary):

`POST /api/book/:id`

##Search
#### Search for a book:

`GET /api/search?query=query`

#### Search for a user:

`GET /api/searchUser?query=query`

##Errors
#### Report an error:

| key           | type    | required |
| --------------| --------| -------- |
| message       | string  | yes      |

`POST /api/errors`
