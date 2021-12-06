/**
 * Init Home Slider Revolution
 * */
const isInitRevolutionSlider = {
    status: false,
    count: 0,
};

function initRevolutionSlider(slider, sliderItem, selector, selectorOption) {
    isInitRevolutionSlider.count++;
    console.log(`init revolution slider loop ${isInitRevolutionSlider.count}`);

    if (isInitRevolutionSlider.status || $(sliderItem).length <= 0) return;

    let _selector = $(selector);
    let sliderOptions = {
        startwidth: 0,
        startheight: 0,
        delay: 10000,

        hideThumbs: 10,

        // Disable autoplay
        // stopLoop: 'on',
        // stopAfterLoops: 0,
        // stopAtSlide: 1,
    };

    // Calculator width height
    _selector.show();

    let generalSize = {
        width: [],
        height: [],
        minWidth: 0,
        minHeight: parseInt(_selector.find('.fixed').height()),
    };
    _selector.each(function () {
        let _img = $(this).find('img');
        generalSize.width.push(parseInt(_img.width()));
        generalSize.height.push(parseInt(_img.height()));
    });
    generalSize.minWidth = Math.min.apply(Math, generalSize.width);
    generalSize.minHeight = generalSize.minHeight > 0 ? generalSize.minHeight : Math.min.apply(Math, generalSize.height);

    sliderOptions.startwidth = generalSize.minWidth > 0 ? generalSize.minWidth : sliderOptions.startwidth;
    sliderOptions.startheight = generalSize.minHeight > 0 ? generalSize.minHeight : sliderOptions.startheight;
    sliderOptions = $.extend(sliderOptions, _selector.find(selectorOption ? selectorOption : '#slider-option').data());
    if (sliderOptions.startwidth > 0 && sliderOptions.startheight > 0) {
        isInitRevolutionSlider.status = true;
        $(slider).show().revolution(sliderOptions);
    } else {
        if (isInitRevolutionSlider.count < 9)
            setTimeout(function () {
                initRevolutionSlider(slider, sliderItem, selector, selectorOption);
            }, 1750);
    }

    _selector.hide();
}

$(document).ready(function () {
    initRevolutionSlider('#my-slider', '#my-slider ul li', '.slider-width-height');
});