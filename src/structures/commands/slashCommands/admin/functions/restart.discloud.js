import {
    SaphireClient as client,
    Database,
    Discloud
} from '../../../../../classes/index.js'
import { Emojis as e } from '../../../../../util/util.js'
import('dotenv/config')

export default async interaction => {

    const { channel } = interaction

    const msg = await interaction.reply({
        content: `${e.Loading} | Solicitando restart a Discloud Host...`,
        fetchReply: true
    })

    const response = await Discloud.apps.restart('saphire')

    if (!response)
        return await interaction.editReply({
            content: `${e.Deny} | Não foi possível concluir o restart.`
        })

    await msg.edit({
        content: `${e.Loading} | Reiniciando...`,
    }).catch(console.log)

    return await Database.Cache.Client.set(`${client.shardId}.RESTART`, {
        channelId: channel.id,
        messageId: msg.id
    })
}