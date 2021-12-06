/**
* Init Home OWL service
* */
$(document).ready(function () {
    $("#owl-our-services").owlCarousel({
        items: 3,
        slideSpeed: 300,
        pagination: false,
        autoPlay: 4000,
        navigation: true,
        navigationText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
        lazyLoad: true,
        itemsDesktop: [990, 2],
        itemsDesktopSmall: [600, 1],
        itemsTablet: [560, 1]
    });
});