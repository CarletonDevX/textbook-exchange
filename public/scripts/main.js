var hitsTheBooks = angular.module('hitsTheBooks', ['ui.router', 'ct.ui.router.extras']);

// BEGIN UTILS
// debouncing function from John Hann
// http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
var debounce = function (func, threshold, execAsap) {
  var timeout;

  return function debounced () {
      var obj = this, args = arguments;
      function delayed () {
          if (!execAsap)
              func.apply(obj, args);
          timeout = null;
      }

      if (timeout)
          clearTimeout(timeout);
      else if (execAsap)
          func.apply(obj, args);

      timeout = setTimeout(delayed, threshold || 100);
  };
};

hitsTheBooks.directive('ngHtbKeypress', function() {
    return function(scope, element, attrs) {

        element.bind("keydown keypress", function(event) {
            var keyCode = event.which || event.keyCode;
            var map = scope.$eval("("+attrs.ngHtbKeypress+")");
            if (map[keyCode]){
	            scope.$eval(map[keyCode])
                event.preventDefault();
            }
        });
    };
});

hitsTheBooks.run(function($rootScope, $state){
	$rootScope.is = function(name){ return $state.is(name) };
	$rootScope.includes = function(name){ return $state.includes(name) };
});
//END UTILS

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



hitsTheBooks.controller('mainController', function($scope, $state, $document) {


	if($state.is('main.search')){
		$scope.searchInput = $state.params.query;
	}

	$scope.handleSearchPaneClick = function(){
		if ($state.includes('main.detail')) {
			$state.go('main.search',{query: $scope.searchInput});
		}
	}
	
	//when typing, throttle searching
	$scope.streamSearch = debounce(function(){
		console.log("queried", $scope.searchInput)
		$state.go('main.search',{query:$scope.searchInput},{location:'replace'});
	},200);

	$scope.search = function() {
		console.log("entersearching");
		$state.go('main.search',{query:$scope.searchInput})
	}
});

hitsTheBooks.controller('searchController', function($scope, results, $stateParams) {
	$scope.query = $stateParams.query;
	$scope.results = results.data;
});

hitsTheBooks.controller('bookController', function($scope, bookInfo, $state, $stateParams) {
	$scope.book = bookInfo.data;
});

hitsTheBooks.controller('userPageController', function($scope, userInfo, $stateParams) {
	console.log(userInfo.data);
	$scope.user = userInfo.data;
});