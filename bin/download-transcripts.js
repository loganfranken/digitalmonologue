'use strict';

const fs = require('fs');
const FtpClient = require('ftp');

const client = new FtpClient();

module.exports = (config) => {

  client.on('ready', () => { client.list(handleFtpList); });

  const handleFtpList = (err, list) => {

    if(err)
    {
      // Listing the contents of the FTP directory failed, close the client
      // and silently fail
      client.end();
      return;
    }

    const fileList = list.filter((item) => (item.type === '-'));

    if(fileList.length === 0)
    {
      // The FTP directory is empty, close the client
      client.end();
      return;
    }

    const fileOps = [];

    // 1: Loop through all of the files in the FTP directory
    fileList.forEach((file) => {

      // 2: Download each file from the FTP directory
      client.get(file.name, (err, stream) => {

        if(err)
        {
          // Retrieving the conents of the FTP file failed, silently fail
          // but keep the client open
          return;
        }

        // 3: Once the file is downloaded, delete the file
        stream.once('close', () => {
          fileOps.push(new Promise((resolve, reject) => {
            client.delete(file.name, (err) => { resolve(); });
          }));
        });

        stream.pipe(fs.createWriteStream(config.ftpDownloadPath + file.name));

      });
    });

    // We use promises to ensure that the client is closed after all of the
    // FTP operations are complete
    Promise.all(fileOps)
      .then(() => { client.end(); })
      .catch(() => { client.end(); });

  }

  // Swallow all unexpected errors
  client.on('error', () => { client.end(); });

  client.connect({
    host: config.ftpHost,
    user: config.ftpUser,
    password: config.ftpPassword
  });

};
