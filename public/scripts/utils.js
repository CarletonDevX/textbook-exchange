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

//array.includes polyfill
//from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    'use strict';
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1]) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}