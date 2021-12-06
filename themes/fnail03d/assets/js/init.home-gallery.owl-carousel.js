/**
* Init Home OWL gallery
* */
$(document).ready(function () {
    $(".gallery-owl").owlCarousel({
        items: 3,
        slideSpeed: 300,
        autoPlay: 4000,
        navigation: true,
        navigationText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
        pagination: false,
        dots: false,
        lazyLoad: true,
        itemsDesktop: [992, 2],
        itemsDesktopSmall: [768, 1],
        itemsTablet: [576, 1]
    });
});