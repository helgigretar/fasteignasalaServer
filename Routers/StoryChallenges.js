var express = require('express')
var router = express.Router()
bodyParser = require('body-parser');
const { Pool, Client } = require('pg');
const { head } = require('./UsersApi');

// support parsing of application/json type post data
router.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/AddStoryToChallenge", async function (req, res) {
    const {challenge_id,image_url,header} = req.body;
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query =  `
    INSERT INTO story_challenges (challenge_id,image_url,header) VALUES ($1,$2,$3)
    `
    let values = [challenge_id,image_url,header];    
    const result = await client.query(query, values)
    client.end();
    res.json({"status":"Story added to challenge"})    
})

module.exports = router
