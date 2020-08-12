const express = require('express')
const router = express.Router()
const URLModel = require("../models/urlschema")
const mongo = require('mongodb');
const dns = require('dns')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const crypto = require('crypto');
const { type } = require('os');
/*
 @TODO prevent duplicate entries in DB by checking long_URL (push lookup into separate function)
 if the short_URL doesn't exist in DB, send error saying it doesn't exist
*/

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

// we ask for an "options"" object for optional parameters - they can just pass "longURL" OR "shortURL" with a value
function lookupURL(options, callback) {
  if (options.longURL === undefined) {
    URLModel.find({ short_URL: redirectURL }, (err, document) => {
      console.log('shortURL found')
      if (err) {
        callback(err, null)
      } else {
        callback(null, document)
      }
    })
  } else if (options.shortURL === undefined) {
    URLModel.find({ long_URL: options.longURL }, (err, document) => {
      if (err) {
        callback(err, null)
      } else {
        callback(null, document)
      }
    })
  }
}

function lookupAndWrite(urlToWrite, callback) {
  dns.lookup(urlToWrite.host, (err, address, family) => {
    if (err) {
      console.error(err)
      res.json({ "error": "invalid URL" })
    }
    else {
      console.log('time to hash and save to DB')
      console.log(urlToWrite)
      // hash using the URI with the protocol stripped from it
      const hash = crypto.createHash('sha1').update(urlToWrite.hostname, 'utf-8').digest('hex')
      const userUrlObj = new URLModel({
        // use origin property to include protocol
        "long_URL": urlToWrite.origin,
        "short_URL": hash.slice(0, 5)
      })
      // save using .create method on model itself (vs using .save on the instance)
      URLModel.create(userUrlObj, (err, document) => {
        if (err) callback(err, null)
        else {
          let response = {"long_URL": document.long_URL, "short_URL":hash.slice(0,5)}
          callback(null, response)
        }
      })
    }
  })
}

router.post("/api/shorturl/new", (req, res) => {
  // convert into URL object to parse only the hostname for DNS lookup
  let newURL = new URL(req.body.longurl)
  // use URL.origin property to include protocol (which we use to store our long_URL)
  lookupURL({ "longURL": newURL.origin }, (err, document) => {
    if (err) {
      console.error(err)
    } else {
      if (document.length) {
        // DB already contains entry
        res.json({ "original_url": document[0].long_URL, "short_url": document[0].short_URL })
        res.end()
      } else {
        // Need to write to DB
        lookupAndWrite(newURL, (err, data) => {
          if (err) console.error(err)
          else res.json(data)
          res.end()
        })
      }
    }
  })
})

module.exports = router