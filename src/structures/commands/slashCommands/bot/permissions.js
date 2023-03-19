import { ApplicationCommandOptionType } from 'discord.js'
import { PermissionsTranslate } from '../../../../util/Constants.js'
import { Emojis as e } from '../../../../util/util.js'

export default {
    name: 'permissions',
    name_localizations: { 'pt-BR': 'permissões' },
    description: '[bot] Verifique as permissões de alguém no servidor',
    dm_permission: false,
    type: 1,
    database: false,
    options: [
        {
            name: 'member',
            name_localizations: { 'pt-BR': 'membro' },
            description: 'Escolha um usuário para ver as permissões dele',
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: 'channel',
            name_localizations: { 'pt-BR': 'canal' },
            description: 'Escolha um canal para verificar as permissões nele',
            type: ApplicationCommandOptionType.Channel
        }
    ],
    helpData: {
        color: '',
        description: '',
        permissions: [],
        fields: []
    },
    async execute({ interaction, client }) {

        const { options } = interaction
        const member = options.getMember('member')
        const channel = options.getChannel('channel')
        const checkPermissions = channel ? channel.permissionsFor(member, false) : member.permissions
        const permissions = Object.entries(checkPermissions.serialize())

        const categories = {
            basic: {
                fieldName: '⭐ Permissions Básicas',
                permissions: ['UseVAD', 'ViewChannel', 'UseExternalStickers', 'UseExternalEmojis', 'UseApplicationCommands', 'Stream', 'Speak', 'AddReactions', 'Connect', 'CreateInstantInvite', 'ReadMessageHistory', 'RequestToSpeak', 'SendMessages', 'SendMessagesInThreads']
            },
            secondary: {
                fieldName: '📝 Secundárias',
                permissions: ['AttachFiles', 'ChangeNickname', 'CreatePrivateThreads', 'CreatePublicThreads', 'EmbedLinks']
            },
            moderator: {
                fieldName: `${e.ModShield} Moderação`,
                permissions: ['ViewAuditLog', 'UseEmbeddedActivities', 'PrioritySpeaker', 'MuteMembers', 'MoveMembers', 'ModerateMembers', 'BanMembers', 'DeafenMembers', 'KickMembers', 'ManageMessages', 'ManageNicknames', 'ManageThreads']
            },
            manager: {
                fieldName: '⚙️ Administrativo',
                permissions: ['Administrator', 'ManageChannels', 'ManageEmojisAndStickers', 'ManageEvents', 'ManageGuild', 'ViewGuildInsights', 'ManageRoles', 'ManageWebhooks', 'MentionEveryone', 'SendTTSMessages']
            },
        }

        return await interaction.reply({
            embeds: [{
                color: client.blue,
                title: '📜 Lista de Permissões',
                description: `Esta é uma lista completa de permissões\ndo membro ${member.displayName} ${channel ? `no canal ${channel}` : 'no servidor'}.`,
                fields: Object.keys(categories).map(category => mapCategory(category))
            }],
            ephemeral: true
        })

        function mapCategory(category) {
            const categoryData = categories[category]
            const permissionsMapped = permissions
                .filter(([perm]) => categoryData.permissions.includes(perm))
                .map(perm => `${perm[1] ? e.CheckV : e.DenyX} ${PermissionsTranslate[perm[0]] || perm[0]}`)
                .join('\n')

            return { name: categoryData.fieldName, value: permissionsMapped }
        }
    }
}