var $ = require('jquery'),
	fs = require('moment'),
	ipc = require('fullcalendar'),
	PouchDB = require('pouchdb')

$(document).ready(function() {
	// page is now ready, initialize the calendar...
	$('#calendar').fullCalendar({
		// put your options and callbacks here
		events: function(start, end, timezone, callback) {
			console.log(start);
			console.log(end);
			console.log(timezone);
			var events = [
				{
					title  : 'event1',
					start  : '2015-08-01'
				},
				{
					title  : 'event2',
					start  : '2015-08-05',
					end    : '2015-08-07'
				}
			];
			callback(events);
		},
		dayRender: function(date, cell) {
			console.log(date);
			console.log(cell);
			cell.html('$100');
		}
	});
});

var db = new PouchDB('transactions', {adapter: 'websql'});
