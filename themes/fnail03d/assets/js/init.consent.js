/**
 * Init Consent
 * */
(function ($) {
    'use strict';

    /*VALIDATE*/
    let signatureObj = new signature3F("#signature"); // Digital Signature
    let formSendConsent = $("form#send_consent");
    if(formSendConsent.length)
        formSendConsent.validate({
            submit: {
                settings: {
                    button: ".btn_consent",
                    inputContainer: '.form-group',
                    errorListClass: 'form-tooltip-error',
                },
                callback: {
                    onValidate: function (node) {
                        signatureObj.isSignature() ? signatureObj.fill() : signatureObj.clean();
                    },
                    onSubmit: function (node, formdata) {
                        /*Deny duplicate click*/
                        formSendConsent.find(".btn_consent").attr("disabled", "disabled").text('Please wait...');

                        node[0].submit();
                        return false;
                    },
                    onError: function () {
                        let errorElement = formSendConsent.find('.error').first();
                        scrollJumpTo(errorElement.length ? errorElement : formSendConsent, window.matchMedia('(min-width: 992px)').matches ? '.fixed-freeze.desktop' : '.fixed-freeze.mobile');
                    }
                }
            }
        });
})(jQuery);