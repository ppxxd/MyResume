//
(function (_document, _window) {
    'use strict';

    var CONFIG = {
        'app.name': 'ppxxd-page',
        'content.url': 'src/views/content/',
        'default.lang': 'ru'
    };

    function App(options) {
        options = options || {};

        //
        var url = purl(),
            locationSearch = url.param(),
            $html = $('html'),
            $app = options.container,
            localConfig = {},
            templates = {};

        //
        function checkLocalConfig() {
            var localStorageItem = _window.localStorage && _window.localStorage.getItem(CONFIG['app.name']);

            localConfig = null;

            try {
                localConfig = JSON.parse(localStorageItem);
            } catch (e) {
            }

            localConfig = localConfig || {};
        }

        function storeLocalConfig() {
            if (_window.localStorage) {
                _window.localStorage.setItem(CONFIG['app.name'], JSON.stringify(localConfig));
            }
        }

        function checkLang() {
            localConfig['lang'] = locationSearch['lang'] || localConfig['lang'] || CONFIG['default.lang'];
            $html.attr('lang', localConfig['lang']);
            storeLocalConfig();
        }

        function loadContent(done) {
            var lang = localConfig['lang'],
                requests = [];

            var contentViews = [
                'base.html',
                lang + '/main.html'
            ];

            $.each(contentViews, function (i, v) {
                var r = $.get(CONFIG['content.url'] + v, function (data) {
                    $(data).each(function () {
                        var $t = $(this),
                            id = $t.attr('id');

                        if (id) {
                            templates[id] = {
                                html: $t.html()
                            };
                        }
                    });
                });
                requests.push(r);
            });

            $.when.apply($, requests).always(function () {
                var more;

                do {
                    more = false;

                    $.each(templates, function (k, t) {
                        $('[' + k + ']').each(function () {
                            var $el = $(this),
                                html = $.trim($el.html());

                            if (!html) {
                                $el.html($.trim(t.html));
                                more = true;
                            }
                        });
                    });
                } while (more);

                done();
            });
        }

        function initTags() {
            var $tagToggles = $app.find('.ap-tags-bar [ap-tag-toggle]'),
                activeClass = 'ap-tags-bar__toggle_active';

            $app.find('.ap-tags-bar [ap-tag-toggle]').click(function () {
                var $tagToggle = $(this),
                    on = $tagToggle.hasClass(activeClass),
                    showSelector = '',
                    one = false;

                if (on) {
                    $tagToggle.removeClass(activeClass);
                } else {
                    $tagToggle.addClass(activeClass);
                }

                $tagToggles.each(function () {
                    var $t = $(this);

                    if ($t.hasClass(activeClass)) {
                        showSelector += (one ? ',' : '') + '[ap-tag~="' + $t.attr('ap-tag-toggle') + '"]';
                        one = true;
                    }
                });

                $app.find(showSelector ? '[ap-tag]:not(' + showSelector + ')' : '[ap-tag]').hide();

                if (showSelector) {
                    $app.find(showSelector).show();
                }
            });
        }

        function initAnchors() {
            $app.find('.ap-anchor-block').each(function () {
                var $anchorBlock = $(this);

                $anchorBlock.prepend($('<a/>', {
                    'class': 'ap-anchor-block__anchor',
                    'href': '#' + $anchorBlock.attr('id')
                }));
            });
        }

        function initTools() {
            // NOOP
        }

        //
        return {
            init: function () {
                checkLocalConfig();
                checkLang();
                loadContent(function () {
                    initTags();
                    initAnchors();
                    initTools();

                    $app.addClass(CONFIG['app.name'] + '_ready');
                });
            }
        };
    }

    // startup
    $(function () {
        var app = new App({
            container: $('body')
        });
        app.init();
    });
})(document, window);
