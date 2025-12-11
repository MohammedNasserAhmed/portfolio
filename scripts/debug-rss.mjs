import Parser from 'rss-parser';

const parser = new Parser();
const FEED_URL = 'https://medium.com/feed/@mohd_nass';

async function main() {
    try {
        const feed = await parser.parseURL(FEED_URL);
        console.log('First item keys:', Object.keys(feed.items[0]));
        console.log('First item sample:', JSON.stringify(feed.items[0], null, 2));
    } catch (e) {
        console.error(e);
    }
}

main();
