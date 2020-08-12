const express = require('express')
const router = express.Router()
const URLModel = require("../models/urlschema")
const mongo = require('mongodb');
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const crypto = require('crypto');
const queryHandler = require('./queryHandler')

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

router.get('/api/shorturl/:url', (req, res) => {
  let redirectURL = req.params.url
  URLModel.findOne({ short_URL: redirectURL }, (err, document) => {
    if (err) {
      res.json({ "error": "that short URL doesn't exist in the database" })
    } else {
      res.redirect(document.long_URL)
    }
  })
})

router.post("/api/shorturl/new", (req, res) => {
  // convert into URL object to parse only the hostname for DNS lookup
  let newURL = new URL(req.body.longurl)
  // use URL.origin property to include protocol (which we use to store our long_URL)
  queryHandler.lookupURL({ "longURL": newURL.origin }, (err, document) => {
    if (err) {
      console.error(err)
    } else {
      if (document.length) {
        // DB already contains entry
        res.json({ "original_url": document[0].long_URL, "short_url": document[0].short_URL })
        res.end()
      } else {
        // Need to write to DB
        queryHandler.lookupAndWrite(newURL, (err, data) => {
          if (err) console.error(err)
          else res.json(data)
          res.end()
        })
      }
    }
  })
})

module.exports = router