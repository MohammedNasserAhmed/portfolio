import Parser from 'rss-parser';

const parser = new Parser();
const usernames = ['@mohd_nass'];

async function check(user) {
    const url = `https://medium.com/feed/${user}`;
    console.log(`Checking ${url}...`);
    try {
        const feed = await parser.parseURL(url);
        console.log(`✅ SUCCESS: ${user}`);
        console.log(`Title: ${feed.title}`);
        console.log(`Items: ${feed.items.length}`);
        return true;
    } catch (e) {
        console.log(`❌ FAILED: ${user} - ${e.message}`);
        return false;
    }
}

async function main() {
    for (const u of usernames) {
        if (await check(u)) break;
    }
}

main();
