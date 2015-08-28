Login stuff is still unclear. [Here's](http://stackoverflow.com/questions/15496915/how-to-implement-a-secure-rest-api-with-node-js) some reading on the subject. 

- Schools
	- Get statistics for school by school ID:
	`GET hitsthebooks.com/api/school/id`
- Users
	- Get current user: 
	`GET hitsthebooks.com/api/user`
	- Update current user (with user details): 
	`PUT hitsthebooks.com/api/user`
	- Delete current user account:
	`DELETE hitsthebooks.com/api/user`
	- Get user by user ID:
	`GET hitsthebooks.com/api/user/id`
	- Get watchlist of current user:
	`GET hitsthebooks.com/api/watchlist`
	- Add book to watchlist of current user with book ID (id in queries):
	`POST hitsthebooks.com/api/watchlist/add`
	- Remove book from watchlist of current user with book ID (id in queries):
	`DELETE hitsthebooks.com/api/watchlist/remove`
	- Clear the watchlist of current user:
	`DELETE hitsthebooks.com/api/watchlist`
	
- Listings
	- Get listings for user with user ID: 
	`GET hitsthebooks.com/api/listings/user/id`
	- Get listings for book with book ID:
	`GET hitsthebooks.com/api/listings/book/id`
	- Add a listing (with listing details)
	`POST hitsthebooks.com/api/listings/add`
	- Make an offer on a listing (id in queries):
	`POST hitsthebooks.com/api/listings/offer/`
	- Get listing by listing ID:
	`GET hitsthebooks.com/api/listings/id`
	- Update listing (with listing details):
	`PUT hitsthebooks.com/api/listings/id`
	- Remove a listing:
	`DELETE hitsthebooks.com/api/listings/id`
	
- Books
	- Get book with book ID:
	`GET hitsthebooks.com/api/book/id`

- Search
	- Search for a book (with queries):
	`GET hitsthebooks.com/api/search/`