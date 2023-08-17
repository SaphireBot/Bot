import { Database, SaphireClient as client } from "../../../../../classes/index.js"
import { Config } from "../../../../../util/Constants.js"
import { Emojis as e } from "../../../../../util/util.js"

export default async interaction => {

    const { user, options, channel } = interaction

    if (user.id !== Config.ownerId)
        return await interaction.reply({
            content: `${e.Deny} | Apenas o meu desenvolvedor pode iniciar este processo.`,
            ephemeral: true
        })

    const message = options.getString('message') || 'Nenhum dado informado.'
    client.restart = message

    const msg = await interaction.reply({ content: `${e.Loading} | Reboot inicializado.`, fetchReply: true })

    await Database.Cache.Client.set('Restart', { channelId: channel.id, message, messageId: msg.id })
    return
}