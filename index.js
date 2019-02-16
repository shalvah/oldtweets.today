'use strict';

function getTweetsOnThisDay(username, { from, until }, today = new Date()) {
    const baseDate = today;

    // Generate an array of all the years we're looking for tweets in.
    // Twitter was founded in 2006, so we only need to go as far as that.
    until = until || 2006;
    const years = Array.from(
        {length: parseInt(from) + 1 - parseInt(until)},
        (_, i) => from - i
    );

    const requests = years.map(year => {
        baseDate.setFullYear(year);
        return getTweetsMadeInYear(username, baseDate)
    });

    return Promise.all(requests)
        .then(function groupTweetsByYear(results) {
            return years.reduce((tweets, year, index) => {
                tweets[year] = results[index];
                return tweets;
            }, {});
        });
}

function getTweetsMadeInYear(username, date) {
    const url = `https://mobile.twitter.com/search?q=`;
    const got = require("got");
    const cheerio = require('cheerio');
    const searchQuery = getSearchQuery(username, date);

    return got(`${url}${searchQuery}`, {headers: {'user-agent': null}})
        .then(r => {
            const $ = cheerio.load(r.body);
            return $('.tweet-text')
                .map(function extractTweetUrlFromDomNode(_, node) {
                    return `http://twitter.com/${username}/status/${node.attribs['data-id']}`;
                }).get();

        })
        .then(tweets => Promise.all(tweets.map(getTweetEmbedHtml)));
}

function getSearchQuery(username, baseDate) {
    const endDate = new Date(baseDate);
    endDate.setDate(parseInt(baseDate.getDate()) + 1);
    const start = baseDate.toISOString().replace(/T.*/, '');
    const end = endDate.toISOString().replace(/T.*/, '');
    return `from:${username} since:${start} until:${end}`;
}

function getTweetEmbedHtml(tweetUrl) {
    const got = require("got");
    const qs = require('querystring');
    const url = 'https://publish.twitter.com/oembed?' + qs.stringify({
        url: tweetUrl,
        theme: 'dark',
        align: 'center',
        dnt: true
    });
    return got(url, {headers: {'user-agent': null}})
        .then(r => qs.unescape(JSON.parse(r.body).html));
}

function respond(res, body = null, status = 200) {
    res.set('Content-Type', 'application/json');
    res.set('Access-Control-Allow-Origin', '*');
    res.status(status).send(body ? JSON.stringify(body) : '')
}

exports.getTweetsOnThisDay = (req, res) => {
    switch (req.method) {
        case 'GET':
            let username = req.query.username;
            if (username === undefined) {
                respond(res, {error: 'Username query parameter is required.'}, 400);
                return;
            }

            if (username.startsWith('@')) {
                username = username.substr(1);
            }

            // Out function runs in UTC time. So if a user in UTC+1 (offset: -60)
            // uses our app at 00:30 Feb 16, they'll get tweets made on Feb 15.
            // We need to change our date query to reflect the day wherever they are
            let offset = req.query.utcOffset;
            let today = new Date();
            if (offset) {
                today.setTime(today.getTime() + (-1 * offset * 60 * 1000));
            }

            let from = req.query.from || today.getFullYear();
            let until = req.query.until || null;
            return getTweetsOnThisDay(username, { from, until }, today)
                .then(tweets => respond(res, tweets));
        default:
            return respond(res, {error: "Read the fucking docs; it's a GET request."}, 405);
    }
};
