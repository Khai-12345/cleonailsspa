/**
 * Init Service
 * */
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}
$(document).ready(function () {
    /*Button Scroll*/
    if (window.matchMedia('(min-width: 992px)').matches) {
        isOnScroll('.service-container', '.btn_service_book', '.fixed-freeze.desktop');
    } else {
        isOnScroll('.service-container', '.btn_service_book', '.fixed-freeze.mobile');
    }

    /*Scroll to service*/
    $(window).on('load', function () {
        if ($('.animation_sroll_jumpto .sroll_jumpto').length > 0) {
            if (window.matchMedia('(min-width: 992px)').matches) {
                scrollJumpTo('#sci_' + getUrlVars()['group'], '.fixed-freeze.desktop');
            } else {
                scrollJumpTo('#sci_' + getUrlVars()['group'], '.fixed-freeze.mobile');
            }
        }
    });
});