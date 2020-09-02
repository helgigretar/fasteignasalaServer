var express = require('express')
var router = express.Router()
bodyParser = require('body-parser');
const { Pool, Client } = require('pg');

// support parsing of application/json type post data
router.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
router.use(bodyParser.urlencoded({ extended: true }));
// Get all of the users that are not my friends
router.get("/getAllofAnteUsersNotMyFriends/:user_id", async function (req, res) {
    const user_id = req.params.user_id
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query = `
    Select distinct
        users.id
        ,users.name
        ,users.image_url
        ,users_score.points
        ,(Select count(id) from friends Where user_id = users.id) as friends
        ,(Select count(id) from challenges Where challenges.challenger_user_id = users.id or challenges.challengee_user_id = users.id) as challenges
        ,(Select count(id) from challenges Where challenges.winner_user_id = users.id) as won	
        ,(Select COUNT(id) from challenges Where (challengee_user_id= users.id or challenger_user_id=users.id) AND winner_user_id != users.id) as lost
        ,(Select count(id) from user_did_not_pay Where user_id = users.id) as user_did_not_pay
    from users
        LEFT OUTER Join friends
            ON friends.friend_id = users.id
        INNER JOIN users_score
            on users.id = users_score.user_id and users_score.league_id =1
        Where  users.id != 2  and (friends.friend_id NOT IN (
            Select friends.friend_id 
            from users Inner join friends 
            on friends.friend_id = users.id 
            Where user_id = $1) 
        or friends.friend_id is null )
        order by users_score.points desc`
    let values = [];
    values.push(user_id) //1
    const result = await client.query(query, values)
    client.end();
    res.json(result.rows)
})
//Get all of my friends
router.get("/getAllOfMyFriendsByUserId/:user_id", async function (req, res) {
    const user_id = req.params.user_id
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query = `
    Select 
        name
        ,image_url 
        ,friends.friend_id 
        ,friends.id 
    from friends
    Inner JOIN users 
        on users.Id = friends.friend_id
    Where friends.user_id= $1
    `
    let values = [user_id];
    const result = await client.query(query, values)
    client.end();
    res.json(result.rows)
})
//Remove friend relations
router.delete("/removeFriendByFriendsRelationId/:friends_relation_id", async function (req, res) {
    const id = req.params.friends_relation_id
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query = `
        Delete from friends Where id = $1
    `
    let values = [id];
    const result = await client.query(query, values)
    client.end();
    res.json({ "status": "Deleted" })
})
//add friend relation
router.post("/addFriend", async function (req, res) {
    const { user_id, friend_id } = req.body;
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query = `
        Insert into friends (user_id,friend_id) Values($1,$2)
    `
    let values = [user_id, friend_id];
    const result = await client.query(query, values)
    client.end();
    res.json({ "status": "Added a new friend" })
})
module.exports = router
