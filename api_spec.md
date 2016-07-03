Looks like passport is gonna make auth a lot easier than we thought- after authenticating, it'll store the user in the req.user object until the session expires. Not sure if the facebook/google oauth stuff is still gonna be possible with the api though.

P.S. Make sure you have a persistent session enabled in whatever you're using to make requests.

Communist calls have been implemented already.

##Authentication
#### ☭ Authentification test [Requires auth]:

`GET hitsthebooks.com/api/authTest`

#### ☭ Login [Requires auth]:

`POST hitsthebooks.com/api/login`

| key       | type    | required |
| --------- | ------- | -------- |
| username  | string  | yes      |
| password  | string  | yes      |

#### ☭ [Logout](http://stackoverflow.com/questions/3521290/logout-get-or-post):

`POST hitsthebooks.com/api/logout`
	
##Schools
#### ☭ Get statistics for current school:

`GET hitsthebooks.com/api/schoolStats`
	
##Users
#### ☭ Register/create a user:

`POST hitsthebooks.com/api/register`

| key       | type    | required |
| --------- | ------- | -------- |
| username  | string  | yes      |
| password  | string  | yes      |

#### ☭ Verify a user with user ID:
`POST hitsthebooks.com/api/verify/userID`

| key       | type    | required |
| --------- | ------- | -------- |
| verifier  | string  | yes      |

#### ☭ Get current user [Requires auth]: 

`GET hitsthebooks.com/api/user`

#### ☭ Update current user (with user details) [Requires auth]: 

`PUT hitsthebooks.com/api/user`

#### ☭ Delete current user account [Requires auth]:

`DELETE hitsthebooks.com/api/user`

#### Get user with user ID:

`GET hitsthebooks.com/api/user/id`	
	
##Avatars
	- ☭ Upload an avatar photo (with file) [Requires auth]:
	`POST hitsthebooks.com/api/avatar`

##Reports
	- ☭ Report a user with user ID (with report details) [Requires auth]:
	`POST hitsthebooks.com/api/report/id`
	
##Subscriptions
	- ☭ Get subscriptions of current user [Requires auth]:
	`GET hitsthebooks.com/api/subscriptions`
	- ☭ Clear subscriptions of current user [Requires auth]:
	`POST hitsthebooks.com/api/subscriptions/clear`
	- ☭ Subscribe current user to book with book ID [Requires auth]:
	`POST hitsthebooks.com/api/subscriptions/add/id`
	- ☭ Unsubscribe current user from book with book ID [Requires auth]:
	`DELETE hitsthebooks.com/api/subscriptions/remove/id`
	
##Listings
	- ☭ Get listings for current user [Requires auth]:
	`GET hitsthebooks.com/api/listings` 
	- ☭ Add a listing with book ID (with listing details) [Requires auth]:
	`POST hitsthebooks.com/api/listings/add/id`
	- ☭ Get listings for user with user ID: 
	`GET hitsthebooks.com/api/listings/user/id`
	- ☭ Get listings for book with book ID:
	`GET hitsthebooks.com/api/listings/book/id`
	- ☭ Get listing with listing ID:
	`GET hitsthebooks.com/api/listings/id`
	- ☭ Update listing with listing ID (with listing details) [Requires auth]:
	`PUT hitsthebooks.com/api/listings/id`
	- ☭ Remove a listing [Requires auth]:
	`DELETE hitsthebooks.com/api/listings/id`
	- ☭ Get previous offer on a listing with listing ID [Requires auth]:
	`GET hitsthebooks.com/api/listings/offer/id`
	- ☭ Make an offer on a listing with listing ID (with optional message) [Requires auth]:
	`POST hitsthebooks.com/api/listings/offer/id`
	- ☭ Complete a listing with listing ID [Requires auth]:
	`POST hitsthebooks.com/api/listings/complete/id`
	
##Books
	- ☭ Get book with book ID:
	`GET hitsthebooks.com/api/book/id`
	- Update amazon info of book with book ID (temporary):
	`POST hitsthebooks.com/api/book/id`

##Search
	- Search for a book (with queries):
	`GET hitsthebooks.com/api/search/`

##Errors
	- Report an error (with error details):
	`POST hitsthebooks.com/api/errors`
