
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});


const axios = require('axios');
const dotenv = require('dotenv');
const db_manager = require('./db_manager');

dotenv.config();

client.on('ready', () => {
  console.log(`Initiating....`);
  console.log(`We have logged in as ${client.user.tag}`);
  console.log(`Chatbase is ready to receive commands!`);
  console.log(`My ID is: ${client.user.id}`);
});

client.on('guildCreate', async (guild) => {
  const adminMembers = guild.members.cache.filter(
    (member) => member.permissions.has('ADMINISTRATOR')
  );

  const message = `
    Hello Admin! Thank you for inviting ChatGPT to your server!
  
    To get started, you need to set the API key and chatbotID using the set command.
    For more information, the .help command is always available in the server.
    Step by step instructions are provided below.
  `;

  const embed = new discord.MessageEmbed()
    .setTitle('Getting Started')
    .setDescription('A step by step guide on how to get started')
    .setColor('#4F45E4')
    .addField('1. Environment', 'Create a private text channel that only the ChatGPT bot and you can see using the permissions tab.')
    .addField('2. Set API key', 'In the private channel, enter .set apikey <your API key>')
    .addField('3. Set Chatbot ID', 'In the private channel, enter .set chatid < chatbot ID>')
    .addField('4. Cleanup', 'Delete the private text channel created in step 1.')
    .addField('5. Permissions', 'Configure your text channels so the ChatGPT bot does not share any communal channels with users you do not want to have access.')
    .addField('6. Rename', 'Right click on the ChatGPT bot in the right side, and click change global nickname, rename it as you please.')
    .addField('(1) NOTE', 'Only users with the admin privilege on the server will be able to configure the bot.')
    .addField('(2) NOTE', 'Any user that shares a text channel with the bot can query it.');

  for (const member of adminMembers.values()) {
    try {
      await member.send(message);
      await member.send(embed);
    } catch (error) {
      console.log(`Failed to send a message to ${member.user.tag}`);
    }
  }
});

client.on('messageCreate', async (message) => {

  console.log("HERE");

  if (message.author.bot) return;

  if (message.content.startsWith('.ping')) {
    message.channel.send(`Here! Response time: ${Math.round(client.ws.ping)}ms`);
  }

  if (message.content.startsWith('.message')) {
    const serverID = message.guild.id;
    const [_, content] = message.content.split(' ');
    const [chatbot_id, api_key] = await pullParameters(serverID);

    const headers = {
      Authorization: `Bearer ${api_key}`,
      'Content-Type': 'application/json',
    };

    const data = {
      messages: [{ content: content, role: 'user' }],
      chatId: chatbot_id,
      stream: false,
      temperature: 0,
    };

    try {
      const response = await axios.post(message_url, data, { headers });
      const message = response.data.text;

      const embed = new discord.MessageEmbed()
        .setTitle('Response')
        .setDescription(message)
        .setColor('#4F45E4');

      message.channel.send(embed);
    } catch (error) {
      const errorMessage = error.response ? error.response.data : error.message;

      const embed = new discord.MessageEmbed()
        .setTitle('ERROR (request-exception)')
        .setDescription('We did not get the response we expected, please check your API key and Chatbot ID')
        .setColor('#4F45E4')
        .addField('Server: ', errorMessage);

      message.channel.send(embed);
    }
  }

  if (message.content.startsWith('.rmessage')) {
    const serverID = message.guild.id;
    const [_, content] = message.content.split(' ');
    const [chatbot_id, api_key] = await pullParameters(serverID);

    const headers = {
      Authorization: `Bearer ${api_key}`,
      'Content-Type': 'application/json',
    };

    const data = {
      messages: [{ content: content, role: 'user' }],
      chatbotId: chatbot_id,
      stream: true,
      temperature: 0,
    };

    try {
      const response = await axios.post(message_url, data, { headers, responseType: 'stream' });
      const decoder = response.data;

      let buildmsg = '';
      let chunks = [];
      const embed = new discord.MessageEmbed()
        .setTitle('Response')
        .setDescription('⌛')
        .setColor('#4F45E4');

      const sentMessage = await message.channel.send(embed);

      decoder.on('data', (chunk) => {
        const chunk_value = chunk.toString('utf-8');
        chunks.push(chunk_value);
      });

      decoder.on('end', async () => {
        for (const chunk_value of chunks) {
          buildmsg += chunk_value;
          embed.setDescription(buildmsg);
          await sentMessage.edit(embed);
          await sleep(500);
        }
      });
    } catch (error) {
      const errorMessage = error.response ? error.response.data : error.message;

      const embed = new discord.MessageEmbed()
        .setTitle('ERROR (request-exception)')
        .setDescription('We did not get the response we expected, please check your API key and Chatbot ID')
        .setColor('#4F45E4');

      message.channel.send(embed);
    }
  }

  if (message.content.startsWith('.set') && message.member.permissions.has('ADMINISTRATOR')) {
    const serverID = message.guild.id;
    const [_, key, value] = message.content.split(' ');

    let [chatbot_id, api_key] = await pullParameters(serverID);

    if (key.toLowerCase() === 'chatid') {
      await storeParameters(serverID, value, api_key);
      message.channel.send('chatID set successfully.');
    } else if (key.toLowerCase() === 'apikey') {
      await storeParameters(serverID, chatbot_id, value);
      message.channel.send('API key set successfully.');
    }
  }

  if (message.content.startsWith('.info') && message.member.permissions.has('ADMINISTRATOR')) {
    const serverID = message.guild.id;
    const [chatbotid, apikey] = await pullParameters(serverID);

    const embed = new discord.MessageEmbed()
      .setTitle('Info')
      .setDescription('View your current chatbot configuration')
      .setColor('#4F45E4')
      .addField('chatbot ID', chatbotid)
      .addField(apikey.length > 15 ? 'api-key' : 'api-key', apikey)
      .addField('server ID', serverID);

    message.channel.send(embed);
  }

  if (message.content.startsWith('.create') && message.member.permissions.has('ADMINISTRATOR')) {
    const serverID = message.guild.id;
    const [_, name, links] = message.content.split(' ');
    const [chatbot_id, api_key] = await pullParameters(serverID);

    const url = 'https://www.chatbase.co/api/v1/create-chatbot';
    const headers = {
      Authorization: `Bearer ${api_key}`,
      'Content-Type': 'application/json',
    };
    const data = {
      urlsToScrape: [links],
      chatbotName: name,
    };

    const link_pattern = /^(http|https):\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/;

    if (link_pattern.test(links)) {
      try {
        const response = await axios.post(url, data, { headers });
        const message = response.data;

        const embed = new discord.MessageEmbed()
          .setTitle('Operation Sent')
          .setDescription('')
          .setColor('#4F45E4')
          .addField('Server Message: ', message);

        message.channel.send(embed);
      } catch (error) {
        const errorMessage = error.response ? error.response.data : error.message;

        const embed = new discord.MessageEmbed()
          .setTitle('Operation Failed')
          .setDescription('Bot not created.')
          .setColor('#4F45E4')
          .addField('error: ', 'The link provided does not appear to be valid, please check the link and try again.')
          .addField('', 'Please ensure "HTTP" or "HTTPS" is included in the link prefix.');

        message.channel.send(embed);
      }
    }
  }

  if (message.content.startsWith('.delete') && message.member.permissions.has('ADMINISTRATOR')) {
    const serverID = message.guild.id;
    const [_, name] = message.content.split(' ');
    const [chatbot_id, api_key] = await pullParameters(serverID);

    const url = 'https://www.chatbase.co/api/v1/delete-chatbot';
    const params = { chatbotId: name };
    const headers = { Authorization: `Bearer ${api_key}` };

    try {
      const response = await axios.delete(url, { params, headers });
      const message = response.data.message;

      const embed = new discord.MessageEmbed()
        .setTitle('Operation Sent')
        .setDescription('')
        .setColor('#4F45E4')
        .addField('Server Message: ', message);

      message.channel.send(embed);
    } catch (error) {
      const errorMessage = error.response ? error.response.data : error.message;

      const embed = new discord.MessageEmbed()
        .setTitle('ERROR (request-exception)')
        .setDescription('We did not get the response we expected, please check your API key and Chatbot ID')
        .setColor('#4F45E4');

      message.channel.send(embed);
    }
  }

  if (message.content.startsWith('.help')) {
    if (message.member.permissions.has('ADMINISTRATOR')) {
      const embed = new discord.MessageEmbed()
        .setTitle('Chatbase')
        .setDescription('Documentation for all Chatbase Commands')
        .setColor('#4F45E4')
        .addField('message', 'message your chatbot | message <prompt>')
        .addField('ping', 'receive response time from server')
        .addField('help', 'list of all valid commands')
        .addField('', 'ADMIN ZONE')
        .addField('rmessage (BETA)', 'message your chatbot with streaming | rmessage <prompt>')
        .addField('set (admin)', 'change api key or chatbot ID | set <apikey | chatid> <value>')
        .addField('create (admin)', 'create a chatbot | create <name> <training link>')
        .addField('delete (admin)', 'delete a chatbot | delete <chatid>');

      message.channel.send(embed);
    } else {
      const embed = new discord.MessageEmbed()
        .setTitle('Help Section')
        .setDescription('How to use our chatbot.')
        .setColor('#4F45E4')
        .addField('message', 'message your chatbot | message <prompt>')
        .addField('ping', 'receive response time from server')
        .addField('help', 'list of all valid commands');

      message.channel.send(embed);
    }
  }
});

async function pullParameters(serverID) {
  const [chatbotid, apikey] = db_manager.read_db(serverID);
  if (chatbotid !== null && apikey !== null) {
    return [chatbotid, apikey];
  } else {
    return ['Not Set', 'Not Set'];
  }
}

async function storeParameters(serverID, chatbot_id, api_key) {
  db_manager.add(serverID, chatbot_id, api_key);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

client.login(process.env.DISCORD_TOKEN);
