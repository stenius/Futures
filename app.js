var $ = require('jquery'),
	fs = require('moment'),
	ipc = require('fullcalendar')

$(document).ready(function() {
	// page is now ready, initialize the calendar...


	$('#calendar').fullCalendar({
		// put your options and callbacks here
		events: function(start, end, timezone, callback) {
			var event_list = [
			];

			start_id = start.format("YYYY/MM/DD HH:mm:ss");
			end_id = end.format("YYYY/MM/DD HH:mm:ss");
			console.log(start_id);
			console.log(end_id);
			events.allDocs({
			  startkey     : start_id,
			  endkey       : end_id,
			  include_docs : true
			}).then(function (result) {
			  // handle result
				for (row in result.rows)
				{
					doc = result.rows[row].doc;
					console.log('y',doc);
					start = new moment(doc['_id']).format("YYYY-MM-DD")
					if (doc['amount'][0] == '-')
						color = 'red';
					else
						color = 'green';
					myEvent = {
						title  : '$8999 - ML Trade',
						start  : start,
						backgroundColor: color
					}
					$('#calendar').fullCalendar( 'renderEvent', myEvent );
				}
				console.log('result');
				console.log(result);
			}).catch(function (err) {
				console.log('error');
				console.log(err);
			  // handle errors
			});

			callback(event_list);
		},
		dayRender: function(date, cell) {

			// days.get(date).then(function (doc) {
			// 	cell.html('<i>$100</i>');
			// }).catch(function(err){
			// 	newDay = {'_id': date,
			// 	// try to get the previous day if it exists and if it does take
			// 	// its balance and add any events to it
			// });

		}
	});
});



// check to see if there is a couchdb document with the date as the id
	// if not create it and find the most recent day
		// if there is no recent day, set the balance to 0
		// find all non repeating events between the range and do the math to get the current day
		// check all the repeating events to see if they apply and activate if so
