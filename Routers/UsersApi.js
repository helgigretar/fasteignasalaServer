var express = require('express')
var router = express.Router()
bodyParser = require('body-parser');
const { Pool, Client } = require('pg');

// support parsing of application/json type post data
router.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
router.use(bodyParser.urlencoded({ extended: true }));
// define the home page route

// Register user in database
async function registerUser(req) {
    const { user_name, password, email, country, age, description, gender } = req.body
    //add to users
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query = "INSERT INTO users (name,user_name,password,email,country,age,image_url,description,gender)VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)"
    let values = [];
    values.push(user_name) //Name = 1
    values.push(user_name) // user_name = 2
    values.push(password) // Pasword =3
    values.push(email) //email =4
    values.push(country) //country =5
    values.push(age) //age =6
    values.push('https://res.cloudinary.com/dnmnx78xg/image/upload/v1594168996/unnamed.png') // image = 7
    values.push(description) // description = 8
    values.push(gender) // gender = 9
    const result = await client.query(query, values)
    client.end();
}
//Login returns status strue if user may login
router.post('/userLogin', async function (req, res) {
    const { user_name, password } = req.body;
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query = "Select id,name,user_name,password,email,country,age,image_url,description,gender from users Where user_name = $1 and password = $2";
    let values = [];
    values.push(user_name) //Name = 1
    values.push(password) // password =2
    const result = await client.query(query, values)
    client.end();
    let authStatus = false;
    const data = result.rows
    if (data.length === 1) {
        data.authStatus = false;
        const user = {
            "id":data[0].id,"name":data[0].name,"user_name":data[0].password, "email":data[0].email,"country":data[0].country,"age":data[0].age,
            "image_url":data[0].image_url,"description":data[0].description,"gender":data[0].gender
        }
        return res.json({ "user": user, "status": true })
    } else {
        return res.json({ "status": false })
    }
})

// Create users
router.post('/CreateUser', async function (req, res) {

    await registerUser(req)
    let id = 0

    await getLastsUserId().then(res => {
        id = res
        console.log(res, " sssss")
    });

    const cred = global.credentials
    const client = new Client({
        user: cred.user,
        host: cred.host,
        database: cred.database,
        password: cred.password,
        port: 5432,
    });
    await client.connect()
    const query = "INSERT INTO users_score (user_id,league_id,points)VALUES ($1,1,0)"
    const values = [id]
    result = await client.query(query, values)
    client.end();
    //I need to check if username is unique.
    return res.json({ "status": true });
})
//get the last user id
async function getLastsUserId() {
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query = "SELECT id FROM users ORDER BY id DESC LIMIT 1;"
    const result = await client.query(query)
    client.end();
    return result.rows[0].id
}
router.get("/getUserByUserId/:user_id", async function (req, res) {
    const  user_id  = req.params.user_id
    const user = {}
    await GetUserByUserId(user_id).then(res=>{
        user.id = res[0].id;
        user.name = res[0].name;
        user.image_url = res[0].image_url;
        user.description = res[0].description
        user.friends = res[0].friends;
        user.points = res[0].points;
        user.challenges= res[0].challenges;
        user.won = res[0].won;
        user.did_not_pay = res[0].user_did_not_pay
    })
    await GetUsersRankingByUserID(user_id).then(res=>{
        user.ranking= res;
    })    
    res.json({ "user": user })
})
//Get user information by its user_id
async function GetUserByUserId(user_id){
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query = `
    Select 
        users.id 
        ,users.name 
        ,users.image_url 
        ,users.description 
        ,(Select count(id) from friends Where user_id = $1) as friends
        ,(Select points from users_score Where user_id = $1 and league_id =1) as points
        ,(Select count(id) from challenges Where challenges.challenger_user_id = $1 or challenges.challengee_user_id = $1) as challenges
        ,(Select count(id) from challenges Where challenges.winner_user_id = $1) as won				
        ,(Select count(id) from user_did_not_pay Where user_id = $1) as user_did_not_pay
    from users
    Where users.id = $1`;
    const values = [user_id];
    const result = await client.query(query, values)
    client.end();
   return result.rows;
}
//get users Rangking by user id for league one
async function GetUsersRankingByUserID(user_id){
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query = "Select user_id,points from users_score order by points desc";    
    const result = await client.query(query)
    client.end();
    client.end();
    let count = 1;
    let finalCount = 0;
    result.rows.forEach(row=>{
        console.log(row.user_id, user_id)
        if(row.user_id.toString() === user_id.toString()){
            finalCount =  count;            
        }
        count +=1;
    })
   return finalCount
}
//Edit user. me information
router.put("/changeUsersDescriptionAndName/:user_id", async function (req, res) {
    const user_id  = req.params.user_id
    const { description, name,email,gender,country } = req.body;
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query = "update users set description = $1, name = $2,email=$3,gender=$4,country=$5 Where users.id = $6";
    let values = [];
    values.push(description) //1
    values.push(name) // 2
    values.push(email) // 3
    values.push(gender) // 4
    values.push(country) // 5
    values.push(user_id) // 6
    const result = await client.query(query, values)
    client.end();
    res.json({ "status": true })
})
//edit user. me image
router.put("/changeUsesImageByUserId/:user_id", async function (req, res) {
    const user_id  = req.params.user_id
    const { image_url } = req.body;
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query = "update users set image_url = $1 Where users.id = $2";
    let values = [];
    values.push(image_url) //1
    values.push(user_id) // 2
    const result = await client.query(query, values)
    client.end();
    res.json({ "status": true })
})
router.get("/test",async function(req,res){
    res.json({"status":"test"})
})

module.exports = router
