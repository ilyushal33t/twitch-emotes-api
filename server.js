const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { ApiCalls } = require(__dirname + "/apicalls.js");
const funcs = require(__dirname + "/funcs.js");
const fetch = require("node-fetch");
const cors = require("cors");
const PORT = 8081;

const $_ = new ApiCalls();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.get("/user", async function (req, res) {
    const data = await funcs.getUser(req.query.name);
    res.json(data);
    res.end()
});

app.get("/useremotes", async function (req, res) {
    const data = await funcs.getUserEmotes(req.query.id);
    res.json(data);
    res.end()
});

app.get("/globalemotes", async function (req, res) {
    let data = await funcs.getGlobalEmotes();
    res.json(data);
    res.end()
});

app.get('/badges', async function (req, res) {
    //TODO:
    let channel = await $_.getTwitchChannelBadges(req.query.id);
    let badges = {
        channel: channel
    }
    res.json(badges);
    res.end()
});

//TODO: 
// app.get('/raw/:emotes')
var i = 0;

app.post('/up', function (req, res) {
    let url = funcs.fullUrl(req);
    console.log('ping ' + i++);
    setTimeout(function () {
        fetch(url + '/up', { method: 'POST' }).catch(e => console.log(e));
        res.end();
    }, 60 * 60 * 1e3 * .1);
});

app.get('/full_user', async function (req, res) {
    let url = funcs.fullUrl(req);
    let user = await (await fetch(url + '/user?name=' + req.query.name)).json();
    let emotes = await (await fetch(url + '/useremotes?id=' + user.id)).json();
    let badges = await (await fetch(url + '/badges?id=' + user.id)).json();
    let data = {
        user: user,
        emotes: emotes,
        badges: badges,
    }
    res.json(data);
    res.end();
});

app.listen(PORT, function () {
    console.log(`Server started on port ${PORT}`);
});
