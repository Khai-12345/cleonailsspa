/**
 * Form
 * */
/* JS Global */
const stackBottomRightModal = {
    dir1: "up",
    dir2: "left",
    firstpos1: 25,
    firstpos2: 25,
    push: "bottom",
};
let call_notify_object = {};

function callNotify(title_msg, msg, type_notify, delay, remove, type) {
    type_notify = type_notify ? type_notify : "error";
    delay = delay ? +delay : 3000;
    remove = (typeof remove == 'undefined' || remove);

    let icon = "";
    if (type_notify === "error" || type_notify === "notice") {
        icon = "fa fa-exclamation-circle";
    } else if (type_notify === "success") {
        icon = "fa fa-check-circle";
    }

    if (remove && typeof call_notify_object.remove === 'function') {
        call_notify_object.remove();
    }

    let option = {
        title: title_msg,
        text: msg,
        type: type_notify,
        icon: icon,

        closer: true,
        closerHover: true,
        sticker: false,
        stickerHover: false,
        labels: {close: 'Close', stick: 'Stick', unstick: 'Unstick'},
        classes: {closer: 'closer', pinUp: 'pinUp', pinDown: 'pinDown'},

        remove: true,
        destroy: true,
        mouseReset: true,
        delay: delay,
    };

    if (!type) {
        option.addclass = 'alert-with-icon stack-bottomright';
        option.stack = stackBottomRightModal;
    } else {
        option.addclass = 'alert-with-icon';
    }

    if(typeof PNotify !== "undefined"){
        call_notify_object = new PNotify(option);
        return call_notify_object;
    }

    alert(`[${option.title}] ${option.msg}`);
    return false;
}

function call_notify(title_msg, msg, type_notify) {
    callNotify(title_msg, msg, type_notify, 0, 1, 1);
}

function showValidateMsg(objThis, msg) {
    if (!msg) {
        msg = objThis.attr('data-validation-message');
    }
    objThis.addClass('error');
    objThis.parent().append(`<div class="form-tooltip-error"><ul><li>${msg}</li></ul></div>`);
}

function clearValidateMsg(objThis) {
    objThis.removeClass("error");
    objThis.parent().find('.form-tooltip-error').remove();
}

function clearAllValidateMsg(objForm) {
    objForm.find('.error').removeClass('error');
    objForm.find('.form-tooltip-error').remove();
}

function change_content(elemenThis, elemenTo) {
    $(elemenTo).html($(elemenThis).val());
}

function check_enter_number(evt, onthis) {
    if (isNaN(onthis.value + "" + String.fromCharCode(evt.charCode))) {
        return false;
    }
}

function initToken(formID) {
    return false;

    $.ajax({
        type: "get",
        url: "/security/create",
        success: function (token) {
            if (formID) {
                let _this = $(`form#${formID}`);
                _this.find('input[name="token"]').remove();
                _this.prepend("<input type='hidden' name='token' value='" + token + "' />");
            } else {
                $("form").each(function () {
                    let _this = $(this);
                    _this.find('input[name="token"]').remove();
                    _this.prepend("<input type='hidden' name='token' value='" + token + "' />");
                });
            }
        }
    });
}

(function ($) {
    'use strict';

    /* Token */
    initToken();

    /* Mask */
    if (typeof webFormat !== 'undefined') {
        $('.inputPhone').mask(webFormat.phoneFormat.replace(/\d/g, '0'), {placeholder: webFormat.phoneFormat.replace(/\d/g, '_')});

        let inputDate = $('.inputDate');
        inputDate.mask(webFormat.dateFormat.replace(/[^\d\/]/g, '0'), {placeholder: webFormat.dateFormat});
        inputDate.datetimepicker({
            format: webFormat.dateFormat,
        });
    } else {
        $('.inputPhone').mask(phoneFormat.replace(/\d/g, '0'), {placeholder: phoneFormat.replace(/\d/g, '_')});

        let inputDate = $('.inputDate');
        inputDate.mask(dateFormatBooking.replace(/[^\d\/]/g, '0'), {placeholder: dateFormatBooking});
        inputDate.datetimepicker({
            format: dateFormatBooking,
        });
    }

    /* Max length */
    let maxlengthCnt = 0;
    $('[maxlength]').each(function () {
        let _self = $(this);
        let maxLength = parseInt(_self.attr('maxlength'));
        if (maxLength > 0) {
            _self.attr('maxLength', maxLength + 1);
            _self.attr('data-maxlength-error', 'maxlength-error-' + maxlengthCnt);
            _self.after('<div id="maxlength-error-' + maxlengthCnt + '" class="maxlength-error"></div>');
            _self.bind('input propertychange', function () {
                let _this = $(this);
                let maxLength = parseInt(_this.attr('maxlength'));
                let containerError = $('#' + _this.attr('data-maxlength-error'));
                let text = _this.val();
                if (text.length > maxLength - 1) {
                    _this.val(text.substring(0, maxLength - 1));
                    containerError.html('Max Length allowed is ' + (maxLength - 1) + ' character');
                } else {
                    containerError.html('');
                }
            });
            maxlengthCnt++;
        }
    });

    /* Remove Validate msg */
    $('body').on('select2:close, change, focus', 'select, input', function (e) {
        clearValidateMsg($(this));
    });
})(jQuery);