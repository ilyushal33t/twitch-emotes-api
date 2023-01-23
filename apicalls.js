require('dotenv').config()
const request = require('request')
const fs = require('fs');
const fetch = require('node-fetch');

class ApiCalls {
    constructor() {
        this.GET_TOKEN = 'https://id.twitch.tv/oauth2/token';
        this.GET_CHANNEL = 'https://api.twitch.tv/helix/streams';
        this.VALIDATE = 'https://id.twitch.tv/oauth2/validate';
        this.ch_info = 'https://api.twitch.tv/helix/channels?broadcaster_id=';
        this.ch_search = 'https://api.twitch.tv/helix/search/channels?query=';
        this.url_channel_twitch_emotes = 'https://api.twitch.tv/helix/chat/emotes?broadcaster_id=';
        this.url_channel_bttv_emotes = 'https://api.betterttv.net/3/cached/users/twitch/'
        this.url_channel_ffz_emotes = 'https://api.frankerfacez.com/v1/room/id/';
        this.url_global_twitch_emotes = 'https://api.twitch.tv/helix/chat/emotes/global';
        this.url_global_emotes_7tv = 'https://api.7tv.app/v2/emotes/global';
        this.url_global_emotes_bttv = 'https://api.betterttv.net/3/cached/emotes/global';
        this.url_global_emotes_ffz = 'https://api.frankerfacez.com/v1/set/global'//'https://api.betterttv.net/3/cached/frankerfacez/emotes/global';
        //this.follows_check='https://api.twitch.tv/helix/users/follows?from_id=22877031';
    }

    async getFFZGlobal() {
        let r = await fetch(this.url_global_emotes_ffz).catch(e => console.log(e));
        let c = await r.json();
        let tmp = null;

        return (tmp = Object.entries(c.sets).map(e => e[1].emoticons), tmp[0].concat(tmp[1]));
    }

    async get7TVGlobal() {
        let r = await fetch(this.url_global_emotes_7tv).catch(e => console.log(e));
        let c = await r.json();

        return c
    }

    async getBTTVGlobal() {
        let r = await fetch(this.url_global_emotes_bttv).catch(e => console.log(e));
        let c = await r.json();

        return c;
    }

    async getChannels(query, count = 20) {
        const ops = {
            method: 'GET',
            headers: {
                'Client-ID': process.env.CLIENT_ID,
                'Authorization': 'Bearer ' + process.env.APP_TOKEN,
            }
        },
            url = this.ch_search + query + '&first=' + count;

        let res = await fetch(url, ops).catch(e => console.log(e)),
            data = await res.json();

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
            url = this.ch_info + id;

        let res = await fetch(url, ops).catch(e => console.log(e)),
            data = await res.json();

        return data.data;
    }

    async get7TVChannelEmotes(id) {
        const url = `https://api.7tv.app/v2/users/${id}/emotes`;
        let r = await fetch(url).catch(e => console.log(e));
        let c = await r.json();

        if (c.error) return [c];

        c.forEach(e => {
            e.image1x = e.urls[0][1];
            e.url = e.urls[3][1];
        });

        return c;
    }

    async getBTTVChannelEmotes(id) {
        let r = await fetch(this.url_channel_bttv_emotes + id).catch(e => console.log(e));
        let c = await r.json();

        return c;
    }

    async getFFZChannelEmotes(id) {
        let r = await fetch(this.url_channel_ffz_emotes + id).catch(e => console.log(e));
        let c = await r.json();

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

        let res = await fetch(url + id, ops).catch(e => console.log(e)),
            data = (await res.json());

        return data?.data || { error: `${data.error} ${data.status} ${data.message}` };
    }

    async getTwitchChannelBadges(id) {
        let url = 'https://api.twitch.tv/helix/chat/badges?broadcaster_id='
        const ops = {
            method: 'GET',
            headers: {
                'Client-ID': process.env.CLIENT_ID,
                'Authorization': 'Bearer ' + process.env.APP_TOKEN,
            },
            responseType: 'json',
            url: url + id,
        }

        let res = await fetch(url + id, ops).catch(e => console.log(e)),
            data = (await res.json());

        return data?.data || { error: `${data.error} ${data.status} ${data.message}` };
    }
}

module.exports = {
    ApiCalls,
}