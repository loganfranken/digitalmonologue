'use strict';

const fs = require('fs');
const FtpClient = require('ftp');

// Processes transcripts in a FTP directory, downloading them locally and
// deleting them off the FTP server
const processDirectory = (err, list, transcriptPath, client) => {

  return new Promise((resolve, reject) => {

    if(err || list.length == 0)
    {
      // Either listing the contents of the FTP directory failed or we have
      // no directory items, close the client and silently fail
      client.end();
      return;
    }

    const fileList = list.filter(item => (item.type === '-'));

    if(fileList.length === 0)
    {
      // The FTP directory is empty, close the client
      client.end();
      return;
    }

    Promise.all(fileList.map(file => (processFile(file, transcriptPath, client))))
      .then(() => { client.end(); resolve(); })
      .catch(() => { client.end(); resolve(); });

  });

};

// Processes a transcript file in a FTP directory, downloading the file
// locally and deleting it off the FTP server
const processFile = (file, transcriptPath, client) => {

  return new Promise((resolve, reject) => {

    client.get(file.name, (err, stream) => {

      if(err)
      {
        // Retrieving the conents of the FTP file failed, silently fail
        // but keep the client open
        resolve();
        return;
      }

      // Once the file is downloaded, delete the file
      stream.once('close', () => {
          client.delete(file.name, (err) => { resolve(); });
      });

      stream.pipe(fs.createWriteStream(transcriptPath + file.name));

    });

  });
};

module.exports = config => {
  return new Promise((resolve, reject) => {

    const client = new FtpClient();
    client.on('error', () => { client.end(); }); // Swallow all unexpected errors

    client.on('ready', () => {
      client.list((err, list) => {
        processDirectory(err, list, config.transcriptPath, client).then(() => { resolve(); })
      });
    });

    client.connect({
      host: config.ftpHost,
      user: config.ftpUser,
      password: config.ftpPassword
    });

  });
};
