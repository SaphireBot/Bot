import { ApplicationCommandOptionType } from "discord.js"
import { Modals } from "../../../../classes/index.js"
import { Permissions, DiscordPermissons } from "../../../../util/Constants.js"
import deleteChannel from "../../functions/channel/delete.channel.js"
import lockChannel from "../../functions/channel/lock.channel.js"
import nsfwDisableChannel from "../../functions/channel/nsfw-disable.channel.js"
import nsfwActiveChannel from "../../functions/channel/nsfw-enable.channel.js"

export default {
    name: 'channel',
    description: '[moderation] Gerencie os canais do servidor atraves deste comando',
    dm_permission: false,
    default_member_permissions: Permissions.ManageChannels,
    type: 1,
    options: [
        {
            name: 'method',
            description: 'Escolha uma função a ser executada',
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'Trancar canal (lock)',
                    value: 'lock'
                },
                {
                    name: 'Destrancar canal (unlock)',
                    value: 'unlock'
                },
                {
                    name: 'Ativar +18 Anos (NSFW)',
                    value: 'nsfw-enable'
                },
                {
                    name: 'Desativar +18 Anos (NSFW)',
                    value: 'nsfw-disable'
                },
                {
                    name: 'Deletar canal',
                    value: 'delete'
                },
                {
                    name: 'Clonar canal',
                    value: 'clone'
                },
                {
                    name: 'Criar um convite',
                    value: 'invite'
                },
                {
                    name: 'Editar tópico',
                    value: 'topic' // Modal
                },
                {
                    name: 'Editar nome',
                    value: 'name' // Modal
                },
                {
                    name: 'Editar categoria',
                    value: 'category' // Select menu
                },
                {
                    name: 'Editar tempo de resposta (cooldown)',
                    value: 'cooldown'
                }
            ],
            required: true
        },
        {
            name: 'channel',
            description: 'Canal que receberá a função',
            type: ApplicationCommandOptionType.Channel,
            // channel_types: [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildVoice],
            required: true
        }
    ],
    helpData: {
        description: 'Comando para administrar o canal facilmente'
    },
    async execute({ interaction, e, client }) {

        const { options, guild } = interaction

        if (!guild.clientHasPermission(DiscordPermissons.ManageChannels))
            return await interaction.reply({
                content: `${e.Deny} | Eu preciso da permissão **\`${DiscordPermissons.ManageChannels}\`** para liberar este comando.`,
                ephemeral: true
            })

        const channel = options.getChannel('channel')
        const method = options.getString('method')

        if (!channel || !method)
            return await interaction.reply({
                content: `${e.Deny} | Informações do comando estão incompletas.`,
                ephemeral: true
            })

        if (!channel.manageable)
            return await interaction.reply({
                content: `${e.Deny} | Eu não tenho permissão suficiente para gerenciar o canal ${channel}.`,
                ephemeral: true
            })

        if (method === 'name')
            return await interaction.showModal(Modals.editChannelName(channel))

        const execute = {
            // lock: lockChannel,
            // unlock: undefined,
            delete: deleteChannel,
            "nsfw-enable": nsfwActiveChannel,
            "nsfw-disable": nsfwDisableChannel,
        }[method] || null

        if (!execute)
            return await interaction.reply({
                content: `${e.Loading} | Recurso em construção...`,
                ephemeral: true
            })

        return execute(interaction, channel)
    }
}