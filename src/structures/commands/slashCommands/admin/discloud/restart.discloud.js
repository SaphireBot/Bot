import {
    SaphireClient as client,
    Database,
    Discloud
} from '../../../../../classes/index.js'
import { Emojis as e } from '../../../../../util/util.js'

export default async interaction => {

    const { channel } = interaction

    const msg = await interaction.reply({
        content: `${e.Loading} | Solicitando restart a Discloud Host...`,
        fetchReply: true
    })

    client.restart = 'System reload was required.'
    await Database.Cache.Client.set('Restart', {
        channelId: channel.id,
        messageId: msg.id
    })
    const response = await Discloud.apps.restart('saphire')

    if (!response) {
        delete client.restart
        await Database.Cache.Client.delete('Restart')
        return await interaction.editReply({
            content: `${e.Deny} | Não foi possível concluir o restart.`
        })
    }

    return await interaction.editReply({ content: `${e.Loading} | Reiniciando...` }).catch(() => { })

}