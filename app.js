var $ = require('jquery'),
	moment = require('moment')
	fullcalendar = require('fullcalendar')
	require('moment-range')
	decimal = require('decimal')


$(document).ready(function() {
	"use strict";
	// page is now ready, initialize the calendar...


	$('#calendar').fullCalendar({
		// put your options and callbacks here
		events: function(start, end, timezone, callback) {
			var event_list = [
			];
			console.log('rendering a new month: ');
			console.log('first moment is')
			console.log(start)

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
				for (var row in result.rows)
				{
					var doc = result.rows[row].doc;
					var start_date = new moment(doc['_id']).format("YYYY-MM-DD")
					if (doc['amount'][0] == '-')
					{
						var color = 'red';
						var title = '$' + doc['amount'].substr(1) + ' - ' + doc['name']
					}
					else
					{
						var color = 'green';
						var title = '$' + doc['amount'] + ' - ' + doc['name']
					}

					var myEvent = {
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
					for (var day in result.rows)
					{
						var day_id = moment(result.rows[day].doc['_id'])
						day_id = day_id.format("YYYY/MM/DD");
						console.log('day: ' + day_id);
					}
					if (result.rows.length == 42 | result.rows.length == 43) //42 days displayed + 1 previous day
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
								last_balance = row_result[0].doc['balance'];
								var first_day_to_create = row_result[0]['id'];
							}
							else
							{
								last_balance = '0.00';
								var first_day_to_create = start_id;
								console.log('no last day saved.');
							}
							var day_objects = {};

							// need to skip the first day in the range since it is already in the db
							var first_day = moment(first_day_to_create).add(1, 'days');
							var end_day = moment(end_id)
							var new_day_range = moment.range(first_day, end_day)
							new_day_range.by('days', function(d){
								var day_id = d.format("YYYY/MM/DD");
								console.log('creating day for ' + day_id + '.');
								var new_day = {
									'_id': day_id,
									'balance': last_balance
								}
								day_objects[day_id] = new_day;
							});
							var rtr_obj = {
								'balance': last_balance,
								'days': day_objects,
								'first_day': first_day,
								'end_day': end_day
							}
							return rtr_obj;
						}).then(function(rtr_obj){
							var balance = rtr_obj['balance'];
							var day_objects = rtr_obj['days'];
							var first_day = rtr_obj['first_day'];
							var first_day_id = first_day.format("YYYY/MM/DD")
							var end_day = rtr_obj['end_day'];
							var end_day_id = end_day.format("YYYY/MM/DD")
							console.log('day objects are');
							console.log(day_objects);
							var first_event_start_key = first_day_id + ' 00:00:00';
							events.allDocs(
							{
								include_docs: true,
								startkey: first_event_start_key,
							}).then(function(eventresult){
								console.log('searching for all events after ' + first_event_start_key + ' with a balance of ' + balance);
								console.log(eventresult);

								console.log('day objects are');
								console.log(day_objects);

								for (var eventrow in eventresult.rows)
								{
									var event_doc = eventresult.rows[eventrow].doc
									console.log(event_doc['_id']);
									//get day id for event and add to all subsequent days
									//
									// TODO: get date of event and change that to the beginning of the range
									var first_day_after_event = moment(event_doc['_id'])
									var last_day = end_day.add(1, 'days');
									var new_day_range = moment.range(first_day_after_event, last_day)
									new_day_range.by('days', function(d){
										var day_id = d.format("YYYY/MM/DD");
										// TODO: modify each of the days that come up after this even and add the sum to it
										day_objects[day_id].balance = String(decimal(day_objects[day_id].balance).add(decimal(event_doc.amount)));
										console.log(day_objects[day_id]);
										console.log('adding balance to day ' + day_id);
									});
								}
						}).then(function(){
							// finally save the new days that were created to the db
							var values = Object.keys(day_objects).map(function(key){
								return day_objects[key];
							});
							console.log(values)
							days.bulkDocs(values);
							console.log('finished')
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
