import { ButtonStyle, ChatInputCommandInteraction } from "discord.js"
import { Emojis as e } from "../../../../../../util/util.js"

/**
 * @param { ChatInputCommandInteraction } interaction
 * @param { 'welcome' | 'leave' } type
 */
export default async (interaction, guildData, type) => {

    const config = type == 'welcome' ? guildData?.WelcomeChannel : guildData?.LeaveChannel
    let messageData = undefined

    if (!config)
        messageData = {
            content: `${e.cry} | Nenhuma mensagem foi configurada ainda.`
        }

    if (config.body)
        messageData = {
            content: config.body.content ?? null,
            embeds: config.body.embeds ?? []
        }

    if (!messageData && !messageData?.content && !messageData?.embeds?.length)
        messageData = {
            content: `${e.cry} | Nenhuma mensagem foi configurada ainda.`
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