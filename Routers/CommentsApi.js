var express = require('express')
var router = express.Router()
bodyParser = require('body-parser');
const { Pool, Client } = require('pg');
let challenges = require('./ChallengesApi');
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
router.get("/getcommentsForChallengeByChallengeId/:challenge_id", async function(req,res){
    const challenge_id = req.params.challenge_id
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query =  `
        Select
            users.name
            ,users.image_url
            ,comments.message
            ,comments.created_date
        from comments
            INNER JOIN users 
                on users.id = comments.user_id
            INNER JOIN challenges
                on challenges.id = comments.challenge_id
        Where challenges.id = $1
        order by comments.created_date asc         
    `
    let values = [challenge_id];    
    const result = await client.query(query, values)
    const data = []
    result.rows.forEach(row=>{
        data.push({
            "name":row.name, "image_url":row.image_url, "message":row.message, "created_date":row.created_date, "ago":challenges.HowLongAgo(row.created_date)
        })
    })
    return res.json(data)

})
module.exports = router
