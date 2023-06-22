# GPT-bot - A GPT-3 Powered Discord Bot

GPT-bot is a Discord bot powered by OpenAI's GPT-3 model. It can process and respond to messages using a GPT-3 model, resulting in near-human level interactions. It also includes server-specific configuration commands that are only accessible by administrators.

## Features

1. **GPT-3 Conversations**: With GPT-bot, you can interact with GPT-3 right within your Discord server. It provides near-human level responses to your prompts.

2. **Server-Specific Configuration**: GPT-bot supports server-specific configurations, allowing administrators to set the API key for each server individually. 

3. **Ping Command**: This command allows you to check the response time between the bot and your server.

4. **Administrator Commands**: Administrators have access to additional commands, such as setting the API key for the server.

## Getting Started

To add GPT-bot to your server, you'll need to have 'Manage Server' permissions. Once added, you will receive a message with further instructions. 

## Commands

### For All Users:

- `.ping`: Checks the response time between the bot and the server.
- `.message <prompt>` or `.m <prompt>`: Sends a message to the chatbot. The bot responds to your prompt.
- `.help`: Provides a list of all valid commands.

### For Administrators:

- `.set apikey <value>`: Sets the API key for the server.
- `.info`: Provides information about the current configuration of the bot in your server.

## Installation and Setup

You'll need to have Node.js installed to run the bot. Here are the steps to get it set up:

1. Clone the repository.

2. Navigate to the project folder and run `npm install` to install all necessary dependencies.

3. Create a `.env` file at the root of the project and add your Discord bot token like so:

```env
DISCORD_TOKEN=<Your Discord Token>
```

4. Run `node chatGPT.js` to start the bot.

5. Invite the bot to your server and follow the instructions sent by the bot.

## Configuring the Bot in Your Server

After inviting the bot to your server, it will send a message to the administrator with instructions for setting up the API key. Make sure to follow these instructions carefully to ensure the bot functions correctly.

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## License

This project is licensed under the terms of the MIT license.