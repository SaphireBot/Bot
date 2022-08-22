import axios from 'axios'
import { SaphireClient as client } from '../../../../../classes/index.js'
import { Emojis as e } from '../../../../../util/util.js'
import('dotenv/config')

export default async interaction => {

    await interaction.deferReply({ ephemeral: true })

    return await axios.get(`https://api.discloud.app/v2/user`, {
        headers: { "api-token": process.env.DISCLOUD_API_TOKEN }
    })
        .then(sendData)
        .catch(async () => await interaction.editReply({
            content: `${e.Deny} | Não foi possível completar a request com a Discloud Host.`
        }))

    async function sendData(data) {

        return console.log(data)

        const response = data.data

        if (response.status !== 'ok')
            return await interaction.editReply({
                content: `${e.Deny} | Não foi possível concluir a request.`
            })

        return await interaction.editReply({
            embeds: [{
                color: client.blue,
                title: `${e.Check} Discloud Backup`,
                description: `[Backup](${response.backups.url}) gerado com sucesso.`
            }]
        }).catch(console.log)

    }

}