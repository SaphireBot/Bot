import axios from 'axios'
import { SaphireClient as client } from '../../../../../classes/index.js'
import { Emojis as e } from '../../../../../util/util.js'
import('dotenv/config')

export default async interaction => {

    await interaction.deferReply({})

    return await axios.get(`https://api.discloud.app/v2/app/912509487984812043/logs`, {
        headers: { "api-token": process.env.DISCLOUD_API_TOKEN }
    })
        .then(sendData)
        .catch(async () => await interaction.editReply({
            content: `${e.Deny} | Não foi possível completar a request com a Discloud Host.`
        }))

    async function sendData(data) {

        const response = data.data

        if (response.status !== 'ok')
            return await interaction.editReply({
                content: `${e.Deny} | Não foi possível acessar o terminal.`
            })

        return await interaction.editReply({
            embeds: [{
                color: client.blue,
                title: `${e.Reference} Discloud Logs`,
                description: `\`\`\`txt\n${response.apps.terminal.small}\`\`\``.limit('MessageEmbedDescription')
            }]
        }).catch(console.log)

    }

}