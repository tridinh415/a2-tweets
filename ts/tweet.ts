class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

    get source():string {
        const t = this.text;
    if (t.startsWith("Just completed") || t.startsWith("Just posted")) {
        return "completed_event";
    }
    if (t.includes("right now")) {
        return "live_event";
    }
    if (t.startsWith("Achieved") || t.includes("set a goal")) {
        return "achievement";
    }
    return "miscellaneous";
}

    get written():boolean {
        //TODO: identify whether the tweet is written
        return this.text.includes(" - ") && !this.text.includes("TomTom MySports Watch");
    }

    get writtenText():string {
        if(!this.written) {
            return "";
        }
        // Keep only the part after " - "
        const afterDash = this.text.substring(this.text.indexOf(" - ") + 3);
        // The link and #Runkeeper come at the end, so cut everything from the link onwards
        const userText = afterDash.split("https://")[0];
        return userText.trim();
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //TODO: parse the activity type from the text of the tweet
        const words = this.text.split(" ");
        const unit = words[4];
        if (unit !== "km" && unit !== "mi") {
            return "unknown";
        }

        // (handles multi word activities like "mtn bike")
        const activity: string[] = [];
        for (let i = 5; i < words.length; i++) {
            if (words[i] === "-" || words[i] === "with" || words[i].startsWith("http")) {
                break;
            }
            activity.push(words[i]);
        }
        return activity.join(" ");
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
        const words = this.text.split(" ");
        const amount = parseFloat(words[3]);
        const unit = words[4];
        if (unit === "km") {
            return amount / 1.609;   // convert km to miles
        }
        if (unit === "mi") {
            return amount;
        }
        return 0;
    }


    getHTMLTableRow(rowNumber:number):string {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
       const words = this.text.split(" ");

        // Replace any word that is a link with a clickable <a> tag
        for (let i = 0; i < words.length; i++) {
            if (words[i].startsWith("http")) {
                words[i] = `<a href="${words[i]}" target="_blank">${words[i]}</a>`;
            }
        }

        const linked = words.join(" ");
        return `<tr><td>${rowNumber}</td><td>${this.activityType}</td><td>${linked}</td></tr>`;
    }
}