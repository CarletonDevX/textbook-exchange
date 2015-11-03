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

//wrapper for $.addClass, $.removeClass, $toggleClass
$.fn.updateClasses = function(cAlter){
  if (cAlter.add){
    for (var i = cAlter.add.length - 1; i >= 0; i--) {
      this.addClass(cAlter.add[i]);
    }
  }
  if (cAlter.remove){
    for (var i = cAlter.remove.length - 1; i >= 0; i--) {
      this.removeClass(cAlter.remove[i]);
    }
  }
  if (cAlter.toggle){
    for (var i = cAlter.toggle.length - 1; i >= 0; i--) {
      this.toggleClass(cAlter.toggle[i]);
    }
  }

  return this;
}

//transition assist (to and from 'auto')
$.fn.transist = function(classesToAlter, propsToHelp, transTime) {
  /*
  propsToHelp is a list of strings
  classesToAlter = {'add':['classname','bla'], 'remove':['asfd'], 'toggle': ['as']}
  */

  var snapshot = function(element, props){
    var $el = $(element);

    var measurer =  { //things we know how to measure
      top: $el.position().top + "px",
      left: $el.position().left + "px",
      height: $el.css("height"),
      width: $el.css("width")
    };

    var snap = {}

    for (var i = props.length - 1; i >= 0; i--) {
      if (measurer[props[i]]){
        snap[props[i]] = measurer[props[i]];
      } else {
        throw new Error("Sorry, transit doesn't know how to measure '"+props[i]+"'.");
      }
    };

    return snap;
  }

  var $el = this;

  // 1. Take a snapshot
  var originSnap = snapshot($el, propsToHelp);
  
  // 2. Copy element invisibly, applying styles
  var $clone = $el.clone()
                  .updateClasses(classesToAlter)
                  .css({"visibility":"hidden", "transition":"none"})
                  .appendTo($el.parent());

  // 3. Take end snapshot of propsToHelp
  var targetSnap = snapshot($clone, propsToHelp);

  // 4. Delete the invisible copy
  $clone.remove();

  // 5. Apply the origin snapshot to the actual element
  $el.css(originSnap);
  // a settimeout to get the css to register
  setTimeout(function(){
    //Apply the target snapshot and styles
    $el.updateClasses(classesToAlter)
       .css(targetSnap);
    //Once transition is over, remove the target snapshot.
    setTimeout(function(){
      $el.removeAttr("style");
    }, transTime)
  },0)
}

//measure width of text, e.g. in input element
//based on http://stackoverflow.com/a/18109656
$.fn.textWidth = function(text, font) {
    if (!$.fn.textWidth.fakeEl) $.fn.textWidth.fakeEl = $('<span>').hide().appendTo(document.body);
    var htmlText = text || this.val() || this.text();
    htmlText = $.fn.textWidth.fakeEl.text(htmlText).html(); //encode to Html
    htmlText = htmlText.replace(/\s/g, "&nbsp;"); //replace trailing and leading spaces
    $.fn.textWidth.fakeEl.html(htmlText).css('font', font || this.css('font'));
    return $.fn.textWidth.fakeEl.width();
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

    .state('account', { url: '',
      views:{'account' : {
          templateUrl: 'partials/account',
          controller: 'accountController' }}
    })
    .state('account.access', { url: '/login',
      templateUrl : '/partials/account.access',
      controller  : 'accountAccessController'
    })
    .state('account.details', { url : '',
      templateUrl : '/partials/account.details',
      controller  : 'accountDetailsController'
    })
    .state('account.edit',{ url: '',
      templateUrl : '/partials/account.edit',
      controller  : 'accountEditController'
    })
    .state('main',{
      url: '/',
      sticky: true,
      views:{
        'main' : {
          templateUrl: 'partials/main',
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
          templateUrl : '/partials/detail'
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


    .state('otherwise', {
      url: "*path",
      template: "Oops! We don't know how to serve you (404)"
    })

    //use HTML5 History API
    $locationProvider.html5Mode(true);
})


hitsTheBooks.controller('headerController', function($scope, $rootScope, $state, $document) {
  $scope.closeBlurb = function() {
    $("#blurb").addClass("hidden");
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

hitsTheBooks.controller('accountController', function($scope, $state) {
  //yea
  return
});

// Enum for events that will be broadcasted
hitsTheBooks.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success'
});

hitsTheBooks.controller('accountAccessController', function($scope, $rootScope, $state, Api, AUTH_EVENTS) {

  // Click background of modal to exit (probably not the best way to do this, just put it in for convenience)
  $('#account-wrapper').click(function (){
    $state.go('main');
  })
  $('#account').click(function (e){
    e.stopPropagation();
  });

  // Login
  $scope.loginData = { username: '', password: '' };

  $scope.login = function (loginData) {
    Api.login(loginData).then(function (res) {
      $scope.setCurrentUser(res.data);
      $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
      $state.go("main");
    }, function () {
      $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
    });
  };

  // Registration
  $scope.registerData = { username: '', password: '', givenName: '', familyName: '' }

  $scope.register = function (loginData) {
    // Nothing here yet :(
  };
});

hitsTheBooks.controller('accountDetailsController', function($scope, $state) {
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

  //the classic type and hit [enter] search
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
  $scope.results = results.data;
});

hitsTheBooks.controller('bookController', function($scope, bookInfo, $state, $stateParams) {
  $scope.book = bookInfo.data;
});

hitsTheBooks.controller('userPageController', function($scope, userInfo, $stateParams) {
  $scope.user = userInfo.data;
});

// Top-level shit
hitsTheBooks.controller('applicationController', function($scope, $rootScope, Api, AUTH_EVENTS) {

  // We'll move this the the account detail controller soon...
  $scope.logout = function () {
    Api.logout().then(function () {
      $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
    });
  }

  Api.getCurrentUser().then(function (res) {
    $scope.setCurrentUser(res.data);
  });

  // This is probably not the best way to do this...
  $scope.showAccountAccess = function () {
    $("#account-details-buttons").hide();
    $("#account-access-buttons").show();
  }
  $scope.showAccountDetails = function () {
    $("#account-details-buttons").show();
    $("#account-access-buttons").hide();
  }

  $scope.setCurrentUser = function (user) {
    $scope.currentUser = user;
    if (user) {
      $scope.showAccountDetails();
    } else {
      $scope.showAccountAccess();
    }
  };

  $scope.setCurrentUser(null);

  //Auth listeners (for testing)
  $scope.$on(AUTH_EVENTS.loginSuccess, 
  function(event, args){
    console.log("Logged in.");
  });
  $scope.$on(AUTH_EVENTS.loginFailed, 
  function(event, args){
    console.log("Login failed.");
  });
  $scope.$on(AUTH_EVENTS.logoutSuccess, 
  function(event, args){
    console.log("Logged out.");
    $scope.setCurrentUser(null);
  });

});