// Copyright (c) CBC/Radio-Canada. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import ko from 'knockout';
import $ from 'jquery';
import moment from 'moment-timezone';
import 'bootstrap-datetimepicker';


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

ko.bindingHandlers.datetimePicker = {
    init: function(element, valueAccessor, allBindings /*, data, context*/ ) {
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
        var pickerOptions = $.extend({}, defaultSettings, ko.toJS(allBindings().datetimePickerOptions));
        // if the user can't pick the time, default to midnight
        if (!pickerOptions.pickTime) {
            pickerOptions.defaultTimeMode = 'midnight';
        }

        ko.utils.domData.set(element, 'pickerOptions', pickerOptions);

        var inputGroup = createInputGroup($(element));

        // @TODO: pluginOptions vs pickerOptions and defaultSettings vs defaultOptions is 
        // confusing. Should be cleaned up to make clear which are options for 
        // the binding handler, and which are the options accepted by bootstap 3 datepicker
        var pluginOptions = getPluginOptions(pickerOptions.pickTime, allBindings);
        inputGroup.datetimepicker(pluginOptions);

        var dateTimePicker = inputGroup.data('DateTimePicker');
        inputGroup.on('dp.change', onChangeDate);

        var displayTimeZone = pickerOptions.pickTime && pickerOptions.timezone;
        if (displayTimeZone) {
            var timeZoneElement = $('<span class="input-group-addon"></span>');
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
                event.date = moment.tz(event.date.format(dateTimeFormat), pickerOptions.timezone);
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

        ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
            if (dateTimePicker) {
                dateTimePicker.destroy();
            }
        });
    },
    update: function(element, valueAccessor /*, allBindings*/ ) {
        var value = ko.unwrap(valueAccessor());
        var newDate = moment(value);

        var dateTimePicker = $(element).parent().data('DateTimePicker');
        var currentDate = dateTimePicker.date();

        var pickerOptions = ko.utils.domData.get(element, 'pickerOptions');

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
    options = $.extend({}, defaultOptions, options);

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
