import { INVITE_COMMAND, LFG_COMMAND } from "../commands.js";
import { createInitialLfgMessage } from "../managers/messageManager.js";
import { inviteManager } from "../managers/inviteManager.js";
import JsonResponse from "../core/JsonResponse.js";

export const applicationComponentRouteHandler = (message, env) => {
  switch (message.data.name.toLowerCase()) {
    case LFG_COMMAND.name.toLowerCase(): {
      return createInitialLfgMessage(message, env);
    }
    case INVITE_COMMAND.name.toLowerCase(): {
      return inviteManager(message, env);
    }
    default: {
      console.error("Unknown Command");
      return new JsonResponse({ error: "Unknown Type" }, { status: 400 });
    }
  }
};
