import { ApplicationCommandOptionType } from 'discord.js'
import { PermissionsTranslate } from '../../../../util/Constants.js'
import { Emojis as e } from '../../../../util/util.js'

export default {
    name: 'permissions',
    name_localizations: { 'pt-BR': 'permissões' },
    description: '[util] Verifique as permissões de alguém no servidor',
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
    api_data: {
        name: "permissions",
        description: "Veja as permissões de alguém ou a sua",
        category: "Utilidades",
        synonyms: ["permissões"],
        tags: [],
perms: {
            user: [],
            bot: []
        }
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
                permissions: ['UseVAD', 'ViewChannel', 'UseExternalStickers', 'UseExternalEmojis', 'UseApplicationCommands', 'Stream', 'Speak', 'AddReactions', 'Connect', 'CreateInstantInvite', 'ReadMessageHistory', 'RequestToSpeak', 'SendMessages', 'SendMessagesInThreads', 'SendVoiceMessages']
            },
            secondary: {
                fieldName: '📝 Secundárias',
                permissions: ['UseEmbeddedActivities', 'AttachFiles', 'ChangeNickname', 'CreatePrivateThreads', 'CreatePublicThreads', 'EmbedLinks', 'SendTTSMessages']
            },
            moderator: {
                fieldName: `${e.ModShield} Moderação`,
                permissions: ['ViewAuditLog', 'PrioritySpeaker', 'MuteMembers', 'MoveMembers', 'ModerateMembers', 'BanMembers', 'DeafenMembers', 'KickMembers', 'ManageMessages', 'ManageNicknames', 'ManageThreads']
            },
            manager: {
                fieldName: '⚙️ Administrativo',
                permissions: ['Administrator', 'ManageChannels', 'ManageEmojisAndStickers', 'ManageEvents', 'ManageGuild', 'ViewGuildInsights', 'ManageRoles', 'ManageWebhooks', 'MentionEveryone']
            }
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