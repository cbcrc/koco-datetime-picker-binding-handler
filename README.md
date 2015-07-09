# koco-datetime-picker-binding-handler
Knockout components binding handler for Bootstrap 3 Datepicker.

The datetimePicker binding handler creates a date/time picker using Bootstrap 3 Datepicker. There's also a utility handler for displaying a datetime string value.

##Installation
```
bower install koco-dateime-picker-binding-handler
```
Add it to `knockout-binding-handlers.js`:
```javascript
define([
'bower_components/koco-datetime-picker-binding-handler/src/datetime-picker-binding-handler',
'bower_components/koco-datetime-picker-binding-handler/src/datetime-binding-handler',
...
],
```

You'll also need to add the bower dependencies to `require.config.js`
```
var require = {
paths: {
...
'bootstrap-datetimepicker': 'bower_components/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker',
'moment-timezone': 'bower_components/moment-timezone/moment-timezone'
...
```

##Usage 
```html
<input data-bind="datetimePicker: date [, options...]">
```
Note that the data-binding _must_ appear on an `input` element. 
###Options

 - `pickTime {boolean}` - show time picker at bottom of calendar. Defaults to `true`.
 - `defaultTimeMode {String}` - Either `now` or `midnight`. If `pickTime` is `false` (ie, the user can only select by date), this will always be `midnight`, regardless of what is passed in. Otherwise defaults to `now`. 
 - `timezone` - convert date to specified timezone. (If `pickTime` is false and no timezone is specified, this will default to EST.)
 -  `isDisplayedInMontrealTimeZone {boolean}` - for legacy support.
 - `labels` - by default, timezone labels will appear in french. To override, provide an object of the format:
 
  ```
{
    timeZoneAbbr: {
        'EST': 'HNE',
        'EDT': 'HAE'
	    },
    timeZoneName: {
        'EST': 'Heure normale de l\'est',
        'EDT': 'Heure avancée de l\'est'
	    }
}
  ```