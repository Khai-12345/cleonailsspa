/**
 * Init Cart
 * */
let webCartForm = {
    formCartID: 'form#formCart',
    boxCart: '#boxCart',

    init: function () {
        let _self = this;

        // Events
        _self.setEvents();
    },

    setEvents: function () {
        let _self = this;
        let formCartObj = $(_self.formCartID);
        let boxCartObj = $(_self.boxCart);

        // Validate
        formCartObj.validate({
            submit: {
                settings: {
                    clear: 'keypress',
                    display: "inline",
                    button: "[type='submit']",
                    inputContainer: 'form-group',
                    errorListClass: 'form-tooltip-error',
                },
            }
        });

        // Events
        formCartObj.on('keyup change', 'input.custom_price', function () {
            let _this = $(this);

            /* Deny click to payment*/
            boxCartObj.find('.btn_cart').prop('disabled', true).attr('disabled', 'disabled').addClass('disabled');

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
            if (item.price_min <= item.price && item.price <= item.price_max) {
                formCartObj.removeError([`custom_price_${item.id}`]);
                _self.changePrice(item.id, item.price);
            } else {
                let error = {};
                error[`custom_price_${item.id}`] = `Accept Amount From ${item.price_min} to ${item.price_max}`;
                formCartObj.addError(error);
            }
        });

        formCartObj.on('keyup change', 'input.custom_quantity', function () {
            let _this = $(this);

            /* Deny click to payment*/
            boxCartObj.find('.btn_cart').prop('disabled', true).attr('disabled', 'disabled').addClass('disabled');

            // Get Item
            let item = {};
            item.id = parseInt(_this.attr('data-id'));
            item.id = (!isNaN(item.id) && item.id > 0) ? item.id : 0;

            item.quantity = parseInt(_this.val());

            /* Save Cart */
            if (item.quantity > 0) {
                formCartObj.removeError([`custom_quantity_${item.id}`]);
                _self.changeQuantity(item.id, item.quantity);
            } else {
                let error = {};
                error[`custom_quantity_${item.id}`] = 'Accept quantity greater than 0';
                formCartObj.addError(error);
            }
        });

        formCartObj.on('click', '.delete_cart', function () {
            let _this = $(this);

            /* Deny click to payment*/
            boxCartObj.find('.btn_cart').prop('disabled', true).attr('disabled', 'disabled').addClass('disabled');

            // Get Item
            let item = {};
            item.id = parseInt(_this.attr('data-id'));
            item.id = (!isNaN(item.id) && item.id > 0) ? item.id : 0;

            /* Save Cart */
            _self.deleteCart(item.id);
        });
    },

    changePrice: function (id, cus_price) {
        let _self = this;
        let formCartObj = $(_self.formCartID);

        $.ajax({
            type: 'post',
            url: '/cart/updateprice',
            data: {id: id, cus_price: cus_price},
            dataType: 'Json',
            success: function (obj) {
                if (obj.status === 'success') {
                    formCartObj.find(`#total_change_${id}`).html(obj.total_show);
                    _self.changeCartInfo({
                        'subtotal': obj.cart_data[2],
                        'discount': obj.cart_data[5],
                        'tax': obj.cart_data[1],
                        'amount': obj.cart_data[3],
                        'id': id,
                    });
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
        let formCartObj = $(_self.formCartID);

        $.ajax({
            type: 'post',
            url: '/cart/updatequantity',
            data: {id: id, quantity: cus_quantity},
            dataType: 'Json',
            success: function (obj) {
                formCartObj.find(`#total_change_${id}`).html(obj.total_show);
                _self.changeCartInfo({
                    'subtotal': obj.cart_data[2],
                    'discount': obj.cart_data[5],
                    'tax': obj.cart_data[1],
                    'amount': obj.cart_data[3],
                    'id': id,
                });
                _self.validateNext();
            },
            error: function () {
                call_notify('Notification', 'Error when process request', 'error');
            }
        });
    },

    deleteCart(id) {
        let _self = this;
        let formCartObj = $(_self.formCartID);

        $.ajax({
            type: 'post',
            url: '/cart/deletecart',
            data: {id: id},
            dataType: 'Json',
            success: function (obj) {
                formCartObj.find(`#cart_item_${id}`).remove();

                let items = formCartObj.find('.cart_item');
                if (items.length <= 0) {
                    formCartObj.find('#cart_items').html('<tr><td colspan="5"><div class="price-row-col"><b>Cart empty...</b></div></td></tr>');
                }

                _self.changeCartInfo({
                    'subtotal': obj.cart_data[2],
                    'discount': obj.cart_data[5],
                    'tax': obj.cart_data[1],
                    'amount': obj.cart_data[3],
                    'id': id,
                });
                _self.validateNext();
            }
        });
    },

    changeCartInfo: function (data) {
        let _self = this;
        let boxCartObj = $(_self.boxCart);

        boxCartObj.find('#cart_subtotal').html(data.subtotal);
        boxCartObj.find('#cart_discount').html(data.discount);
        boxCartObj.find('#cart_tax').html(data.tax);
        boxCartObj.find('#cart_total').html(data.amount);
    },

    validateNext: function () {
        let _self = this;
        let formCartObj = $(_self.formCartID);
        let boxCartObj = $(_self.boxCart);
        if (formCartObj.find('input.error').length > 0) {
            boxCartObj.find('.btn_cart').prop('disabled', true).attr('disabled', 'disabled').addClass('disabled');
        } else {
            boxCartObj.find('.btn_cart').prop('disabled', false).removeAttr('disabled').removeClass('disabled');
        }
    }
};