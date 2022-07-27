import { PermissionFlagsBits } from 'discord.js'

export default {
    name: 'test',
    description: 'sasasa',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 't',
            description: 'bla bla',
            type: 3,
        }
    ],
    async execute({ interaction, client, Database }) {
        
        let CreateInstantInvite = 1n
        let KickMembers = 2n
        let BanMembers = 4n
        let Administrator = 8n
        let ManageChannels = 16n
        let ManageGuild = 32n
        let AddReactions = 64n
        let ViewAuditLog = 128n
        let PrioritySpeaker = 256n
        let Stream = 512n
        let ViewChannel = 1024n
        let SendMessages = 2048n
        let SendTTSMessages = 4096n
        let ManageMessages = 8192n
        let EmbedLinks = 16384n
        let AttachFiles = 32768n
        let ReadMessageHistory = 65536n
        let MentionEveryone = 131072n
        let UseExternalEmojis = 262144n
        let ViewGuildInsights = 524288n
        let Connect = 1048576n
        let Speak = 2097152n
        let MuteMembers = 4194304n
        let DeafenMembers = 8388608n
        let MoveMembers = 16777216n
        let UseVAD = 33554432n
        let ChangeNickname = 67108864n
        let ManageNicknames = 134217728n
        let ManageRoles = 268435456n
        let ManageWebhooks = 536870912n
        let ManageEmojisAndStickers = 1073741824n
        let UseApplicationCommands = 2147483648n
        let RequestToSpeak = 4294967296n
        let ManageEvents = 8589934592n
        let ManageThreads = 17179869184n
        let CreatePublicThreads = 34359738368n
        let CreatePrivateThreads = 68719476736n
        let UseExternalStickers = 137438953472n
        let SendMessagesInThreads = 274877906944n
        let UseEmbeddedActivities = 549755813888n
        let ModerateMembers = 1099511627776n

        const perms = [
            CreateInstantInvite,
            KickMembers,
            BanMembers,
            Administrator,
            ManageChannels,
            ManageGuild,
            AddReactions,
            ViewAuditLog,
            PrioritySpeaker,
            Stream,
            ViewChannel,
            SendMessages,
            SendTTSMessages,
            ManageMessages,
            EmbedLinks,
            AttachFiles,
            ReadMessageHistory,
            MentionEveryone,
            UseExternalEmojis,
            ViewGuildInsights,
            Connect,
            Speak,
            MuteMembers,
            DeafenMembers,
            MoveMembers,
            UseVAD,
            ChangeNickname,
            ManageNicknames,
            ManageRoles,
            ManageWebhooks,
            ManageEmojisAndStickers,
            UseApplicationCommands,
            RequestToSpeak,
            ManageEvents,
            ManageThreads,
            CreatePublicThreads,
            CreatePrivateThreads,
            UseExternalStickers,
            SendMessagesInThreads,
            UseEmbeddedActivities,
            ModerateMembers
        ]

        console.log(perms.map(perm => JSON.stringify({ value: `${BigInt(perm)}` })))

        const msg = await interaction.reply({ content: `ok`, fetchReply: true })
    }
}