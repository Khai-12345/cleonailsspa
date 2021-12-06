/**
* Magnific Popup
* */
function initImageMagnificPopup(elementClass) {
    let groups = {};
    $(elementClass).each(function () {
        let id = $(this).attr('data-group');
        if (!groups[id]) {
            groups[id] = [];
        }
        groups[id].push(this);
    });
    $.each(groups, function () {
        $(this).magnificPopup({
            type: 'image',
            closeOnContentClick: true,
            closeBtnInside: true,
            gallery: {enabled: true}
        });
    });
}
(function ($) {
    'use strict';
    initImageMagnificPopup('.m-magnific-popup');
})(jQuery);