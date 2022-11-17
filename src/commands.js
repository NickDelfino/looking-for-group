/**
 * Share command metadata from a common spot to be used for both runtime
 * and registration.
 */

export const LFG_COMMAND = {
    name: 'lfg',
    description: 'Start the lfg dialog.',
    type: 1,
    options: [
        {
            name: "game",
            description: "The game you are looking to find a group for.",
            type: 3,
            required: true
        },
        {
            name: "time",
            description: "The number of minutes until you will start playing. Also accepts word 'now'.",
            type: 3,
            required: false
        },
        {
            name: "mention",
            description: "Mention user and roles who you want to see the message.",
            type: 3,
            required: false
        }
    ]
};

export const INVITE_COMMAND = {
    name: 'invite',
    description: 'Get an invite link to add the bot to your server.',
};

export const JOIN_GROUP_COMMAND = {
    name: 'join-group',
    description: 'Joins the user\'s group message.'
};