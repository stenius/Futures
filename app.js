var $ = require('jquery'),
	fs = require('moment'),
	ipc = require('fullcalendar'),
	PouchDB = require('pouchdb')

$(document).ready(function() {
	// page is now ready, initialize the calendar...
	$('#calendar').fullCalendar({
		// put your options and callbacks here
		events: function(start, end, timezone, callback) {
			var events = [
				{
					title  : '$8999 - ML Trade',
					start  : '2015-08-18',
					backgroundColor: 'green'
				},
				{
					title  : '$2500 - Credit Card Payment',
					start  : '2015-08-23',
					backgroundColor: 'red'
				}
			];
			callback(events);
		},
		dayRender: function(date, cell) {
			var first = $.fullCalendar.moment('2015-08-18');
			var second = $.fullCalendar.moment('2015-08-23');
			if (date.diff(first) < 0)
				cell.html('<i>$100</i>');
			else if (date.diff(second) < 0)
				cell.html('<i>$9099</i>');
			else
				cell.html('<i>$6599</i>');
		}
	});
});

var db = new PouchDB('transactions', {adapter: 'websql'});
