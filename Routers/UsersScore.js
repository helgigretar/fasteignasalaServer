var express = require('express')
var router = express.Router()

      bodyParser = require('body-parser');

// support parsing of application/json type post data
router.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
router.use(bodyParser.urlencoded({ extended: true }));

// middleware that is specific to this router
// define the home page route
router.get('/troll', function (req, res) {
  res.send('Birds home page')
})
// define the about route
router.post('/about', function (req, res) {    
    console.log(req.body)
  res.send('About birds')
})

module.exports = router
