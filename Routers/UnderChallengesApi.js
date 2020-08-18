var express = require('express')
var router = express.Router()
bodyParser = require('body-parser');
const { Pool, Client } = require('pg');
let challenges = require('./ChallengesApi');
// support parsing of application/json type post data
router.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/createUnderChallenge", async function (req, res) {
    const{challenges_id,challenger_user_id,challenger_user_winner_id,challengee_user_id,challengee_user_winner_id,terms,prize} = req.body
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query =  `
    insert into under_challenges (challenges_id,challenger_user_id,challenger_user_winner_id,challengee_user_id,challengee_user_winner_id,terms,prize)
    VALUES ($1,$2,$3,$4,$5,$6,$7);        
    `
    let values = [];
    values.push(challenges_id) //   1  
    values.push(challenger_user_id) //     2
    values.push(challenger_user_winner_id) //     3
    values.push(challengee_user_id) //   4  
    values.push(challengee_user_winner_id) //  5   
    values.push(terms) //     6
    values.push(prize) //     7
    const result = await client.query(query, values)
    client.end();
    res.json({"status":"under challenge has been created"})    
})
router.get("/getUnderChallengesByChallengeID/:challenge_id", async function(req,res){
    const challenge_id = req.params.challenge_id
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query =  `
        Select
            under_challenges.challenges_id	as challenges_id          
            --Challenger
            , (Select name from users Where id = under_challenges.challenger_user_id) as challenger_name
            ,(Select image_url from users Where id = under_challenges.challenger_user_id) as challenger_image_url
            --Challengee
            ,(Select name from users Where id = under_challenges.challengee_user_id) as challengee_name
            ,(Select image_url from users Where id = under_challenges.challengee_user_id) as challengee_image_url
            ,under_challenges.prize as prize
        FROM under_challenges
        Where under_challenges.challenges_id=$1
    `
    const values =[challenge_id]
    const result = await client.query(query, values)
    client.end();
    res.json(result.rows)    
})

module.exports = router
