const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { ApiCalls, get } = require(__dirname + "/apicalls.js");
const funcs = require(__dirname + "/funcs.js");
const { readStats, dumpStats, getRoute } = require(__dirname + "/funcs.js");
const fetch = require("node-fetch");
const cors = require("cors");
const PORT = 8081;

const $_ = new ApiCalls();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use((req, res, next) => {
    res.on('finish', () => {
        const stats = readStats();
        console.log(stats);
        console.log(`${req.method} ${getRoute(req)} ${res.statusCode}`)
        const event = `${req.method} ${getRoute(req)} ${res.statusCode}`
        stats[event] = stats[event] ? stats[event] + 1 : 1
        dumpStats(stats)
    })
    next()
})

app.get('/stats/', (req, res) => {
    res.json(readStats())
})


app.get("/user", async function (req, res) {
    try {
        const data = await funcs.getUser(req.query.name);
        res.json(data);
    } catch (e) { console.error(e); }
    res.end()
});

app.get("/useremotes", async function (req, res) {
    const data = await funcs.getUserEmotes(req.query.id);
    res.json(data);
    res.end()
});

app.get("/globalemotes", async function (req, res) {
    try {
        let data = await funcs.getGlobalEmotes();
        res.json(data);
    } catch (e) { console.error(e); }
    res.end()
});

app.get('/badges', async function (req, res) {
    try {
        let channel = await $_.getTwitchChannelBadges(req.query.id);
        let badges = {
            channel: channel
        }
        res.json(badges);
    } catch (e) { console.error(e); }
    res.end()
});

//TODO: 
// app.get('/raw/:emotes')
var i = 0;

app.post('/up', function (req, res) {
    try {
        let url = funcs.fullUrl(req);
        console.log('ping ' + i++);
        setTimeout(function () {
            fetch(url + '/up', { method: 'POST' }).catch(e => console.log(e));
            res.end();
        }, 60 * 60 * 1e3 * .1);
    } catch (e) { console.error(e); }
});

app.get('/full_user', async function (req, res) {
    try {
        // let url = funcs.fullUrl(req);
        let user = await funcs.getUser(req.query.name);
        let emotes = await funcs.getUserEmotes(user.id);
        let badges = await $_.getTwitchChannelBadges(user.id);
        let data = {
            user: user,
            emotes: emotes,
            badges: badges,
        }
        res.json(data);
    } catch (e) { console.error(e) }
    res.end();
});

app.listen(PORT, function () {
    console.log(`Server started on port ${PORT}`);
});
