'use strict';

var config = require('../config');
var downloadTranscripts = require('../lib/download-transcripts');
var express = require('express');
var router = express.Router();
var scrapeTranscripts = require('../lib/scrape-transcripts');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Digital Monologue' });
});

router.get('/transcripts', function(req, res, next) {

  downloadTranscripts(config).then(() => {
    scrapeTranscripts(config).then(transcripts => {
      res.json(transcripts);
    });
  });

});

module.exports = router;
