var hitsTheBooks = angular.module('hitsTheBooks', ['ui.router']);

hitsTheBooks.config(function($stateProvider, $locationProvider) {
	$stateProvider

		.state('home',{
			url: '/',
			templateUrl : '/partials/home',
			controller  : 'homeController'
		})
		.state('home.bookDetail',{
			// the resolve function is how we'd grab JSON before rendering a view.
			// For example...
			resolve : {
				bookInfo: function($http, $stateParams) {
					return $http({
						method : 'GET',
						url : '/api/book/' + $stateParams.isbn
					});
				}
			},
			url : 'book/:isbn',
			templateUrl : '/partials/bookDetail',
			controller  : 'bookController'
		})
		.state('home.search',{
			resolve : {
				//get results of search from server
				results: function($http, $stateParams) {
				  return $http({
				    method : 'GET',
				       url : '/api/search?query=' + $stateParams.query
				  });
				}
			},
			url : 'search?query',
			templateUrl : '/partials/search',
			controller  : 'searchController'
		})
		.state('home.search.bookDetail',{
			resolve : {
				bookInfo: function($http, $stateParams) {
					return $http({
						method : 'GET',
						url : '/api/book/' + $stateParams.isbn
					});
				}
			},
			url : '/book/:isbn',
			templateUrl : '/partials/bookDetail',
			controller  : 'bookController'
		})

		.state('otherwise', {
			url: "*path",
			template: "Oops! We don't know how to serve you (404)"
		})

		//use HTML5 History API
		$locationProvider.html5Mode(true);
})

hitsTheBooks.controller('homeController', function($scope) {
	$scope.message = "DAVID'S BIG NOSE";
});

hitsTheBooks.controller('searchController', function($scope, results, $stateParams) {
	$scope.query = $stateParams.query;
	$scope.results = results.data;
	console.log($scope.results);
});

hitsTheBooks.controller('bookController', function($scope, bookInfo, $stateParams) {
	console.log(bookInfo.data);
	$scope.book = bookInfo.data;
});