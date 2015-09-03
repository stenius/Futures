var $ = require('jquery'),
	moment = require('moment')
	fullcalendar = require('fullcalendar')
	require('moment-range')


$(document).ready(function() {
	"use strict";
	// page is now ready, initialize the calendar...


	$('#calendar').fullCalendar({
		// put your options and callbacks here
		events: function(start, end, timezone, callback) {
			var event_list = [
			];
			console.log('rendering a new month: ');

			//get all the events that apply to the range then
			var start2 = moment(start).subtract(1, 'days');
			var end2 = moment(end).subtract(1, 'days');
			// start.subtract(1, 'days');
			// end.subtract(1, 'days');
			var start_id = start2.format("YYYY/MM/DD HH:mm:ss");
			var end_id = end2.format("YYYY/MM/DD HH:mm:ss");
			events.allDocs({
			  startkey     : start_id,
			  endkey       : end_id,
			  include_docs : true
			}).then(function (result) {
			console.log('there are '+ result.rows.length + ' events saved in this range');
			  // handle result
				for (row in result.rows)
				{
					var doc = result.rows[row].doc;
					start_date = new moment(doc['_id']).format("YYYY-MM-DD")
					if (doc['amount'][0] == '-')
					{
						color = 'red';
						title = '$' + doc['amount'].substr(1) + ' - ' + doc['name']
					}
					else
					{
						color = 'green';
						title = '$' + doc['amount'] + ' - ' + doc['name']
					}

					myEvent = {
						title  : title,
						start  : start_date,
						backgroundColor: color
					}
					$('#calendar').fullCalendar( 'renderEvent', myEvent );
				}

				//get all days in the range plus the first hidden day, if the count is less than the date range
				var start2 = moment(start).subtract(1, 'days');
				var end2 = moment(end).subtract(1, 'days');
				start_id = start2.format("YYYY/MM/DD");
				end_id = end2.format("YYYY/MM/DD");
				console.log('starting at ' + start_id);
				console.log('ending at ' + end_id);
				days.allDocs({
				  startkey     : start_id,
				  endkey       : end_id,
				  include_docs : true
				}).then(function (result) {
					console.log('there are '+ result.rows.length + ' days saved in this range');
					for (day in result.rows)
					{
						var day_id = moment(result.rows[day].doc['_id'])
						day_id = day_id.format("YYYY/MM/DD");
						console.log('day: ' + day_id);
					}
					if (result.rows.length == 43) //42 days displayed + 1 previous day
					{
						for (row in result.rows)
						{
							var day_id = new moment(result.rows[row].doc['_id']).format("YYYY-MM-DD")
							$("td.fc-day[data-date='"+day_id+"']").html('<i>$'+ result.rows[row].doc['balance'] + '</i>')
						}
					}
					else
					{
						//find the last day and create documents for filler days use that balance
						//take the events and then apply them to any days that have been created
						//
						//use bulkupdate to save the new documents
						days.allDocs({
							include_docs: true,
							descending: true,
							startkey: end_id,
							limit: 1
						}).then(function(row_result){
							//if the range is 0, create the first day with a balance of zero
							row_result = row_result.rows
							if (row_result.length == 1)
							{
								console.log('last day saved: ');
								console.log(row_result[0].doc)
								//copy the balance over to the next created day
								//last_balance = row_result[0]['balance'];
								last_balance = 10;
								var first_day_to_create = row_result[0]['id'];
							}
							else
							{
								last_balance = 0;
								var first_day_to_create = startkey;
								console.log('no last day saved.');
							}
							var day_objects = [];

							// need to skip the first day in the range since it is already in the db
							var first_day = moment(first_day_to_create).add(1, 'days');
							var new_day_range = moment.range(first_day, moment(end_id))
							new_day_range.by('days', function(d){
								var day_id = d.format("YYYY/MM/DD");
								console.log('creating day for ' + day_id + '.');
								var new_day = {
									'_id': day_id,
									'balance': last_balance
								}
								day_objects.push(new_day);
							});
							var rtr_obj = {
								'balance': last_balance,
								'days': day_objects
							}
							return rtr_obj;
						}).then(function(rtr_obj){
							var balance = rtr_obj['balance'];
							var day_objects = rtr_obj['days'];
							console.log('day objects are');
							console.log(day_objects);
							events.allDocs(
							{
								include_docs: true,
								startkey: start_id
							}).then(function(eventresult){
								console.log('searching for all events after ' + start_id + ' with a balance of ' + balance);
								for (eventrow in eventresult.rows)
									console.log(eventresult.rows[eventrow].doc)
						})});

						//add a document for the first day in the range
					}

					console.log(result);
				}).catch(function (err) {
					console.log('error');
					console.log(err);
				});
			}).catch(function (err) {
				console.log('error');
				console.log(err);
			  // handle errors
			});

			callback(event_list);
		},
	});
});
