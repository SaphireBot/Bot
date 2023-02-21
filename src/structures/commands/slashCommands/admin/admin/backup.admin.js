import axios from "axios"
import { Emojis as e } from "../../../../../util/util.js"
import { readFileSync, rmSync, createWriteStream } from 'fs'
import { AttachmentBuilder } from "discord.js"
import { cwd } from "process"

export default async interaction => {

    const { user, options } = interaction
    const password = options.getString('password')

    if (password !== process.env.GET_BACKUP_ZIP)
        return await interaction.reply({ content: `${e.Deny} | Senha incorreta.`, ephemeral: true })

    await interaction.reply({ content: `${e.Loading} | Obtendo o backup da Saphire API...`, ephemeral: true })

    const backup = await axios({
        url: "https://ways.discloud.app/backup",
        headers: { authorization: password },
        responseType: "stream"
    })
        .then(response => {
            response.data.pipe(createWriteStream('backup.zip'))
            return true
        })
        .catch(error => {
            console.log(error)
            return false
        })

    if (!backup)
        return await interaction.editReply({ content: `${e.Deny} | Não foi possível obter o backup.` })

    const file = readFileSync(`${cwd()}/backup.zip`);
    const attachment = new AttachmentBuilder(file, { name: "database-backup.zip", description: "Backup do banco de dados" })

    await user.send({ content: `${e.Check} | Backup solicitado com sucesso.`, files: [attachment] })
        .then(async () => await interaction.editReply({ content: `${e.Check} | Backup solicitado com sucesso. Enviado ao seu privado.` }))
        .catch(async error => await interaction.channel.send({ content: `${e.Deny} | Não foi possível mandar o backup para o seu privado.\n${e.bug} | \`${error}\`` }))

    return rmSync("backup.zip")
}