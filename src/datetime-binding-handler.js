// Copyright (c) CBC/Radio-Canada. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import ko from 'knockout';
import $ from 'jquery';
import moment from 'moment';


ko.bindingHandlers.datetime = {
    update: function(element, valueAccessor, allBindingsAccessor /*, viewModel*/ ) {
        var valueUnwrapped = ko.unwrap(valueAccessor());

        if (!valueUnwrapped) {
            return;
        }

        var datetime = moment.utc(valueUnwrapped).local();
        var $element = $(element);
        var allBindings = allBindingsAccessor();
        var pattern = allBindings.datePattern || 'YYYY-MM-DD H:mm';

        $element.text(datetime.format(pattern));

        if ($element.is('time')) {
            $element.attr('datetime', datetime.toISOString());
        }
    }
};
