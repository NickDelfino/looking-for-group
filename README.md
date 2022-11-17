# looking-for-group

Technicals are based on this guide and repo therein: https://discord.com/developers/docs/tutorials/hosting-on-cloudflare-workers

## Register commands
When registering new commands or updating existing commands, run this on the command line: 
`DISCORD_TOKEN=<INSERT TOKEN> DISCORD_APPLICATION_ID=<INSERT ID> node src/register.js`

## Run dev locally

To run locally, start up the cloudflare worker locally: `npm run dev`

To get a routable external url, run this command: `npm run ngrok`

This returned url needs to get pasted in the interactions endpoint text box in the developer page:
https://discord.com/developers/applications/1041907222508212344/information

## Deploy to cloudflare

To deploy to cloudflare, use `npm run publish`.

The above assumes the wrangler CLI has been installed and connected to the correct project.
