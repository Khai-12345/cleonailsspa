/**
 * Init Booking
 * */
function web_goTo(jumpToElement, redirectURL) {
    scrollJumpto(jumpToElement, window.matchMedia('(min-width: 992px)').matches ? '.fixed-freeze.desktop' : '.fixed-freeze.mobile', redirectURL);
}

const maskLoadingHtml = '<div class="mask_booking" style="position: absolute; z-index: 2; height: 100%; width: 100%; top: 0; left: 0; background:rgba(0,0,0,0.5);text-align: center;"><i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i></div>';
let webBookingForm = {
    formID: 'form#formBooking',
    formConfirmID: 'form#formBookingConfirm',
    boxBookingInfo: '#boxBookingInfo',
    boxServiceStaff: '#boxServiceStaff',
    boxDateTime: '#boxDateTime',
    popupBookingConfirm: '#popupBookingConfirm',

    itemIndex: 0,
    categories: {},
    services: {},
    staffs: {},
    getHoursProcess: {
        'queue': '',
        'process': '',
        'sending': false,
    },
    saveFormProcess: {
        'queue': 0,
        'process': 0,
        'sending': false,
    },

    init: function (categories_JsonString, services_JsonString, staffs_JsonString, dataForm_JsonString) {
        let _this = this;

        // Events
        _this.setEvents();

        // Category & Service
        _this.setCategories(categories_JsonString);
        _this.setServices(services_JsonString);

        // Staffs
        _this.setStaffs(staffs_JsonString);

        // Data Form
        _this.setDataForm(dataForm_JsonString);
    },

    setEvents: function () {
        let _this = this;
        let formObj = $(_this.formID);
        let formConfirmObj = $(_this.formConfirmID);

        // Date time picker
        formObj.find('.booking_date').mask(webFormat.dateFormat.replace(/[^\d\/]/g, '0'), {placeholder: webFormat.dateFormat});
        formObj.find('.booking_date').datetimepicker({
            format: webFormat.dateFormat,
            minDate: webBooking.minDate,
            defaultDate: webBooking.minDate,
        });

        formObj.on('dp.change', '.booking_date', function () {
            _this.setOptionCategoryAndServices();
            _this.setOptionStaffs();

            _this.generalHTML(true);
            _this.saveForm();
        });

        formObj.on('change', '.booking_service', function () {
            let itemID = $(this).closest('.booking-item').attr('id');
            _this.setOptionStaff(itemID);

            _this.generalHTML(true);
            _this.saveForm();
        });

        formObj.on('change', '.booking_staff', function () {
            _this.generalHTML(true);
            _this.saveForm();
        });

        formObj.on('click', '.booking_item_add', function () {
            _this.addItem();
            _this.saveForm();
        });

        formObj.on('click', '.booking_item_remove', function () {
            let itemID = $(this).closest('.booking-item').attr('id');
            _this.removeItem(itemID);

            _this.generalHTML(true);
            _this.saveForm();
        });

        formObj.on('click', '.search_booking', function (e) {
            e.preventDefault();

            let _self = $(this);
            _self.attr('disabled', 'disabled');

            _this.generalHTML();
            _this.saveForm();

            _self.removeAttr('disabled');
        });

        $(`${_this.boxBookingInfo}, ${_this.formID}`).on('click', '.open_booking', function (e) {
            e.preventDefault();

            let _self = $(this);
            formObj.find('[name="booking_hours"]').val(_self.attr('valhours'));

            if (_this.validate()) {
                $.magnificPopup.open({
                    type: 'inline',
                    midClick: true,
                    closeOnBgClick: false,
                    items: {
                        src: _this.popupBookingConfirm,
                    },
                });
            }
        });

        formConfirmObj.on('click', '.btn_cancel', function (e) {
            e.preventDefault();
            $.magnificPopup.close();
        });

        formConfirmObj.validate({
            submit: {
                settings: {
                    clear: 'keypress',
                    display: "inline",
                    button: ".btn_confirm",
                    inputContainer: 'group-select',
                    errorListClass: 'form-tooltip-error',
                },
                callback: {
                    onSubmit: function (node, formData) {
                        formConfirmObj.find(".btn_confirm").attr("disabled", "disabled");

                        let isValidate = true;
                        formConfirmObj.removeError();

                        if (webGlobal.enableRecaptcha) {
                            let g_recaptcha_response = $("#g-recaptcha-response").val();
                            if (g_recaptcha_response) {
                                formObj.find('[name="g-recaptcha-response"]').val(g_recaptcha_response);
                            } else {
                                isValidate = false;
                                call_notify('Notification', 'Recaptcha is invalid', "error");
                            }
                        }

                        if (isValidate) {
                            formObj.find('[name="booking_name"]').val(formData['booking_name']);
                            formObj.find('[name="booking_phone"]').val(formData['booking_phone']);
                            formObj.find('[name="booking_email"]').val(formData['booking_email']);
                            formObj.find('[name="notelist"]').val(formData['notelist']);
                            formObj.find('[name="store_id"]').val(formData['choose_store']);

                            formObj.submit();
                            return true;
                        } else {
                            formConfirmObj.find(".btn_confirm").removeAttr("disabled");
                            return false;
                        }
                    },
                    onError: function (node, globalError) {
                        let error_msg = '';
                        for (let p in globalError) {
                            error_msg += globalError[p] + '<br>';
                        }
                        call_notify('Notification', error_msg, "error");
                    }
                }
            }
        });
    },

    setCategories: function (categories_JsonString) {
        let _this = this;

        _this.categories = JSON.parse(categories_JsonString);
    },

    setServices: function (services_JsonString) {
        let _this = this;

        _this.services = JSON.parse(services_JsonString);
    },

    setStaffs: function (staffs_JsonString) {
        let _this = this;

        _this.staffs = JSON.parse(staffs_JsonString);
    },

    setDataForm: function (dataForm_JsonString) {
        let _this = this;
        let formObj = $(_this.formID);

        let dataForm_Json = JSON.parse(dataForm_JsonString);

        // Date
        let date = dataForm_Json.booking_date ? dataForm_Json.booking_date : webBooking.minDate;
        formObj.find('.booking_date').val(date);

        // Services & staff
        let generalHtml = false;
        let serviceAndStaffs = dataForm_Json.service_staff ? dataForm_Json.service_staff : [","];
        let ItemCnt = 0;
        for (let x in serviceAndStaffs) {
            ItemCnt++;
            if (ItemCnt > 1) {
                _this.addItem();
            }


            let bookingItemObj = formObj.find('.booking-item').last();
            let bookingItemID = bookingItemObj.attr('id');
            let serviceAndStaff = serviceAndStaffs[x].split(',');

            let serviceID = serviceAndStaff[0];
            _this.setOptionCategoryAndService(bookingItemID, serviceID);

            let staffID = serviceAndStaff[1];
            _this.setOptionStaff(bookingItemID, staffID);

            if (serviceID) {
                generalHtml = true;
            }
        }

        if (generalHtml) {
            _this.generalHTML();
        }
    },

    setOptionCategoryAndServices: function () {
        let _this = this;
        let formObj = $(_this.formID);

        let bookingItemsObj = formObj.find('.booking-item');
        bookingItemsObj.each(function () {
            let bookingItemID = $(this).attr('id');
            _this.setOptionCategoryAndService(bookingItemID);
        });
    },

    setOptionCategoryAndService: function (itemID, serviceID) {
        let _this = this;
        let formObj = $(_this.formID);
        let dateObj = formObj.find('.booking_date');
        let bookingItemObj = formObj.find(`#${itemID}`);
        let serviceObj = bookingItemObj.find('.booking_service');

        let maskLoadingObj = $(maskLoadingHtml);
        serviceObj.parent().append(maskLoadingObj);

        let serviceIDSelected = serviceID ? serviceID : serviceObj.val();
        let dayName = _this.getDayOfWeek(dateObj.val(), true);

        let html = `<option value="">${webForm['booking_service_placeholder']}</option>`;
        for (let x in _this.categories) {
            let category = _this.categories[x];
            let services = _this.categories[x].services;

            let optionServiceHtml = '';
            for (let y in services) {
                let service = _this.getService(services[y], dayName);
                if (service) {
                    let selected = serviceIDSelected * 1 === service.id * 1 ? 'selected ' : ''; /*Fix for error when minify*/
                    optionServiceHtml += `<option ${selected} value="${service.id}">${service.name}` + (service.price ? ` (${service.price})` : '') + `</option>`;
                }
            }

            if (optionServiceHtml) {
                html += `<optgroup label="${category.name}">${optionServiceHtml}</optgroup>`;
            }
        }
        serviceObj.html(html);
        maskLoadingObj.remove();
    },

    getService: function (serviceID, dayName) {
        let _this = this;

        let service = null;
        if (_this.services && _this.services[serviceID]) {
            if (dayName && _this.services[serviceID].schedule === true) {
                for (let x in _this.services[serviceID].scheduleDay) {
                    if (_this.services[serviceID].scheduleDay[x] === dayName) {
                        service = _this.services[serviceID];
                        break;
                    }
                }
            } else {
                service = _this.services[serviceID];
            }
        }

        return service;
    },

    setOptionStaffs: function () {
        let _this = this;
        let formObj = $(_this.formID);

        let bookingItemsObj = formObj.find('.booking-item');
        bookingItemsObj.each(function () {
            let itemID = $(this).attr('id');
            _this.setOptionStaff(itemID);
        });
    },

    setOptionStaff: function (itemID, staffID) {
        let _this = this;
        let formObj = $(_this.formID);
        let dateObj = formObj.find('.booking_date');
        let bookingItemObj = formObj.find(`#${itemID}`);
        let serviceObj = bookingItemObj.find('.booking_service');
        let staffObj = bookingItemObj.find('.booking_staff');

        let maskLoadingObj = $(maskLoadingHtml);
        staffObj.parent().append(maskLoadingObj);

        let serviceID = serviceObj.val();
        let service = _this.getService(serviceID);
        let staffIDs = service ? service.staffs : null;
        let staffIDSelected = staffID ? staffID : staffObj.val();
        let dayName = _this.getDayOfWeek(dateObj.val(), true);

        let html = `<option value="">${webForm['booking_technician_placeholder']}</option>`;
        for (let x in staffIDs) {
            let staff = _this.getStaff(staffIDs[x], dayName);
            if (staff) {
                let selected = staffIDSelected * 1 === staff.id * 1 ? 'selected' : '';
                html += `<option ${selected} value="${staff.id}">${staff.name}` + (staff.note ? ` (${staff.note})` : '') + `</option>`;
            }
        }
        staffObj.html(html);
        maskLoadingObj.remove();
    },

    getStaff: function (staffID, dayName) {
        let _this = this;

        let staff = null;
        if (_this.staffs && _this.staffs[staffID]) {
            if (dayName && _this.staffs[staffID].schedule === true) {
                for (let x in _this.staffs[staffID].scheduleDay) {
                    if (_this.staffs[staffID].scheduleDay[x] === dayName) {
                        staff = _this.staffs[staffID];
                        break;
                    }
                }
            } else {
                staff = _this.staffs[staffID];
            }
        }

        return staff;
    },

    addItem: function () {
        let _this = this;
        let formObj = $(_this.formID);
        let bookingItemObj = formObj.find('.booking-item').last();

        _this.itemIndex++;
        let html = `
            <div class="row booking-service-staff booking-item is-more" id="bookingItem_${_this.itemIndex}">
                <div class="remove-services pointer booking_item_remove"><i class="fa fa-minus-circle"></i></div>
                ` + bookingItemObj.html() + `
            </div>
        `;
        let htmlObj = $(html);
        htmlObj.find('.booking_service').val('');
        htmlObj.find('.booking_staff').val('');

        bookingItemObj.after(htmlObj);
    },

    removeItem: function (itemID) {
        let _this = this;
        let formObj = $(_this.formID);
        let bookingItemObj = formObj.find(`#${itemID}`);

        bookingItemObj.remove();
    },

    validate: function () {
        let _this = this;

        let formObj = $(_this.formID);
        let dateObj = formObj.find('.booking_date');
        let servicesObj = formObj.find('.booking_service');
        let staffsObj = formObj.find('.booking_staff');

        let isValidate = true;
        clearAllValidateMsg(formObj);

        // Date
        if (!dateObj.val()) {
            isValidate = false;
            showValidateMsg(dateObj, webForm ['booking_date_err']);
        }

        // Services
        servicesObj.each(function () {
            let _self = $(this);
            if (!_self.val()) {
                isValidate = false;
                showValidateMsg(_self, webForm ['booking_service_err']);
            }
        });

        // Staffs
        if (webBooking.requiredTechnician) {
            staffsObj.each(function () {
                let _self = $(this);
                if (!_self.val()) {
                    isValidate = false;
                    showValidateMsg(_self, webForm ['booking_technician_err']);
                }
            });
        }

        if (isValidate) {
            return true;
        } else {
            let errorElement = formObj.find('.error').first();
            web_goTo(errorElement.length ? errorElement : formObj);
            return false;
        }
    },

    generalHTML: function (validate) {
        let _this = this;

        if (!webBooking.requiredHour) {
            return false;
        }

        if (validate || _this.validate()) {
            $(_this.boxBookingInfo).show();
            _this.generalHTMLServiceStaff();
            _this.generalHTMLDateTime();
        }
    },

    generalHTMLServiceStaff: function () {
        let _this = this;

        if (!webBooking.requiredHour) {
            return false;
        }

        let formObj = $(_this.formID);
        let servicesObj = formObj.find('.booking_service');
        let staffsObj = formObj.find('.booking_staff');

        let maskLoadingObj = $(maskLoadingHtml);
        $(_this.boxBookingInfo).append(maskLoadingObj);

        let services = [];
        servicesObj.each(function () {
            let _self = $(this).find('option:selected');

            let service = {
                name: 'N/A',
                price: 'N/A',
            };

            let serviceItem = _this.getService(_self.val());
            if (serviceItem) {
                service.name = serviceItem.name;
                service.price = serviceItem.price;
            }

            services.push(service);
        });

        let staffs = [];
        staffsObj.each(function () {
            let _self = $(this).find('option:selected');

            let staff = {
                name: webForm['any_person'],
                image: webGlobal.noPhoto,
                imageIsNo: true,
            };

            let staffItem = _this.getStaff(_self.val());
            if (staffItem) {
                staff.name = staffItem.name;
                staff.image = staffItem.image;
                staff.imageIsNo = staffItem.imageIsNo;
            }

            staffs.push(staff);
        });

        let html = '';
        for (let x in services) {
            html += `
            <div class="service-staff">
                <div class="service-staff-avatar ` + (staffs[x].imageIsNo ? 'no-photo' : '') + `">
                    <img class="img-responsive" src="${staffs[x].image}" alt="${staffs[x].name}">
                </div>
                <div class="service-staff-info">
                    <h5>${staffs[x].name}</h5>
                    <p>${services[x].name}</p>
                    <p>${webForm['price']}: ${services[x].price}</p>
                </div>
            </div>
            `;
        }
        $(_this.boxServiceStaff).html(html);

        maskLoadingObj.remove();
    },

    generalHTMLDateTime: function () {
        let _this = this;

        if (!webBooking.requiredHour) {
            return false;
        }

        _this.getHoursProcess.queue++;
        if (_this.getHoursProcess.sending === false) {
            _this.getHoursProcess.process = _this.getHoursProcess.queue;

            let formObj = $(_this.formID);
            let dateObj = formObj.find('.booking_date');
            let servicesObj = formObj.find('.booking_service');
            let staffsObj = formObj.find('.booking_staff');

            let maskLoadingObj = $(maskLoadingHtml);
            $(_this.boxBookingInfo).append(maskLoadingObj);

            let date = dateObj.val();
            if (date) {
                let serviceIDs = [];
                servicesObj.each(function () {
                    let _self = $(this).find('option:selected');
                    serviceIDs.push(_self.val() * 1);
                });

                let staffIDs = [];
                staffsObj.each(function () {
                    let _self = $(this).find('option:selected');
                    staffIDs.push(_self.val() * 1);
                });

                $.ajax({
                    type: "post",
                    url: "/book/get_hours",
                    data: {input_date: date, input_services: serviceIDs, input_staffs: staffIDs},
                    beforeSend: function () {
                        _this.getHoursProcess.sending = true;
                    },
                    success: function (response) {
                        let responseObj = JSON.parse(response);
                        let boxDateTimeObj = $(_this.boxDateTime);

                        boxDateTimeObj.find('#dateInfo').html(_this.convertDate(responseObj.date));

                        boxDateTimeObj.find('#timeAMHtml').html(responseObj.htmlMorning);
                        boxDateTimeObj.find('#timeAMNote').html(responseObj.checkmorning ? '' : webForm['booking_hours_expired']);

                        boxDateTimeObj.find('#timePMHtml').html(responseObj.htmlAfternoon);
                        boxDateTimeObj.find('#timePMNote').html(responseObj.checkafternoon ? '' : webForm['booking_hours_expired']);
                    },
                    complete: function () {
                        _this.getHoursProcess.sending = false;
                        if (_this.getHoursProcess.queue !== _this.getHoursProcess.process) {
                            _this.generalHTMLDateTime();
                        }

                        maskLoadingObj.remove();
                    }
                });
            } else {
                $(_this.boxDateTime).find('#dateInfo').html('N/A');
                maskLoadingObj.remove();
            }
        }
    },

    saveForm: function () {
        let _this = this;

        _this.saveFormProcess.queue++;
        if (_this.saveFormProcess.sending === false) {
            _this.saveFormProcess.process = _this.saveFormProcess.queue;
            $.ajax({
                type: "post",
                url: "/book/saveform",
                data: $(_this.formID).serialize(),
                beforeSend: function () {
                    _this.saveFormProcess.sending = true;
                },
                complete: function () {
                    _this.saveFormProcess.sending = false;
                    if (_this.saveFormProcess.queue !== _this.saveFormProcess.process) {
                        _this.saveForm();
                    }
                }
            });
        }
    },

    convertDate: function (input) {
        let listDate = input.split('/');
        let splitDate = webFormat.datePosition.split(',');
        let newDate = listDate[splitDate[2]] + '/' + listDate[splitDate[1]] + '/' + listDate[splitDate[0]];
        newDate += '';

        let date = new Date(newDate);
        let months = [webForm['jan'], webForm['feb'], webForm['mar'], webForm['apr'], webForm['may'], webForm['jun'], webForm['jul'], webForm['aug'], webForm['sep'], webForm['oct'], webForm['nov'], webForm['dec']];
        let days = [webForm['sunday'], webForm['monday'], webForm['tuesday'], webForm['wednesday'], webForm['thursday'], webForm['friday'], webForm['saturday']];

        return days[date.getDay()] + ", " + months[date.getMonth()] + "-" + date.getDate() + "-" + date.getFullYear();
    },

    getDayOfWeek: function (input, type) {
        // ISO-8601
        let dayOfWeek_Obj = {
            1: "monday",
            2: "tuesday",
            3: "wednesday",
            4: "thursday",
            5: "friday",
            6: "saturday",
            7: "sunday"
        };

        let dayNumber = moment(input).day();
        dayNumber *= 1;
        if (dayNumber === 0) {
            dayNumber = 7;
        }

        return type ? dayOfWeek_Obj[dayNumber] : dayNumber;
    },
};

(function ($) {

})(jQuery);

$(document).ready(function () {

});