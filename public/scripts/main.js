var hitsTheBooks = angular.module('hitsTheBooks', ['ui.router', 'ct.ui.router.extras']);

hitsTheBooks.run(function($rootScope, $state){
  $rootScope.is = function(name){ return $state.is(name) };
  $rootScope.includes = function(name){ return $state.includes(name) };
});


//a more flexible keypress directive that maps keycodes to functions
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

// Like ng-click but not activated when click event 
// is bubbled up the the el with the directive
hitsTheBooks.directive('ngHtbSelfClick', [ '$parse', '$rootScope', function($parse, $rootScope) {
  return {
    restrict: 'A',
    compile: function($element, attrs){
      var fn = $parse(attrs['ngHtbSelfClick'], null, true);
      return function ngHtbEventHandler(scope, element) {
        element.on('click', function(event) {
          var callback = function() {
            fn(scope, {$event:event});
          };

          var target = event.target;
          if (element[0] === target) {
            scope.$apply(callback);
          }
        })
      }
    }
  }
}]);

// Update model when form data is autofilled. From the magical mind of Gert Hengeveld.
hitsTheBooks.directive('formAutofillFix', function ($timeout) {
  return function (scope, element, attrs) {
    element.prop('method', 'post');
    if (attrs.ngSubmit) {
      $timeout(function () {
        element
          .unbind('submit')
          .bind('submit', function (event) {
            event.preventDefault();
            element
              .find('input, textarea, select')
              .trigger('input')
              .trigger('change')
              .trigger('keydown');
            scope.$apply(attrs.ngSubmit);
          });
      });
    }
  };
});

hitsTheBooks.filter('ordinal', function() {
  return function(input) {
    //if input is an integer
    if (input == parseInt(input, 10)) {
      input = input || '';
      var lastDig = input % 10;
      var suffixMap = {0: 'th', 1:'st', 2:'nd', 3:'rd'};
      return suffixMap[lastDig] || suffixMap[0]; 
    } else return '';
  };
});

hitsTheBooks.config(function($stateProvider, $locationProvider) {
  $stateProvider

    .state('account', { url: '/account',
      views:{'account' : {
          templateUrl: '/partials/account',
          controller: 'accountController' }}
    })
    .state('account.access', { url: '/access',
      templateUrl : '/partials/account.access',
      controller  : 'accountAccessController'
    })
    .state('account.details', { url : '/dash',
      templateUrl : '/partials/account.details',
      controller  : 'accountDetailsController',
      resolve : {
        watchlist: function(Api, $stateParams) {
          return Api.getWatchlist();
        }
      }
    })
    .state('account.edit',{ url: '/edit',
      templateUrl : '/partials/account.edit',
      controller  : 'accountEditController'
    })
    .state('main',{
      url: '/',
      sticky: true,
      // deepStateRedirect: true,
      views:{
        'main' : {
          templateUrl: '/partials/main',
          controller: 'mainController'
        }
      }
    })
    .state('main.search',{
      resolve : {
        //get results of search from server
        results: function(Api, $stateParams) {
          return Api.search($stateParams.query);
        }
      },
      url : 'search?query',
      sticky: true,
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
          templateUrl : '/partials/detail',
          controller : 'detailsController'
        }
      }
    })
    .state('main.detail.book',{
      resolve : {
        bookInfo: function(Api, $stateParams) {
          return Api.getBook($stateParams.isbn);
        }
      },
      url : 'book/:isbn',
      templateUrl : '/partials/detail.book',
      controller  : 'bookController'
    })
    .state('main.detail.user',{
      url : 'user/:userID',
      resolve : {
        userInfo: function(Api, $stateParams) {
          return Api.getUser($stateParams.userID);
        }
      },
      templateUrl : '/partials/detail.user',
      controller  : 'userPageController'
    })
    .state('main.detail.error',{
      url : 'error', // use {location:false} on $state.go so it doesn't switch to this
      params: {
        message: 'An error occurred.' // default message
      },
      templateUrl : '/partials/detail.error',
      controller: function($scope, $stateParams) {
        $scope.message = $stateParams.message;
      }
    })
    .state('otherwise',{
      url : '*path',
      onEnter: function ($state){
        $state.go('main.detail.error', {message: 'Page not found.'}, {location: false});
      }
    })

    //use HTML5 History API
    $locationProvider.html5Mode(true);
});

hitsTheBooks.controller('headerController', function($scope, $rootScope, $state, $previousState, $document) {

  $scope.modalStates = {
    'blurb':true,
    'about':false
  }

  $rootScope.openAccount = function(){
    $state.go('account')
    $previousState.memo('accountEntryPoint');
  }

  //transists for header
  $scope.$on('$stateChangeStart',
    function(event, toState, toParams, fromState, fromParams) {
    //header transitions
    if (toState.name=="main"){
      if(fromState.name){
        $('header').transist({'remove':['minimized']},['height'],200)
      }
    } else if(fromState.name=="main" && toState.name.indexOf('account') == -1){
      $('header').transist({'add':['minimized']},['height'],200)
    } else if(!fromState.name){ //init
      $('header').addClass('minimized');
    }
  });

});

hitsTheBooks.controller('accountController', function($scope, $previousState, $state) {
  //redirect to view depending on user state
  if ($scope.currentUser) {
    $state.go('account.details')
  } else {
    $state.go('account.access')
  }

  $scope.closeAccount = function(){
    if ($previousState.get('accountEntryPoint')){
      // console.log('previousState is', $previousState.get('accountEntryPoint'))
      $previousState.go('accountEntryPoint');
    } else {
      $state.go('main')
    }

  }
});

// Enum for events that will be broadcasted
hitsTheBooks.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success'
});

hitsTheBooks.controller('accountAccessController', function($scope, $rootScope, $state, Api, AUTH_EVENTS) {

  // Login
  $scope.loginData = { username: '', password: '' };

  $scope.login = function (loginData) {
    Api.login(loginData).then(function (res) {
      $scope.closeAccount();
    });
  };

  // Registration
  $scope.registerData = { username: '', password: '', givenName: '', familyName: '' }

  $scope.register = function (loginData) {
    // Nothing here yet :(
  };
});

hitsTheBooks.controller('accountDetailsController', function($scope, watchlist, $rootScope, $state, Api, AUTH_EVENTS) {

  $scope.watchlist = watchlist;

  // Click background of modal to exit.
  // (definitely not the best way to do this, just put it in for now, for convenience)
  $('.modal-wrapper').click(function (){
    $scope.closeAccount();
  })
  $('.modal').click(function (e){
    e.stopPropagation();
  });

  $scope.logout = function () {
    Api.logout().then(function () {
      $scope.closeAccount();
    });
  }


});

hitsTheBooks.controller('accountEditController', function($scope, $state) {
  return
});

hitsTheBooks.controller('mainController', function($scope, $rootScope, $state, $document) {
  var streamSearchDelay = 200; //ms
  var initSearch = false;

  //inject the query if we init on the search page
  if ($state.is('main.search')) {
    $scope.searchInput = $state.params.query;
  }

  $scope.handleSearchPaneClick = function(){
    if ($state.includes('main.detail')) {
      $state.go('main.search',{query: $scope.searchInput});
    }
  }

  //keep search box kleen
  $scope.$on('$stateChangeStart', 
  function(event, toState, toParams, fromState, fromParams){
    //if we're heading home, erase the search box
    if (toState.name=="main"){
      //while this ↴ looks superfluous, it's necessary to change
      //the input value in time for updateSearchBox to resize.
      $('input#search-box').val('');
      $scope.searchInput = '';
      $scope.updateSearchBox();
    }
  });

  // transists for search view
  $rootScope.$on('$stateChangeStart',
  function(event, toState, toParams, fromState, fromParams){
    var $sr = $('#search-results');
    
    if (fromState.name=="main.search" && toState.name !== "main.search") {
      $sr.transist({'add':['minimized']},['height'],200);
    }

    if (fromState.name.indexOf("main.detail") > -1 &&
        toState.name == "main.search"){
      $sr.transist({'remove':['minimized']},['height'],200);
    }
  });
  //transists continued...
  $rootScope.$on('$stateChangeSuccess',
  function(event, toState, toParams, fromState, fromParams){
    var $sr = $('#search-results');
    if (fromState.name=="main" && toState.name=="main.search") {
      $sr.transist({'remove':['minimized']},['height'],200);
    }
  });

  //TODO:
  //transists for detail view
  // $rootScope.$on('$stateChangeSuccess',
  // function(event, toState, toParams, fromState, fromParams){
  //   var $sr = $('#search-results');
  //   if (fromState.name !== "main.detail" &&
  //       toState.name.indexOf()=="main.detail") {
  //     $sr.transist({'remove':['minimized']},['height'],200);
  //   }
  // });

  //the classic type-and-hit-[enter] search
  $scope.classicSearch = function() {
    if (!initSearch && $scope.searchInput) {
      $state.go('main.search',{query:$scope.searchInput})
    }
  }
  
  $scope.resetInitSearch = function(){ initSearch = false }

  //when typing, perform a throttled search
  var streamSearch = debounce(function(){
    if ($scope.searchInput){
      $state.go('main.search',{query:$scope.searchInput},{location:'replace'});
    }
  },streamSearchDelay);

  $scope.updateSearchBox = function() {
    var $this = $('input#search-box');
    var lenVal = $this.textWidth();
    var lenPh = $this.textWidth($this.attr("placeholder"));
    $this.width(Math.max(lenVal, lenPh) + 25);
  }

  $scope.search = function(){
    if ($scope.searchInput){
      streamSearch();
      if(!initSearch) {
        initSearch = true;
        $state.go('main.search',{query:$scope.searchInput},{location:'replace'});
      }
    }
  }

  // this is absolutely absolutely gross.
  // TODO: Find something tastier.
  setTimeout(function(){
    $scope.updateSearchBox();
  }, 0);
  
});

hitsTheBooks.controller('searchController', function($scope, results, $stateParams) {
  $scope.query = $stateParams.query;
  $scope.results = results;
});

hitsTheBooks.controller('detailsController', function($scope, $stateParams, $location) {

  $scope.goBack = function(){
    window.history.back();
  }

});


hitsTheBooks.controller('bookController', function($scope, bookInfo, $state, $rootScope, $stateParams, Api) {

  $scope.book = bookInfo;
  $scope.whichListings = "both"
  $scope.listingOrder = "price";
  $scope.reverseSort = true;
  $scope.removingListing = false;
  $scope.offer = {
    active: false,
    listing: null,
    message: null
  }
  //TODO: for some reason, default selling and renting prices aren't working
  $scope.newListing = {
    active: false,
    selling: true,
    renting: false,
    sellingPrice: 10.00,
    rentingPrice: 10.00,
    condition: 'New'
  }

  $scope.beginRemovingListing = function() { $scope.removingListing = true; }

  $scope.cancelRemovingListing = function() { $scope.removingListing = false; }

  $scope.removeListing = function(listing, success) {
    // Api.removeListing($scope.book.ISBN, {listingID = })
    console.log(listing);
  }

  $scope.makeOfferInit = function(listing) {
    console.log(listing);
    $scope.offer.listing = listing;
    $scope.offer.message = 
      "Hi "+$scope.offer.listing.user.name.fullName+", \n\n"
      + "I am interested in [buying/renting] your copy of "+$scope.book.name+". "
      + "Please let me know when we could meet.\n\n"
      + "Thanks"
      + ($rootScope.currentUser ? (",\n"+$rootScope.currentUser.name.fullName) : "!")
    $scope.offer.active = true;
  }

  $scope.handleReorder = function(category) {
    if ($scope.listingOrder == category) $scope.reverseSort = !$scope.reverseSort;
    else {
      $scope.listingOrder = category;
      $scope.reverseSort = {'lastName':true,
                            'condition':false,
                            'price':true}[category];
    }
  }

  $scope.addToWatchlist = function () {
    Api.addToWatchlist($scope.book.ISBN).then(function (data) {
      $rootScope.currentUser.subscriptions = data;
    }, function (err) {
      console.log(err);
    });
  }

  $scope.removeFromWatchlist = function () {
    //TODO: this shit shouldn't happen here.
    Api.removeFromWatchlist($scope.book.ISBN).then(function (data) {
      $rootScope.currentUser.subscriptions = data;
      // console.log($scope.currentUser.subscriptions);
      // console.log($scope.currentUser.subscriptions.indexOf($scope.book.ISBN) > -1);
    }, function (err) {
      console.log(err);
    });
  }

  $scope.submitListing = function () {
    console.log($scope.book);
    var data = {
      condition: $scope.newListing.condition
    }
    if ($scope.newListing.selling) {
      data['sellingPrice'] = $scope.newListing.sellingPrice;
    }
    if($scope.newListing.renting) {
      data['rentingPrice'] = $scope.newListing.rentingPrice;
    }
    Api.addListing($scope.book.ISBN, data).then(function (res) {
      Api.getListings($scope.book.ISBN).then( function(listings) {
        $scope.book.listings = listings;
      }, function(err) {
        console.log(err);
      });
    }, function (err) {
      console.log(err);
    })
  }
});

hitsTheBooks.controller('userPageController', function($scope, userInfo, $stateParams) {
  $scope.user = userInfo;
});

// Top-level shit
hitsTheBooks.controller('applicationController', function($state, $scope, $rootScope, Api, AUTH_EVENTS) {

  // Route change error handling
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    $state.go('main.detail.error', {message:error.data.errors[0]}, {location: false});
  });

  $scope.setCurrentUser = function () {
    Api.getCurrentUser().then(function (res) {
      $rootScope.currentUser = res;
      console.log(res);
    }, 
    function (err) {
      $rootScope.currentUser = null;
    });
  }

  $rootScope.currentUser = null;
  $scope.setCurrentUser();

  //Auth listeners
  $scope.$on(AUTH_EVENTS.loginSuccess, 
  function(event, args){
    console.log("Logged in.");
    $scope.setCurrentUser();
  });
  $scope.$on(AUTH_EVENTS.loginFailed, 
  function(event, args){
    console.log("Login failed.");
  });
  $scope.$on(AUTH_EVENTS.logoutSuccess, 
  function(event, args){
    console.log("Logged out.");
    $scope.setCurrentUser();
  });

});
