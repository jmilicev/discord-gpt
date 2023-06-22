
# OpenAI Toolkit

The OpenAI Toolkit is a Node.js module that provides a convenient interface for interacting with OpenAI's GPT models through the OpenAI API. It allows you to generate text based on prompts and provides additional features such as estimating token count and cost.

## Prerequisites

Before using the OpenAI Toolkit, make sure you have the following installed:

- Node.js
- NPM (Node Package Manager)

## Installation

1. Install the OpenAI Toolkit module by running the following command in your project directory:

   ```shell
   npm install openai-toolkit
   ```

2. Require the module in your JavaScript file:

   ```javascript
   const { call } = require('openai-toolkit');
   ```

## Usage

To use the OpenAI Toolkit, follow these steps:

1. Get your OpenAI API key from the OpenAI website. You will need this key to make API requests.

2. Create a new JavaScript file (e.g., `app.js`) and require the OpenAI Toolkit module:

   ```javascript
   const { call } = require('openai-toolkit');
   ```

3. Use the `call` function to generate text:

   ```javascript
   call(input, temperature, maxTokens, modelType, PARAMETERS, apiKey, onData, onEnd);
   ```

   - `input` (string): The prompt for generating text.
   - `temperature` (number): Controls the randomness of the generated text. A higher value (e.g., 0.8) produces more random outputs, while a lower value (e.g., 0.2) produces more deterministic outputs.
   - `maxTokens` (number): Limits the length of the generated text. You can set the maximum number of tokens the model should generate.
   - `modelType` (string): Specifies the GPT model to use. For example, "gpt-3.5-turbo" is the most advanced model as of the last update.
     - Valid options are: `'gpt-4'`,`'gpt-4-0314'`, `'gpt-4-32k'`, `'gpt-4-32k-0314'`, `'gpt-3.5-turbo'`, `'gpt-3.5-turbo-0301'`
     - note you can only use gpt-4-* models if you have been given access by the openAI team, you do not have them default.
   - `PARAMETERS` (string): Additional parameters for customizing the behavior of the function. Supported options include:
     - `"a"`: Enable analytics to estimate token count and cost.
     - `"e"`: Append an end indicator to the generated output.
     - `"s"`: Silent mode, disables additional output.
   - `apiKey` (string): Your OpenAI API key.
   - `onData` (function): Callback function to handle the generated output. Receives the generated text as a parameter.
   - `onEnd` (function): Callback function called when the generation process ends.

4. Run your JavaScript file using Node.js:

   ```shell
   node app.js
   ```

5. The generated text will be displayed according to your specified parameters.

## Examples

Here are some examples of using the OpenAI Toolkit:

1. Basic Usage:

   ```javascript
   const { call } = require('openai-toolkit');

   const input = 'Hello, GPT!';
   const temperature = 0.6;
   const maxTokens = 50;
   const modelType = 'gpt-3.5-turbo';
   const PARAMETERS = '';
   const apiKey = 'your_api_key_here';

   function onData(output) {
     console.log(output);
   }

   function onEnd() {
     console.log('Generation completed.');
   }

   call(input, temperature, maxTokens, modelType, PARAMETERS, apiKey, onData, onEnd);
   ```

2. Analytics and Token Count:

   ```javascript
   const { call } = require('openai-toolkit');

   const input = 'Hello, GPT!';
   const temperature = 0.6;
   const maxTokens = 50;
   const modelType = 'gpt-3.5-turbo';
   const PARAMETERS = 'a';
   const apiKey = 'your_api_key_here';

   function onData(output) {
     console.log(output);
   }

   function onEnd() {
     console.log('Generation completed.');
   }

   call(input, temperature, maxTokens, modelType, PARAMETERS, apiKey, onData, onEnd);
   ```

## License

Feel free to use this project as you please!
