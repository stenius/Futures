var $ = require('jquery'),
	moment = require('moment')
	fullcalendar = require('fullcalendar')
	require('moment-range')
	decimal = require('decimal')


$(document).ready(function() {
	"use strict";

	// as events come in from a remote source update the balances and displayed days
	var rep = events.replicate.from(events2, {
	  live: true,
	  retry: true
	}).on('change', function (info) {
		console.log(info);
		// TODO: check to make sure that it is a object being added and not deleted
		addTransactions(info.docs)
	  // TODO: increase the balance for all days found after this event
	}).on('paused', function () {
	  // replication paused (e.g. user went offline)
		console.log('paused');
	}).on('active', function () {
		console.log('active');
	  // replicate resumed (e.g. user went back online)
	}).on('denied', function (info) {
		console.log(info);
	  // a document failed to replicate, e.g. due to permissions
	}).on('complete', function (info) {
		console.log(info);
	  // handle complete
	}).on('error', function (err) {
		console.log(err);
	  // handle error
	});

	var addTransactions = function(transactions) {
		for (var row in transactions)
		{
			console.log('adding transaction')
			console.log(transactions[row])

			// increase the balance of all days, and save them

			// days.allDocs(
			// {
			// 	include_docs: true,
			// 	startkey: first_event_start_key,
			// }).then(function(eventresult){
			// })
			// if a day is currently being displayed, update the balance of it
		}

	}


	$('#calendar').fullCalendar({
		customButtons: {
			settingsButton: {
				text: 'Settings',
				click: function() {
					alert('clicked the settings button!');
				}
			}
		},
		header: {
			left: 'title settingsButton',
			right: 'today prev,next',
		},

		// find or create day objects in db as days are displayed
		events: function(start, end, timezone, callback) {
			var event_list = [
			];
			console.log('rendering a new month: ');
			console.log('first moment is')
			console.log(start)

			//get all the events that apply to the range then
			var start2 = moment(start).subtract(1, 'days');
			var end2 = moment(end).subtract(1, 'days');
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
				start_id = start.format("YYYY/MM/DD");
				end_id = end2.format("YYYY/MM/DD");
				console.log('starting at ' + start_id);
				console.log('ending at ' + end_id);
				days.allDocs({
				  startkey     : start_id,
				  endkey       : end_id,
				  include_docs : true
				}).then(function (result) {
					console.log('there are '+ result.rows.length + ' days saved in this range');

					for (row in result.rows)
					{
						var day_id = new moment(result.rows[row].doc['_id']).format("YYYY-MM-DD")
						$("td.fc-day[data-date='"+day_id+"']").html('<i>$'+ result.rows[row].doc['balance'] + '</i>')
					}

					//find the last day and create documents for filler days use that balance
					//take the events and then apply them to any days that have been created
					days.allDocs({
						include_docs: true,
						descending: true,
						startkey: end_id,
						limit: 1
					}).then(function(row_result){
						// TODO: check to see if the last day saved in the db occurs after the current date range, if so, just set all of the values to 0

						//if the range is 0, create the first day with a balance of zero
						row_result = row_result.rows
						if (row_result.length == 1)
						{
							console.log('last day saved: ');
							console.log(row_result[0].doc)

							//copy the balance over to the next created day
							last_balance = row_result[0].doc['balance'];

							// need to skip the first day in the range since it is already in the db
							var first_day_to_create = row_result[0]['id'];
							var first_day = moment(first_day_to_create).add(1, 'days');
						}
						else
						{
							last_balance = '0.00';
							var first_day = start;
							console.log('no last day saved.');
						}
						var day_objects = {};

						var end_day = moment(end_id)
						var new_day_range = moment.range(first_day, end_day)
						new_day_range.by('days', function(d){
							var day_id = d.format("YYYY/MM/DD");
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
						var first_event_start_key = first_day_id + ' 00:00:00';
						events.allDocs(
						{
							include_docs: true,
							startkey: first_event_start_key,
						}).then(function(eventresult){
							for (var eventrow in eventresult.rows)
							{
								var event_doc = eventresult.rows[eventrow].doc
								//get day id for event and add to all subsequent days
								var first_day_after_event = moment(event_doc['_id'])
								var last_day = moment(end_day).add(1, 'days');
								var new_day_range = moment.range(first_day_after_event, last_day)
								new_day_range.by('days', function(d){
									var day_id = d.format("YYYY/MM/DD");
									day_objects[day_id]['balance'] = String(decimal(day_objects[day_id]['balance']).add(decimal(event_doc.amount)));
								});
							}
							return day_objects;
						}).then(function(day_obj){
							// finally save the new days that were created to the db
							var values = Object.keys(day_obj).map(function(key){
								return day_obj[key];
							});
							days.bulkDocs(values);

							//iterate over the new days created and display them on the calendar
							for (var day in values)
							{
								var day_id = values[day]['_id'];
								var re = new RegExp('/', 'g');
								day_id = day_id.replace(re, '-')
								var day_balance = values[day]['balance'];
								console.log('creating ' + day_id + ' with a balance of $' + day_balance);
								$("td.fc-day[data-date='"+day_id+"']").html('<i>$'+ day_balance + '</i>');
							}
						})
					});
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
