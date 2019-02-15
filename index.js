'use strict';

function getTweetsOnThisDay(username, today = new Date()) {
    const baseDate = today;

    // Generate an array of all the years we're looking for tweets in.
    // Twitter was founded in 2006, so we only need to go as far as that.
    const years = Array.from(
        {length: parseInt(today.getFullYear()) - 2006},
        (_, i) => 2006 + i
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
    const url = 'https://publish.twitter.com/oembed?' + qs.stringify({ url: tweetUrl, theme: 'dark' });
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
            getTweetsOnThisDay(req.query.username)
                .then(tweets => respond(res, tweets));
            return;
        default:
        // I don't fucking care
    }
};
