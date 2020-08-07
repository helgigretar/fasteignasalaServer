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

app.get('/', async(req, res)=> {
    const data = getCredentials(req.hostname);
    const client = new Client({
      user: data.user,
      host: data.host,
      database: data.database,
      password: data.password,
      port: 5432,
    });
    await client.connect()
    const result = await client.query('Select * from urls;')
    return res.json({"BBB":result});
});


app.get('/token',async (req,res)=>{
  var expires = moment().add('days', 7).valueOf();
  console.log(expires)
  
var token = jwt.encode({
  iss: 55,//user.id
  exp: expires
}, app.get('jwtTokenSecret'));

res.json({
  token : token,
  expires: expires,
  user: "user.toJSON()"
});
})


app.post('/url', function(req, res) {
  const url = req.body.url

  urlShortener.short(url, function(err, shortUrl) {
    db.Url.findOrCreate({where: {url: url, shortUrl: shortUrl}})
          .then(([urlObj, created]) => {
            res.redirect('/');
          });
  });
});
function getCredentials(hostname){
  const obj = {
    "user":"drejoxqksziety",
    "host":"ec2-54-195-247-108.eu-west-1.compute.amazonaws.com",
    "database":"d711qi31b5sskh",
    "password":"c1d0a5ba1ad75f9e465c78ea4222e2f5c83fda8184415a77e38100ce5feac47c",
    "port":5432
};
    return obj;/*
  if(hostname=== "localhost"){
    const obj = {
      "user":"lmvcxxxhtocjdi",
      "host":"ec2-54-75-231-156.eu-west-1.compute.amazonaws.com",
      "database":"d1f8fo5umskshe",
      "password":"ab392b2548f635aee2c6a062fa1b447dc9374ac58156f8a01ced0cc7d1a50632",
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