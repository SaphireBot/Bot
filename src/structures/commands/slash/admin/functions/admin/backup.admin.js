import { readFileSync, createWriteStream, rm } from 'fs'
import { AttachmentBuilder } from "discord.js"
import { Emojis as e } from "../../../../../../util/util.js";
import axios from "axios"
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export default async interaction => {

    const { user, options } = interaction
    const password = options.getString('password')

    if (password !== process.env.GET_BACKUP_ZIP)
        return interaction.reply({ content: `${e.Deny} | Senha incorreta.`, ephemeral: true })

    await interaction.reply({ content: `${e.Loading} | Obtendo o backup da Saphire API...`, ephemeral: true })

    const backup = await getBackup()
    await delay(2000)

    if (!backup)
        return interaction.editReply({ content: `${e.Deny} | Não foi possível obter o backup.` })

    let file = undefined
    let attachment = []

    try {
        file = readFileSync("backup.zip")
        attachment.push(new AttachmentBuilder(file, { name: "database-backup.zip", description: "Backup do banco de dados" }))
    } catch (err) {
        if (file) rm("backup.zip", () => { })
        return interaction.editReply({ content: `${e.DenyX} | Não foi possível obter o arquivo.` })
    }

    return rm("backup.zip", async err => {
        return await user.send({ content: `${e.CheckV} | Backup solicitado com sucesso.`, files: attachment })
            .then(() => interaction.editReply({ content: `${e.CheckV} | Backup solicitado com sucesso. Enviado ao seu privado.${err ? `${e.DenyX} | Arquivo não deletado da raiz` : ""}` }))
            .catch(error => interaction.channel.send({ content: `${e.DenyX} | Não foi possível mandar o backup para o seu privado.\n${e.bug} | \`${error}\`` }))
    })

    async function getBackup() {

        const file = await axios({
            url: "https://api.saphire.one/backup",
            headers: { authorization: password },
            responseType: "stream"
        })
            .then(response => response.data)
            .catch(() => false)

        if (file) {
            await file.pipe(createWriteStream('backup.zip'))
            return true
        }

        return false
    }
}