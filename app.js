const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const exphbs  = require('express-handlebars');
const urlShortener = require('node-url-shortener');
const bodyParser = require('body-parser');
const moment = require('moment')
const { Pool, Client } = require('pg')
var os = require('os');
var jwt = require('jwt-simple');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded());
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('jwtTokenSecret', 'YOUR_SECRET_STRING');
const users = require('./Routers/UsersApi')

//Here are the home routes
app.use('/Users',users)


app.get('/', async(req, res)=> {
  console.log("Test")
    const data = getCredentials(req.hostname);
    const client = new Client({
      user: data.user,
      host: data.host,
      database: data.database,
      password: data.password,
      port: 5432,
    });
    await client.connect()
    const result = await client.query('Select * from users;')
    return res.json({"BBB":result});
});
function getCredentials(hostname){
  const obj = {
    "user":"postgres",
    "host":"localhost",
    "database":"postgres",
    "password":"Nordural050196",
    "port":5432
};
return obj;
  /*
  if(hostname=== "localhost"){
      const obj = {
          "user":"postgres",
          "host":"localhost",
          "database":"postgres",
          "password":"Nordural050196",
          "port":5432
      };
      return obj;
  }else{
    const obj = {
      "user":"drejoxqksziety",
      "host":"ec2-54-195-247-108.eu-west-1.compute.amazonaws.com",
      "database":"d711qi31b5sskh",
      "password":"c1d0a5ba1ad75f9e465c78ea4222e2f5c83fda8184415a77e38100ce5feac47c",
      "port":5432
  };
      return obj;
  }*/
}

app.listen(port, () => console.log(`url-shortener listening on port ${port}!`));