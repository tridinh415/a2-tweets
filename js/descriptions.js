function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	//TODO: Filter to just the written tweets
	const tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	// Keep only the tweets with user-written text
	writtenTweets = [];
	for (let i = 0; i < tweet_array.length; i++) {
		if (tweet_array[i].written) {
			writtenTweets.push(tweet_array[i]);
		}
	}
}


function addEventHandlerForSearch() {
	//TODO: Search the written tweets as text is entered into the search box, and add them to the table
	const searchBox = document.getElementById('textFilter');
	const table = document.getElementById('tweetTable');

	searchBox.addEventListener('input', function () {
		const searchText = searchBox.value;
		document.getElementById('searchText').innerText = searchText;

		// Empty search box then clear the table
		if (searchText === '') {
			table.innerHTML = '';
			document.getElementById('searchCount').innerText = 0;
			return;
		}

		// Find written tweets that contain the search text 
		const matches = [];
		for (let i = 0; i < writtenTweets.length; i++) {
			const tweetText = writtenTweets[i].writtenText.toLowerCase();
			if (tweetText.includes(searchText.toLowerCase())) {
				matches.push(writtenTweets[i]);
			}
		}

		// Show how many matched
		document.getElementById('searchCount').innerText = matches.length;

		// Build one table row per match
		let rows = '';
		for (let i = 0; i < matches.length; i++) {
			rows = rows + matches[i].getHTMLTableRow(i + 1);
		}
		table.innerHTML = rows;
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});