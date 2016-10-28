(function ($) {
  $('html').niceScroll({zindex: 999, cursorborder: '', cursorborderradius: '0px', cursorwidth: '10px', cursorcolor: '#555555', cursoropacitymin: .5});
  function initNice() {
    if ($(window).innerWidth() <= 960) {
      $('html').niceScroll().remove();
    }
    else {
      $('html').niceScroll({zindex: 999, cursorborder: '', cursorborderradius: '2px', cursorcolor: '#555555', cursoropacitymin: .1});
    }
  }
  $(window).load(initNice);
  $(window).resize(initNice);
})(jQuery);