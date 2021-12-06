/**
 * Init News
 * */
(function ($) {
    'use strict';

    /* Anchor Link */
    $('[href^="#"]:not([data-toggle])').on("click", function (event) {
        let _h = $(this).attr('href');
        let _hsplit = _h.substr(1, _h.length);
        if ( _hsplit != 'open_booking' ) {
            event.preventDefault();
            scrollJumpTo(_h, window.matchMedia('(min-width: 992px)').matches ? '.fixed-freeze.desktop' : '.fixed-freeze.mobile');
        }
    });
})(jQuery);