/**
 * Global Functions
 * */

/*
* Active Menu
* */
function setActiveMenu(elementMenuMain, elementMenuMobile, inputs) {
    if (!inputs) {
        console.log('set active menu missed inputs');
        return false;
    }
    if (typeof inputs.site == "undefined" || inputs.site === "idx") inputs.site = "";
    if (typeof inputs.site_act == "undefined") inputs.site_act = "";
    if (inputs.site === 'p') inputs.site += '/' + inputs.site_act;

    elementMenuMain = elementMenuMain.split(",");
    for (let j in elementMenuMain) {
        elementMenuMain[j] += ` > li > a[href="/${inputs.site}"]`;
    }
    elementMenuMain = elementMenuMain.join(',');

    elementMenuMobile = elementMenuMobile.split(",");
    for (let j in elementMenuMobile) {
        elementMenuMobile[j] += ` > li > a[href="/${inputs.site}"]`;
    }
    elementMenuMobile = elementMenuMobile.join(',');

    $(`${elementMenuMain}, ${elementMenuMobile}`).addClass('active').parent().addClass('active');
}

/*
* Gallery Category
* ids: '' | 'id+id+id'
* */
function getGalleryCategory(ids = [], status = 1, page = 1, container = '', callback = function () {}) {
    let data = {
        cat_id: 'id+' + (ids.constructor === Array ? ids.join('+') : ids),
        cat_status: parseInt(status),
        page: parseInt(page),
        blockId: container,
        returnJson: true
    };
    data.cat_status = !isNaN(data.cat_status) ? data.cat_status : 1;
    data.page = !isNaN(data.page) ? data.page : 1;

    let containerObj = $(data.blockId);
    let maskLoadingObj = $('<div class="mask_booking" style="position: absolute; height: 100%; width: 100%; top: 0; left: 0; background:rgba(0,0,0,0.5);text-align: center;"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></div>');

    $.ajax({
        type: 'post',
        url: '/gallery/getlistbycat',
        data: data,
        dataType: 'Json',
        beforeSend: function () {
            containerObj.append(maskLoadingObj);
        },
        success: function (obj) {
            if (typeof callback === 'function') callback(obj);
        },
        complete: function () {
            maskLoadingObj.remove();
        }
    });
}

/*
* Menu Category
* ids: '' | 'id+id+id'
* */
function getMenuCategory(ids = [], container = '', callback = function () {}) {
    let maskLoadingObj = $('<div class="mask_booking" style="position: absolute; height: 100%; width: 100%; top: 0; left: 0; background:rgba(0,0,0,0.5);text-align: center;"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></div>');
    $.ajax({
        type: 'get',
        url: '/service/get_category/id+' + (ids.constructor === Array ? ids.join('+') : ids),
        dataType: 'Json',
        beforeSend: function () {
            $(container).append(maskLoadingObj);
        },
        success: function (obj) {
            if (typeof callback === 'function') callback(obj);
        },
        complete: function () {
            maskLoadingObj.remove();
        }
    });
}

(function ($) {
    'use strict';

    /* ANCHOR LINK */
    $('[href^="#"]:not([data-toggle])').on("click", function (event) {
        let _h = $(this).attr('href');
        let _hsplit = _h.substr(1, _h.length);
        if (_hsplit !== 'open_booking') {
            event.preventDefault();
            if(typeof scrollJumpTo === 'function'){
                scrollJumpTo(_h, window.matchMedia('(min-width: 992px)').matches ? '.fixed-freeze.desktop' : '.fixed-freeze.mobile');
            } else if ($(_h).length > 0) {
                /*Calculator position and call jumpto with effect*/
                let _pos = parseInt($(_h).offset().top);
                let _fixedObj = $(window.matchMedia('(min-width: 992px)').matches ? '.fixed-freeze.desktop' : '.fixed-freeze.mobile');
                let _fixed = parseInt(_fixedObj.length > 0 ? _fixedObj.height() : 0);
                $('html, body').animate({
                    scrollTop: (_pos - (_fixed+15)) + 'px'
                }, 750, 'swing');
            }
        }
    });
})(jQuery);