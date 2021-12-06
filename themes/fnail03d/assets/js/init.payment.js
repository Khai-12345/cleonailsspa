/**
 * Init Payment
 * */
let webPaymentForm = {
    formPaymentNew: true,
    formPaymentID: 'form#formPayment',
    boxRecipient: '#boxRecipient',
    boxPaymentItems: '#boxPaymentItems',
    boxCart: '#boxCart',
    boxPreview: '#boxPreview',

    init: function (isPaymentNew, dataForm_JsonString) {
        let _self = this;

        // Payment is new
        _self.formPaymentNew = (typeof isPaymentNew !== 'undefined' && isPaymentNew);

        // Events
        _self.setEvents();

        // Data Form
        _self.setDataForm(dataForm_JsonString);
    },

    setEvents: function () {
        let _self = this;
        let formPaymentObj = $(_self.formPaymentID);
        let boxPaymentItemsObj = $(_self.boxPaymentItems);
        let boxRecipientObj = $(_self.boxRecipient);

        // Validate
        formPaymentObj.validate({
            submit: {
                settings: {
                    clear: 'keypress',
                    display: "inline",
                    button: "[type='submit']",
                    inputContainer: 'form-group',
                    errorListClass: 'form-tooltip-error',
                },
                callback: {
                    onSubmit: function (node, formdata) {
                        /* Deny duplicate click && Clears all form errors */
                        formPaymentObj.find('.btn_payment').prop('disabled', true).attr('disabled', 'disabled').addClass('disabled');
                        formPaymentObj.removeError();

                        if (_self.formPaymentNew) {
                            let isValidate = true;

                            /* Check price */
                            let item = {};
                            let customPriceObj = formPaymentObj.find('[name="custom_price"]');

                            item.price = parseFloat(formdata['custom_price']);
                            item.price = (!isNaN(item.price) && item.price > 0) ? item.price : 0;

                            item.price_min = parseFloat(customPriceObj.attr('data-price_min'));
                            item.price_min = (!isNaN(item.price_min) && item.price_min > 0) ? item.price_min : 0;

                            item.price_max = parseFloat(customPriceObj.attr('data-price_max'));
                            item.price_max = (!isNaN(item.price_max) && item.price_max > 0) ? item.price_max : 0;

                            if (!(item.price_min <= item.price && item.price <= item.price_max)) {
                                isValidate = false;
                                formPaymentObj.addError({
                                    'custom_price': `Accept Amount From ${item.price_min} to ${item.price_max}`,
                                });
                            }

                            if (!isValidate) {
                                formPaymentObj.find('.btn_payment').prop('disabled', false).removeAttr('disabled').removeClass('disabled');
                                let errorElement = formPaymentObj.find('.error').first();
                                scrollJumpTo(errorElement.length > 0 ? errorElement : formPaymentObj, window.matchMedia('(min-width: 992px)').matches ? '.fixed-freeze.desktop' : '.fixed-freeze.mobile');
                                return false;
                            }
                        }

                        waitingDialog.show("Please wait a moment ...");
                        node[0].submit();
                    },
                    onError: function () {
                        let errorElement = formPaymentObj.find('.error').first();
                        scrollJumpTo(errorElement.length > 0 ? errorElement : formPaymentObj, window.matchMedia('(min-width: 992px)').matches ? '.fixed-freeze.desktop' : '.fixed-freeze.mobile');
                    }
                }
            }
        });

        // Events
        formPaymentObj.on('click', 'input[name="send_to_friend"]', function () {
            let _this = $(this);
            let sendToFriend = _this.is(':checked');
            if (sendToFriend) {
                _this.prop('checked', true);
                boxRecipientObj.show();
            } else {
                _this.prop('checked', false);
                boxRecipientObj.hide();
            }
        });

        if (_self.formPaymentNew) {
            boxPaymentItemsObj.on('click', '.paymentItem', function (e) {
                e.preventDefault();
                let _this = $(this);

                /* Init active */
                boxPaymentItemsObj.find('.paymentItem').removeClass('active');
                _this.addClass('active');

                /* Get Item */
                let item = {};
                item.id = parseInt(_this.attr('data-id'));
                item.id = (!isNaN(item.id) && item.id > 0) ? item.id : 0;

                item.name = _this.attr('data-name');
                item.image = _this.attr('data-image');

                item.price = parseFloat(_this.attr('data-price'));
                item.price = (!isNaN(item.price) && item.price > 0) ? item.price : 0;

                item.price_custom = parseInt(_this.attr('data-price_custom'));
                item.price_custom = (!isNaN(item.price_custom) && item.price_custom > 0);

                item.price_min = parseFloat(_this.attr('data-price_min'));
                item.price_min = (!isNaN(item.price_min) && item.price_min > 0) ? item.price_min : 0;

                item.price_max = parseFloat(_this.attr('data-price_max'));
                item.price_max = (!isNaN(item.price_max) && item.price_max > 0) ? item.price_max : 0;

                item.quantity = 1;

                /* Payment */
                formPaymentObj.removeError();

                /* Price && Note*/
                let customPriceObj = formPaymentObj.find('[name="custom_price"]');
                let cus_price = parseFloat(customPriceObj.val());
                cus_price = (!isNaN(cus_price) && cus_price > 0) ? cus_price : 0;
                if (cus_price > 0 && item.price_custom && item.price_min <= cus_price && cus_price <= item.price_max) {
                    item.price = cus_price;
                }
                customPriceObj.val(item.price)
                    .attr({
                        'data-id': item.id,
                        'data-price_custom': item.price_custom ? 1 : 0,
                        'data-price_min': item.price_min,
                        'data-price_max': item.price_max,
                    }).prop('readonly', !item.price_custom);

                let customPriceNoteObj = formPaymentObj.find('#custom_price_note');
                customPriceNoteObj.html(`<p><b>Note:</b> Accept Amount From ${item.price_min} to ${item.price_max}</p>`);
                if (item.price_custom) {
                    customPriceNoteObj.show();
                } else {
                    customPriceNoteObj.hide();
                }

                /* Quantity */
                let customQuantityObj = formPaymentObj.find('[name="custom_quantity"]');
                let cus_quantity = parseInt(customQuantityObj.val());
                cus_quantity = (!isNaN(cus_quantity) && cus_quantity > 0) ? cus_quantity : 0;
                if (cus_quantity > 0) {
                    item.quantity = cus_quantity;
                }
                customQuantityObj.val(item.quantity).attr('data-id', item.id);

                /* Preview */
                _self.changePreviewInfo({
                    'name': item.name,
                    'image': item.image,
                    'amount': 'N/A',
                    'quantity': 'N/A',
                });

                /* Save Cart */
                _self.changeCart(item.id, item.quantity, item.price);
            });

            formPaymentObj.on('keyup change', 'input[name="custom_price"]', function () {
                let _this = $(this);

                /* Deny duplicate click */
                formPaymentObj.find('.btn_payment').prop('disabled', true).attr('disabled', 'disabled').addClass('disabled');

                /* Get Item */
                let item = {};
                item.id = parseInt(_this.attr('data-id'));
                item.id = (!isNaN(item.id) && item.id > 0) ? item.id : 0;

                item.price = parseFloat(_this.val());
                item.price = (!isNaN(item.price) && item.price > 0) ? item.price : 0;

                item.price_custom = parseInt(_this.attr('data-price_custom'));
                item.price_custom = (!isNaN(item.price_custom) && item.price_custom > 0);

                item.price_min = parseFloat(_this.attr('data-price_min'));
                item.price_min = (!isNaN(item.price_min) && item.price_min > 0) ? item.price_min : 0;

                item.price_max = parseFloat(_this.attr('data-price_max'));
                item.price_max = (!isNaN(item.price_max) && item.price_max > 0) ? item.price_max : 0;

                /* Save Cart */
                if (item.price_custom && item.price_min <= item.price && item.price <= item.price_max) {
                    formPaymentObj.removeError(['custom_price']);
                    _self.changePrice(item.id, item.price);
                } else {
                    formPaymentObj.addError({
                        'custom_price': `Accept Amount From ${item.price_min} to ${item.price_max}`,
                    });
                }
            });

            formPaymentObj.on('keyup change', 'input[name="custom_quantity"]', function () {
                let _this = $(this);

                /* Deny duplicate click */
                formPaymentObj.find('.btn_payment').prop('disabled', true).attr('disabled', 'disabled').addClass('disabled');

                // Get Item
                let item = {};
                item.id = parseInt(_this.attr('data-id'));
                item.id = (!isNaN(item.id) && item.id > 0) ? item.id : 0;

                item.quantity = parseInt(_this.val());

                /* Save Cart */
                if (item.quantity > 0) {
                    formPaymentObj.removeError(['custom_quantity']);
                    _self.changeQuantity(item.id, item.quantity);
                } else {
                    formPaymentObj.addError({'custom_quantity': 'Accept quantity greater than 0'});
                }
            });

            formPaymentObj.on('keyup', 'input[name="ship_full_name"]', function () {
                let _this = $(this);
                _self.changePreviewInfo({
                    'from': _this.val(),
                });
            });

            formPaymentObj.on('keyup', 'input[name="recipient_name"]', function () {
                let _this = $(this);
                _self.changePreviewInfo({
                    'to': _this.val(),
                });
            });
        }
    },

    setDataForm: function (dataForm_JsonString) {
        let _self = this;
        let formPaymentObj = $(_self.formPaymentID);
        let boxPaymentItemsObj = $(_self.boxPaymentItems);
        let boxRecipientObj = $(_self.boxRecipient);

        let sendToFriend = formPaymentObj.find('input[name="send_to_friend"]').is(':checked');
        if (sendToFriend) {
            boxRecipientObj.show();
        } else {
            boxRecipientObj.hide();
        }

        if (_self.formPaymentNew) {
            let data = JSON.parse(dataForm_JsonString);

            // Default Price & quantity
            if (data.cus_price > 0) {
                let customPriceObj = formPaymentObj.find('[name="custom_price"]');
                customPriceObj.val(data.cus_price);
            }

            if (data.cus_quantity > 0) {
                let customQuantityObj = formPaymentObj.find('[name="custom_quantity"]');
                customQuantityObj.val(data.cus_quantity);
            }

            // Choose Item
            let paymentItemObj = boxPaymentItemsObj.find(`.paymentItem[data-id="${data.id}"]`);
            if (paymentItemObj.length <= 0) {
                paymentItemObj = boxPaymentItemsObj.find('.paymentItem').first();
            }
            paymentItemObj.trigger('click');
        }
    },

    changeCart: function (id, quantity, cus_price) {
        let _self = this;
        let formPaymentObj = $(_self.formPaymentID);

        /* Reset Preview*/
        _self.changePreviewInfo({
            'amount': 'N/A',
            'quantity': 'N/A',
        });

        $.ajax({
            type: 'post',
            url: '/cart/changecart',
            data: {id: id, quantity: quantity, cus_price: cus_price},
            dataType: 'Json',
            success: function (obj) {
                obj.id = id;

                let customQuantityObj = formPaymentObj.find('[name="custom_quantity"]');
                customQuantityObj.val(obj.quantity);

                let customPriceObj = formPaymentObj.find('[name="custom_price"]');
                customPriceObj.val(obj.price_new);

                _self.changeCartInfo(obj);
                _self.changePreviewInfo(obj.preview);
                _self.validateNext();
            },
            error: function () {
                call_notify('Notification', 'Error when process request', 'error');
            }
        });
    },

    changePrice: function (id, cus_price) {
        let _self = this;

        /* Reset Preview*/
        _self.changePreviewInfo({
            'amount': 'N/A',
            'quantity': 'N/A',
        });

        $.ajax({
            type: 'post',
            url: '/cart/updateprice',
            data: {id: id, cus_price: cus_price},
            dataType: 'Json',
            success: function (obj) {
                if (obj.status === 'success') {
                    _self.changeCartInfo({
                        'subtotal': obj.cart_data[2],
                        'discount': obj.cart_data[5],
                        'tax': obj.cart_data[1],
                        'amount': obj.cart_data[3],
                        'id': id,
                    });
                    _self.changePreviewInfo(obj.preview);
                    _self.validateNext();
                } else {
                    call_notify('Notification', obj.msg, 'error');
                }
            },
            error: function () {
                call_notify('Notification', 'Error when process request', 'error');
            }
        });
    },

    changeQuantity: function (id, cus_quantity) {
        let _self = this;

        /* Reset Preview*/
        _self.changePreviewInfo({
            'amount': 'N/A',
            'quantity': 'N/A',
        });

        $.ajax({
            type: 'post',
            url: '/cart/updatequantity',
            data: {id: id, quantity: cus_quantity},
            dataType: 'Json',
            success: function (obj) {
                _self.changeCartInfo({
                    'subtotal': obj.cart_data[2],
                    'discount': obj.cart_data[5],
                    'tax': obj.cart_data[1],
                    'amount': obj.cart_data[3],
                    'id': id,
                });
                _self.changePreviewInfo(obj.preview);
                _self.validateNext();
            },
            error: function () {
                call_notify('Notification', 'Error when process request', 'error');
            }
        });
    },

    changePreviewInfo: function (data) {
        let _self = this;
        let boxCartObj = $(_self.boxCart);
        let boxPreviewObj = $(_self.boxPreview);

        if (typeof data.name !== 'undefined') {
            boxCartObj.find('#cart_name').html(data.name);
        }

        if (typeof data.image !== 'undefined') {
            boxCartObj.find('#cart_image img').attr("src", data.image);
            boxPreviewObj.find("#preview_image img").attr("src", data.image);
        }

        if (typeof data.amount !== 'undefined') {
            boxPreviewObj.find('#preview_amount').html(data.amount);
        }

        if (typeof data.quantity !== 'undefined') {
            boxCartObj.find('#cart_quantity').html(data.quantity);
            boxPreviewObj.find("#preview_quantity").html(data.quantity);
        }

        if (typeof data.from !== 'undefined') {
            boxPreviewObj.find("#preview_from").html(data.from);
        }

        if (typeof data.to !== 'undefined') {
            boxPreviewObj.find("#preview_to").html(data.to);
        }

        if (typeof data.message !== 'undefined') {
            boxPreviewObj.find("#preview_message").html(data.message);
        }
    },

    changeCartInfo: function (data) {
        let _self = this;
        let boxCartObj = $(_self.boxCart);
        let formPaymentObj = $(_self.formPaymentID);

        boxCartObj.find('#cart_subtotal').html(data.subtotal);
        boxCartObj.find('#cart_discount').html(data.discount);
        boxCartObj.find('#cart_tax').html(data.tax);
        boxCartObj.find('#cart_total').html(data.amount);
        if (data.id) {
            formPaymentObj.find('#custom_price').attr('data-id', data.id);
        }
    },

    validateNext: function () {
        let _self = this;
        let formPaymentObj = $(_self.formPaymentID);
        if (formPaymentObj.find('input.error').length > 0) {
            formPaymentObj.find('.btn_payment').prop('disabled', true).attr('disabled', 'disabled').addClass('disabled');
        } else {
            formPaymentObj.find('.btn_payment').prop('disabled', false).removeAttr('disabled').removeClass('disabled');
        }
    }
};