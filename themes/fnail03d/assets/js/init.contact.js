/**
 * Init Contact
 * */
(function ($) {
    'use strict';

    $("#send_contact_main").validate({
        submit: {
            settings: {
                button: ".btn_contact",
                inputContainer: '.form-group',
                errorListClass: 'form-tooltip-error',
            }
        }
    });
})(jQuery);