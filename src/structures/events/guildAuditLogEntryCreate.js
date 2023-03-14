import { Guild, GuildAuditLogsEntry } from 'discord.js';
import { SaphireClient as client } from "../../classes/index.js";
import channelCreate from './functions/channelCreate.js';
import channelDelete from "./functions/channelDelete.js";
import integrationCreate from "./functions/integrationCreate.js";
import integrationDelete from "./functions/integrationDelete.js";

const guildEntriesFunctions = {
    Guild: {
        // Create: Unused
        // Delete: Unused
        // Update: When a guild is updated
        // All: ??
    },
    Channel: {
        Create: channelCreate,
        Delete: channelDelete,
        // Update: channelUpdate is enable at event listener
        // All: ??
    },
    User: {
        // Create: Unused
        // Delete: Unused
        // Update: Emit when a member changes his names
        // All: ??
    },
    Role: {
        // Create: When a role is created
        // Delete: When a role is deleted
        // Update: When a role is updated
        // All: ??
    },
    Invite: {
        // Create: When an invite is created
        // Delete: When an invite is deleted
        // Update: Unused
        // All: ??
    },
    Webhook: {
        // Create: When a webhook is created
        // Delete: When a webhook is deleted
        // Update: When a webhook is updated
        // All: ??
    },
    Emoji: {
        // Create: When an emoji is created
        // Delete: When an emoji is deleted
        // Update: When an emoji is updated
        // All: ??
    },
    Message: {
        // Create: Unused
        // Delete: When a message is deleted from other user, different from the author
        // Update: Unused
        // All: ??
    },
    Integration: {
        Create: integrationCreate,
        Delete: integrationDelete,
        // Update: Unused
        // All: ??
    },
    StageInstance: {
        // Create: ??
        // Delete: ??
        // Update: ??
        // All: ??
    },
    Sticker: {
        // Create: When a sticker is created
        // Delete: When a sticker is deleted
        // Update: When a sticker is updated
        // All: ??
    },
    Thread: {
        // Create: When a thread is created
        // Delete: When a thread is deleted
        // Update: When a thread is updated
        // All: ??
    },
    GuildScheduledEvent: {
        // Create: When a guild schedule event is created
        // Delete: When a guild schedule event is deleted
        // Update: When a guild schedule event is updated
        // All: ??
    },
    ApplicationCommandPermission: {
        // Create: ??
        // Delete: ??
        // Update: ??
        // All: ??
    },
    AutoModeration: { // This action type isn't documented
        // Create: ??
        // Delete: ??
        // Update: When a configuration ou rule was update
        // All: Emitted here, but why?
    }
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
    const execute = guildEntriesFunctions[targetType]?.[actionType]
    return execute?.(auditLogEntry, guild)
})