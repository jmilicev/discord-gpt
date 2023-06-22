const { EmbedBuilder, Client, GatewayIntentBits } = require('discord.js');
const db_manager = require('./db_manager');
const fs = require('fs');
const openai = require('openai-toolkit')
const { PermissionsBitField } = require('discord.js');

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

dotenv.config();

client.on('ready', () => {

  //clear server cache when rebooting
  //to avoid bad decrypt error.
  const path = './db.txt';
  try {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
  } catch (err) {
    console.error(err);
  }
  fs.writeFileSync(path, '', 'utf8');

  console.log(`Initiating....`);
  console.log(`We have logged in as ${client.user.tag}`);
  console.log(`GPTbot is ready to receive commands!`);
  console.log(`My ID is: ${client.user.id}`);
});

client.on('guildCreate', async (guild) => {
  console.log('Added to new server');
});


client.on('messageCreate', async (message) => {

  if (message.author.bot) return;

  if(message.content.startsWith('.setup')){

    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    const adminMembers = message.guild.members.cache.filter(
      (member) => member.permissions.has(PermissionsBitField.Flags.Administrator)
    );
  
    const sendmessage = `Hello Admin!\nThank you for inviting ChatGPT to your server!\n\nTo get started, you need to set the API key and chatbotID using the set command.\n\nFor more information, the .help command is always available in the server. Step by step instructions are provided below.
    `
  
    const embed = new EmbedBuilder()
      .setTitle('Getting Started')
      .setDescription('A step by step guide on how to get started')
      .setColor('#4F45E4')
      .addFields(
        { name: '1. Environment', value: 'Create a private text channel that only the ChatGPT bot and you can see using the permissions tab.', inline: true },
        { name: '2. Set API key', value: 'In the private channel, enter .set apikey <your API key>', inline: true },
        { name: '3. Cleanup', value: 'Delete the private text channel created in step 1.', inline: true },
        { name: '4. Permissions', value: 'Configure your text channels so the ChatGPT bot does not share any communal channels with users you do not want to have access.', inline: true },
        { name: '5. Rename', value: 'Right click on the ChatGPT bot in the right side, and click change global nickname, rename it as you please.', inline: true }
      )
      .addFields(
        { name: '(1) NOTE', value: 'Only users with the admin privilege on the server will be able to configure the bot.', inline: true },
        { name: '(2) NOTE', value: 'Any user that shares a text channel with the bot can query it.', inline: true }
      );
  
    for (const member of adminMembers.values()) {
      try {
        await member.send(sendmessage);
        await member.send({ embeds: [embed] });
      } catch (error) {
        console.log(`Failed to send a message to ${member.user.tag}`);
      }
    }
  }else{

  }
}
  

  if (message.content.startsWith('.ping')) {
    message.channel.send(`Here! Response time: ${Math.round(client.ws.ping)}ms`);
  }

  if (message.content.startsWith('.message') || message.content.startsWith('.m')) {
    const serverID = message.guild.id;
    const [_, ...temp] = message.content.split(' ');
    const content = temp.join(' ');
  
    const api_key = await pullParameters(serverID);
    
    // Start typing indicator
    message.channel.sendTyping();
  
    openai.callStatic(content, 0, 1000, 'gpt-3.5-turbo', '', api_key)
      .then(response => {
        const embed = new EmbedBuilder()
        .setTitle('Response')
        .setDescription(response)
        .setColor('#4F45E4');
  
        message.channel.send({ embeds: [embed] });
      })
      .catch(error => {
        const embed = new EmbedBuilder()
        .setTitle('ERROR (request-exception)')
        .setDescription('We did not get the response we expected, please check your API key')
        .setColor('#4F45E4')
        .addFields({ name: 'Server: ', value: error, inline: true });
  
        message.channel.send({ embeds: [embed] });
      });
  }
  
  if (message.content.startsWith('.set')){
    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      const serverID = message.guild.id;
      const [_, key, value] = message.content.split(' ');
      
      if(key != null){
        if (key.toLowerCase() === 'apikey') {
          await storeParameters(serverID, value);
          message.channel.send('API key set successfully.');
        }
      }
  }else{
    const embed = new EmbedBuilder()
    .setTitle('Not Authorized')
    .setDescription('This function is only for administrators.')
    .setColor('#4F45E4') 
    message.channel.send({ embeds: [embed] });
  }
  }

  if (message.content.startsWith('.info')) {
    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    const serverID = message.guild.id;
    var api_key = await pullParameters(serverID);

    const embed = new EmbedBuilder()
      .setTitle('Info')
      .setDescription('View your current configuration')
      .setColor('#4F45E4')
      .addFields({ 
        name: 'key', 
        value: api_key.length > 15 ? 'Set' : api_key, 
        inline: true
    })    
      .addFields({ name: 'server ID', value: serverID, inline: true})
      message.channel.send({ embeds: [embed] });
  } else{
    const embed = new EmbedBuilder()
    .setTitle('Not Authorized')
    .setDescription('This function is only for administrators.')
    .setColor('#4F45E4') 
    message.channel.send({ embeds: [embed] });
  }
}

  if (message.content.startsWith('.help')) {

    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      const embed = new EmbedBuilder()
        .setTitle('GPT Bot')
        .setDescription('Documentation for all GPTbot Commands')
        .setColor('#4F45E4')
        .addFields(
          { name: 'message', value: 'message chatGPT | message <prompt>', inline: true},
          { name: 'ping', value: 'receive response time from server', inline: true },
          { name: 'help', value: 'list of all valid commands', inline: true },
          { name: '--', value: 'ADMIN ZONE', inline: true },
          { name: 'set (admin)', value: 'Set your API key | set <apikey <value>', inline: true },
          { name: 'setup (admin)', value: 'Instructions on how to setup this bot', inline: true },
        );

        message.channel.send({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle('Help Section')
        .setDescription('How to use our chatbot.')
        .setColor('#4F45E4')
        .addFields(
          { name: 'message', value: 'message chatGPT | message <prompt>', inline: true },
          { name: 'ping', value: 'receive response time from server', inline: true },
          { name: 'help', value: 'list of all valid commands', inline: true }
        );

      message.channel.send({ embeds: [embed] });
    }
  }
});

async function pullParameters(serverID) {
  try{
    const record = await db_manager.read_db(serverID);
    return record;
  }catch(Error){
    return "Not Found";
  }
}

async function storeParameters(serverID, api_key) {
  db_manager.add(serverID, api_key);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

client.login(process.env.DISCORD_TOKEN);
