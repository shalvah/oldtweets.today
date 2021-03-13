# &#35;TwitterThrowback
You know of [Facebook's "On This Day" feature](https://www.facebook.com/help/439014052921484)? It shows you the posts you made (and a few other things) on this day (for example, February 15) in the past. If you're on Facebook, you can see yours at [facebook.com/onthisday](https://facebook.com/onthisday).

Yeah, this is that, but for Twitter. You can see the tweets you've made on this day in the past by visiting [oldtweets.today](http://oldtweets.today).

## How this works
This repo contains two different components.

### The website
A simple page served via GitHub Pages from the `docs/` folder. This is where you enter your Twitter username, and then a request is made to the API to retrieve your old tweets.

### The API
The API is a serverless JavaScript function hosted on [Google Cloud Functions](https://cloud.google.com/functions/) (Node.js 10). Normally, this would call Twitter's API to request your old tweets, but Twitter's Standard Search API only provides access to tweets made in the past 7 days, so that's pretty useless.
 
 However, you can use the search on twitter.com to fetch tweets by a particular person on a particular date, with little restriction. That's what this API does. It runs the search on Twitter's site, scrapes the results and extracts the necessary data and returns the tweets requested as embeddable HTML.

## Want to contribute or play with this locally?
See the [contribution](./CONTRIBUTING.md) and [development](./DEVELOPMENT.md) guides.

## License
Do whatever you want.

## If you like this...
then you might like some other tools I've built around Twitter and their API:
- [@this_vid](https://github.com/shalvah/DownloadThisVideo)
- [@RemindMe_OfThis](https://github.com/shalvah/RemindMeOfThisTweet)
- [twittersignin](https://github.com/shalvah/twittersignin)
- [twitter-error-handler](https://github.com/shalvah/twitter-error-handler)
