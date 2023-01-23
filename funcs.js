const { ApiCalls } = require(__dirname + '/apicalls.js');
const $_ = new ApiCalls();
const url = require('url');

async function getUser(name) {
    let data = await $_.getChannels(name) || JSON.stringify({ error: 'Failed to search. Check your query.' });

    data = data.find(u => u.broadcaster_login == name.toLowerCase()) || JSON.stringify({ error: '404' });

    return data;
}

async function getUserEmotes(id) {
    const tw = [], ffz = [], bttv = [], _7tv = [];

    (await $_.getTwitchEmotes(id, 'channel')).forEach(e => {
        let { name, images: image, format } = e;
        image = (tmp = Object.values(image), tmp[tmp.length - 1]);
        let image1x = tmp[0];
        if (format.includes('animated')) {
            image = image.replace(/\/static\//, '/animated/');
            image1x = image1x.replace(/\/static\//, '/animated/');
        }
        tw.push({ name, image, image1x })
    });
    (await $_.getFFZChannelEmotes(id)).forEach(e => {
        if (e.error) return;
        let { name, urls: image } = e;
        image = (tmp = Object.values(image), tmp[tmp.length - 1]);
        let image1x = tmp[0];
        ffz.push({ name, image, image1x })
    });
    let { channelEmotes, sharedEmotes, message } = (await $_.getBTTVChannelEmotes(id));
    if (!message) {
        [...channelEmotes, ...sharedEmotes].forEach(e => {
            let { code: name, id: image } = e;
            let image1x = `https://cdn.betterttv.net/emote/${image}/1x`;
            image = `https://cdn.betterttv.net/emote/${image}/3x`;
            bttv.push({ name, image, image1x })
        });

    }
    (await $_.get7TVChannelEmotes(id))?.forEach(e => {
        if (e.error) return;
        let { name, url: image, error, image1x } = e;
        if (error) return;
        _7tv.push({ name, image, image1x })
    });

    const data = {
        twitch: tw,
        _7tv: _7tv,
        bttv: bttv,
        ffz: ffz,
    };

    return data;
}

async function getGlobalEmotes() {
    const tw = [], ffz = [], bttv = [], _7tv = [];
    let tmp = null;

    (await $_.getTwitchEmotes()).forEach(e => {
        let { name, images: image } = e;
        image = (tmp = Object.values(image), tmp[tmp.length - 1]);
        let image1x = tmp[0];
        tw.push({ name, image, image1x })
    });
    (await $_.getFFZGlobal()).forEach(e => {
        let { name, urls: image } = e;
        image = (tmp = Object.values(image), tmp[tmp.length - 1]);
        let image1x = tmp[0];
        ffz.push({ name, image, image1x })
    });
    (await $_.get7TVGlobal()).forEach(e => {
        let { name, urls: image } = e;
        image = image[image.length - 1][1];
        let image1x = image.replace(/\/4x\.webp/, '/1x.webp');
        _7tv.push({ name, image, image1x })
    });
    (await $_.getBTTVGlobal()).forEach(e => {
        let { code: name, id: image } = e;
        image = `https://cdn.betterttv.net/emote/${image}/3x`;
        let image1x = image.replace(/\/3x/, '/1x');
        bttv.push({ name, image, image1x })
    });

    const data = {
        twitch: tw,
        _7tv: _7tv,
        bttv: bttv,
        ffz: ffz,
    };

    return data;
}

function fullUrl(req) {
    return url.format({
        protocol: req.protocol,
        host: req.get('host'),
        // pathname: req.originalUrl
    });
}

module.exports = {
    getGlobalEmotes,
    getUserEmotes,
    getUser,
    fullUrl,
}