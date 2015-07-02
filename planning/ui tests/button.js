/*Here's how this deal works:
1. Take a 'snapshot' (height,width,position) of the button
2. Copy the button invisibly
3. Apply the new styling to the button copy
4. Take a snapshot of that new styling, clean up
5. Apply the origin snapshot to the button to give the browser values it can animate
6. Apply the target snapshot to the button to trigger the animation
7. Remove the snapshot styling to retain fluid, flexible layout :)
*/

$(function(){
  $(".dialog-button").click(function(){
    
   //Our snapshot function
   var getLoc = function(element){
     var $element = $(element);
     return {
       top: $element.position().top + "px",
       left: $element.position().left + "px",
       height: $element.css("height"),
       width: $element.css("width")
     };
   };
   
   //Step 1
   var $el = $(this);
   var $elInner = $el.children().first();
   var origin = getLoc($el);
   var originInner = getLoc($elInner);
     
   //Step 2-4
   var $clone = $el.clone()
                   .css("visibility","hidden")
                   .toggleClass('expanded')
                   .toggleClass('collapsed')
                   .appendTo($el.parent());
   var $cloneInner = $clone.children().first();
   var target = getLoc($clone);
   var targetInner = getLoc($cloneInner);
    
   $clone.remove();
    
   
   //Step 5
   $el.css(origin);
   $elInner.css( $el.hasClass("collapsed") ? targetInner:originInner );
   //A setTimeout of 0 gives the style time to register before we transition
   setTimeout(function(){
     //add pos: abs and transition: all
     $el.addClass("dialog-transition");
     //Step 6: transition to target info
     $el.css(target);
     $el.toggleClass("expanded").toggleClass("collapsed");
     //Step 7: when that's done, put back into the flow
     // (500ms is the transition time set in the css)
     setTimeout(function(){
       $el.removeClass("dialog-transition")
          .removeAttr("style");
       $elInner.removeAttr("style");
     },500);
   },0);

  });
});