var express = require('express')
var router = express.Router()
bodyParser = require('body-parser');
const { Pool, Client } = require('pg');

// support parsing of application/json type post data
router.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
router.use(bodyParser.urlencoded({ extended: true }));
// Get all of the users that are not my friends
router.post("/addChallengeInvestor", async function (req, res) {
    const {challenge_id,chosen_winner_user_id,user_id} = req.body;
    //Check if allowed to create
    let allowedToCreate = false;
    let userModifieing =false;
    try{
        //Since I am using a cheap shit I have to have a try right here
        await IsUserAllowedToAddInvestors(user_id,challenge_id).then(res=>{
            allowedToCreate = res
        })
        if(allowedToCreate===true){
            //Check if user is modifieing or creating
            await IsUserModifieing(challenge_id,user_id).then(res=>{
                userModifieing =res
            })
            console.log(userModifieing, " jsjsjjjs ")
            if(userModifieing ===false){
                //Mod
                await UpdateExistingChallengeInvestor(chosen_winner_user_id,challenge_id,user_id)
                res.json({"status":"Modified existing challenge investor",allowed:true})    
            }else{
                //Create
                await AddInvestor(chosen_winner_user_id,challenge_id,user_id)
                res.json({"status":"Added a new challenge investor.",allowed:true})    
            }
        }else{
            return res.json({"status":"user is not alllowed to invest on his own challenge",allowed:false})
        }    
    }catch{
    res.json({status:"To many connections",allowed:false})
    }
})
async function IsUserAllowedToAddInvestors(user_id,challenge_id){
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect();
    const query = "Select count(id) from challenges Where (challengee_user_id= $1 or challenger_user_id= $1) and id = $2";
    let values = [user_id,challenge_id]; 
    const result = await client.query(query, values)
    client.end();
    if(result.rows[0].count === "0"){
        return true;
    }else{
        return false;
    }
}
async function IsUserModifieing(challenge_id,user_id){
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect();
    const query = `
        Select count(id) from challenge_investors Where challenge_id = $2 and user_id = $1
    `
    let values = [user_id,challenge_id]; 
    const result = await client.query(query, values)
    client.end();
    console.log(result.rows[0].count)
    if(result.rows[0].count === "0"){
        console.log("heere")
        return true;
    }else{
        return false;
    }
}
async function UpdateExistingChallengeInvestor(chosen_winner_user_id,challenge_id,user_id){
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect();
    const query = `
        Update challenge_investors set chosen_winner_user_id = $3 Where challenge_id= $2 AND user_id=$1
    `
    let values = [user_id,challenge_id,chosen_winner_user_id]; 
    const result = await client.query(query, values)
    client.end();
    return
}
async function AddInvestor(chosen_winner_user_id,challenge_id,user_id){
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect();
    const query = `
     Insert into challenge_investors (challenge_id,chosen_winner_user_id,user_id) Values ($2,$3,$1)
    `
    let values = [user_id,challenge_id,chosen_winner_user_id]; 
    const result = await client.query(query, values)
    client.end();
    return   
} 
router.delete("/DeleteExcistingRow", async function (req, res) {
    const {challenge_id,user_id} =req.body
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect();
    const query = `
    Delete from challenge_investors Where challenge_id = $2 AND user_id = $1
    `
    let values = [user_id,challenge_id]; 
    const result = await client.query(query, values)
    client.end();
    res.json({"status":"Challenge investment has been reomved"})     
})


module.exports = router
