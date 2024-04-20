import JsonResponse from "../core/JsonResponse.js";

export const inviteManager = (message, env) => {
  const applicationId = env.DISCORD_APPLICATION_ID;
  const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${applicationId}&scope=applications.commands`;
  return new JsonResponse({
    type: 4,
    data: {
      content: INVITE_URL,
      flags: 64,
    },
  });
};
