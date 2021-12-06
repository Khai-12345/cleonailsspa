/**
 * JavaScript of theme
 * */
(function ($) {
    'use strict';

    /* Nav Mobile */
    $(".menu-btn-show").click(function () {
        $('.menu-bar-mobile').toggleClass("menu-bar-mobile-show");
        $(".shadow-mobile").fadeIn();
    });
    $(".shadow-mobile").click(function () {
        $('.menu-bar-mobile').removeClass("menu-bar-mobile-show");
        $(this).fadeOut();
    });

    /* Toggle menu mobile */
    $('.dropdown-toggle > .btn-toggle').click(function () {
        $(this).closest('.dropdown-toggle').find('.dropdown-menu-toggle').first().slideToggle();
    });
    $('.menu-bar-toggle > .btn-toggle').click(function () {
        $(this).closest('.menu-bar-toggle').find('.menu-bar-toggle-container').first().slideToggle();
    });
})(jQuery);

$(document).ready(function () {
    /* Wow Animation */
    new WOW().init();

    /* Freeze Header */
    let activeFreezeHeader = parseInt($('[name="activeFreezeHeader"]').val());
    if (activeFreezeHeader === 1 || activeFreezeHeader === 3) {
        isFreezeHeader('.wrap-freeze-header', '.flag-freeze-header');
    }

    if (activeFreezeHeader === 1 || activeFreezeHeader === 2) {
        isFreezeHeader('.wrap-freeze-header-mobile', '.flag-freeze-header-mobile', 'mobile');
    }

    /* Scroll to top */
    $('.arrow-footer').click(function () {
        $('html, body').animate({scrollTop: 0}, 800);
        return false;
    });
});