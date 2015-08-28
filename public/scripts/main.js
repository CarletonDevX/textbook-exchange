var hitsTheBooks = angular.module('hitsTheBooks', ['ui.router', 'ct.ui.router.extras']);

hitsTheBooks.run(function($rootScope, $state){
	$rootScope.is = function(name){ return $state.is(name) };
	$rootScope.includes = function(name){ return $state.includes(name) };
});

hitsTheBooks.config(function($stateProvider, $locationProvider) {
	$stateProvider

		.state('main',{
			url: '/',
			templateUrl : '/partials/main',
			controller  : 'mainController'
		})
		.state('main.search',{
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
		.state('main.detail',{
			url:'',
			sticky: true,
			views: {
				'detail' : {
					templateUrl : '/partials/detail'
				}
			}
		})
		.state('main.detail.book',{
			resolve : {
				bookInfo: function($http, $stateParams) {
					return $http({
						method : 'GET',
						url : '/api/book/' + $stateParams.isbn
					});
				}
			},
			url : 'book/:isbn',
			templateUrl : '/partials/detail.book',
			controller  : 'bookController'
		})
		.state('main.detail.user',{
			url : 'user/:userID',
			resolve : {
				userInfo: function($http, $stateParams) {
					return $http({
						method : 'GET',
						url : '/api/user/' + $stateParams.userID
					});
				}
			},
			templateUrl : '/partials/detail.user',
			controller  : 'userPageController'
		})


		.state('otherwise', {
			url: "*path",
			template: "Oops! We don't know how to serve you (404)"
		})

		//use HTML5 History API
		$locationProvider.html5Mode(true);
})



hitsTheBooks.controller('mainController', function($scope) {
	$scope.message = "DAVID'S BIG NOSE";
});

hitsTheBooks.controller('searchController', function($scope, results, $stateParams) {
	$scope.query = $stateParams.query;
	$scope.results = results.data;
	console.log($scope.results);
});

hitsTheBooks.controller('bookController', function($scope, bookInfo, $state, $stateParams) {
	$scope.book = bookInfo.data;
	console.log($state);
});

hitsTheBooks.controller('userPageController', function($scope, userInfo, $stateParams) {
	console.log(userInfo.data);
	$scope.user = userInfo.data;
});