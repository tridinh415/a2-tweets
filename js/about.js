function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;	
	// update every element with this id or class
	function setText(name, value) {
		document.querySelectorAll('#' + name + ', .' + name).forEach(el => el.innerText = value);
	}

	// format a percentage with exactly 2 decimals
	function pct(count, total) {
		return math.format(count / total * 100, {notation: 'fixed', precision: 2}) + '%';
	}

	const total = tweet_array.length;

	// Earliest and latest tweet dates
	const times = tweet_array.map(t => t.time.getTime());
	const opts = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
	setText('firstDate', new Date(Math.min(...times)).toLocaleDateString('en-US', opts));
	setText('lastDate', new Date(Math.max(...times)).toLocaleDateString('en-US', opts));

	// Count tweets in each category
	const completed = tweet_array.filter(t => t.source === 'completed_event').length;
	const live = tweet_array.filter(t => t.source === 'live_event').length;
	const achievements = tweet_array.filter(t => t.source === 'achievement').length;
	const misc = tweet_array.filter(t => t.source === 'miscellaneous').length;

	setText('completedEvents', completed);
	setText('completedEventsPct', pct(completed, total));
	setText('liveEvents', live);
	setText('liveEventsPct', pct(live, total));
	setText('achievements', achievements);
	setText('achievementsPct', pct(achievements, total));
	setText('miscellaneous', misc);
	setText('miscellaneousPct', pct(misc, total));

	// User written tweets out of completed events
	const written = tweet_array.filter(t => t.source === 'completed_event' && t.written).length;
	setText('written', written);
	setText('writtenPct', pct(written, completed));
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});