import { JOIN_GROUP_COMMAND, LEAVE_GROUP_COMMAND } from "../commands.js";
import JsonResponse from "../core/JsonResponse.js";
import { joinLfgMessage } from "../managers/messageManager.js";

export const messageComponentRouteHandler = (message, env) => {
  switch (message.data.custom_id.toLowerCase()) {
    case JOIN_GROUP_COMMAND.name.toLowerCase(): {
      return joinLfgMessage(message, env, true);
    }
    case LEAVE_GROUP_COMMAND.name.toLowerCase(): {
      return joinLfgMessage(message, env, false);
    }
    default:
      console.error("Unknown Command");
      return new JsonResponse({ error: "Unknown Type" }, { status: 400 });
  }
};
