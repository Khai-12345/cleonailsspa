/**
 * Init Home Tab gallery
 * */
function getGalleryByCat(cat_id, page) {
    cat_id = cat_id ? cat_id : 0;
    page = page ? page : 0;
    // console.log(cat_id);
    $.ajax({
        type: "post",
        url: "/gallery/getlistbycat",
        beforeSend: function () {

        },
        data: {cat_id: cat_id, page: page},
        success: function (html) {
            // console.log(html);
            var obj = JSON.parse(html);
            // console.log(obj);
            var html_gallery = "";
            if (obj.data.length > 0) {
                for (var x in obj.data) {
                    html_gallery += `<div class="col-lg-4 col-md-4 col-sm-6 col-xs-6">
                                        <div class="item-gallery">
                                                        <div class="img-item-gallery">
                                                            <div class="img-item">
                                                            <a itemprop="url" rel="group2" class="clearfix gallery-item2 m-magnific-popup" href="` + obj.data[x].image + `">
                                                                <span style="background-image:url('` + obj.data[x].imageThumb + `')"></span>
                                                                <img style="display: none" itemprop="image" src="` + obj.data[x].imageThumb + `" alt="` + obj.data[x].name + `">
                                                                </a>
                                                            </div>
                                                        </div>
                                                        <a itemprop="url" rel="group1" class="clearfix gallery-item1 m-magnific-popup" href="` + obj.data[x].image + `">
                                                            <div class="social-item-gallery">
                                                                <div class="vertical">
                                                                    <h2 itemprop="name">
                                                                        <span class="a">
                                                                        ` + obj.data[x].name + `
                                                                        </span>
                                                                    </h2>
                                                                    <div class="img-vector-services">
                                                                        <img itemprop="image" src="images/icon-vector-services.png">
                                                                    </div>
                                                                    <span itemprop="name">` + obj.data[x].name + `</span>
                                                                </div>
                                                            </div>
                                                        </a>
                                                    </div>
                                    </div>`;
                }
            } else {
                html_gallery = "Not found gallery item in this category.";
            }

            $(".box_list_gallery").html(html_gallery);
            $(".box_paging").html(obj.paging_ajax);

            initImageMagnificPopup('.m-magnific-popup');
        }
    });
}

$(document).ready(function () {
    /* Filter */
    $('ul#filter li a').click(function () {
        let _this = $(this);
        let id = _this.attr("data-id");

        // Class active
        $('ul#filter li').removeClass('active');
        $(this).parent("li").addClass("active");

        // Class active
        $("select#filter_select").val(id).trigger("change");
    });

    $('select#filter_select').change(function () {
        let _this = $(this);
        let id = _this.val();

        // Call gallery ajax
        getGalleryByCat(id);

        // Class active
        $('ul#filter li').removeClass('active');
        $('ul#filter li a[data-id="'+id+'"]').parent("li").addClass("active");
    });

    $("select#filter_select option:first").trigger("change");
});