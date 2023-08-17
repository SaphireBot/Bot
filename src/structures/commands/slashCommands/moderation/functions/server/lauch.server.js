import { ButtonStyle, ChatInputCommandInteraction } from "discord.js"
import { Emojis as e } from "../../../../../../util/util.js"

/**
 * @param { ChatInputCommandInteraction } interaction
 * @param { 'welcome' | 'leave' } type
 */
export default async (interaction, guildData, type) => {

    const config = type == 'welcome' ? guildData?.WelcomeChannel : guildData?.LeaveChannel
    let messageData = {}

    if (!config)
        messageData = {
            content: `${e.Animated.SaphireCry} | Nenhuma mensagem foi configurada ainda.`
        }

    if (config?.body)
        messageData = {
            content: config.body?.content ?? null,
            embeds: config.body?.embeds ?? []
        }

    if (!messageData?.embeds) messageData.embeds = []
    const embed = messageData?.embeds[0] || {}
    if (!embed.description && !embed.title) messageData.embeds = []

    if (!messageData && !messageData?.content && !messageData?.embeds?.length)
        messageData = {
            content: `${e.Animated.SaphireCry} | Nenhuma mensagem foi configurada ainda.`
        }

    messageData.components = [{
        type: 1,
        components: [
            {
                type: 2,
                label: 'Iniciar Configuração',
                emoji: e.Gear,
                custom_id: JSON.stringify({ c: 'server', src: type }),
                style: ButtonStyle.Success
            },
            {
                type: 2,
                label: 'Desativar Configuração',
                emoji: e.Trash,
                custom_id: JSON.stringify({ c: 'server', src: 'disable', type: type, confirm: 'f' }),
                style: ButtonStyle.Danger,
                disabled: !messageData && !messageData?.content && !messageData?.embeds?.length
            }
        ]
    }]

    return interaction.reply(messageData)
}