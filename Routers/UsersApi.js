const express = require('express');
const router = express.Router();
const { Pool, Client } = require('pg')


async function CreateUsers(req, res) {
    const data = getCredentials(req.hostname);
    const client = new Client({
        user: data.user,
        host: data.host,
        database: data.database,
        password: data.password,
        port: 5432,
      });
      await client.connect()
      const query = "INSERT INTO users (name,password,email,country,age,image_url,description,gender,user_name)VALUES ('name','password','email','country',22,'@image_url',Null,'gender','name')"
      const result = await client.query(query)
      return res.json({"BBB":result});
}
function getCredentials(hostname){
    /*const obj = {
      "user":"postgres",
      "host":"localhost",
      "database":"postgres",
      "password":"Nordural050196",
      "port":5432
  };
  return obj;*/
  const obj = {
    "user":"drejoxqksziety",
    "host":"ec2-54-195-247-108.eu-west-1.compute.amazonaws.com",
    "database":"d711qi31b5sskh",
    "password":"c1d0a5ba1ad75f9e465c78ea4222e2f5c83fda8184415a77e38100ce5feac47c",
    "port":5432
};
    return obj;
}
  
router.get('/CreateUser', CreateUsers);

module.exports = router;

