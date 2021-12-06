/**
 * Is On Scroll Service
 * */
function isOnScroll(container, selector, header, boundSubtraction) {
    container = (typeof container == "undefined") ? "" : container;
    selector = (typeof selector == "undefined") ? "" : selector;
    header = (typeof header == "undefined") ? "" : header;

    /*Check exit element*/
    if (!$(container).length || !$(selector).length) {
        return false;
    }

    /*Append element instead*/
    let injectSpace = $('<div />', {
        height: $(selector).outerHeight(true),
        class: 'injectSpace' + new Date().getTime()
    }).insertAfter($(selector));
    injectSpace.hide();

    /*Check scroll*/
    $(window).on('scroll', function () {
        if ($(container).isOnScroll_Service(selector, header, boundSubtraction)) {
            injectSpace.show();
        } else {
            injectSpace.hide();
        }
    });
}

(function ($) {
    'use strict';

    $.fn.isOnScroll_Service = function (selector, header, boundSubtraction) {
        /*Calculate viewport*/
        let win = $(window);
        let viewport = {
            top: win.scrollTop(),
            left: win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();

        /*Calculate bounds*/
        let bounds = this.offset();
        if (typeof bounds == 'undefined') {
            return false;
        }

        if ($(boundSubtraction).length > 0) {
            let boundSubtractionHeight = $(boundSubtraction).outerHeight(true);
            let boundMaxWidth = $(boundSubtraction).attr('bound-maxwidth');
            boundMaxWidth = (typeof boundMaxWidth == "undefined") ? 0 : boundMaxWidth;
            if (boundMaxWidth > 0 && window.matchMedia('(max-width: ' + boundMaxWidth + 'px)').matches !== true) {
                boundSubtractionHeight = 0;
            }
            bounds.top = bounds.top + boundSubtractionHeight;
        }
        bounds.right = bounds.left + this.outerWidth();
        bounds.bottom = bounds.top + this.outerHeight();

        let boundsSelectorObj = $(selector).parent();
        let boundsSelector = boundsSelectorObj.offset();
        boundsSelector.right = boundsSelector.left + boundsSelectorObj.outerWidth();
        boundsSelector.bottom = boundsSelector.top + boundsSelectorObj.outerHeight();

        /*Calculate header fixed*/
        let headerHeight = 0;
        if ($(header).length > 0) {
            headerHeight = $(header).outerHeight(true);

            /*Check fixed*/
            let checkFixed = $(header).attr('checkfixed');
            checkFixed = (typeof checkFixed == "undefined") ? 'false' : checkFixed;
            if (checkFixed === "true" && $(header).css('position') !== 'fixed') {
                headerHeight = 0;
            }

            /*Check max width*/
            let maxWidth = $(header).attr('header-maxwidth');
            maxWidth = (typeof maxWidth == 'undefined') ? 0 : maxWidth;
            if (maxWidth > 0 && window.matchMedia('(max-width: ' + maxWidth + 'px)').matches !== true) {
                headerHeight = 0;
            }
        }

        if (viewport.top >= (bounds.top - headerHeight) && viewport.top <= (bounds.bottom - headerHeight)) {
            $(selector).css({
                'position': 'fixed',
                'top': headerHeight + 'px',
                'right': (viewport.right - boundsSelector.right) + 'px',
                'z-index': '1001',
            });
            return true;
        } else {
            $(selector).css({
                'position': '',
            });
            return false;
        }
    };
})(jQuery);