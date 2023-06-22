#!/bin/bash

# Execute each command sequentially, waiting for the previous one to finish,
# used for hosting on the linode server, as the node version automatically
# goes down for some reason.

# Source the .bashrc file
source ~/.bashrc

# Install Node.js version 18 using NVM
nvm install 18

# Run the chatGPT.js script
node chatGPT.js
