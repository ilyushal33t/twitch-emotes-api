const { ApiCalls } = require(__dirname + '/apicalls.js');
const $_ = new ApiCalls();
const url = require('url');
const fs = require('fs');
const FILE_PATH = 'stats.json'

async function getUser(name) {
    try {

        let data = await $_.getChannels(name) || { error: 'Failed to search. Check your query.' };

        if (!data.error)
            data = data.find(u => u.broadcaster_login == name.toLowerCase()) || { error: '404' };

        return data;

    } catch (e) { console.error(e) }
}

async function getUserEmotes(id) {
    try {
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
            let zerowidth = e.visibility_simple.includes('ZERO_WIDTH')
            if (error) return;
            _7tv.push({ name, image, image1x, zerowidth })
        });

        const data = {
            twitch: tw,
            _7tv: _7tv,
            bttv: bttv,
            ffz: ffz,
        };

        return data;
    } catch (e) { console.error(e); }
}

async function getGlobalEmotes() {
    try {
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
    } catch (e) { console.error(e); }
}

function fullUrl(req) {
    try {
        return url.format({
            protocol: req.protocol,
            host: req.get('host'),
            // pathname: req.originalUrl
        });
    } catch (e) { console.error(e); }
}

// read json object from file
const readStats = () => {
    let result = {}
    try {
        result = JSON.parse(fs.readFileSync(FILE_PATH))
    } catch (err) {
        console.error(err)
    }
    return result
}

// dump json object to file
const dumpStats = (stats) => {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(stats), { flag: 'w+' })
    } catch (err) {
        console.error(err)
    }
}

function getRoute(req) {
    const route = req.route ? req.route.path : '' // check if the handler exist
    const baseUrl = req.baseUrl ? req.baseUrl : '' // adding the base url if the handler is a child of another handler

    return route ? `${baseUrl === '/' ? '' : baseUrl}${route}` : 'unknown route'
}



module.exports = {
    getGlobalEmotes,
    getUserEmotes,
    getUser,
    fullUrl,
    readStats,
    dumpStats,
    getRoute,
}