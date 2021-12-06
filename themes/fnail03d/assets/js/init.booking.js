/**
 * Init Booking
 * */
function convertDate(input) {
    let list_date = input.split("/");
    let splitDate = posFormat.split(",");
    let new_date = list_date[splitDate[2]] + "/" + list_date[splitDate[1]] + "/" + list_date[splitDate[0]];
    return new_date;
}

function setHtmldate(date_choose, locationTo_obj, loading_obj) {
    let mask_loading_obj = $('<div class="mask_booking" style="position: absolute; height: 100%; width: 100%; top: 0; left: 0; background:rgba(0,0,0,0.5);text-align: center;"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></div>');
    if (loading_obj) {
        loading_obj.append(mask_loading_obj);
    }

    let new_date = convertDate(date_choose);
    let d = new Date(new_date);

    let months = [webForm['jan'], webForm['feb'], webForm['mar'], webForm['apr'], webForm['may'], webForm['jun'], webForm['jul'], webForm['aug'], webForm['sep'], webForm['oct'], webForm['nov'], webForm['dec']];
    let days = [webForm['sunday'], webForm['monday'], webForm['tuesday'], webForm['wednesday'], webForm['thursday'], webForm['friday'], webForm['saturday']];

    let str_show = days[d.getDay()] + ", " + months[d.getMonth()] + "-" + d.getDate() + "-" + d.getFullYear();
    locationTo_obj.html(str_show);

    if (loading_obj) {
        mask_loading_obj.remove();
    }
}

function pushHtmlTime(input_date, type, locationTo_obj, loading_obj) {
    let mask_loading_obj = $('<div class="mask_booking" style="position: absolute; height: 100%; width: 100%; top: 0; left: 0; background:rgba(0,0,0,0.5);text-align: center;"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></div>');
    $.ajax({
        type: "post",
        url: "/book/get_hours",
        data: {input_date: input_date, type: type},
        beforeSend: function () {
            if (loading_obj) {
                loading_obj.append(mask_loading_obj);
            }
        },
        success: function (response) {
            let obj = JSON.parse(response);

            if (type == 'option') {
                let html = '<option value="">Select hours</option>';
                html += '<optgroup label="Morning" class="timeMorning">' + obj.htmlMorning + '</optgroup>';
                html += '<optgroup label="Afternoon" class="timeAfternoon">' + obj.htmlAfternoon + '</optgroup>';
                locationTo_obj.html(html);
            } else {
                setHtmldate(input_date, locationTo_obj.find('.time_show'));

                locationTo_obj.find('.note_am_time').html(obj.checkmorning == false ? webForm['booking_hours_expired'] : '');
                locationTo_obj.find('.note_pm_time').html(obj.checkafternoon == false ? webForm['booking_hours_expired'] : '');

                locationTo_obj.find('.html_time_morning').html(obj.htmlMorning);
                locationTo_obj.find('.html_time_afternoon').html(obj.htmlAfternoon);
            }
        },
        complete: function () {
            if (loading_obj) {
                mask_loading_obj.remove();
            }
        }
    });
}

function pushHtmlStaff(input_staff, locationTo_obj, loading_obj) {
    let mask_loading_obj = $('<div class="mask_booking" style="position: absolute; height: 100%; width: 100%; top: 0; left: 0; background:rgba(0,0,0,0.5);text-align: center;"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></div>');
    if (loading_obj) {
        loading_obj.append(mask_loading_obj);
    }

    let html = '<option value="">' + webForm['booking_technician_placeholder'] + '</option>';
    if (input_staff) {
        let obj = JSON.parse(input_staff);
        for (var x in obj) {
            html += `<option value="${obj[x].id}" urlimg="${obj[x].image}">${obj[x].name}</option>`;
        }
    }
    locationTo_obj.html(html);

    if (loading_obj) {
        mask_loading_obj.remove();
    }
}

function pushHtmlServiceStaff(input_service_obj, input_staff_obj, locationTo_obj, loading_obj) {
    let mask_loading_obj = $('<div class="mask_booking" style="position: absolute; height: 100%; width: 100%; top: 0; left: 0; background:rgba(0,0,0,0.5);text-align: center;"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></div>');
    if (loading_obj) {
        loading_obj.append(mask_loading_obj);
    }

    let services = [];
    input_service_obj.each(function () {
        let temp = {};
        temp.price = 'N/A';
        temp.name = 'N/A';
        if ($(this).val()) {
            temp.price = $('option:selected', this).attr('price');
            temp.name = $('option:selected', this).text();
        }

        services.push(temp);
    });

    let staffs = [];
    input_staff_obj.each(function () {
        let temp = {};
        temp.name = webForm['any_person'];
        temp.image = '/public/library/global/no-photo.jpg';
        if ($(this).val()) {
            temp.name = $('option:selected', this).text();
            temp.image = $('option:selected', this).attr('urlimg');
        }

        staffs.push(temp);
    });

    let html = '';
    for (var x in services) {
        html += `
        <div class="staff_service_v1 col-sm-6 col-md-6">
            <div class="col-xs-4 staff-avatar">
                <img class="img-responsive" src="${staffs[x].image}" alt="${staffs[x].name}">
            </div>
            <div class="col-xs-8">
                <h4>${staffs[x].name}</h4>
                <p>${services[x].name}</p>
                <p>${webForm['price']}: ${services[x].price}</p>
            </div>
        </div>
        `;
    }
    locationTo_obj.html(html);

    if (loading_obj) {
        mask_loading_obj.remove();
    }
}

function addItemBooking(objForm) {
    let html = '<div class="row item-booking is-more"><div class="remove-services removeButton pointer"><i class="fa fa-minus-circle"></i></div>' + objForm.find('.item_template').html() + '</div>';
    let last_item_obj = objForm.find('.item-booking').last();
    last_item_obj.after($(html));
}

function saveForm(objForm) {
    let formData = objForm.serialize();
    $.ajax({
        type: "post",
        url: "/book/saveform",
        data: formData,
        success: function (html) {
        }
    });
}

function loadForm(formData, formObj, formType) {
    if (formData) {
        let obj = JSON.parse(formData);

        if (formType == 'email') {
            /*Service, staff*/
            let listService = typeof (obj.service_staff) != "undefined" ? obj.service_staff : [];
            if (listService.length > 0) {
                let booking_service_obj = formObj.find('.booking_service');
                let booking_staff_obj = formObj.find('.booking_staff');
                for (var x in listService) {
                    let service_staff = listService[x].split(',');

                    booking_service_obj.find(`option[value="${service_staff[0]}"]`).attr("selected", "selected");
                    pushHtmlStaff(booking_service_obj.find("option:selected").attr("staff"), booking_staff_obj, booking_staff_obj.parent());

                    booking_staff_obj.find(`option[value="${service_staff[1]}"]`).attr("selected", "selected");
                }
            }

            /*Date, hours*/
            let booking_date_obj = formObj.find('.booking_date');
            let booking_hours_obj = formObj.find('.booking_hours');
            let booking_date = typeof (obj.booking_date) != "undefined" ? obj.booking_date : '';
            if (booking_date != '') {
                booking_date_obj.val(booking_date);
            }
            pushHtmlTime(booking_date_obj.val(), 'option', booking_hours_obj, booking_hours_obj.parent());

            let booking_hours = typeof (obj.booking_hours) != "undefined" ? obj.booking_hours : '';
            if (booking_hours != '') {
                booking_hours_obj.find(`option[value="${booking_hours}"]`).attr("selected", "selected");
            }
        } else {
            /*Service, staff*/
            let listService = typeof (obj.service_staff) != "undefined" ? obj.service_staff : [];
            if (listService.length > 0) {
                let booking_item_obj = {};
                let booking_service_obj = {};
                let booking_staff_obj = {};
                let service_staff = {};
                for (var x in listService) {
                    if (x > 0) {
                        addItemBooking(formObj);
                    }

                    service_staff = listService[x].split(',');
                    booking_item_obj = formObj.find('.item-booking:last')
                    booking_service_obj = booking_item_obj.find('.booking_service');
                    booking_staff_obj = booking_item_obj.find('.booking_staff');

                    booking_service_obj.find(`option[value="${service_staff[0]}"]`).attr("selected", "selected");
                    pushHtmlStaff(booking_service_obj.find("option:selected").attr("staff"), booking_staff_obj, booking_staff_obj.parent());

                    booking_staff_obj.find(`option[value="${service_staff[1]}"]`).attr("selected", "selected");
                }
            }
            pushHtmlServiceStaff(formObj.find(".booking_service"), formObj.find(".booking_staff"), $('#box_service_staff'), $('#booking_info'));

            /*Date, hours*/
            let booking_date_obj = formObj.find('.booking_date');
            let booking_hours_obj = formObj.find('.booking_hours');
            let booking_date = typeof (obj.booking_date) != "undefined" ? obj.booking_date : '';
            if (booking_date != '') {
                booking_date_obj.val(booking_date);
            }
            pushHtmlTime(booking_date, 'html', $('#box_date_time'), $('#booking_info'));
            $('#booking_info').show();

            let booking_hours = typeof (obj.booking_hours) != "undefined" ? obj.booking_hours : '';
            if (booking_hours != '') {
                booking_hours_obj.val(booking_hours);
            }
        }
    }
}

(function ($) {
    /*DATE TIME PICKER BOOKING*/
    $('.bookingDate').datetimepicker({
        format: dateFormatBooking,
        minDate: minDateBooking,
        defaultDate: minDateBooking,
    });

    /*EMAIL BOOKING*/
    let formEmailBooking = $("form#emailBooking");

    formEmailBooking.on("change", ".booking_service", function () {
        let booking_staff_obj = formEmailBooking.find('.booking_staff');
        pushHtmlStaff($(this).find("option:selected").attr("staff"), booking_staff_obj, booking_staff_obj.parent());
        saveForm(formEmailBooking);
    });

    formEmailBooking.on("dp.change", ".booking_date", function () {
        let booking_hours_obj = formEmailBooking.find('.booking_hours');
        pushHtmlTime($(this).val(), 'option', booking_hours_obj, booking_hours_obj.parent());
        saveForm(formEmailBooking);
    });

    formEmailBooking.on("change", ".booking_staff, .booking_hours", function () {
        saveForm(formEmailBooking);
    });

    formEmailBooking.validate({
        submit: {
            settings: {
                clear: 'keypress',
                display: "inline",
                button: ".btn_send_appointment",
                inputContainer: 'form-group',
                errorListClass: 'form-tooltip-error',
            },
            callback: {
                onSubmit: function (node, formdata) {
                    let isValidate = true;

                    /*Deny duplicate click*/
                    formEmailBooking.find(".btn_send_appointment").attr("disabled", "disabled");

                    /*Clears all form errors*/
                    formEmailBooking.removeError();

                    /*Check services multi*/
                    if (formdata['product_id[]'].length <= 0) {
                        isValidate = false;
                        formEmailBooking.addError({
                            'product_id[]': webForm ['booking_service_err'],
                        });
                    }

                    if (enableRecaptcha && !$("#g-recaptcha-response").val()) {
                        isValidate = false;
                    }

                    if (isValidate) {
                        node[0].submit();
                    } else {
                        formEmailBooking.find(".btn_send_appointment").removeAttr("disabled");
                        scrollJumpto(formEmailBooking);
                    }

                    return false;
                },
                onError: function () {
                    scrollJumpto(formEmailBooking);
                }
            }
        }
    });

    /*SMS BOOKING*/
    let formSmsBooking = $("form#smsBooking");

    formSmsBooking.on("click", ".addButton", function () {
        addItemBooking(formSmsBooking);
        pushHtmlServiceStaff(formSmsBooking.find(".booking_service"), formSmsBooking.find(".booking_staff"), $('#box_service_staff'), $('#booking_info'));
        saveForm(formSmsBooking);
    });

    formSmsBooking.on("click", ".removeButton", function () {
        let last_item_obj = $(this).closest('.item-booking');
        last_item_obj.remove();
        pushHtmlServiceStaff(formSmsBooking.find(".booking_service"), formSmsBooking.find(".booking_staff"), $('#box_service_staff'), $('#booking_info'));
        saveForm(formSmsBooking);
    });

    formSmsBooking.on("change", ".booking_service", function () {
        let booking_staff_obj = $(this).closest('.item-booking').find('.booking_staff');
        pushHtmlStaff($(this).find("option:selected").attr("staff"), booking_staff_obj, booking_staff_obj.parent());
        pushHtmlServiceStaff(formSmsBooking.find(".booking_service"), formSmsBooking.find(".booking_staff"), $('#box_service_staff'), $('#booking_info'));
        saveForm(formSmsBooking);
    });

    formSmsBooking.on("change", ".booking_staff", function () {
        pushHtmlServiceStaff(formSmsBooking.find(".booking_service"), formSmsBooking.find(".booking_staff"), $('#box_service_staff'), $('#booking_info'));
        saveForm(formSmsBooking);
    });

    formSmsBooking.on("dp.change", ".booking_date", function () {
        pushHtmlTime($(this).val(), 'html', $('#box_date_time'), $('#booking_info'));
        saveForm(formSmsBooking);
    });

    formSmsBooking.on("click", ".btn_action", function (e) {
        e.preventDefault();
        let isValidate = true;

        /*Deny duplicate click*/
        formSmsBooking.find(".btn_action").attr("disabled", "disabled");

        /*Clears all form errors*/
        clearAllValidateMsg(formSmsBooking);

        /*Check services multi*/
        let booking_service_obj = formSmsBooking.find('.booking_service');
        booking_service_obj.each(function () {
            if ($(this).val()) {
                clearValidateMsg($(this));
            } else {
                isValidate = false;
                showValidateMsg($(this), webForm ['booking_service_err']);
            }
        });

        /*Check staff multi*/
        if (bookingRequiredTechnician == 1) {
            let booking_staff_obj = formSmsBooking.find('.booking_staff');
            booking_staff_obj.each(function () {
                if ($(this).val()) {
                    clearValidateMsg($(this));
                } else {
                    isValidate = false;
                    showValidateMsg($(this), webForm ['booking_technician_err']);
                }
            });
        }

        /*Check date*/
        let booking_date_obj = formSmsBooking.find('.booking_date');
        if (booking_date_obj.val()) {
            clearValidateMsg(booking_date_obj);
        } else {
            isValidate = false;
            showValidateMsg(booking_date_obj, webForm ['booking_date_err']);
        }

        if (isValidate) {
            pushHtmlServiceStaff(formSmsBooking.find(".booking_service"), formSmsBooking.find(".booking_staff"), $('#box_service_staff'), $('#booking_info'));
            pushHtmlTime(formSmsBooking.find(".booking_date").val(), 'html', $('#box_date_time'), $('#booking_info'));
            let booking_info_obj = $('#booking_info');
            booking_info_obj.show();
            scrollJumpto(booking_info_obj);
        }

        formSmsBooking.find(".btn_action").removeAttr("disabled");
    });

    $("body").on("click", ".open_booking", function (e) {
        e.preventDefault();
        let isValidate = true;
        formSmsBooking.find('[name="booking_hours"]').val($(this).attr("valhours"));

        /*Check services multi*/
        let services = formSmsBooking.find('.booking_service');
        services.each(function () {
            if ($(this).val()) {
                clearValidateMsg($(this));
            } else {
                isValidate = false;
                showValidateMsg($(this), webForm ['booking_service_err']);
            }
        });

        /*Check staff multi*/
        if (bookingRequiredTechnician == 1) {
            let booking_staff_obj = formSmsBooking.find('.booking_staff');
            booking_staff_obj.each(function () {
                if ($(this).val()) {
                    clearValidateMsg($(this));
                } else {
                    isValidate = false;
                    showValidateMsg($(this), webForm ['booking_technician_err']);
                }
            });
        }

        /*Check date*/
        let booking_date_obj = formSmsBooking.find('.booking_date');
        if (booking_date_obj.val()) {
            clearValidateMsg(booking_date_obj);
        } else {
            isValidate = false;
            showValidateMsg(booking_date_obj, webForm ['booking_date_err']);
        }

        if (isValidate == true) {
            $.magnificPopup.open({
                type: 'inline',
                midClick: true,
                closeOnBgClick: false,
                items: {
                    src: '#open_booking',
                },
            });
        } else {
            scrollJumpto(formSmsBooking);
        }

        return false;
    });

    $("body").on("click", ".btn_cancel", function (e) {
        e.preventDefault();
        $.magnificPopup.close();
    });

    let formSmsBookingConfirm = $("form#smsBookingConfirm");
    formSmsBookingConfirm.validate({
        submit: {
            settings: {
                clear: 'keypress',
                display: "inline",
                button: ".btn_confirm",
                inputContainer: 'form-group',
                errorListClass: 'form-tooltip-error',
            },
            callback: {
                onSubmit: function (node, formdata) {
                    let isValidate = true;

                    /*Deny duplicate click*/
                    formSmsBookingConfirm.find(".btn_confirm").attr("disabled", "disabled");

                    /*Clears all form errors*/
                    formSmsBookingConfirm.removeError();

                    if (enableRecaptcha) {
                        let g_recaptcha_response = $("#g-recaptcha-response").val();
                        if (g_recaptcha_response) {
                            formSmsBooking.find('[name="g-recaptcha-response"]').val(g_recaptcha_response);
                        } else {
                            isValidate = false;
                        }
                    }

                    if (isValidate) {
                        formSmsBooking.find('[name="booking_name"]').val(formdata['booking_name']);
                        formSmsBooking.find('[name="booking_phone"]').val(formdata['booking_phone']);
                        formSmsBooking.find('[name="notelist"]').val(formdata['notelist'] ? formdata['notelist'] : '');
                        formSmsBooking.find('[name="store_id"]').val(formdata['choose_store'] ? formdata['choose_store'] : 0);

                        formSmsBooking.submit();
                    }

                    formSmsBookingConfirm.find(".btn_confirm").removeAttr("disabled");
                    scrollJumpto(formSmsBooking);
                    return false;
                },
                onError: function () {
                    scrollJumpto(formSmsBooking);
                }
            }
        }
    });
})(jQuery);

$(document).ready(function () {

});