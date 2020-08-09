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
const friends = require('./Routers/FriendsApi')
const leaderBoard = require('./Routers/LeaderBoardApi')
const challenges = require('./Routers/ChallengesApi')
const challengeInvestor = require('./Routers/ChallengeInvestorApi')
const StoryChallenges = require('./Routers/StoryChallenges')
const comments = require('./Routers/CommentsApi')
const underChallenges = require('./Routers/UnderChallengesApi')
const notifications = require('./Routers/NotificationsApi')

//Here are the home routes
app.use('/Users',users)
app.use('/Friends',friends)
app.use('/LeaderBoards',leaderBoard)
app.use('/Challenges',challenges)
app.use('/challengeInvestors',challengeInvestor)
app.use('/StoryChallenges',StoryChallenges)
app.use('/Comments',comments)
app.use('/underChallenges',underChallenges)
app.use("/Notifications", notifications)
global.credentials = {
  "user": "postgres",
  "host": "localhost",
  "database": "postgres",
  "password": "Nordural050196",
  "port": 5432
};
/*const obj = {
  "user":"drejoxqksziety",
  "host":"ec2-54-195-247-108.eu-west-1.compute.amazonaws.com",
  "database":"d711qi31b5sskh",
  "password":"c1d0a5ba1ad75f9e465c78ea4222e2f5c83fda8184415a77e38100ce5feac47c",
  "port":5432
};*/

app.listen(port, () => console.log(`url-shortener listening on port ${port}!`));