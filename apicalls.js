require('dotenv').config()
const request = require('request')
const fs = require('fs');
const fetch = require('node-fetch');

var get = {
    json: async function (url, query = void 0, ops = void 0) {
        try {
            if (typeof url === 'string') {
                if (typeof query === 'object' && query.constructor.name === 'Object') {
                    url += '?' + Object.entries(query).map(([key, val]) => `${key}=${val}`).join('&')
                }
                if (typeof ops === 'object' && ops.constructor.name === 'Object')
                    return (await fetch(url, ops)).json();
                else
                    return (await fetch(url)).json();
            }
        } catch (e) { console.error(e); }
    }
}

class ApiCalls {
    url_ch_info = 'https://api.twitch.tv/helix/channels';
    url_ch_search = 'https://api.twitch.tv/helix/search/channels';
    url_channel_twitch_emotes = 'https://api.twitch.tv/helix/chat/emotes?broadcaster_id=';
    url_channel_bttv_emotes = 'https://api.betterttv.net/3/cached/users/twitch/'
    url_channel_ffz_emotes = 'https://api.frankerfacez.com/v1/room/id/';
    url_global_twitch_emotes = 'https://api.twitch.tv/helix/chat/emotes/global';
    url_global_7tv_emotes = 'https://api.7tv.app/v2/emotes/global';
    url_global_bttv_emotes = 'https://api.betterttv.net/3/cached/emotes/global';
    url_global_ffz_emotes = 'https://api.frankerfacez.com/v1/set/global'
    url_follows_check = 'https://api.twitch.tv/helix/users/follows?from_id=22877031';

    async getFFZGlobal() {
        let c = await get.json(this.url_global_ffz_emotes);
        let tmp = null;

        return (tmp = Object.entries(c.sets).map(e => e[1].emoticons), tmp[0].concat(tmp[1]));
    }

    async get7TVGlobal() {
        return await get.json(this.url_global_7tv_emotes)
    }

    async getBTTVGlobal() {
        return await get.json(this.url_global_bttv_emotes);
    }

    async getChannels(query, count = 20) {
        const ops = {
            method: 'GET',
            headers: {
                'Client-ID': process.env.CLIENT_ID,
                'Authorization': 'Bearer ' + process.env.APP_TOKEN,
            }
        }

        let data = await get.json(
            this.url_ch_search,
            { query: query, first: count },
            ops
        );

        return data.data;
    }

    async getChannelInfo(id) {
        const ops = {
            method: 'GET',
            headers: {
                'Client-ID': process.env.CLIENT_ID,
                'Authorization': 'Bearer ' + process.env.APP_TOKEN,
            }
        },
            url = this.url_ch_info + id;

        let data = get.json(
            this.url_ch_info,
            { broadcaster_id: id },
            ops
        );

        return data.data;
    }

    async get7TVChannelEmotes(id) {
        const url = `https://api.7tv.app/v2/users/${id}/emotes`;
        let c = await get.json(url);

        if (c.error) return [c];

        c.forEach(e => {
            e.image1x = e.urls[0][1];
            e.url = e.urls[3][1];
        });

        return c;
    }

    async getBTTVChannelEmotes(id) {
        return await get.json(this.url_channel_bttv_emotes + id);;
    }

    async getFFZChannelEmotes(id) {
        let c = await get.json(this.url_channel_ffz_emotes + id);
        if (c.error) return [{ error: `${c.status}, ${c.error}, ${c.message}`, }]

        return Object?.entries(c?.sets)?.[0]?.[1]?.emoticons
    }

    async getTwitchEmotes(id = '', type = 'global') {
        let url = type == 'channel' ? this.url_channel_twitch_emotes : this.url_global_twitch_emotes
        const ops = {
            method: 'GET',
            headers: {
                'Client-ID': process.env.CLIENT_ID,
                'Authorization': 'Bearer ' + process.env.APP_TOKEN,
            },
            responseType: 'json',
            url: url + id,
        }

        let data = await get.json(url + id, void 0, ops);

        return data?.data || { error: `${data.error} ${data.status} ${data.message}` };
    }

    async getTwitchChannelBadges(id) {
        let url = 'https://api.twitch.tv/helix/chat/badges'
        const ops = {
            method: 'GET',
            headers: {
                'Client-ID': process.env.CLIENT_ID,
                'Authorization': 'Bearer ' + process.env.APP_TOKEN,
            },
            responseType: 'json',
            url: url + id,
        }

        let data = await get.json(
            url,
            { broadcaster_id: id },
            ops
        );

        return data?.data || { error: `${data.error} ${data.status} ${data.message}` };
    }
}

module.exports = {
    ApiCalls,
    get
}