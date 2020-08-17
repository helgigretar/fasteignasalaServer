var express = require('express')
var router = express.Router()
bodyParser = require('body-parser');
const { Pool, Client } = require('pg');
const e = require('express');

// support parsing of application/json type post data
router.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/createChallenge", async function (req, res) {
    let challenge_id =0;
    await CreateChallenge(req.body)
    await GetChallengeLastId().then(res=>{
        challenge_id=res
    })
    console.log(challenge_id)
    const msg = "You got a new challenge ! " + req.body.name + " Do you want to accept ? ";
    await CreateNewNotficationsRow(challenge_id, msg, req.body.challengee_user_id, req.body.challenger_user_id, "CREATE")
    res.json({ "status": "created" })
})
//Create new row for the notifications table
async function CreateNewNotficationsRow(challenge_id,message,receive_user_id, send_user_id,type){
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query = `
        INSERT INTO notifications (seen,message,challenge_id,send_user_id,receive_user_id,type) 
        VALUES (false,$1,$2,$3,$4,$5)
    `
    let values = [];
    values.push(message);//1
    values.push(challenge_id);//2
    values.push(send_user_id);//3
    values.push(receive_user_id);//4
    values.push(type);//5
    const result = await client.query(query, values)
    return
}
//Get the latest challenge id
async function GetChallengeLastId(){
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query = `
        Select id from challenges order by id desc Limit 1
    `
    const result = await client.query(query)
    return result.rows[0].id
}
//Creta a new challenge
async function CreateChallenge(body){
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query = `
        Insert into challenges(name,image_url,challenger_user_id,challengee_user_id,status,sub_challenge,created_date,terms,starting_date,prize,end_date)
        Values ($1,$2,$3,$4,$5,$6,NOW(),$7,$8,$9,$10)
    `
    let values = [];
    values.push(body.name);//1
    values.push(body.image_url);//2
    values.push(body.challenger_user_id);//3
    values.push(body.challengee_user_id);//4    
    values.push("Pending");//5
    values.push(body.sub_challenge);//6
    values.push(body.terms);//7
    values.push(body.starting_date);//8
    values.push(body.prize);//9
    values.push(body.end_date);//10
    const result = await client.query(query, values)
    return result
}
router.get("/getChallengesByUserId/:user_id", async function (req, res) {
    const user_id = req.params.user_id
    //For me profile
    const query = `
        Select 
            challenges.id 
            ,challenges.name 
            ,challenges.image_url 
            ,challenges.challenger_user_id 
            ,(Select name from users Where id = challenges.challenger_user_id) as challenger_name
            ,(Select image_url from users Where id = challenges.challenger_user_id) as challenger_user_image_url
            ,(Select Count(id) 
                    from challenge_investors 				  
                    Where challenge_investors.challenge_id = challenges.id AND 
                    challenge_investors.chosen_winner_user_id = challenges.challenger_user_id) as challenge_investors_for_challenger
            ,(Select Count(id) 
                    from challenge_investors 
                    Where challenge_investors.challenge_id = challenges.id AND
                    challenge_investors.chosen_winner_user_id = challenges.challenger_user_id AND
                    challenge_investors.user_id = $1) as challenger_investor_color
            ,challenges.challengee_user_id
            ,(Select name from users Where id = challenges.challengee_user_id) as challengee_name
            ,(Select image_url from users Where id = challenges.challengee_user_id) as challengee_user_image_url
            ,(Select Count(id) 
                from challenge_investors 
                Where challenge_investors.challenge_id = challenges.id AND 
                challenge_investors.chosen_winner_user_id = challenges.challengee_user_id) as challenge_investors_for_challengee
            ,(Select Count(id) 
                    from challenge_investors 
                    Where challenge_investors.challenge_id = challenges.id AND 
                    challenge_investors.chosen_winner_user_id = challenges.challengee_user_id AND 
                    challenge_investors.user_id = $1) as challengee_investor_color
            ,challenges.status 
            ,to_char(challenges.starting_date, 'dd.mm.yyyy') as starting_date
            ,to_char(challenges.created_date, 'dd.mm.yyyy') as created_date
            ,to_char(challenges.finished_date, 'dd.mm.yyyy') as finished_date
            ,challenges.terms
            ,challenges.prize
            ,(Select (array_agg(image_url)) from story_challenges Where challenge_id = challenges.id) as story_images
            ,(Select (array_agg(header)) from story_challenges Where challenge_id = challenges.id)  as story_headers                             
        from challenges
        Where challenges.challenger_user_id = $1 or challenges.challengee_user_id = $1
        order by last_modified_date desc
    `
    const values = [user_id]
    let data = []
    await GetingChallengeInfoFromQuery(query, values).then(res => {
        data = res
    })
    res.json(data)
})
router.get("/getChallengeByChallengeId/:challenge_id/:user_id", async function (req, res) {
    const challenge_id = req.params.challenge_id
    const user_id = req.params.user_id
    const query = `
    Select 
        challenges.id 
        ,challenges.name 
        ,challenges.image_url 
        ,challenges.challenger_user_id 
        ,(Select name from users Where id = challenges.challenger_user_id) as challenger_name
        ,(Select image_url from users Where id = challenges.challenger_user_id) as challenger_user_image_url
        ,(Select Count(id) 
                from challenge_investors 				  
                Where challenge_investors.challenge_id = challenges.id AND 
                challenge_investors.chosen_winner_user_id = challenges.challenger_user_id) as challenge_investors_for_challenger
        ,(Select Count(id) 
                from challenge_investors 
                Where challenge_investors.challenge_id = challenges.id AND
                challenge_investors.chosen_winner_user_id = challenges.challenger_user_id AND
                challenge_investors.user_id = $1) as challenger_investor_color
        ,challenges.challengee_user_id
        ,(Select name from users Where id = challenges.challengee_user_id) as challengee_name
        ,(Select image_url from users Where id = challenges.challengee_user_id) as challengee_user_image_url
        ,(Select Count(id) 
            from challenge_investors 
            Where challenge_investors.challenge_id = challenges.id AND 
            challenge_investors.chosen_winner_user_id = challenges.challengee_user_id) as challenge_investors_for_challengee
        ,(Select Count(id) 
                from challenge_investors 
                Where challenge_investors.challenge_id = challenges.id AND 
                challenge_investors.chosen_winner_user_id = challenges.challengee_user_id AND 
                challenge_investors.user_id = $1) as challengee_investor_color
        ,challenges.status 
        ,to_char(challenges.starting_date, 'dd.mm.yyyy') as starting_date
        ,to_char(challenges.created_date, 'dd.mm.yyyy') as created_date
        ,to_char(challenges.finished_date, 'dd.mm.yyyy') as finished_date
        ,challenges.terms
        ,challenges.prize
        ,(Select (array_agg(image_url)) from story_challenges Where challenge_id = challenges.id) as story_images
        ,(Select (array_agg(header)) from story_challenges Where challenge_id = challenges.id)  as story_headers                             
    from challenges
    Where challenges.id = $2
`
    const values = [user_id, challenge_id]
    let data = []
    await GetingChallengeInfoFromQuery(query, values).then(res => {
        data = res
    })
    res.json(data)
})

router.get("/getAllChallenges/:user_id", async function (req, res) {    
    const user_id = req.params.user_id
    const query = `
    Select 
        challenges.id 
        ,challenges.name 
        ,challenges.image_url 
        ,challenges.challenger_user_id 
        ,(Select name from users Where id = challenges.challenger_user_id) as challenger_name
        ,(Select image_url from users Where id = challenges.challenger_user_id) as challenger_user_image_url
        ,(Select Count(id) 
                from challenge_investors 				  
                Where challenge_investors.challenge_id = challenges.id AND 
                challenge_investors.chosen_winner_user_id = challenges.challenger_user_id) as challenge_investors_for_challenger
        ,(Select Count(id) 
                from challenge_investors 
                Where challenge_investors.challenge_id = challenges.id AND
                challenge_investors.chosen_winner_user_id = challenges.challenger_user_id AND
                challenge_investors.user_id = $1) as challenger_investor_color
        ,challenges.challengee_user_id
        ,(Select name from users Where id = challenges.challengee_user_id) as challengee_name
        ,(Select image_url from users Where id = challenges.challengee_user_id) as challengee_user_image_url
        ,(Select Count(id) 
            from challenge_investors 
            Where challenge_investors.challenge_id = challenges.id AND 
            challenge_investors.chosen_winner_user_id = challenges.challengee_user_id) as challenge_investors_for_challengee
        ,(Select Count(id) 
                from challenge_investors 
                Where challenge_investors.challenge_id = challenges.id AND 
                challenge_investors.chosen_winner_user_id = challenges.challengee_user_id AND 
                challenge_investors.user_id = $1) as challengee_investor_color
        ,challenges.status 
        ,to_char(challenges.starting_date, 'dd.mm.yyyy') as starting_date
        ,to_char(challenges.created_date, 'dd.mm.yyyy') as created_date
        ,to_char(challenges.finished_date, 'dd.mm.yyyy') as finished_date
        ,challenges.terms
        ,challenges.prize
        ,(Select (array_agg(image_url)) from story_challenges Where challenge_id = challenges.id) as story_images
        ,(Select (array_agg(header)) from story_challenges Where challenge_id = challenges.id)  as story_headers                             
    from challenges
`
    const values = [user_id]
    let data = []
    await GetingChallengeInfoFromQuery(query, values).then(res => {
        data = res
    })
    res.json(data)
})
async function GetingChallengeInfoFromQuery(query, values) {
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const result = await client.query(query, values)
    const data = []
    const current = new Date();
    result.rows.forEach(row => {
        let starting_date = row.starting_date
        if (starting_date != "" && current > Date.parse(starting_date)) {
            starting_date = HowLongAgo(starting_date);
        }
        let created_date = row.created_date;
        if (created_date != "" && current > Date.parse(created_date)) {
            created_date = HowLongAgo(created_date);
        }
        let finished_date = row.finished_date;
        if (finished_date != "" && current > Date.parse(finished_date)) {
            finished_date = HowLongAgo(finished_date);
        }
        const storyChallenges = []
        storyChallenges.push({ "image_url":row.image_url, "header": ""})
        if (row.story_images !== null) {
            for (let i = 0; i < row.story_images.length; i++) {
                storyChallenges.push({ "image_url": row.story_images[i], "header": row.story_headers[i] })
            }
        }
        data.push({
            "challenge_id": row.id, "challenge_image_url": row.image_url,
            "challenge_name": row.name, "challenge_status": row.status,
            "challenge_status_color": GetRightStatusColor(row.status),
            "challenge_starting_date": starting_date, "storyChallenges": storyChallenges,
            "challenger_user_id": row.challenger_user_id, "challenger_user_name": row.challenger_name,
            "challenger_user_image_url": row.challenger_user_image_url,
            "challenge_investors_for_challenger": row.challenge_investors_for_challenger,
            "challenger_investor_color": HasUserInvestedInChallenge(row.challenger_investor_color),
            "challengee_user_id": row.challengee_user_id, "challengee_user_name": row.challengee_name,
            "challengee_user_image_url": row.challengee_user_image_url,
            "challenge_investors_for_challengee": row.challenge_investors_for_challengee,
            "challengee_investor_color": HasUserInvestedInChallenge(row.challengee_investor_color),
            "created_date": created_date, "finished_date": finished_date,
            "terms": row.terms, "prize": row.prize
        })
    })
    return data;
}
function GetRightStatusColor(txt) {
    switch (txt) {
        case "Pending":
            return "orange";
        case "On going":
            return "blue";
        default:
            return "green";
    }
}
function HasUserInvestedInChallenge(numb) {
    console.log(typeof (numb), " ", numb)
    if (numb === "1") {
        return "green";
    } else {
        return "black"
    }
}
function HowLongAgo(setDate) {
    const SECOND = 1;
    const MINUTE = 60 * SECOND;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;
    const MONTH = 30 * DAY;

    const date1 = new Date(setDate);
    const date2 = new Date(new Date());
    const diffTime = Math.abs(date2 - date1);
    var delta = (diffTime / 1000).toFixed(1); //seconds
    if (delta < 1 * MINUTE) {
        return delta == 1 ? "one second ago" : delta + " seconds ago";
    }

    if (delta < 2 * MINUTE) {
        return "a minute ago"
    }

    if (delta < 45 * MINUTE) {
        var minutes = Math.round(parseInt((delta / (60))))
        return minutes + " minutes ago"
    }
    //return ts.Minutes + " minutes ago";

    if (delta < 90 * MINUTE) {
        return "an hour ago";
    }

    if (delta < 24 * HOUR) {
        var hours = Math.round(parseInt((delta / (60 * 60))))
        return hours + " hours ago"
    }
    //return ts.Hours + " hours ago";

    if (delta < 48 * HOUR) {

        return "yesterday"
    }

    if (delta < 30 * DAY) {
        var days = Math.round(parseInt((delta / (60 * 60 * 24))))
        return days + " days ago";
    }
    if (delta < 12 * MONTH) {
        var months = Math.round(parseInt((delta / (60 * 60 * 24 * 30))))
        return months <= 1 ? "one month ago" : months + " months ago";
        //  let months = Convert.ToInt32(Math.Floor((double)ts.Days / 30));
    }
    else {
        var years = Math.round(parseInt((delta / (60 * 60 * 24 * 30 * 365))))
        return years <= 1 ? "one year ago" : years + " years ago";
    }
}
router.put("/AcceptChallenge", async function (req,res){
    const { id,challenger_user_id,challengee_user_id} = req.body
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query = `update challenges set accepted_date = NOW(), last_modified_date = NOW() WHERE id = $1`
    const values=[id]
    const result = await client.query(query, values)
    //Challenger fær svar til baka um að hans challenge hafi verið samþykkt
    let {challenge_name,user_name} = ""
    await GetChallengeeName(id).then(res=>{
        challenge_name= res.rows[0].challenge_name
        user_name = res.rows[0].user_name
    })
    let msg = "Your challenge " + challenge_name + " has been accepted by " + user_name;   
    await CreateNewNotficationsRow(id,msg,challenger_user_id,challengee_user_id,"ACCEPT")
    await ConfirmingNotificationAction(id,"CREATE")
    res.json({ "status": "created" })
})
async function ConfirmingNotificationAction(challenge_id,status){
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query =`
    Update notifications set action_commited = true, action_commited_date=NOW() Where challenge_id = $1 AND type = $2
    `
    const values=[challenge_id,status]
    const result = await client.query(query, values)
    return result
}
async function GetChallengeeName(challenge_id){
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query =`
    Select 
        challenges.name as challenge_name,            
        users.name as user_name   
    from challenges
    INNER JOIN users
        on challenges.challengee_user_id = users.id
    Where challenges.id = $1`
    const values=[challenge_id]
    const result = await client.query(query, values)
    return result
}
async function GetChallengerName(challenge_id){
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query =`
    Select 
        challenges.name as challenge_name,            
        users.name as user_name   
    from challenges
    INNER JOIN users
        on challenges.challenger_user_id = users.id
    Where challenges.id = $1`
    const values=[challenge_id]
    const result = await client.query(query, values)
    return result
}
router.put("/finishChallenge", async function(req,res){
    const {id,winner_user_id,challenger_user_id,challengee_user_id}=req.body
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query =`
        update challenges set finished_date = NOW(),status='Finished', last_modified_date = NOW(),winner_user_id = $2 WHERE id = $1
    `
    const values=[id,winner_user_id]
    const result = await client.query(query, values)
    let {challenge_name,user_name} = ""
    await GetChallengerName(id).then(res=>{
        challenge_name= res.rows[0].challenge_name
        user_name = res.rows[0].user_name
    })
    let message = "Your challenge on " + challenge_name + " has finished and the winner is " + user_name
    await CreateNewNotficationsRow(id,message,challengee_user_id,challenger_user_id,"FINISH");
    await ConfirmingNotificationAction(id,"START")
    return res.json({"status":"finished challenge"})
})
router.put("/StartChallengebyChallengeId", async function(req,res){
    const {id,challengee_user_id,challenger_user_id} =req.body
    const cred = global.credentials
    const client = new Client({ user: cred.user, host: cred.host, database: cred.database, password: cred.password, port: 5432 });
    await client.connect()
    const query = `
        update challenges set status = 'On going', last_modified_date = NOW() WHERE id = $1
    `
    const values=[id]
    const result = await client.query(query, values)
    let {challenge_name,user_name} = ""
    await GetChallengeeName(id).then(res=>{
        challenge_name= res.rows[0].challenge_name
        user_name = res.rows[0].user_name
    })
    let message = "Your challenge on " + challenge_name + " has been started by " + user_name
    await CreateNewNotficationsRow(id,message,challengee_user_id,challenger_user_id,"START");
    await ConfirmingNotificationAction(id,"ACCEPT")
    return res.json({"status":"challenge has been started"})
})

module.exports = router
module.exports.HowLongAgo = HowLongAgo
