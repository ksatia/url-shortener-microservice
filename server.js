'use strict';
const express = require('express');
const router = require('./routes/router')
//const db = mongoose.connection
const cors = require('cors');

// Routes and DB connection
var app = express();
app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));
app.use(router)

// port config 
const PORT = process.env.PORT || 3000;

// start server
app.listen(PORT, function () {
  console.log(`Node.js listening on port ${PORT}...`);
});