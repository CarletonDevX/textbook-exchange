var hitsTheBooks = angular.module('hitsTheBooks', ['ui.router']);

hitsTheBooks.config(function($stateProvider, $locationProvider) {
	$stateProvider

		.state('home',{
			url: '/',
			templateUrl : '/partials/home',
			controller  : 'homeController'
		})	
		.state('home.searchResults',{
			// the resolve function is how we'd grab JSON before rendering a view.
			// For example...
			resolve : {
				results: function($http, $stateParams) {
				  return $http({
				    method : 'GET',
				       url : '/api/search?query='+$stateParams.query
				  });
				}
			},
			url : 'search?query',
			templateUrl : '/partials/searchResults',
			controller  : 'searchResultsController'
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

hitsTheBooks.controller('searchResultsController', function($scope, results, $stateParams) {
	$scope.query = $stateParams.query;
	$scope.results = results.data;
	console.log($scope.results);
});