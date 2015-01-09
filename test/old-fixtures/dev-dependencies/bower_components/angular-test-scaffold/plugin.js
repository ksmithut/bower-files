'use strict';
/* global $ */
/* global inject */

$(function(){

  $.fn.ngBrowserTrigger = function(eventType) {

    var element = this[0];

    if (!element) {
      throw 'element cannot simulate event:' + eventType;
    }

    if (document.createEvent) {
      
      var event = document.createEvent('MouseEvents');
      event.initMouseEvent(eventType, true, true, window,
        0, 0, 0, 0, 0, false, false, false, false, 0, element);
      element.dispatchEvent(event);

    } else {

      element.fireEvent('on' + eventType);

    }

  };

  $.fn.ngClickLink = $.fn.$click = function() {

    var element = this;

    var href = element.attr('href');

    if (!element || !href){
      throw 'cannot simulate click link on element';
    }

    element.scope().$apply(inject(function($location){
      element.click();
      $location.path(href);
    }));
  };

  $.fn.ngTypeOn = $.fn.$type = function(string) {

    this.val(string);
    this.ngBrowserTrigger('input');

  };

});
