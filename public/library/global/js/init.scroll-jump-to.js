/**
* Scroll Jump To
* */
function redirectUrl(url, target) {
    /*Check target*/
    if (typeof target == 'undefined') {
        target = '_self';
    }

    /*append element*/
    let redirect_url = 'redirect_url_' + new Date().getTime();
    $('body').append('<div style="display:none;"><a class="' + redirect_url + '" title="redirect" target="' + target + '">&nbsp;</a></div>');

    /*Call event*/
    let redirect = $('.' + redirect_url);
    redirect.attr('href', url);
    redirect.attr('onclick', "document.location.replace('" + url + "'); return false;");
    redirect.trigger('click');
}

function scrollJumpTo(jumpTo, headerFixed, redirect) {
    /*Check exits element for jumpto*/
    if ($(jumpTo).length > 0) {
        /*Calculator position and call jumpto with effect*/
        let _pos = parseInt($(jumpTo).offset().top);
        let _fixedObj = $(headerFixed);
        let _fixed = parseInt(_fixedObj.length > 0 ? _fixedObj.height() : 0);
        $('html, body').animate({
            scrollTop: (_pos - (_fixed+15)) + 'px'
        }, 750, 'swing');
    }

    /*Check redirect if not exits element for jumpto*/
    else if (redirect) {
        redirectUrl(redirect);
    } else {
        console.log(jumpTo + ' Not found.');
    }
}

function scrollJumpto(jumpTo, headerFixed, redirect){
    scrollJumpTo(jumpTo, headerFixed, redirect);
}

function initEventScrollJumpTo(element) {
    $(element).on('click', function (event) {
        event.preventDefault();

        /*input elements*/
        let jumpto = $(this).data('jumpto');
        let headerFixed = $(this).data('headerfixed');
        let redirect = $(this).data('redirect');

        if (headerFixed === '.freeze-header') headerFixed = window.matchMedia('(min-width: 992px)').matches ? '.fixed-freeze.desktop' : '.fixed-freeze.mobile';

        /*call jump to*/
        scrollJumpTo(jumpto, headerFixed, redirect);
    });
}