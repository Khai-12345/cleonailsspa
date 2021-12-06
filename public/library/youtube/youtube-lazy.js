/**
 * Web: https://noembed.com
 * Edit by ThamLV Y2021M11D05
 * */
function initYoutubeLazy(element) {
    $(element).each((index, item) => {
        let _this = $(item);
        let _data = _this.data();
        if (_data.src.indexOf('youtube.com/embed') !== -1) {
            let _youtube = $(`
                <div class="youtube-lazy-player" data-id="${_data.id}">
                    <img class="youtube-lazy-image" src="https://img.youtube.com/vi/${_data.id}/hqdefault.jpg" alt="hqdefault.jpg">
                    <div class="youtube-lazy-play"></div>
                    <h3 class=youtube-lazy-title></h3>
                </div>
            `);

            _this.css({
                'background-image': 'url(https://img.youtube.com/vi/' + _data.id + '/hqdefault.jpg)',
                'background-size': '100% 100%',
            }); // Background Iframe
            _this.hide(); // Hide Iframe
            _youtube.insertAfter(_this); // Insert Youtube
            _youtube.on('click', '.youtube-lazy-play', () => {
                let youtubeIframeObj = $(`${element}[data-id="${_data.id}"]`);
                let src = youtubeIframeObj.data('src');
                if (src.indexOf('autoplay=1') === -1) src += src.indexOf('?') === -1 ? '?autoplay=1' : '&autoplay=1';

                youtubeIframeObj.attr('src', src).show(); //  Replace Source & Show Youtube
                $(`div[data-id="${_data.id}"]`).remove(); // Remove Source
            }); // Init Event

            $.getJSON('https://noembed.com/embed',
                {format: 'json', url: 'https://www.youtube.com/watch?v=' + _data.id},
                function (data) {
                    if (data && data.title) $(`div[data-id="${_data.id}"]`).find('.youtube-lazy-title').text(data.title);
                }
            ); // Query Title
        }
    });
}

(function ($) {
    'use strict';
    initYoutubeLazy('iframe[data-lazy="youtube"]');
})(jQuery);