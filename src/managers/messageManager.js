import JsonResponse from "../core/JsonResponse.js";
import {
  ButtonStyleTypes,
  InteractionResponseType,
  MessageComponentTypes,
} from "discord-interactions";
import { JOIN_GROUP_COMMAND, LEAVE_GROUP_COMMAND } from "../commands.js";

export const createInitialLfgMessage = async (message, env) => {
  let lookingForGroupMessage = createLookingForGroupMessage(message);

  await env.LFG.put(
    message.id,
    JSON.stringify({
      joinedUsers: [],
      originalMessage: lookingForGroupMessage,
    })
  );

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: lookingForGroupMessage,
      components: [
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            {
              type: MessageComponentTypes.BUTTON,
              label: "Join Group!",
              style: ButtonStyleTypes.PRIMARY,
              custom_id: JOIN_GROUP_COMMAND.name.toLowerCase(),
            },
            {
              type: MessageComponentTypes.BUTTON,
              label: "Leave Group!",
              style: ButtonStyleTypes.DANGER,
              custom_id: LEAVE_GROUP_COMMAND.name.toLowerCase(),
            },
          ],
        },
      ],
    },
  });
};

const createLookingForGroupMessage = (message) => {
  const userId = message.member.user.id;

  let countdownString = "";

  const timeFromNowMinutes = validateAndReturnTimeFromOption(
    message.data.options.find((option) => option.name === "time")
  );

  if (timeFromNowMinutes || timeFromNowMinutes === 0) {
    const currentTime = Math.round(
      (Date.now() + Number(timeFromNowMinutes) * 60 * 1000) / 1000
    );
    countdownString = `<t:${currentTime}:R>`;
  }

  let gameName = message.data.options.find(
    (option) => option.name === "game"
  ).value;

  return `<@${userId}> wants to play \`${gameName}\` ${countdownString}. ${getUserOrRoleMention(
    message.data
  )}`;
};

const validateAndReturnTimeFromOption = (timeFromNowMinutesOption) => {
  if (!timeFromNowMinutesOption) {
    return null;
  }

  let timeFromNowMinutes = timeFromNowMinutesOption.value;

  if (timeFromNowMinutes === "now") {
    return 0;
  }

  if (isNaN(Number(timeFromNowMinutes))) {
    throw new JsonResponse(
      { error: "Needs to be a number or the word `now`." },
      { status: 400 }
    );
  }

  return timeFromNowMinutes;
};

const getUserOrRoleMention = (messageData) => {
  const mention = messageData.options.find(
    (option) => option.name === "mention"
  );
  if (!mention) {
    return "";
  }

  return ` Do you want to play ${mention.value}?`;
};

export const joinLfgMessage = async (message, env, joinedGroup) => {
  const userId = message.member.user.id;
  const interactionId = message.message.interaction.id;

  const currentActiveMessage = JSON.parse(await env.LFG.get(interactionId));

  if (!currentActiveMessage.joinedUsers.includes(userId) && joinedGroup) {
    currentActiveMessage.joinedUsers.push(userId);
  } else if (!joinedGroup) {
    currentActiveMessage.joinedUsers = currentActiveMessage.joinedUsers.filter(
      (id) => {
        return id !== userId;
      }
    );
  }
  await env.LFG.put(interactionId, JSON.stringify(currentActiveMessage));

  const joinedMessaged = `${
    currentActiveMessage.originalMessage
  } ${getCurrentActiveJoinedList(currentActiveMessage.joinedUsers)}`;

  try {
    return new JsonResponse({
      type: InteractionResponseType.UPDATE_MESSAGE,
      data: {
        content: joinedMessaged,
        components: [
          {
            type: MessageComponentTypes.ACTION_ROW,
            components: [
              {
                type: MessageComponentTypes.BUTTON,
                label: "Join Group!",
                style: ButtonStyleTypes.PRIMARY,
                custom_id: JOIN_GROUP_COMMAND.name.toLowerCase(),
              },
              {
                type: MessageComponentTypes.BUTTON,
                label: "Leave Group!",
                style: ButtonStyleTypes.DANGER,
                custom_id: LEAVE_GROUP_COMMAND.name.toLowerCase(),
              },
            ],
          },
        ],
      },
    });
  } catch (err) {
    console.error("Error sending message:", err);
  }
};

const getCurrentActiveJoinedList = (joinedUsers) => {
  if (joinedUsers.length > 0) {
    return (
      "\n\nJoined group: " +
      joinedUsers.map((activeUserId) => `<@${activeUserId}>`).join(",")
    );
  }
  return "";
};
