/**
 * The core server that runs on a Cloudflare worker.
 */

import {Router} from 'itty-router';
import {
    InteractionResponseType,
    InteractionType,
    verifyKey,
} from 'discord-interactions';
import {INVITE_COMMAND, JOIN_GROUP_COMMAND, LFG_COMMAND} from "./commands.js";
import JsonResponse from './core/JsonResponse.js';
import {joinedGroup, lookingForGroup} from "./routes/lookingForGroup.js";
import {invite} from "./routes/invite";

const router = Router();

/**
 * A simple :wave: hello page to verify the worker is working.
 */
router.get('/', (request, env) => {
    return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

/**
 * Main route for all requests sent from Discord.  All incoming messages will
 * include a JSON payload described here:
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
router.post('/', async (request, env) => {
    const message = await request.json();
    if (message.type === InteractionType.PING) {
        // The `PING` message is used during the initial webhook handshake, and is
        // required to configure the webhook in the developer portal.
        return new JsonResponse({
            type: InteractionResponseType.PONG,
        });
    } else if (message.type === InteractionType.APPLICATION_COMMAND) {
        // Most user commands will come as `APPLICATION_COMMAND`.
        switch (message.data.name.toLowerCase()) {
            case LFG_COMMAND.name.toLowerCase(): {
                return lookingForGroup(message, env);
            }
            case INVITE_COMMAND.name.toLowerCase(): {
                return invite(message, env);
            }
            default:
                console.error('Unknown Command');
                return new JsonResponse({error: 'Unknown Type'}, {status: 400});
        }
    } else if (message.type === InteractionType.MESSAGE_COMPONENT) {
        switch (message.data.custom_id.toLowerCase()) {
            case JOIN_GROUP_COMMAND.name.toLowerCase(): {
                return joinedGroup(message, env);
            }
            default:
                console.error('Unknown Command');
                return new JsonResponse({error: 'Unknown Type'}, {status: 400});
        }
    } else {
        console.error('Unknown Type');
        return new JsonResponse({error: 'Unknown Type'}, {status: 400});
    }
});

router.all('*', () => new Response('Not Found.', {status: 404}));

export default {
    /**
     * Every request to a worker will start in the `fetch` method.
     * Verify the signature with the request, and dispatch to the router.
     * @param {*} request A Fetch Request object
     * @param {*} env A map of key/value pairs with env vars and secrets from the cloudflare env.
     * @returns
     */
    async fetch(request, env) {
        if (request.method === 'POST') {
            // Using the incoming headers, verify this request actually came from discord.
            const signature = request.headers.get('x-signature-ed25519');
            const timestamp = request.headers.get('x-signature-timestamp');
            const body = await request.clone().arrayBuffer();
            const isValidRequest = verifyKey(
                body,
                signature,
                timestamp,
                env.DISCORD_PUBLIC_KEY
            );
            if (!isValidRequest) {
                console.error('Invalid Request');
                return new Response('Bad request signature.', {status: 401});
            }
        }

        // Dispatch the request to the appropriate route
        return router.handle(request, env);
    },
};
