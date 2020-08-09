var express = require('express')
var router = express.Router()
bodyParser = require('body-parser');
const { Pool, Client } = require('pg');

// support parsing of application/json type post data
router.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/addComment", async function (req, res) {
    const{user_id,challenge_id,message} = req.body
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query =  `
        Insert into comments (user_id,challenge_id,message) VALUES ($1,$2,$3);        
    `
    let values = [user_id,challenge_id,message];    
    const result = await client.query(query, values)
    res.json({"status":"comment created"})    
})

module.exports = router
