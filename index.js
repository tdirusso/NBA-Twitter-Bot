const Twitter = require('twitter');
const fs = require('fs');

require('dotenv').config();

const client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_SECRET
});

let history = [];
const historyFile = 'responded_to_tweets.txt';

if (fs.existsSync(historyFile)) {
    var historyData = fs.readFileSync(historyFile);
    history = historyData.toString().split(',') || [];
} else {
    fs.writeFileSync(historyFile, '');
}

const indexHistoryFile = 'index_history.txt';

if (!fs.existsSync(indexHistoryFile)) {
    fs.writeFileSync(indexHistoryFile, '0');
}

var indexHistoryData = fs.readFileSync(indexHistoryFile);
indexHistoryData = indexHistoryData.toString();

let curIndex = parseInt(indexHistoryData);

const tweetConfig = {
    NBA: [
        'Who\'s winning the MVP this year? 🤔',
        'Who you have winning the chip?',
        'Nets winning it all. Don’t @ me',
        'Nuggets winning it all. Don’t @ me',
        'Jazz winning it all. Don’t @ me',
        'Lakers winning it all. Don’t @ me',
        'Bucks winning it all. Don’t @ me',
        '76ers winning it all. Don’t @ me',
        'Best NBA apparel at goattalk.shop',
        'Your two favorite NBA players have to 1v1, who wins?',
        'Who’s winning the East?',
        'Who’s winning the West?',
        'Clippers winning it all. Don\'t @ me',
        'Rank these players (this year)\n- Jokic\n- Embiid\n- Bron\n- KD'
    ],
    LebronJames: [
        'Is LeBron the 🐐? Come with facts!',
        'Which current player has a chance to be better than LBJ?',
        'MJ > LBJ',
        'Bron for 🐐 | goattalk.shop',
        'Best Lakers apparel at goattalk.shop',
        'How much does Bron have left in the tank?',
        'Lakers getting beat by the Clippers in the WCF.. watch',
        'AD is the best player on the Lakers. Don’t @ me',
        'When will Bron request a trade to a playoff contender?'
    ],
    MileHighBasketball: [
        'Joker for MVP 💯',
        'Jokic = 🐐',
        'Jokic winning the MVP?',
        'Will Jokic be considered one of the best big men of all time?',
        'Jokic > Bron',
        'Best Nuggets apparel at goattalk.shop',
        'Are the Nuggets winning the West?',
        'Nuggets making it to the WCF?',
        'Will Jokic be considered among the greats?',
        '#MileHighBasketball for life',
        'Porter Jr. need to get going!'
    ],
    ThunderUp: [
        'SGA has a chance to be a top 10 player in the league',
        '#ThunderUp',
        'KD = 🗑',
        'Westbrook.. the 🐐',
        'Thunder will win a chip in the next 5 years.. Yes/No?',
        'Will OKC be a playoff contender next year?',
        'Will SGA win an MVP at some point?',
        'OKC has the best small market team, hands down!'
    ]
};

const indexMap = new Map();

const hashtagKeys = Object.keys(tweetConfig);
const keysLength = hashtagKeys.length;

hashtagKeys.forEach(key => {
    const set = tweetConfig[key];
    const randIndex = Math.ceil(Math.random() * ((set.length - 1) - 0) + 0);
    indexMap.set(key, randIndex);
});

function postTweet() {
    const hashtag = hashtagKeys[curIndex];
    const replies = tweetConfig[hashtag];


    client.get('search/tweets', { q: `%23${hashtag}`, result_type: 'recent', count: 1, include_entities: true }, (error, tweets, _) => {
        if (error) console.log(error);

        tweets.statuses.forEach(tweet => {
            if (!history.includes(tweet.id_str)) {
                fs.appendFileSync(historyFile, `${tweet.id},`);
                history.push(tweet.id_str);

                const status = `${replies[indexMap.get(hashtag)]}`;

                indexMap.set(hashtag, indexMap.get(hashtag) + 1);
                if (indexMap.get(hashtag) >= (replies.length - 1)) {
                    indexMap.set(hashtag, 0);
                }

                client.post('statuses/update', { status, in_reply_to_status_id: tweet.id_str, auto_populate_reply_metadata: true }, (error, tweet, response) => {
                    if (error) {
                        console.log('ERROR', error);
                    } else {
                        console.log(`Successfully tweeted: "${tweet.text}"`);
                        console.log('\n');
                    }
                });
            }
        });

        curIndex = curIndex + 1;
        if (curIndex >= (keysLength)) {
            curIndex = 0;
        }

        fs.writeFileSync(indexHistoryFile, curIndex.toString());

        setTimeout(postTweet, Math.ceil(Math.random() * (600000 - 1500000) + 1500000)); //random number between 10 and 25 minutes
    });
}

postTweet();