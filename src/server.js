/**
 * The core server that runs on a Cloudflare worker.
 */

import { Router } from "itty-router";
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from "discord-interactions";
import JsonResponse from "./core/JsonResponse.js";
import { applicationComponentRouteHandler } from "./routes/applicationComponentRouteHandler.js";
import { messageComponentRouteHandler } from "./routes/messageComponentRouteHandler.js";
import { logMessage } from "./managers/logger.js";

const router = Router();

/**
 * A simple :wave: hello page to verify the worker is working.
 */
router.get("/", (request, env) => {
  return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

/**
 * Main route for all requests sent from Discord.  All incoming messages will
 * include a JSON payload described here:
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
router.post("/", async (request, env) => {
  const message = await request.json();
  switch (message.type) {
    case InteractionType.PING: {
      return new JsonResponse({
        type: InteractionResponseType.PONG,
      });
    }
    case InteractionType.APPLICATION_COMMAND: {
      return applicationComponentRouteHandler(message, env);
    }
    case InteractionType.MESSAGE_COMPONENT: {
      return messageComponentRouteHandler(message, env);
    }
    default: {
      console.error("Unknown Type");
      return new JsonResponse({ error: "Unknown Type" }, { status: 400 });
    }
  }
});

router.all("*", () => new Response("Not Found.", { status: 404 }));

export default {
  /**
   * Every request to a worker will start in the `fetch` method.
   * Verify the signature with the request, and dispatch to the router.
   * @param {*} request A Fetch Request object
   * @param {*} env A map of key/value pairs with env vars and secrets from the cloudflare env.
   * @returns
   */
  async fetch(request, env) {
    if (request.method === "POST") {
      // Using the incoming headers, verify this request actually came from discord.
      const signature = request.headers.get("x-signature-ed25519");
      const timestamp = request.headers.get("x-signature-timestamp");
      const body = await request.clone().arrayBuffer();
      const isValidRequest = verifyKey(
        body,
        signature,
        timestamp,
        env.DISCORD_PUBLIC_KEY
      );
      if (!isValidRequest) {
        await logMessage(env, "Not valid request");
        return new Response("Bad request signature.", { status: 401 });
      }
    }

    // Dispatch the request to the appropriate route
    return router.handle(request, env).catch(async (exception) => {
      await logMessage(env, exception);
    });
  },
};
