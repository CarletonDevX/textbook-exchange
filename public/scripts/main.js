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
  originSnap = snapshot($el, propsToHelp);
  
  // 2. Copy element invisibly, applying styles
  var $clone = $el.clone()
                  .css({"visibility":"hidden", "transition":"none"})
                  .updateClasses(classesToAlter)
                  .appendTo($el.parent());

  // 3. Take end snapshot of propsToHelp
  targetSnap = snapshot($clone, propsToHelp);

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


hitsTheBooks.controller('headerController', function($scope, $state, $document) {
  $scope.closeBlurb = function(){
    $("#blurb").addClass("hidden");
  }

  // $('header').addClass($state.is('main')?'home-view':'minimized');

  $scope.$on('$stateChangeStart', 
  function(event, toState, toParams, fromState, fromParams){
    if (toState.name=="main"){
      $('#search-results').transist({'add':['minimized']},['height'],200);
    }

    if (toState.name !== "main"){
      $('#search-results').transist({'remove':['minimized']},['height'],200)
    }
    //if we're heading home, erase the search box
    if (toState.name=="main"){
      $('header').transist({'remove':['minimized']},['height'],200)
    } else if(fromState.name=="main"){
      $('header').transist({'add':['minimized']},['height'],200)
    }
  })
})

hitsTheBooks.controller('mainController', function($scope, $state, $document) {
  var streamSearchDelay = 200; //ms
  var initSearch = false;

  //inject the query if we init on the search page
  if($state.is('main.search')){
    $scope.searchInput = $state.params.query;
  }

  $scope.handleSearchPaneClick = function(){
    if ($state.includes('main.detail')) {
      $state.go('main.search',{query: $scope.searchInput});
    }
  }

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

  })


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
    $this.width($this.textWidth()+25);
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

  //this is absolutely absolutely gross.
  //TODO: Find something tastier.
  // setTimeout(function(){
  //   $scope.updateSearchBox();
  // }, 1);
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