const { callStatic } = require('./caller');

const input = 'what is a porche gt3rs';
const temperature = 0.5;
const maxTokens = 500;
const modelType = 'gpt-3.5-turbox'; // Replace with your desired model type
const apiKey = ''; // Replace with your OpenAI API key

callStatic(input, temperature, maxTokens, modelType, "", apiKey)
  .then(response => {
    console.log(response);
  })
  .catch(error => {
    console.error(error);
  });
