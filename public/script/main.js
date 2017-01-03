'use strict';

const maxNewLines = 2;
const output = document.getElementById('output');

const transcripts = [];
let currTranscript = '';
let currTranscriptPosition = 0;
let newLineCount = 0;

// Refreshes the current local cache of transcripts
const refreshTranscripts = () => {
  getNewTranscripts().then(newTranscripts => {

    console.log(newTranscripts);

    newTranscripts.forEach(newTranscript => {

      // Make sure we haven't already cached this transcript
      if(transcripts.filter(t => t.key === newTranscript.key).length === 0)
      {
        transcripts.push(newTranscript);
      }

    });
  });
};

// Retrieves new transcripts from the web service
const getNewTranscripts = () => {
  return new Promise((resolve, reject) => {
    fetch('/transcripts').then(response => {
      response.json().then(json => { resolve(json); });
    });
  });
};

// Advances the output to the screen
const updateOutput = () => {

  if(currTranscriptPosition >= currTranscript.length)
  {
    // If we have reached the end of this transcript, add some space
    if(newLineCount < maxNewLines)
    {
      output.innerHTML += '<br>';
      newLineCount++;
      return;
    }

    // After we have added some space, move onto the next message
    moveToNextTranscript();
    return;
  }

  output.innerHTML += currTranscript[currTranscriptPosition++];

};

// Sets the next transcript as the current one
const moveToNextTranscript = () => {

  if(transcripts.length === 0)
  {
    // We have no transcripts right now
    return;
  }

  // Reset values
  currTranscript = transcripts.shift().content;
  currTranscriptPosition = 0;
  newLineCount = 0;

}

setInterval(updateOutput, 100);
setInterval(refreshTranscripts, 60000);
