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

hitsTheBooks.filter('unsafe', function($sce) {
    return function(val) {
        if (val.match(/<(\w+)>.*<\/\1>/) != null) {
          // HTML format
          return $sce.trustAsHtml(val);
        } else {
          // Not HTML
          return $sce.trustAsHtml("<p>" + val + "</p>");
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
        setTimeout(function () { // Why the timeout? See https://github.com/angular-ui/ui-router/issues/326
          $state.go('main.detail.error', {message: 'Page not found.'}, {location: false});
        });
      }
    })

    //use HTML5 History API
    $locationProvider.html5Mode(true);
});

hitsTheBooks.controller('headerController', function($scope, $rootScope, $state, $previousState, $document) {

  $rootScope.modalStates = {
    'blurb':true,
    'about':false,
    'contact':false
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
  $scope.signinAlert = 0;
  $scope.login = function (loginData) {
    Api.login(loginData).then(function (res) {
      switch (res.status) {
        case 401:
          $scope.signinAlert = 1;
          break;
        case 400:
          $scope.unverifiedUserId = res.data.userID;
          $scope.signinAlert = 2;
          break;
        case 500:
          $scope.signinAlert = 3;
          break;
        case 200:
          $scope.closeAccount();
          $scope.signinAlert = 0;
          break;
      }
    });
  };

  // Registration
  $scope.registerData = { username: '', password: '', givenName: '', familyName: '' }
  $scope.registerAlert = 0;
  $scope.registrationError = "";
  $scope.register = function (registerData) {
    Api.register(registerData).then(function(res) {
      console.log(res);
      switch (res.status) {
        case 400:
          $scope.registerAlert = 1;
          $scope.registrationError = res.data.errors[0];
          break;
        case 500:
        case 0:
          $scope.registerAlert = 2;
          break;
        default:
          $scope.registerData = { username: '', password: '', givenName: '', familyName: '' }
          $scope.registerAlert = 3;
          break;
      }
    });
  };

  $scope.requestPasswordReset = function() {
    Api.requestPasswordReset($scope.loginData.username);
  }

  $scope.resendVerification = function() {
    Api.resendVerificationEmail($scope.unverifiedUserId);
  }
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
  //View defaults & settings
  angular.extend($scope, {
    book : bookInfo,
    //LISTING TABLE DEFAULTS
    mergedListings : [],
    listingOrder : "price",
    whichListings : "both",
    reverseSort : true,
    descMinimized : false,
    descMinHeight : null,
    offer : {
        active: false,
        listing: null,
        message: null
    },
    removingListing : false,
    // NEW LISTING DEFAULTS
    listingPaneOpen : false,
    currUserListing : false,
    conditionOptions : [
      {code: 0, name: "New"},
      {code: 1, name: "Lightly Used"},
      {code: 2, name: "Used"},
      {code: 3, name: "Heavily Used"}
    ],
    conditionDescriptions : {
      0 : "Pristine condition, rarely opened if at all",
      1 : "No writing inside, spine may be creased, cover otherwise undamaged",
      2 : "Writing or minor cover damage",
      3 : "Lots of writing, heavy cover and/or page damage"
    },
    newListing : {
      selling: true,
      renting: true,
      sellingPrice: Math.min(bookInfo.amazonInfo.sellingPrice, 100) || 0,
      rentingPrice: Math.min(Math.round(0.5*bookInfo.amazonInfo.sellingPrice),100) || 0,
      condition: {code: 1, name: "Used, No Marks"}
    }
  });


  var getCurrUserListing = function() {
    if ($scope.currentUser && $scope.currentUser.listings){
      for (i in $scope.currentUser.listings){
        if ($scope.book.ISBN == $scope.currentUser.listings[i].ISBN && $scope.currentUser.listings[i].completed == false){
          return $scope.currentUser.listings[i];
        }
      }
      return false;
    }
  }
  $scope.$watch('currentUser', function(){
    $scope.currUserListing = getCurrUserListing();
  });

  var insertAmazonListing = function(otherListings) {
    var merged = otherListings.slice(0);
    merged.push({
      isAmazonListing: true,
      amazonUrl: $scope.book.amazonInfo.url,
      condition : 0,
      sellingPrice : $scope.book.amazonInfo.sellingPrice
    });
    return merged
  }
  $scope.$watch('book.listings', function(){
    $scope.mergedListings = insertAmazonListing($scope.book.listings);
  });

  var refreshListings = function() {
    Api.getListings($scope.book.ISBN).then( function(listings) {
      $scope.book.listings = listings;
    }, function(err) {
      console.log(err);
    });
  }

  var refreshCurrentUser = function() {
    $scope.setCurrentUser();
  }

  //TODO - sometimes hidedesc doesn't work either
  var hideDesc = function(){
    infoContentHeight = Math.max(Math.max($(".info .info-table").height(),$(".info .preview").height()))
    totalInfoHeight = $("#book-details .info").height()

    if (totalInfoHeight > infoContentHeight + 40) {
      $scope.$apply(function(){
        $scope.descMinimized = true;
        $scope.descMinHeight = infoContentHeight + 40 + "px";
      })
    }
  }
  setTimeout(hideDesc);

  $scope.toggleDesc = function(){ $scope.descMinimized = !$scope.descMinimized; }

  $scope.openRemovingListing = function() { $scope.removingListing = true; }

  $scope.closeRemovingListing = function() { $scope.removingListing = false; }

  $scope.removeListing = function(listing, itSold) {
    if (itSold) {
      Api.completeListing(listing.listingID).then(
        function (res) {
          refreshListings();
          refreshCurrentUser();
          $scope.closeRemovingListing();
        },
        function (err) { console.log(err) }
      );
    } else { //it didn't sell but the user wants to remove it anyway
      Api.removeListing(listing.listingID).then(
        function (res) {
          refreshListings();
          refreshCurrentUser();
          $scope.closeRemovingListing();
        },
        function (err) { console.log(err) }
      );
    }
  }

  $scope.makeOfferInit = function(listing) {
    $scope.offer.listing = listing;
    console.log(listing);
    $scope.offer.message =
      "Hi "+$scope.offer.listing.user.name.fullName+",\n\n"
      + "I am interested in [buying/renting] your copy of "+$scope.book.name+". "
      + "Please let me know when we could meet.\n\n"
      + "Thanks"
      + ($rootScope.currentUser ? (",\n"+$rootScope.currentUser.name.fullName) : "!")
    $scope.offer.active = true;
  }

  $scope.makeOffer = function() {
    Api.makeOffer($scope.offer.listing.listingID, $scope.offer.message)
      .then( function (data) {
        refreshCurrentUser();
        $scope.offer.active = false;
      }, function (err) {
        console.log(err);
      })
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
    Api.addToWatchlist($scope.book.ISBN).then(
      function (res) { $rootScope.currentUser.subscriptions = res; },
      function (err) { console.log(err); }
    );
  }

  $scope.removeFromWatchlist = function () {
    //TODO: this shit shouldn't happen here.
    Api.removeFromWatchlist($scope.book.ISBN).then(
      function (res) { $rootScope.currentUser.subscriptions = res; },
      function (err) { console.log(err); }
    );
  }

  $scope.openListingPane = function() {
    // initializes the listing pane with correct settings
    // cast prices to checkmarks -- should this be done elsewhere?
    if ($scope.currUserListing) {
      //copy the deets of the user's listing into the panel
      $scope.newListing = {
        condition : $scope.conditionOptions[$scope.currUserListing.condition],
        // if there are prices set, set the form values to those prices, o/w use amazon or fall back on 0.
        sellingPrice : ($scope.currUserListing.sellingPrice != null) ? $scope.currUserListing.sellingPrice : ( Math.min(bookInfo.amazonInfo.sellingPrice, 100) || 0 ),
        rentingPrice : ($scope.currUserListing.rentingPrice != null) ? $scope.currUserListing.rentingPrice : ( Math.min(Math.round(0.5*bookInfo.amazonInfo.sellingPrice), 100)  || 0 ),
        selling   : ($scope.currUserListing.sellingPrice != null),
        renting   : ($scope.currUserListing.rentingPrice != null),
        listingID : $scope.currUserListing.listingID
      };
    }
    $scope.listingPaneOpen = true;
  }

  $scope.closeListingPane = function() {
    $scope.listingPaneOpen = false;
  }

  $scope.submitListing = function () {
    //build the data object
    var data = {
      condition: $scope.newListing.condition.code
    }
    // using -1 tells the server to wipe the selling/renting
    // price. Null tells the server not to record it in the
    // first place. might be more consistent to just use neg-
    // ative numbers.
    if ($scope.newListing.selling) {
      data['sellingPrice'] = $scope.newListing.sellingPrice;
    } else if ($scope.currUserListing) {
      data['sellingPrice'] = -1;
    } else {
      data['sellingPrice'] = null;
    }
    if($scope.newListing.renting) {
      data['rentingPrice'] = $scope.newListing.rentingPrice;
    } else if ($scope.currUserListing) {
      data['rentingPrice'] = -1;
    } else {
      data['rentingPrice'] = null;
    }

    if ($scope.currUserListing) { // if we're updating a listing
      Api.updateListing($scope.currUserListing.listingID, data).then( function (res) {
        refreshListings();
        refreshCurrentUser();
        $scope.closeListingPane();
      }, function (err) {
        console.log(err);
      });
    } else { // this is a fresh listing
      Api.addListing($scope.book.ISBN, data).then(function (res) {
        refreshListings();
        refreshCurrentUser();
        $scope.closeListingPane();
      }, function (err) {
        console.log(err);
      });
    }
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
      console.log("current user is", res);
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

hitsTheBooks.controller('errorReportController', function($scope, $rootScope, $http, Api) {
  $scope.showError = false;
  $scope.errorMessage = '';
  $scope.formData = {};
  $scope.showSuccess = false;
  $scope.successMessage = '';
  $scope.submit = function() {
    if (!navigator.onLine) {
      $scope.showError = true;
      $scope.errorMessage = "You are offline.";
      return;
    }
    var response = Api.reportError($scope.formData).then(function(res) {
      $scope.showError = false;
      $scope.formData = {};
      $scope.successMessage = res;
      $scope.showSuccess = true;
    }, function(err) {
      $scope.showError = true;
      $scope.errorMessage = err.data.errors[0];
    });
  }
});
