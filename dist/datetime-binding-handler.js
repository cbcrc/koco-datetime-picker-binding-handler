(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['knockout', 'jquery', 'moment'], factory);
    } else if (typeof exports !== "undefined") {
        factory(require('knockout'), require('jquery'), require('moment'));
    } else {
        var mod = {
            exports: {}
        };
        factory(global.knockout, global.jquery, global.moment);
        global.datetimeBindingHandler = mod.exports;
    }
})(this, function (_knockout, _jquery, _moment) {
    'use strict';

    var _knockout2 = _interopRequireDefault(_knockout);

    var _jquery2 = _interopRequireDefault(_jquery);

    var _moment2 = _interopRequireDefault(_moment);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    _knockout2.default.bindingHandlers.datetime = {
        update: function update(element, valueAccessor, allBindingsAccessor /*, viewModel*/) {
            var valueUnwrapped = _knockout2.default.unwrap(valueAccessor());

            if (!valueUnwrapped) {
                return;
            }

            var datetime = _moment2.default.utc(valueUnwrapped).local();
            var $element = (0, _jquery2.default)(element);
            var allBindings = allBindingsAccessor();
            var pattern = allBindings.datePattern || 'YYYY-MM-DD H:mm';

            $element.text(datetime.format(pattern));

            if ($element.is('time')) {
                $element.attr('datetime', datetime.toISOString());
            }
        }
    }; // Copyright (c) CBC/Radio-Canada. All rights reserved.
    // Licensed under the MIT license. See LICENSE file in the project root for full license information.
});