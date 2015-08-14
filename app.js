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
			cell.html('$100');
		}
	});
});

var db = new PouchDB('transactions', {adapter: 'websql'});
