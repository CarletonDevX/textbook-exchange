var hitsTheBooks = angular.module('hitsTheBooks', ['ui.router', 'ct.ui.router.extras']);

hitsTheBooks.config(function($stateProvider, $locationProvider) {
	$stateProvider

		.state('home',{
			url: '/',
			templateUrl : '/partials/home',
			controller  : 'homeController'
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
			sticky: true,
			url : 'search?query',
			views:{
				'search' : {
					templateUrl : '/partials/search',
					controller  : 'searchController'
				}
			}
		})
		.state('home.detail',{
			url:'',
			sticky: true,
			views: {
				'detail' : {
					templateUrl : '/partials/detail'
				}
			}
		})
		.state('home.detail.book',{
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
			templateUrl : '/partials/book',
			controller  : 'bookController'
		})
		.state('home.detail.user',{
			url : 'user/:id',
			templateUrl : '/partials/user',
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