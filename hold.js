client.on('guildCreate', async (guild) => {
  const { Permissions } = require('discord.js');
  const adminMembers = guild.members.cache.filter(
    (member) => member.permissions && member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
  );

  const message = `
    Hello Admin! Thank you for inviting ChatGPT to your server!

    To get started, you need to set the API key and chatbotID using the set command.
    For more information, the .help command is always available in the server.
    Step by step instructions are provided below.
  `;

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
      await member.send(message);
      await member.send(embed);
    } catch (error) {
      console.log(`Failed to send a message to ${member.user.tag}`);
    }
  }
});