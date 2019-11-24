(function($) {
  $.fn.blue_slider = function(options) {
    var settings = $.extend({
      slide_template: '1fr',
      slide_gap: 0,
      current_fr_index: 1,
      current_fr_index_flow: true,
      slide_step: 1,
      current_fr_class: 'fr-current',
      active_fr_class: 'fr-active',
      custom_fr_class: '',
      left_padding: 0,
      right_padding: 0,
      speed: 1000,
      ease_function: 'ease-out',
      sencitive_drag: 100,
      loop: false,
      auto_play: false,
      auto_play_period: 3000,
      start_slide_index: 1,
      arrows: false,
      prev_arrow: '',
      next_arrow: '',
    }, options);
    var sliderParent = this;
    var sliderParentWidth = parseInt(sliderParent.css('width')) - (settings.right_padding + settings.left_padding);
    var prev_slide_arrow = '';
    var next_slide_arrow = '';
    var sencitive_drag = settings.sencitive_drag;
    var wholeItemsCount = sliderParent.children().length;
    var current_fr_class = settings.current_fr_class;
    var active_fr_class = settings.active_fr_class;
    var customFrClass;
    if (settings.custom_fr_class !== '') {
      customFrClass = settings.custom_fr_class.split(' ');
      for (var i = 0; i < customFrClass.length; i++) {
        if (customFrClass[i] === '') {
          customFrClass.splice(i--, 1);
        }
      }
    }
    var slide_gap = parseInt(settings.slide_gap);
    var current_fr_index = parseInt(settings.current_fr_index);
    var slide_template = settings.slide_template.trim();
    for (var s = 0; s < slide_template.length; s++) {
      var indexBegin = slide_template.indexOf('(', s);
      if (indexBegin > -1) {
        var indexComma = slide_template.indexOf(',', ++indexBegin);
        var indexEnd = slide_template.indexOf(')', ++indexComma);
        var repeatCount = parseInt(slide_template.substring(indexBegin, indexComma));
        var repeatValue = ' ' + slide_template.substring(indexComma, indexEnd).trim() + ' ';
        var tempSlide_template = slide_template.substring(0, indexBegin - 1);
        for (var r = 0; r < repeatCount; r++) {
          tempSlide_template += repeatValue;
        }
        slide_template = tempSlide_template + slide_template.substring(indexEnd + 1);
        s = indexBegin;
      }
    }
    var activeItemsArray = slide_template.split(' ');
    for (var i = 0; i < activeItemsArray.length; i++) {
      if (activeItemsArray[i] === '') {
        activeItemsArray.splice(i--, 1);
      }
    }
    var activeItemsCount = activeItemsArray.length;
    var frItemsCount = 0;
    var frItemsWidth = 0;
    var pxItemsCount = 0;
    var pxItemsWidth = 0;
    var pxMinItemWidth = sliderParentWidth;
    var frWidth = 0;
    for (var i = 0; i < activeItemsCount; i++) {
      if (activeItemsArray[i].indexOf('fr') > -1) {
        frItemsCount++;
        frItemsWidth += parseFloat(activeItemsArray[i]);
      } else {
        pxItemsCount++;
        pxItemsWidth += parseFloat(activeItemsArray[i]);
        if (pxMinItemWidth > parseFloat(activeItemsArray[i])) {
          pxMinItemWidth = parseFloat(activeItemsArray[i]);
        }
      }
    }
    if ((sliderParentWidth - pxItemsWidth - (slide_gap * pxItemsCount)) > 0) {
      if (frItemsCount == 0) {
        activeItemsArray.push('1fr');
        activeItemsCount = activeItemsArray.length;
        frItemsCount++;
        frItemsWidth = 1;
      }
      frWidth = (sliderParentWidth - pxItemsWidth - (slide_gap * (activeItemsCount - 1))) / frItemsWidth;
    } else {
      if (frItemsCount == 0) {
        activeItemsArray.push('1fr');
        activeItemsCount = activeItemsArray.length;
        frItemsCount++;
        frItemsWidth = 1;
      }
      frWidth = pxMinItemWidth;
    }
    if (current_fr_index > activeItemsCount || current_fr_index < 1) {
      console.error("Blue-Slider Error: The input of 'current_fr_index' must be bigger than zero and less than or equal to the number of slides to be shown!");
      return false;
    }
    var slideWrapperContainer = document.createElement('div');
    slideWrapperContainer.className = 'slide-wrapper';
    slideWrapperContainer.style.position = 'relative';
    slideWrapperContainer.style.width = '100%';
    slideWrapperContainer.style.height = '100%';
    var slideTrackContainer = document.createElement('div');
    slideTrackContainer.className = 'slide-tracker';
    slideTrackContainer.style.position = 'absolute';
    slideTrackContainer.style.height = '100%';
    slideTrackContainer.style.width = ((frWidth * frItemsWidth) + pxItemsWidth + (frWidth * (wholeItemsCount - frItemsCount - pxItemsCount)) + (slide_gap * wholeItemsCount)) + 'px';
    slideTrackContainer.style.transition = 'transform ' + settings.speed + 'ms ' + settings.ease_function;
    sliderParent.children().each(function() {
      var slideItemContainer = document.createElement('div');
      slideItemContainer.className = 'slide-item';
      slideItemContainer.style.position = 'absolute';
      slideItemContainer.style.height = '100%';
      slideItemContainer.style.width = '0';
      slideItemContainer.style.top = 0;
      slideItemContainer.style.left = 0;
      slideItemContainer.style.transition = 'all ' + settings.speed + 'ms ' + settings.ease_function;
      slideItemContainer.appendChild(this);
      slideTrackContainer.appendChild(slideItemContainer);
    });
    slideWrapperContainer.append(slideTrackContainer);
    sliderParent.append(slideWrapperContainer);
    var slideWrapper = sliderParent.children('.slide-wrapper');
    var slideTracker = slideWrapper.children('.slide-tracker');
    var slideItems = slideTracker.children('.slide-item');
    if ((2 - settings.start_slide_index) > current_fr_index || (!settings.current_fr_index_flow ? (settings.start_slide_index > wholeItemsCount - current_fr_index + 1) : (settings.start_slide_index > wholeItemsCount))) {
      console.error("Blue-Slider Error: The input of 'start_slide_index' is not in correct range!");
      return false;
    }
    var start_slide_index = settings.start_slide_index - 1;
    if (settings.current_fr_index_flow && start_slide_index < 0) {
      start_slide_index = 0;
    }
    var currentTransX = settings.left_padding;
    if (start_slide_index >= 0) {
      currentTransX = (-(frWidth + slide_gap) * start_slide_index) + settings.left_padding;
    } else {
      for (var i = 0; i < -start_slide_index; i++) {
        if (activeItemsArray[i].indexOf('fr') > -1) {
          currentTransX += (frWidth * parseFloat(activeItemsArray[i])) + slide_gap + settings.left_padding;
        } else {
          currentTransX += parseFloat(activeItemsArray[i]) + slide_gap + settings.left_padding;
        }
      }
    }
    var current_fr_index_temp = 1;
    slideTracker.css({
      'transform': 'translate3d(' + currentTransX + 'px, 0, 0)'
    });
    var setWidthItems = function() {
      var totalItemsWidth = 0;
      slideItems.each(function(index) {
        var newIndex = index - start_slide_index;
        var itemWidth = frWidth;
        if (newIndex >= 0 && newIndex < activeItemsCount) {
          if (activeItemsArray[newIndex].indexOf('fr') > -1) {
            itemWidth = (frWidth * parseFloat(activeItemsArray[newIndex]));
          } else {
            itemWidth = parseFloat(activeItemsArray[newIndex]);
          }
        }
        $(this).css({
          'width': itemWidth,
          'transform': 'translate3d(' + totalItemsWidth + 'px, 0, 0)',
        });

        if (settings.current_fr_index_flow) {
          if ((newIndex + 1) == current_fr_index_temp) {
            $(this).addClass(current_fr_class);
          } else {
            $(this).removeClass(current_fr_class);
          }
        } else {
          if ((newIndex + 1) == current_fr_index) {
            $(this).addClass(current_fr_class);
          } else {
            $(this).removeClass(current_fr_class);
          }
        }

        if ((newIndex + 1) > 0 && (newIndex + 1) <= activeItemsCount) {
          $(this).addClass(active_fr_class);
        } else {
          $(this).removeClass(active_fr_class);
        }

        if (customFrClass) {
          for (var c = 0; c < customFrClass.length; c++) {
            $(this).removeClass(customFrClass[c]);
          }
          if (customFrClass[newIndex]) {
            $(this).addClass(customFrClass[newIndex]);
          }
        }

        totalItemsWidth += (itemWidth + slide_gap);
      });
    }
    setWidthItems();
    var arrowClickEnable = true;
    var slideAutoPlay;
    if (settings.arrows) {
      if (settings.prev_arrow !== '') {
        prev_slide_arrow = $(settings.prev_arrow);
      }
      if (settings.next_arrow !== '') {
        next_slide_arrow = $(settings.next_arrow);
      }
    }
    prev_slide_arrow.on('click', function() {
      if(!arrowClickEnable) {
        return false;
      }
      if (settings.auto_play) {
        clearInterval(slideAutoPlay);
      }
      for (var i = 0; i < settings.slide_step; i++) {
        slideBackward();
      }
      if (settings.auto_play) {
        slideAutoPlay = setInterval(autoPlayRun, settings.auto_play_period);
      }
    });
    next_slide_arrow.on('click', function() {
      if(!arrowClickEnable) {
        return false;
      }
      if (settings.auto_play) {
        clearInterval(slideAutoPlay);
      }
      for (var i = 0; i < settings.slide_step; i++) {
        slideForward();
      }
      if (settings.auto_play) {
        slideAutoPlay = setInterval(autoPlayRun, settings.auto_play_period);
      }
    });

    var xClick;
    slideTracker.on('mousedown', '.slide-item', function(e) {
      xClick = e.pageX;
    });
    slideTracker.on('mouseup', '.slide-item', function(e) {
      if (xClick == e.pageX) {
        slideTracker.css('transition', 'transform ' + settings.speed + 'ms ' + settings.ease_function);
        var moveSteps = $(this).index() - slideTracker.children('.' + current_fr_class).index();
        if (moveSteps > 0) {
          for (var i = 0; i < moveSteps; i++) {
            slideForward();
          }
        } else if (moveSteps < 0) {
          for (var i = 0; i < Math.abs(moveSteps); i++) {
            slideBackward();
          }
        }
      }
    });

    var dragEnable = false;
    var posX = 0;
    var distanceMove = 0;
    var velocity = 1;
    sliderParent.mousedown(function(e) {
      dragEnable = true;
      velocity = 1;
      posX = e.pageX - $(this).offset().left;
      var slideTrackerStyles = slideTracker.attr('style');
      var newStyles = slideTrackerStyles.substring(0, slideTrackerStyles.indexOf('transition') - 1) +
        slideTrackerStyles.substring(slideTrackerStyles.indexOf(';', slideTrackerStyles.indexOf('transition')) + 1);
      slideTracker.attr('style', newStyles);
      if (settings.auto_play) {
        clearInterval(slideAutoPlay);
      }
    });
    sliderParent.on('dragstart', function() {
      return false;
    });
    $(window).on('mouseup drop', function(e) {
      if(!dragEnable) {
        return false;
      }
      dragEnable = false;
      slideTracker.css('transition', 'transform ' + settings.speed + 'ms ' + settings.ease_function);
      if (Math.abs(distanceMove) > sencitive_drag) {
        if (distanceMove > 0) {
          for (var i = 0; i < settings.slide_step; i++) {
            slideBackward();
          }
        } else {
          for (var i = 0; i < settings.slide_step; i++) {
            slideForward();
          }
        }
      } else {
        slideTracker.css({
          'transform': 'translate3d(' + currentTransX + 'px, 0, 0)'
        });
      }
      distanceMove = 0;
      if (settings.auto_play) {
        slideAutoPlay = setInterval(autoPlayRun, settings.auto_play_period);
      }
    });
    sliderParent.mousemove(function(e) {
      if (dragEnable) {
        var newPosX = (e.pageX - $(this).offset().left);
        distanceMove = newPosX - posX;
        if ((slideTracker.children('.' + current_fr_class).index() == 0 && distanceMove > 0) ||
          (slideTracker.children('.' + current_fr_class).index() == wholeItemsCount - 1 && distanceMove < 0)) {
          var distanceTemp = Math.abs(distanceMove);
          velocity = 1 - (distanceTemp / sliderParentWidth);
        }
        distanceMove *= velocity;
        slideTracker.css({
          'transform': 'translate3d(' + (distanceMove + currentTransX) + 'px, 0, 0)'
        });
      }
    });

    function slideBackward() {
      if (settings.current_fr_index_flow &&
        (current_fr_index_temp > current_fr_index ||
          (current_fr_index_temp > slideTracker.children('.' + current_fr_class).index())) &&
        (current_fr_index_temp > 1)) {
        current_fr_index_temp--;
      } else {
        arrowClickEnable = false;
        if (slideTracker.children('.' + current_fr_class).index() != 0) {
          start_slide_index--;
          if ((currentTransX + (frWidth + slide_gap)) > settings.left_padding && (currentTransX + (frWidth + slide_gap)) <= (sliderParentWidth - settings.right_padding)) {
            var itemWidth = frWidth;
            if (activeItemsArray[Math.abs(start_slide_index) - 1].indexOf('fr') > -1) {
              itemWidth = (frWidth * parseFloat(activeItemsArray[Math.abs(start_slide_index) - 1]));
            } else {
              itemWidth = parseFloat(activeItemsArray[Math.abs(start_slide_index) - 1]);
            }
            currentTransX += (itemWidth + slide_gap);
          } else {
            currentTransX += (frWidth + slide_gap);
          }
        }
        setTimeout(function() { arrowClickEnable = true; }, settings.speed);
      }
      slideTracker.css({
        'transform': 'translate3d(' + currentTransX + 'px, 0, 0)'
      });
      setWidthItems();
    }

    function slideForward() {
      if (settings.current_fr_index_flow &&
        (current_fr_index_temp < current_fr_index ||
          (wholeItemsCount - slideTracker.children('.' + current_fr_class).index() - 1 <= activeItemsCount - current_fr_index)) &&
        (current_fr_index_temp < activeItemsCount)) {
        current_fr_index_temp++;
      } else {
        arrowClickEnable = false;
        if (slideTracker.children('.' + current_fr_class).index() != wholeItemsCount - 1) {
          start_slide_index++;
          if ((currentTransX - (frWidth + slide_gap)) >= 0 && (currentTransX - (frWidth + slide_gap)) <= sliderParentWidth) {
            var itemWidth = frWidth;
            if (activeItemsArray[Math.abs(start_slide_index)].indexOf('fr') > -1) {
              itemWidth = (frWidth * parseFloat(activeItemsArray[Math.abs(start_slide_index)]));
            } else {
              itemWidth = parseFloat(activeItemsArray[Math.abs(start_slide_index)]);
            }
            currentTransX -= (itemWidth + slide_gap);
          } else {
            currentTransX -= (frWidth + slide_gap);
          }
        }
        setTimeout(function() { arrowClickEnable = true; }, settings.speed);
      }
      slideTracker.css({
        'transform': 'translate3d(' + currentTransX + 'px, 0, 0)'
      });
      setWidthItems();
    }
    var slideDirection = 1;
    if (settings.auto_play) {
      slideAutoPlay = setInterval(autoPlayRun, settings.auto_play_period);
    }
    function autoPlayRun() {
      if (slideTracker.children('.' + current_fr_class).index() == 0) {
        slideDirection = 1;
      } else if (slideTracker.children('.' + current_fr_class).index() == wholeItemsCount - 1) {
        slideDirection = 0;
      }
      if (slideDirection) {
        slideForward();
      } else {
        slideBackward();
      }
    }
  }
})(jQuery);
