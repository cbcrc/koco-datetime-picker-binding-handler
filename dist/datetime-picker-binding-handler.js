(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['knockout', 'jquery', 'moment-timezone', 'bootstrap-datetimepicker'], factory);
    } else if (typeof exports !== "undefined") {
        factory(require('knockout'), require('jquery'), require('moment-timezone'), require('bootstrap-datetimepicker'));
    } else {
        var mod = {
            exports: {}
        };
        factory(global.knockout, global.jquery, global.momentTimezone, global.bootstrapDatetimepicker);
        global.datetimePickerBindingHandler = mod.exports;
    }
})(this, function (_knockout, _jquery, _momentTimezone) {
    'use strict';

    var _knockout2 = _interopRequireDefault(_knockout);

    var _jquery2 = _interopRequireDefault(_jquery);

    var _momentTimezone2 = _interopRequireDefault(_momentTimezone);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    // Copyright (c) CBC/Radio-Canada. All rights reserved.
    // Licensed under the MIT license. See LICENSE file in the project root for full license information.

    var dateFormat = 'YYYY-MM-DD';
    var dateTimeFormat = 'YYYY-MM-DD HH:mm';
    var defaultOptions = {
        format: dateTimeFormat,
        widgetPositioning: {
            horizontal: 'right'
        },
        icons: {
            time: 'fa fa-clock-o',
            date: 'fa fa-calendar',
            up: 'fa fa-chevron-up',
            down: 'fa fa-chevron-down',
            previous: 'fa fa-arrow-left',
            next: 'fa fa-arrow-right',
            today: 'fa fa-dot-circle-o',
            clear: 'fa fa-trash-o'
        }
    };

    /**
     *  The datetimePicker binding handler creates a date/time picker 
     *  using Bootstrap 3 Datepicker
     * 
     *  Usage: 
     *  <input data-bind="datetimePicker [, options]">
     * 
     *  See README for details.
     */

    _knockout2.default.bindingHandlers.datetimePicker = {
        init: function init(element, valueAccessor, allBindings /*, data, context*/) {
            var datetime = valueAccessor();
            var originalDateTime = datetime();

            var defaultSettings = {
                pickTime: true,
                defaultTimeMode: 'now',
                timezone: null,
                labels: {
                    timeZoneAbbr: {
                        'EST': 'HNE',
                        'EDT': 'HAE'
                    },
                    timeZoneName: {
                        'EST': 'Heure normale de l\'est',
                        'EDT': 'Heure avancée de l\'est'
                    }
                }
            };

            if (!allBindings.get('pickTime') || allBindings.get('isDisplayedInMontrealTimeZone')) {
                defaultSettings.timezone = 'America/Montreal';
            }
            var pickerOptions = _jquery2.default.extend({}, defaultSettings, _knockout2.default.toJS(allBindings().datetimePickerOptions));
            // if the user can't pick the time, default to midnight
            if (!pickerOptions.pickTime) {
                pickerOptions.defaultTimeMode = 'midnight';
            }

            _knockout2.default.utils.domData.set(element, 'pickerOptions', pickerOptions);

            var inputGroup = createInputGroup((0, _jquery2.default)(element));

            // @TODO: pluginOptions vs pickerOptions and defaultSettings vs defaultOptions is
            // confusing. Should be cleaned up to make clear which are options for
            // the binding handler, and which are the options accepted by bootstap 3 datepicker
            var pluginOptions = getPluginOptions(pickerOptions.pickTime, allBindings);
            inputGroup.datetimepicker(pluginOptions);

            var dateTimePicker = inputGroup.data('DateTimePicker');
            inputGroup.on('dp.change', onChangeDate);

            var displayTimeZone = pickerOptions.pickTime && pickerOptions.timezone;
            if (displayTimeZone) {
                var timeZoneElement = (0, _jquery2.default)('<span class="input-group-addon"></span>');
            }

            function onChangeDate(event) {
                event.preventDefault();

                if (!event.date) {
                    datetime(null);

                    if (displayTimeZone && inputGroup.is(timeZoneElement.parent())) {
                        timeZoneElement.detach();
                    }

                    return;
                }

                var dateChanged = false;
                if (pickerOptions.timezone) {
                    event.date = _momentTimezone2.default.tz(event.date.format(dateTimeFormat), pickerOptions.timezone);
                    dateChanged = true;
                }

                if (mustForceMidnight(event)) {
                    event.date.startOf('day');
                    dateChanged = true;
                }

                if (dateChanged) {
                    dateTimePicker.date(event.date);
                }

                if (displayTimeZone) {
                    showTimeZone(event.date.zoneAbbr());
                }

                // We don't use .toISOString() because it included milliseconds which screwed up our comparisons
                var formattedDateTime = event.date.utc().format('YYYY-MM-DD[T]HH:mm:ss[Z]');

                datetime(formattedDateTime);
            }

            function mustForceMidnight(event) {
                if (pickerOptions.defaultTimeMode !== 'midnight') {
                    return false;
                }

                if (!pickerOptions.pickTime) {
                    return true;
                }

                // Only force midnight the first time setting the date
                return !originalDateTime && !event.oldDate;
            }

            function showTimeZone(zoneAbbr) {

                timeZoneElement.text(pickerOptions.labels.timeZoneAbbr[zoneAbbr]);
                timeZoneElement.attr('title', pickerOptions.labels.timeZoneName[zoneAbbr]);

                if (!inputGroup.is(timeZoneElement.parent())) {
                    inputGroup.prepend(timeZoneElement);
                }
            }

            _knockout2.default.utils.domNodeDisposal.addDisposeCallback(element, function () {
                if (dateTimePicker) {
                    dateTimePicker.destroy();
                }
            });
        },
        update: function update(element, valueAccessor /*, allBindings*/) {
            var value = _knockout2.default.unwrap(valueAccessor());
            var newDate = (0, _momentTimezone2.default)(value);

            var dateTimePicker = (0, _jquery2.default)(element).parent().data('DateTimePicker');
            var currentDate = dateTimePicker.date();

            var pickerOptions = _knockout2.default.utils.domData.get(element, 'pickerOptions');

            if (!newDate.isValid()) {
                dateTimePicker.date(null);
                return;
            }

            if (pickerOptions.timezone) {
                newDate.tz(pickerOptions.timezone);
            }

            if (!newDate.isSame(currentDate)) {
                dateTimePicker.date(newDate);
            }
        }
    };

    function getPluginOptions(pickTime, allBindings) {
        var options = allBindings.get('pickerOptions') || {};
        options = _jquery2.default.extend({}, defaultOptions, options);

        if (!pickTime) {
            options.format = dateFormat;
        }

        return options;
    }

    function createInputGroup(element) {
        element.wrapAll('<div class="input-group datetime"></div>');
        var group = element.parent();
        group.append('<span class="input-group-btn"><button class="btn btn-default" type="button"><i class="fa fa-calendar"></i></button></span>');

        return group;
    }
});