; (function (VirtualTable, $) {
    var pluginName = 'clusterTable';

    function Plugin(element, options) {
        var el = element;
        var $el = $(element);
        var table = null;
        var tmpl = '<div id="{Element_Id}_scrollArea" class="virtualize-scroll"><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody id="{Element_Id}_contentArea" class ="virtualize-content"><tr class ="virtualize-no-data"><td>{initialText}</td></tr></tbody></table></div><table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody id="contentFooterArea" class ="virtualize-footer-content">{tableTotalRow}</tbody></table>';
        options = $.extend({}, $.fn[pluginName].defaults, options);

        function init() {
            hook('onInit');
            virtualizeTable();
            initializeEvents();
        }

        function option(key, val) {
            if (val) {
                options[key] = val;
            } else {
                return options[key];
            }
        }

        function destroy() {
            $el.each(function () {
                var el = this;
                var $el = $(this);

                // Add code to restore the element to its original state...

                hook('onDestroy');
                $el.removeData('plugin_' + pluginName);
            });
        }

        function hook(hookName) {
            if (options[hookName] !== undefined) {
                options[hookName].call(el);
            }
        }

        function update() {
            options = $.extend({}, options, arguments[0]);
            table.update(getData(options.rows));
        }

        init();

        function initializeEvents() {
            if (options.onHeaderClick) {
                $el.find('table.header tr th').on('click', function (ev) {
                    options.onHeaderClick(this);
                });
            }
            if (options.onRowClick) {
                $el.find('tbody.virtualize-content tr').on('click', function (ev) {
                    options.onRowClick(this);
                });
            }
        }

        function virtualizeTable() {
            if (!$el.hasClass(options.className))
                $el.addClass(options.className);
            if (options.enableTemplate)
                $el.append(options.templateHeader);
            if (options.tableTotalRow) {
                $el.append(tmpl.formatUnicorn({ "Element_Id": options.bindTo, "initialText": options.initialText, "height": options.height, "tableTotalRow": options.tableTotalRow }));
            } else {
                $el.append(tmpl.formatUnicorn({ "Element_Id": options.bindTo, "initialText": options.initialText, "height": options.height }));
            }
            table = new VirtualTable({
                renderRows: getData(options.rows, true),
                scrollerId: options.bindTo + '_scrollArea',
                contentId: options.bindTo + '_contentArea'
            });

            if (options.after) {
                options.after($el);
            }
        }

        function getData(data, initialized) {
            if (!options.enableTemplate)
                return options.renderRows;
            if (options.enableTemplate) {
                if (options.templateData.length) {
                    return $.map(data, function (item, i) {
                        if (initialized)
                            item._enableTableRow = true;
                        if (item._enableTableRow)
                            return options.template.formatUnicorn(item, options.templateData);
                    });
                }
                throw "property templateData not provided.";
            }
        }

        return {
            option: option,
            destroy: destroy,
            update: update,
            virtualizeTable: virtualizeTable
        };
    }

    $.fn[pluginName] = function (options) {
        if (typeof arguments[0] === 'string') {
            var methodName = arguments[0];
            var args = Array.prototype.slice.call(arguments, 1);
            var returnVal;
            this.each(function () {
                if ($.data(this, 'plugin_' + pluginName) && typeof $.data(this, 'plugin_' + pluginName)[methodName] === 'function') {
                    returnVal = $.data(this, 'plugin_' + pluginName)[methodName].apply(this, args);
                } else {
                    throw new Error('Method ' + methodName + ' does not exist on jQuery.' + pluginName);
                }
            });
            if (returnVal !== undefined) {
                return returnVal;
            } else {
                return this;
            }
        } else if (typeof options === "object" || !options) {
            return this.each(function () {
                if (!$.data(this, 'plugin_' + pluginName)) {
                    $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
                }
            });
        }
    };

    $.fn[pluginName].defaults = {
        height: 400,
        bindTo: '',
        rows: [],
        renderRows: [],
        enableTemplate: false,
        template: '<span>No template provided.</span>',
        templateHeader: '<span>No table header provided.</span>',
        templateData: [],
        headers: [],
        className: 'cluster-table',
        initialText: '',
        onHeaderClick: null,
        onRowClick: null,
        tableTotalRow: null,
        onInit: function () {
        },
        onDestroy: function () {
        },
        after: null
    };

})(VirtualTable, jQuery);
; if (!String.prototype.formatUnicorn) {
    //usage "Hello, {name}, are you feeling {adjective}?".formatUnicorn({name:"Gabriel", adjective: "OK"})
    String.prototype.formatUnicorn = function () {
        if (arguments[1]) {
            var e = this.toString();
            if (!arguments.length)
                return e;
            var t = typeof arguments[0]
              , n = "string" == t || "number" == t ? Array.prototype.slice.call(arguments) : arguments[0],
              f = arguments[1].map(function (x) { return x.column });
            for (var a in n) {
                if (f.indexOf(a) > -1) {
                    var format = ($.grep(arguments[1], function (e) { return e.column == a; }))[0].format;
                    if (format) {
                        e = e.replace(new RegExp("\\{" + a + "\\}", "gi"), format(n[a], n));
                        continue;
                    }
                    e = e.replace(new RegExp("\\{" + a + "\\}", "gi"), n[a]);
                }
            }
            return e
        }
        var _e = this.toString();
        if (!arguments.length)
            return _e;
        var t = typeof arguments[0]
          , n = "string" == t || "number" == t ? Array.prototype.slice.call(arguments) : arguments[0];
        for (var a in n) {
            _e = _e.replace(new RegExp("\\{" + a + "\\}", "gi"), n[a]);
        }
        return _e;
    }
}
