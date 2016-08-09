var hitsTheBooks = angular.module('hitsTheBooks', ['ui.router', 'ct.ui.router.extras', 'ngFileUpload', 'ngImgCrop']);

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

// Like ng-mousedown but not activated when click event
// is bubbled up the the el with the directive
hitsTheBooks.directive('ngHtbSelfMousedown', [ '$parse', '$rootScope', function($parse, $rootScope) {
  return {
    restrict: 'A',
    compile: function($element, attrs){
      var fn = $parse(attrs['ngHtbSelfMousedown'], null, true);
      return function ngHtbEventHandler(scope, element) {
        element.on('mousedown', function(event) {
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
        results: function(Api, $stateParams, $q) {
          if ($stateParams.query) {
            return Api.search($stateParams.query);
          } else {
            return $q.resolve(null);
          }
        }
      },
      onEnter: function($stateParams, $state) {
        if ($stateParams.query == null) {
          $state.go('main');
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
        },
        //rootscope works mostly, unless you're landing on your own userpage
        watchlist: function(Api, $stateParams) {
          /* do this instead */
          return Api.getWatchlist()
            .then(function(result) {
              if (result.status && result.status == 401) {
                result = [];
              }
              return result
            });
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
    if ($scope.currentUser){
      $state.go('main.detail.user', {userID: $scope.currentUser.userID} );
    } else $state.go('account');
    $previousState.memo('accountEntryPoint');
  }

  //transists for header
  $scope.$on('$stateChangeStart',
    function(event, toState, toParams, fromState, fromParams) {
    //header transitions
    if (toState.name=="main"){
        $('header').transist({'remove':['minimized']},['height'],200)
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
    $state.go('main.detail.user', {userID: $scope.currentUser.userID} );
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
  $scope.SignInAlert = {
    NONE : 0,
    INCORRECT_INFO : 1,
    UNVERIFIED : 2,
    SERVER_ERROR : 3,
    RESEND_RESET_ALERT : 4
  };
  $scope.RegisterAlert = {
    NONE : 0,
    INVALID_INFO : 1,
    SERVER_ERROR : 2,
    SUCCESS : 3
  };

  // Login
  $scope.loginData = { username: '', password: '' };
  $scope.signinAlert = $scope.SignInAlert.NONE;
  $scope.login = function (loginData) {
    Api.login(loginData).then(function (res) {
      switch (res.status) {
        case 401:
          $scope.signinAlert = $scope.SignInAlert.INCORRECT_INFO;
          break;
        case 400:
          $scope.signinAlert = $scope.SignInAlert.UNVERIFIED;
          break;
        case 500:
          $scope.signinAlert = $scope.SignInAlert.SERVER_ERROR;
          break;
        default:
          $scope.closeAccount();
          $scope.signinAlert = $scope.SignInAlert.NONE;
          break;
      }
    });
  };

  // Registration
  $scope.registerData = { username: '', password: '', givenName: '', familyName: '', gradYear: '' }
  $scope.registerAlert = $scope.RegisterAlert.NONE;
  $scope.registrationError = "";
  $scope.register = function (registerData) {
    Api.register(registerData).then(function(res) {
      switch (res.status) {
        case 400:
          $scope.registerAlert = $scope.RegisterAlert.INVALID_INFO;
          $scope.registrationError = res.data;
          break;
        case 500:
        case 0:
          $scope.registerAlert = $scope.RegisterAlert.SERVER_ERROR;
          break;
        default:
          $scope.registerData = { username: '', password: '', givenName: '', familyName: '' }
          $scope.registerAlert = $scope.RegisterAlert.SUCCESS;
          break;
      }
    });
  };

  $scope.requestPasswordReset = function() {
    Api.requestPasswordReset($scope.loginData.username).then(function(res) {
      switch (res.status) {
        case 200:
          $scope.signinAlert = $scope.SignInAlert.RESEND_RESET_ALERT;
          $scope.resendResetAlert = res.data;
          break;
        case 400:
          $scope.signinAlert = $scope.SignInAlert.RESEND_RESET_ALERT;
          $scope.resendResetAlert = res.data.errors[0];
          break;
        case 404:
          $scope.signinAlert = $scope.SignInAlert.RESEND_RESET_ALERT;
          $scope.resendResetAlert = "User not found";
          break;
        case 500:
          $scope.signinAlert = $scope.SignInAlert.SERVER_ERROR;
          break;
      }
    });

  }

  $scope.resendVerification = function() {
    Api.resendVerificationEmail($scope.loginData.username).then(function(res) {
      switch (res.status) {
        case 200:
          $scope.signinAlert = $scope.SignInAlert.RESEND_RESET_ALERT;
          $scope.resendResetAlert = res.data;
          break;
        case 400:
          $scope.signinAlert = $scope.SignInAlert.RESEND_RESET_ALERT;
          $scope.resendResetAlert = res.data.errors[0];
          break;
        case 404:
          $scope.signinAlert = $scope.SignInAlert.RESEND_RESET_ALERT;
          $scope.resendResetAlert = "User not found.";
          break;
        case 500:
          $scope.signinAlert = $scope.SignInAlert.SERVER_ERROR;
          break;
      }
    });
  }
});

hitsTheBooks.controller('accountEditController', function($scope, $state) {
  return
});

hitsTheBooks.controller('mainController', function($scope, $rootScope, $state, $document) {
  var streamSearchDelay = 200; //ms
  var initSearch = false;
  angular.extend($scope, {
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
  });

  //inject the query if we init on the search page
  if ($state.is('main.search')) {
    $scope.searchInput = $state.params.query;
  }

  $scope.handleSearchPaneClick = function(){
    if ($state.includes('main.detail') && $scope.searchInput) {
      $state.go('main.search',{query: $scope.searchInput});
    }
  }

  //keep search box kleen
  $scope.$on('$stateChangeStart',
  function(event, toState, toParams, fromState, fromParams){
    //if we're heading home, erase the search box
    if (toState.name == "main"){
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

    if (fromState.name == "main.search" && toState.name !== "main.search") {
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
    if (fromState.name == "main" && toState.name == "main.search") {
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
    $scope.offer.message =
      "Hi "+$scope.offer.listing.user.name.fullName+",\n\n"
      + "I am interested in [buying/renting] your copy of \""+$scope.book.name+"\". "
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

hitsTheBooks.controller('userPageController', function($scope, $state, $timeout, $rootScope, userInfo, Upload, Api, watchlist, $stateParams, AUTH_EVENTS) {
  $scope.user = userInfo;
  $scope.watchlist = watchlist; 
  $scope.emailSettings = {};
  if ($rootScope.currentUser){
    angular.extend($scope.emailSettings, $rootScope.currentUser.emailSettings);
  }

  $scope.$on(AUTH_EVENTS.loginSuccess,
    function() {
      refreshUser();
      refreshWatchlist();
    }
  );
  angular.extend($scope, {
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
    avatar : {
      active: false,
      picFile: null,
      croppedImage: ''
    },
    changePwData : {},
    editingUser : false,
    removingListingID : null,
    newUserInfo : {
      //hehehe -- Joe
      possGradYears : (() => {d = new Date().getFullYear(); return Array.from(Array(6),(x,i)=>i+d-1)})()
    },
    disabledComponents : {
      watchlistbox : false,
      undercutbox : false,
      htbupdatebox : false,
      pwChanging : false,
      newUserInfo : false
    },
  }); 

  $scope.initiateUserEdit = function() {
    $scope.editingUser = true;
    angular.extend(
      $scope.newUserInfo, 
      {
        givenName : $scope.user.name.givenName,
        familyName : $scope.user.name.familyName,
        gradYear: $scope.user.gradYear,
        bio: $scope.user.bio
      }
    );
  }

  $scope.cancelUserEdit = function() {
    $scope.editingUser = false;
  }

  $scope.deleteAccount = function() {
    if (confirm("Are you sure you want to delete all your HTB data? This action can't be undone.")) {
      Api.deleteCurrentUser().then(function (res) {
        $state.go('main');
      }, function (err){
        alert("Sorry we could not delete your account at this time.")
      });
    } else {
      // Do nothing!
    }
  }

  $scope.updateUser = function() {
    $scope.disabledComponents.newUserInfo = true;
    Api.updateCurrentUser({
      bio: $scope.newUserInfo.bio,
      givenName : $scope.newUserInfo.givenName,
      familyName : $scope.newUserInfo.familyName,
      gradYear : $scope.newUserInfo.gradYear
    }).then(function(res){
      $scope.disabledComponents.newUserInfo = false;
      $scope.editingUser = false;
      refreshUser();
      refreshCurrentUser();
    }, function (err){
      alert("Unable to update user.");
      $scope.disabledComponents.newUserInfo = false;
      $scope.editingUser = false;
    });
  }

  $scope.validateNewPw = function() {
    if ($scope.changePwData.newPw == $scope.changePwData.newPwRepeat) {
      document.getElementById('new-pw-repeat').setCustomValidity('');
    } else {
      document.getElementById('new-pw-repeat').setCustomValidity('Must match the previous field');
    }
  }

  $scope.changePassword = function(pwData) {
    $scope.disabledComponents.pwChanging = true;
    Api.updateCurrentUser({
      oldPassword : pwData.oldPw,
      password : pwData.newPw
    }).then(
    function(res){
      console.log(res);
      $scope.changePwData.alert = "Password changed!"
      $scope.changePwData.oldPw = null;
      $scope.changePwData.newPw = null;
      $scope.changePwData.newPwRepeat = null;
      $scope.disabledComponents.pwChanging = false;      
    }, function(err){
      console.log('error!')
      console.log(err);
      $scope.changePwData.alert = err.data;
      $scope.disabledComponents.pwChanging = false;      
    });
  }

  $scope.openAvatarModal = function() { $scope.avatar.active = true; }
  $scope.closeAvatarModal = function() {
    $scope.avatar = {
      active: false,
      picFile: null,
      croppedImage: '',
      progress: null
    };
  }

  $scope.upload = function(dataUrl, name) {
    Upload.upload({
      url: '/api/avatar',
      data: {
        file: Upload.dataUrltoBlob(dataUrl, name)
      }
    }).then(function (response) {
      $timeout(function () {
        // $scope.result = response.data;
        refreshUser();
        $scope.closeAvatarModal();
      });
    }, function (response) {
      if (response.status > 0) $scope.errorMsg = response.status 
        + ': ' + response.data;
    }, function (evt) {
      $scope.avatar.progress = parseInt(100.0 * evt.loaded / evt.total);
    });
  }

  $scope.handleEmailSettingChange = function (componentName) {
    $scope.disabledComponents[componentName] = true;
    data = {emailSettings: JSON.stringify($scope.emailSettings)};
    Api.updateCurrentUser(data).then(
      function(res) {
        $scope.disabledComponents[componentName] = false;
        $rootScope.currentUser = res;
        angular.extend($scope.emailSettings, $rootScope.currentUser.emailSettings);
      }, function (err) {
        $scope.disabledComponents[componentName] = false;
        angular.extend($scope.emailSettings, $rootScope.currentUser.emailSettings);
        console.log(err)
      });
  }

  var refreshWatchlist = function() {
    Api.getWatchlist().then(
      function (res) { $scope.watchlist = res },
      function (err) { console.log(err); }
    );
  }

  $scope.unsubscribe = function(ISBN) {
    Api.removeFromWatchlist(ISBN).then(
      function (res) { refreshWatchlist(); },
      function (err) { console.log(err); }
    );
  }

  $scope.clearWatchlist = function() {
    Api.clearWatchlist().then(
      function (res) { refreshWatchlist(); },
      function (err) { console.log(err); }
    );
  }

  $scope.openRemovingListing = function(listing) {
    $scope.removingListingID = listing.listingID;
  }

  $scope.closeRemovingListing = function() {
    $scope.removingListingID = null;
  }

  var refreshUser = function() {
    Api.getUser($stateParams.userID).then( function(user) {
      $scope.user = user;
    }, function(err) {
      console.log(err);
    });
  }

  $scope.removeListing = function(listing, itSold) {
    if (itSold) {
      Api.completeListing(listing.listingID).then(
        function (res) {
          refreshUser();
          refreshCurrentUser();
          $scope.closeRemovingListing();
        },
        function (err) { console.log(err) }
      );
    } else { //it didn't sell but the user wants to remove it anyway
      Api.removeListing(listing.listingID).then(
        function (res) {
          refreshUser();
          refreshCurrentUser();
          $scope.closeRemovingListing();
        },
        function (err) { console.log(err) }
      );
    }
  }

  $scope.makeOfferInit = function(listing) {
    $scope.offer.listing = listing;
    $scope.offer.message =
      "Hi "+$scope.user.name.fullName+",\n\n"
      + "I am interested in [buying/renting] your copy of \""+$scope.offer.listing.book.name+"\". "
      + "Please let me know when we could meet.\n\n"
      + "Thanks"
      + ($rootScope.currentUser ? (",\n"+$rootScope.currentUser.name.fullName) : "!")
    $scope.offer.active = true;
  }

  var refreshCurrentUser = function() {
    $scope.setCurrentUser();
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

  $scope.openListingPane = function(listing) {
    // initializes the listing pane with correct settings
    // cast prices to checkmarks -- should this be done elsewhere?
    //copy the deets of the user's listing into the panel
    console.log("listing: ", listing)
    $scope.newListing = {
      bookName : listing.book.name,
      condition : $scope.conditionOptions[listing.condition],
      // if there are prices set, set the form values to those prices, o/w use amazon or fall back on 0.
      sellingPrice : (listing.sellingPrice != null) ? listing.sellingPrice : 0,
      rentingPrice : (listing.rentingPrice != null) ? listing.rentingPrice : 0,
      selling   : (listing.sellingPrice != null),
      renting   : (listing.rentingPrice != null),
      listingID : listing.listingID
    };
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
    } else {
      data['sellingPrice'] = -1;
    }

    if($scope.newListing.renting) {
      data['rentingPrice'] = $scope.newListing.rentingPrice;
    } else {
      data['rentingPrice'] = -1;
    } 

    Api.updateListing($scope.newListing.listingID, data).then( function (res) {
      refreshUser();
      refreshCurrentUser();
      $scope.closeListingPane();
    }, function (err) {
      console.log(err);
    });
}

});

// Top-level shit
hitsTheBooks.controller('applicationController', function($state, $scope, $rootScope, Api, AUTH_EVENTS) {

  // Route change error handling
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    $state.go('main.detail.error', {message:error.data}, {location: false});
  });

  $scope.setCurrentUser = function () {
    Api.getCurrentUser().then(function (res) {
      $rootScope.currentUser = res;
    },
    function (err) {
      $rootScope.currentUser = null;
    });
  }

  $scope.logout = function () {
    Api.logout().then(function () {
      $scope.setCurrentUser();
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
