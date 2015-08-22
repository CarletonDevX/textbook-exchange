Login stuff is still unclear. [Here's](http://stackoverflow.com/questions/15496915/how-to-implement-a-secure-rest-api-with-node-js) some reading on the subject. 

- Schools
	- Get statistics for school by school ID:
	`GET hitsthebooks.com/api/school/id`
- Users
	- Get current user: 
	`GET hitsthebooks.com/api/user`
	- Update current user (with user details): 
	`PUT hitsthebooks.com/api/user`
	- Get user by user ID:
	`GET hitsthebooks.com/api/user/id`
	- Get watchlist of current user:
	`GET hitsthebooks.com/api/watchlist`
	- Add book to watchlist of current user with book ID:
	`POST hitsthebooks.com/api/watchlist/add/id`
	- Remove book from watchlist of current user with book ID:
	`POST hitsthebooks.com/api/watchlist/remove/id`
	- Clear the watchlist of current user:
	`POST hitsthebooks.com/api/watchlist/clear`
	- Deactivate current user account:
	`POST hitsthebooks.com/api/deactivate`
	
- Listings
	- Get listings for user with user ID: 
	`GET hitsthebooks.com/api/listing/user/id`
	- Get listings for book with book ID:
	`GET hitsthebooks.com/api/listing/book/id`
	- Add a listing (with listing details):
	`POST hitsthebooks.com/api/listing/add`
	- Remove a listing with listing ID:
	`POST hitsthebooks.com/api/listing/remove/id`
	- Make an offer on a listing with listing ID:
	`POST hitsthebooks.com/api/listing/offer/id`
	
- Books
	- Get book with book ID:
	`GET hitsthebooks.com/api/book/id`

- Search
	- Search for a book (with queries):
	`GET hitsthebooks.com/api/search/`