var express = require('express')
var router = express.Router()
bodyParser = require('body-parser');
const { Pool, Client } = require('pg');
let challenges = require('./ChallengesApi');
// support parsing of application/json type post data
router.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/getAllNotifications/:user_id", async function(req,res){
    const user_id = req.params.user_id
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query =  `
        Select 
            challenges.image_url
            ,notifications.message
            ,notifications.type
            ,users.name
            ,users.image_url
            ,challenges.id
            ,challenges.challenger_user_id
            ,notifications.receive_user_id
            ,notifications.action_commited
        from notifications
        INNER JOIN users 
            on users.id = notifications.send_user_id
        INNER JOIN challenges 
            ON challenges.id = notifications.challenge_id
        Where notifications.receive_user_id = $1
    `
    const values =[user_id]
    const result = await client.query(query, values)
    res.json(result.rows)    
})

module.exports = router
