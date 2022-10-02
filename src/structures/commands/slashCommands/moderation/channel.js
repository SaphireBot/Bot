import { ApplicationCommandOptionType, ChannelType } from "discord.js"
import { Modals } from "../../../../classes/index.js"
import { Permissions, DiscordPermissons, PermissionsTranslate } from "../../../../util/Constants.js"
import categoryChannel from "../../functions/channel/category.channel.js"
import deleteChannel from "../../functions/channel/delete.channel.js"
import inviteChannel from "../../functions/channel/invite.channel.js"
import lockChannel from "../../functions/channel/lock.channel.js"
import nsfwDisableChannel from "../../functions/channel/nsfw-disable.channel.js"
import nsfwActiveChannel from "../../functions/channel/nsfw-enable.channel.js"
import unlockChannel from "../../functions/channel/unlock.channel.js"

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
                    value: 'topic'
                },
                {
                    name: 'Editar nome',
                    value: 'name'
                },
                {
                    name: 'Mudar canal de categoria',
                    value: 'category' // Select menu
                }
            ],
            required: true
        },
        {
            name: 'channel',
            description: 'Canal que receberá a função',
            type: ApplicationCommandOptionType.Channel
        }
    ],
    helpData: {
        description: 'Comando para administrar o canal facilmente'
    },
    async execute({ interaction, e }) {

        const { options, guild, channel: currentChannel } = interaction

        if (!guild.clientHasPermission(DiscordPermissons.ManageChannels))
            return await interaction.reply({
                content: `${e.Deny} | Eu preciso da permissão **\`${PermissionsTranslate.ManageChannels}\`** para liberar este comando.`,
                ephemeral: true
            })

        const channel = options.getChannel('channel') || currentChannel
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

        const showModal = {
            name: 'editChannelName',
            clone: 'ChannelClone',
            topic: 'editTopic',
        }[method]

        if (showModal) {

            if (showModal === 'editTopic' && [ChannelType.GuildVoice, ChannelType.GuildCategory].includes(channel.type))
                return await interaction.reply({
                    content: `${e.Deny} | Canais de voz e categorias não possuem tópicos a serem editados.`,
                    ephemeral: true
                })

            return await interaction.showModal(Modals[showModal](channel))
        }

        const execute = {
            lock: lockChannel,
            unlock: unlockChannel,
            delete: deleteChannel,
            "nsfw-enable": nsfwActiveChannel,
            "nsfw-disable": nsfwDisableChannel,
            invite: inviteChannel,
            category: categoryChannel
        }[method] || null

        if (!execute)
            return await interaction.reply({
                content: `${e.Loading} | Recurso em construção...`,
                ephemeral: true
            })

        return execute(interaction, channel)
    }
}