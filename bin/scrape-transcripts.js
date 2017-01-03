'use strict';

const config = require('../config');
const fs = require('fs');

// "Scrapes" a directory of transcripts, deleting the local files and returning
// a key-value representation of the transcript data
const scrapeTranscriptDirectory = (config) => {
  return new Promise((resolve, reject) => {

    // Look through the files in the transcripts directory
    fs.readdir(config.transcriptPath, (err, files) => {

      if(err || files.length === 0)
      {
        // Either we encountered an error or we have no files, silently
        // resolve to an empty array
        resolve([]);
        return;
      }

      // Look specifically for transcript files
      var transcriptFiles = files.filter(file => (config.transcriptPattern.test(file)));

      if(transcriptFiles.length === 0)
      {
        // We have no files matching the transcript pattern, silently resolve
        // to an empty array
        resolve([]);
        return;
      }

      Promise.all(transcriptFiles.map(file => (scrapeTranscript(file, config.transcriptPath))))
        .then((transcripts) => resolve(transcripts))
        .catch(() => resolve([]));

    });

  });
};

// "Scrapes" a transcript, deleting the local file and returning a key-value
// representation of the data from the transcript
const scrapeTranscript = (file, transcriptPath) => {

  var filePath = transcriptPath + file;

  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {

      if(err)
      {
        // There was an error reading in the file, silently resolve
        resolve();
        return;
      }

      // Create an in-memory key-value store of the transcripts
      const transcriptData = {
        key: file,
        content: data
      };

      fs.unlink(filePath, () => { resolve(transcriptData); });

    });
  });

};

module.exports = scrapeTranscriptDirectory;
