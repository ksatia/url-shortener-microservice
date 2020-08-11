const express = require('express')
const router = express.Router()
const URLModel = require("../models/urlschema")
const mongo = require('mongodb');
const dns = require('dns')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

// Load .env file when not in production
if (process.env.NODE_ENV != "production") {
  dotenv.config()
}

// Connect to DB
mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true });

const app = express()

// router level middleware
router.use(express.urlencoded({ extended: true }))
router.use('/public', express.static(process.cwd() + '/public'));

//build routes
router.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

router.get("/api/hello", function (req, res) {
  res.json({ greeting: 'hello API' });
});

router.post("/api/shorturl/new", (req, res) => {
  // URLModel gives us access to our collection of documents stored in the URL_Store DB
  // Construct object to store in DB
  let newURL = new URL(req.body.longurl)
  // strips the protocol from the string
  console.log(newURL.host)
  
  dns.lookup(newURL.host, (err, address, family) => {
    if (err) {
      console.error(err)
      res.json({"error":"invalid URL"})
    }
    else {console.log('successful lookup')}
    /*
    const userUrlObj = new URLModel({
      "long_URL": req.body.longurl,
      "short_URL": "23"
    }) 
    // save using .create method on model itself (vs using .save on the instance)
    URLModel.create(userUrlObj, (err, data) => {
      if (err) console.log(err)
      else console.log('success')
    }) */
  })
})

module.exports = router