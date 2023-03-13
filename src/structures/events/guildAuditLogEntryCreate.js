import { Guild, GuildAuditLogsEntry } from 'discord.js';
import { SaphireClient as client } from "../../classes/index.js";
import channelCreate from './functions/channelCreate.js';
import channelDelete from "./functions/channelDelete.js";
import integrationCreate from "./functions/integrationCreate.js";
import integrationDelete from "./functions/integrationDelete.js";

const guildEntriesFunctions = {
    Guild: {},
    Channel: {
        Create: channelCreate,
        Delete: channelDelete,
        // Update: channelUpdate is enable at event listener
    },
    User: {
        // Delete: deleteUser
    },
    Role: {},
    Invite: {},
    Webhook: {},
    Emoji: {},
    Message: {},
    Integration: {
        Create: integrationCreate,
        Delete: integrationDelete
    },
    StageInstance: {},
    Sticker: {},
    Thread: {},
    GuildScheduledEvent: {},
    ApplicationCommandPermission: {}
}

/**
 * @param { GuildAuditLogsEntry } auditLogEntry
 * @param { Guild } auditLogEntry
 */
client.on('guildAuditLogEntryCreate', async (auditLogEntry, guild) => {

    /**
     * targetType = Guild | Channel | User | Role | Invite | Webhook | Emoji | Message | Integration | StageInstance | Sticker | Thread | GuildScheduledEvent | ApplicationCommandPermission
     * actionType = Create | Delete | Update | All
     */

    const { targetType, actionType } = auditLogEntry
    const execute = guildEntriesFunctions[targetType][actionType]
    return execute?.(auditLogEntry, guild)
})