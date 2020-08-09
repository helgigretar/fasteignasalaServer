var express = require('express')
var router = express.Router()
bodyParser = require('body-parser');
const { Pool, Client } = require('pg');

// support parsing of application/json type post data
router.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/getAllUsersRankingbyLeagueId/:league_id", async function (req, res) {
    const id  = req.params.league_id
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query =  `
        Select 
            users.image_url 
            ,users.name
            ,points
            ,users.id 
            ,(Select COUNT(id) from challenges Where challenges.winner_user_id = users.id) as won
            ,(Select COUNT(id) from challenges Where (challengee_user_id= users.id or challenger_user_id=users.id) AND winner_user_id != users.id) as lost
        from users_score
        INNER JOIN users	
            on users.id = users_score.user_id
        Where users_score.league_id =$1
        Order by points desc;
    `
    let values = [id];    
    const result = await client.query(query, values)
    res.json(result.rows)    
})

module.exports = router
