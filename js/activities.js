function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	//TODO: create a new array or manipulate tweet_array to create a graph of the number of tweets containing each type of activity.
	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	const activities = [];
	for (let i = 0; i < tweet_array.length; i++) {
		const tweet = tweet_array[i];
		if (tweet.source === 'completed_event' && tweet.activityType !== 'unknown') {
			activities.push({
				activityType: tweet.activityType,
				distance: tweet.distance,
				day: dayNames[tweet.time.getDay()]
			});
		}
	}

	// ===== Count each activity type and find the top 3 =====

	const counts = {};
	for (let i = 0; i < activities.length; i++) {
		const type = activities[i].activityType;
		if (counts[type] === undefined) {
			counts[type] = 0;
		}
		counts[type] = counts[type] + 1;
	}
	
	const types = Object.keys(counts);   // ["run", "walk", "bike", ...]
	types.sort(function (a, b) {
		return counts[b] - counts[a];     // biggest count first
	});
	const top1 = types[0];
	const top2 = types[1];
	const top3 = types[2];

	document.getElementById('numberActivities').innerText = types.length;
	document.getElementById('firstMost').innerText = top1;
	document.getElementById('secondMost').innerText = top2;
	document.getElementById('thirdMost').innerText = top3;

	// Chart 1 - number of tweets for each activity type
	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "width": 900,
	  "height": 400,
	  "data": {
	    "values": activities
	  },
	  //TODO: Add mark and encoding
	  "mark": "bar",
	  "encoding": {
	    "x": { "field": "activityType", "type": "nominal", "sort": "-y", "title": "Activity type" },
	    "y": { "aggregate": "count", "type": "quantitative", "title": "Number of tweets" }
	  },
	  "config": {
	    "axis": {
	      "titleFontSize": 16,
	      "labelFontSize": 16
	    }
	  }
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	//TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
	//Use those visualizations to answer the questions about which activities tended to be longest and when.

	// Chart 2 - every activity as its own dot
	// Keep only the top 3 activities for the next two charts
	const topActivities = [];
	for (let i = 0; i < activities.length; i++) {
		const type = activities[i].activityType;
		if (type === top1 || type === top2 || type === top3) {
			topActivities.push(activities[i]);
		}
	}
	const allPointsSpec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "Distance by day of the week for the top 3 activities.",
	  "width": 900,
	  "height": 400,
	  "data": { "values": topActivities },
	  "mark": {"type": "point", "size": 100, "filled": true},
	  "encoding": {
	    "x": { "field": "day", "type": "ordinal", "sort": dayNames, "title": "Day of week" },
	    "y": { "field": "distance", "type": "quantitative", "title": "Distance (mi)" },
	    "color": { "field": "activityType", "type": "nominal", "title": "Activity" }
	  },
	  "config": {
	    "axis": {
	      "titleFontSize": 16,
	      "labelFontSize": 16
	    }
	  }
	};
	vegaEmbed('#distanceVis', allPointsSpec, {actions:false});

	// Chart 3 - same chart, but one dot per activity per day (the average)
	const meanSpec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "Mean distance by day of the week for the top 3 activities.",
	  "width": 900,
	  "height": 400,
	  "data": { "values": topActivities },
	  "mark": {"type": "point", "size": 100, "filled": true},
	  "encoding": {
	    "x": { "field": "day", "type": "ordinal", "sort": dayNames, "title": "Day of week" },
	    "y": { "field": "distance", "aggregate": "mean", "type": "quantitative", "title": "Mean distance (mi)" },
	    "color": { "field": "activityType", "type": "nominal", "title": "Activity" }
	  },
	  "config": {
	    "axis": {
	      "titleFontSize": 16,
	      "labelFontSize": 16
	    }
	  }
	};
	vegaEmbed('#distanceVisAggregated', meanSpec, {actions:false});

	const allPointsChart = document.getElementById('distanceVis');
	const meanChart = document.getElementById('distanceVisAggregated');
	const button = document.getElementById('aggregate');

	meanChart.style.display = 'none';    // hide the mean chart at the start
	
	//The button switches between Chart 2 and Chart 3
	button.addEventListener('click', function () {
		if (meanChart.style.display === 'none') {
			// Currently showing all points -> switch to means
			allPointsChart.style.display = 'none';
			meanChart.style.display = 'block';
			button.innerText = 'Show all activities';
		} else {
			// Currently showing means -> switch to all points
			allPointsChart.style.display = 'block';
			meanChart.style.display = 'none';
			button.innerText = 'Show means';
		}
	});

		//  Which activity is longest/shortest, and weekday vs weekend

	// Helper: average distance of a list of activities
	function averageDistance(list) {
		let total = 0;
		for (let i = 0; i < list.length; i++) {
			total = total + list[i].distance;
		}
		return total / list.length;
	}
	// Helper: get only the activities of one type
	function onlyType(type) {
		const result = [];
		for (let i = 0; i < topActivities.length; i++) {
			if (topActivities[i].activityType === type) {
				result.push(topActivities[i]);
			}
		}
		return result;
	}
	// Sort the top 3 types by their average distance (longest first)
	const topTypes = [top1, top2, top3];
	topTypes.sort(function (a, b) {
		return averageDistance(onlyType(b)) - averageDistance(onlyType(a));
	});
	document.getElementById('longestActivityType').innerText = topTypes[0];
	document.getElementById('shortestActivityType').innerText = topTypes[2];

	// Split into weekend and weekday activities

	const weekend = [];
	const weekday = [];
	for (let i = 0; i < topActivities.length; i++) {
		const day = topActivities[i].day;
		if (day === 'Sat' || day === 'Sun') {
			weekend.push(topActivities[i]);
		} else {
			weekday.push(topActivities[i]);
		}
	}

	if (averageDistance(weekend) > averageDistance(weekday)) {
		document.getElementById('weekdayOrWeekendLonger').innerText = 'weekends';
	} else {
		document.getElementById('weekdayOrWeekendLonger').innerText = 'weekdays';
	}
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});