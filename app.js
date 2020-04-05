const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const exphbs  = require('express-handlebars');
const urlShortener = require('node-url-shortener');
const bodyParser = require('body-parser');
const db = require('./models/index.js');
const { Pool, Client } = require('pg')
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded());
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get('/', async(req, res)=> {
  try{

    const client = new Client({
      user: 'drejoxqksziety',
      host: 'ec2-54-195-247-108.eu-west-1.compute.amazonaws.com',
      database: 'd711qi31b5sskh',
      password: 'c1d0a5ba1ad75f9e465c78ea4222e2f5c83fda8184415a77e38100ce5feac47c',
      port: 5432,
    })
    await client.connect()
    /*await client.query('Select * from urls;', (err, res) => {    
      
      console.log(err, res.fields[0].tableID)
      const r = res.fields[0].tableID
      client.end()
      console.log(r, " lllllll")
    })*/
    const result = await client.query('Select * from urls;')
    //res.send(result.rows[0].message)
    return res.json({"BBB":result});
  }catch(e){
    res.json({"Erro":e})
  }
});

app.post('/url', function(req, res) {
  const url = req.body.url

  urlShortener.short(url, function(err, shortUrl) {
    db.Url.findOrCreate({where: {url: url, shortUrl: shortUrl}})
          .then(([urlObj, created]) => {
            res.redirect('/');
          });
  });
});

async function lol(){
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'urlshortener_development',
    password: 'Nordural050196',
    port: 5432,
  })
  await client.connect()
  /*await client.query('Select * from urls;', (err, res) => {    

      console.log(err, res.fields[0].tableID)
      const r = res.fields[0].tableID
      client.end()
      console.log(r, " lllllll")
    })*/
    const result = await client.query('SELECT $1::text as message', ['Hello world!'])
    //res.send(result.rows[0].message)
    return res.json({"BBB":result});
  
}

app.listen(port, () => console.log(`url-shortener listening on port ${port}!`));