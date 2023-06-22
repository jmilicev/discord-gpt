const { call } = require('./caller');

const input = 'what is a porche gt3rs';
const temperature = 1;
const maxTokens = 30;
const modelType = 'gpt-3.5-turbo-16k'; // Replace with your desired model type
const PARAMETERS = 'a';
const apiKey = ''; // Replace with your OpenAI API key

call(input, temperature, maxTokens, modelType, PARAMETERS, apiKey, onData, onEnd);

function onData(output) {
  process.stdout.write(output);
}

function onEnd() {
  // Finalize the output or perform any other actions
  console.log('Stream ended');
}
