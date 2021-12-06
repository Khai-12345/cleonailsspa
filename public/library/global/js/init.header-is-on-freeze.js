/**
 * Is On Freeze Header
 * */
function isFreezeHeader(wrapFreezeHeader, flagFreezeHeader, device) {
    let deviceName = device === 'mobile' ? 'mobile' : 'desktop';
    let wrapFreezeHeaderObj = $(wrapFreezeHeader);
    let flagFreezeHeaderObj = $(flagFreezeHeader);

    if (!flagFreezeHeaderObj.hasClass('initializedFreezeHeader') && wrapFreezeHeaderObj.length > 0 && flagFreezeHeaderObj.length > 0) {
        flagFreezeHeaderObj.addClass('initializedFreezeHeader');
        wrapFreezeHeaderObj.addClass(`fixed-freeze ${deviceName}`);

        let insteadFreezeHeaderObj = $(`<div class="instead-flag-freeze-header ${deviceName}"></div>`);
        insteadFreezeHeaderObj.insertBefore(flagFreezeHeaderObj);

        $(window).on('scroll', function () {
            if (wrapFreezeHeaderObj.isOnFreeze_Header()) {
                flagFreezeHeaderObj.removeClass(`freeze-header with-bg ${deviceName}`);
                insteadFreezeHeaderObj.height('0');
            } else {
                insteadFreezeHeaderObj.height(flagFreezeHeaderObj.outerHeight() + 'px');
                flagFreezeHeaderObj.addClass(`freeze-header with-bg ${deviceName}`);
            }
        });
    }
}

(function ($) {
    'use strict';

    $.fn.isOnFreeze_Header = function () {
        /* Not included margin, padding of window */
        let win = $(window);
        let viewport = {
            top: win.scrollTop(),
            left: win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();

        /* Not included margin of this element: same container */
        let bounds = this.offset();
        if (typeof bounds == 'undefined') {
            return false;
        }
        bounds.right = bounds.left + this.outerWidth();
        bounds.bottom = bounds.top + this.outerHeight();

        return (bounds.top >= viewport.top && bounds.bottom <= viewport.bottom);
    };
})(jQuery);