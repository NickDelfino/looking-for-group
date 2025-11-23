import JsonResponse from "../core/JsonResponse.js";
import {
  ButtonStyleTypes,
  InteractionResponseType,
  MessageComponentTypes,
} from "discord-interactions";
import { JOIN_GROUP_COMMAND, LEAVE_GROUP_COMMAND } from "../commands.js";

export const createInitialLfgMessage = async (message, env) => {
  let startTime = getStartTimeFromMessage(message);
  let lookingForGroupMessage = createLookingForGroupMessage(message, startTime);

  let startTimeToBind = startTime !== undefined ? startTime : null;

  await env.DB.prepare(
    "INSERT INTO LookingForGroupMessages " +
      " (messageId, content, startTime, createdBy, createdAt) " +
      " VALUES (?1, ?2, ?3, ?4, ?5)"
  )
    .bind(
      message.id,
      lookingForGroupMessage,
      startTimeToBind,
      message.member.user.id,
      Date.now()
    )
    .run();

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

  let dateTime = message.data.options.find(
    (option) => option.name === "datetime"
  );
  if (dateTime) {
    let number = validateAndRetrieveDatetime(dateTime.value);
    countdownString = `on <t:${number.getTime() / 1000}:f>`;
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

function validateAndRetrieveDatetime(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new JsonResponse(
      { error: "Datetime is not valid. Double check format." },
      { status: 400 }
    );
  }

  return date;
}

function getStartTimeFromMessage(message) {
  let startTime;

  const timeFromNowMinutes = validateAndReturnTimeFromOption(
    message.data.options.find((option) => option.name === "time")
  );

  if (timeFromNowMinutes || timeFromNowMinutes === 0) {
    startTime = Math.round(Date.now() + Number(timeFromNowMinutes) * 60 * 1000);
  }

  let dateTime = message.data.options.find(
    (option) => option.name === "datetime"
  );
  if (dateTime) {
    let validatedDateTime = validateAndRetrieveDatetime(dateTime.value);
    startTime = validatedDateTime.getTime();
  }

  return startTime;
}

export const joinLfgMessage = async (message, env, joinedGroup) => {
  const userId = message.member.user.id;
  const interactionId = message.message.interaction.id;

  const currentActiveMessage = await env.DB.prepare(
    "SELECT content FROM LookingForGroupMessages WHERE messageId = ?1"
  )
    .bind(interactionId)
    .first();

  if (!currentActiveMessage) {
    throw new JsonResponse(
      { error: "Could not find the requested LFG message." },
      { status: 404 }
    );
  }

  if (joinedGroup) {
    await env.DB.prepare(
      "INSERT INTO JoinedUsers(userId, messageId, joinedAt)" +
        "VALUES (?1, ?2, ?3) " +
        "ON CONFLICT(userId, messageId) DO NOTHING;"
    )
      .bind(userId, interactionId, Date.now())
      .run();
  } else {
    await env.DB.prepare(
      "DELETE FROM JoinedUsers WHERE userId = ?1 AND messageId = ?2"
    )
      .bind(userId, interactionId)
      .run();
  }

  const joinedUsersResult = await env.DB.prepare(
    "SELECT userId FROM JoinedUsers WHERE messageId = ?1 ORDER BY joinedAt ASC"
  )
    .bind(interactionId)
    .all();

  const joinedUsers = joinedUsersResult.results.map((row) => row.userId);

  const joinedMessaged = `${currentActiveMessage.content} ${getCurrentActiveJoinedList(
    joinedUsers
  )}`;

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
