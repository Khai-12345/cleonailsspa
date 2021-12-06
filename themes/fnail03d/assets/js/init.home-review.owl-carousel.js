/**
* Init Home OWL review
* */
$(document).ready(function () {
    $("#owl-demo").owlCarousel({
        autoPlay: 5000, //Set AutoPlay to 3 seconds
        dots: true,
        items: 1,
        itemsDesktop: [1199, 3],
        itemsDesktopSmall: [979, 3]
    });
});