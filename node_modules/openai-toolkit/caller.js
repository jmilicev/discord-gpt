const https = require('https');
const path = require('path');
const axios = require('axios');

const validModels = [
  'gpt-4',
  'gpt-4-32k',
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-16k',
  ];

function callAPIStatic(input, temperature, maxTokens, modelType, PARAMETERS, apiKey) {
  return new Promise((resolve, reject) => {
    if (input === '') {
      reject('\nERROR: cannot have empty message\n');
      return;
    }
    if (temperature > 1 || temperature < 0) {
      reject('ERROR: temperature must be between 0 and 1 inclusive');
      return;
    }
    if (maxTokens < 1) {
      reject('ERROR: max tokens cannot be 0 or negative');
      return;
    }
  
    if(!validModels.includes(modelType)){
      reject("ERROR: model is not a valid option\noptions: gpt-4, gpt-4-32k, gpt-3.5-turbo, gpt-3.5-turbo-16k");
    }

    const data = {
      model: modelType,
      messages: [{ role: 'user', content: input }],
      temperature: temperature,
      max_tokens: maxTokens,
    };

    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk.toString();
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          if (
            response.choices &&
            response.choices.length > 0 &&
            response.choices[0].message &&
            response.choices[0].message.content
          ) {
            const completion = response.choices[0].message.content;
            resolve(completion);
          } else {
            reject('Unable to retrieve completion from the server response.');
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify(data));
    req.end();
  });
}

function callAPI(input, temperature, maxTokens, modelType, PARAMETERS, apiKey, onData, onEnd) {
  //check parameters
  if(input == ""){
    onData("\nERROR: cannot have empty message\n");
    process.exit();
  }if(temperature>1 || temperature<0){
    onData("ERROR: temperature must be between 0 and 1 inclusive");
    process.exit();
  }if(maxTokens<1){
    onData("ERROR: max tokens cannot be 0 or negative");
    process.exit();
  }

  if(!validModels.includes(modelType)){
    onData("ERROR: model is not a valid option");
    onData("options: gpt-4, gpt-4-32k, gpt-3.5-turbo, gpt-3.5-turbo-16k");

    process.exit();
  }
  
  var rctoken = 0;
  var trtoken = 0;

  var filebuilder = ""
  var potentialErrorString = "";

  const startDelimiter = '{"content":"';
  const endDelimiter = '"}';
  const gpt35turbo_RATE = 0.000002; //per 1 token

  const req = https.request(
    {
      hostname: "api.openai.com",
      port: 443,
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${apiKey}`,
      }
    },
    function (res) {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk.toString();
        potentialErrorString += responseData;

        while (responseData.indexOf(startDelimiter) !== -1 && responseData.indexOf(endDelimiter) !== -1) {
          const startIndex = responseData.indexOf(startDelimiter) + startDelimiter.length;
          const endIndex = responseData.indexOf(endDelimiter, startIndex);

          if (startIndex !== -1 && endIndex !== -1) {
            const content = responseData.substring(startIndex, endIndex);
            const output = content.replace(/\\n/g, '\n');
            rctoken++;
            filebuilder+=output;
            onData(output);
            responseData = responseData.substring(endIndex + endDelimiter.length);
          } else {
            break;
          }
        }
      });

      res.on('end', () => {
        if (PARAMETERS.includes("e")) {
          onData(" %^& END");
        }


        const totaltokens = rctoken + trtoken;
        const priceinCENTS = totaltokens * gpt35turbo_RATE * 100;

        if (rctoken === 0) {
          const error = "\n\nERROR DETECTED: \nLIKELY API KEY / API ISSUE\n\n" + potentialErrorString + "\n\n\nEND ERROR";
          onData(error);
        } else if (PARAMETERS.includes("a") || PARAMETERS.includes("A")) {
          trtoken = estimateTokenCount(input);
          const analytics = '\n\n -- analytics --\n' +
            "prompt tokens spent: " + trtoken + '\n' +
            "completion tokens spent: " + rctoken + '\n' +
            "total tokens spent: " + totaltokens + '\n' +
            "estimated cost: ¢" + priceinCENTS.toFixed(3) + '\n' +
            ' ---- ---- ---- \n';
          onData(analytics);
        } else {
          if (!PARAMETERS.includes("s")) {
            onData('\n\n ---- ---- ----  ----  ----  ---- \n\n');
          }
        }

        onEnd();
      });
    }
  );

  req.on('error', (e) => {
    onData("Problem with request" + e);
  });

  function estimateTokenCount(text) {
    //according to OpenAI, each token is approximately 4 characters
    return Math.round(text.length / 4);
  }

  function processCall() {
    var body = JSON.stringify({
      messages: [
        {
          role: 'user',
          content: input,
        },
      ],
      model: modelType,
      temperature: temperature,
      max_tokens: maxTokens,
      stream: true
    });

    if (!PARAMETERS.includes("s")) {
      onData("\n -- GPT: --\n");
      onData("temp = " + temperature + " | m-t = " + maxTokens + " | mdl = " + modelType + "\n\n");
    }
    req.write(body);
    req.end();
  }

  processCall();
}

module.exports = {
  call: callAPI,
  callStatic: callAPIStatic
};
