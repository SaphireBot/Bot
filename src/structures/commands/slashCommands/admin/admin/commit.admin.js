import axios from "axios"
import { Emojis as e } from "../../../../../util/util.js"

export default async interaction => {

    const { options } = interaction
    const discloudFile = options.getAttachment('discloud')
    const squarecloudFile = options.getAttachment('squarecloud')
    const apiFile = options.getAttachment('api')

    if (!discloudFile && !squarecloudFile && !api)
        return await interaction.reply({
            content: `${e.Deny} | Pelo menos um arquivo deve ser enviado para alguma host.`
        })

    if (discloudFile && discloudFile.contentType !== 'application/zip')
        return await interaction.reply({
            content: `${e.Deny} | O arquivo enviado para a Discloud não está no formato \`.zip\``,
            ephemeral: true
        })

    if (squarecloudFile && squarecloudFile.contentType !== 'application/zip')
        return await interaction.reply({
            content: `${e.Deny} | O arquivo enviado para a Squarecloud não está no formato \`.zip\``,
            ephemeral: true
        })

    if (apiFile && apiFile.contentType !== 'application/zip')
        return await interaction.reply({
            content: `${e.Deny} | O arquivo enviado para a Squarecloud não está no formato \`.zip\``,
            ephemeral: true
        })

    await interaction.reply({
        content: `${e.Loading} | Enviando arquivo de commit para a Saphire API...`
    })

    return await axios.post('https://ways.discloud.app/commit', {}, {
        headers: {
            authorization: process.env.COMMIT_AUTHORIZATION,
            discloud: discloudFile?.attachment || null,
            squarecloud: squarecloudFile?.attachment || null,
            api: apiFile?.attachment || null
        }
    })
        .then(async () => await interaction.editReply({ content: `${e.Check} | Arquivo de commit enviado com sucesso.` }).catch(() => { }))
        .catch(async err => await interaction.editReply({ content: `${e.Deny} | Não foi possível efetuar o envio do arquivo de commit.\n${e.bug} | \`${err}\`` }).catch(() => { }))

}