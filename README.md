# Looking for Group (LFG)

[What is it?](#what-is-it)

[Set up local dev environment](#setup-local-dev-environment)

[Contribute](#contribute)

## What is it? 

Looking for Group ([add the bot here](https://discord.com/oauth2/authorize?client_id=1041907222508212344&scope=applications.commands)) is a Discord bot which helps you find people in your server to play games with. You
can announce the game you want to play, when you want to play (minutes from now), and let specific people know you want to play. The bot message has an 
"I'm in!" button other users in the Discord channel can press to update the message with their handle. See the demo below.

![lfg_demo](https://user-images.githubusercontent.com/6242133/215342891-f1b4e967-2903-45de-aca3-e2df6897cc78.gif)

## Setup local dev environment

This [guide](https://discord.com/developers/docs/tutorials/hosting-on-cloudflare-workers) should be followed to setup a discord test bot and cloudflare account which can 
then leverage this code. 

### Register commands
When registering new commands or updating existing commands, run this on the command line:
`DISCORD_TOKEN=<INSERT TOKEN> DISCORD_APPLICATION_ID=<INSERT ID> node src/register.js`

### Run locally

To deploy to cloudflare, copy the `wrangler.toml.example` and rename it to
`wrangler.toml`. Fill in the blanks with the correct information. You'll need your cloudflare account id,
keyspace id, and preview keyspace id.

To run locally, start up the cloudflare worker locally: `npm run dev`

To get a routable external url, run this command: `npm run ngrok`

This returned url needs to get pasted in the interactions endpoint text box on your app development page.

### Deploy to cloudflare

Once this is complete, to deploy to cloudflare, use `npm run publish`.

The above assumes the wrangler CLI has been installed and connected to the correct project.

### Cloudflare D1 Sql Setup

[D1 Migrations Instructions](https://developers.cloudflare.com/workers/wrangler/commands/#d1-migrations-create)

#### Running Migrations
Dev:
`wrangler d1 migrations apply <QA_DATABASE_NAME> -e dev --remote`

Production:
`wrangler d1 migrations apply <PROD_DATABASE_NAME> -e production --remote`

## Contribute

All contributions welcome. Feel free to create issues for features or bug fixes. 

Join the development and community [discord server](https://discord.gg/MK2WZhuDNp)!

