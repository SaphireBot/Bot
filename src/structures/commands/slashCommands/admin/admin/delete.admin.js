import { Database } from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"

export default async interaction => {

    const { options } = interaction
    const userId = options.getString('user')
    const serverId = options.getString('server')
    let responseMessage = ''

    await deleteUser()
    await deleteServer()

    if (!responseMessage)
        return await interaction.reply({
            content: `${e.Deny} | Forneça um ID de um servidor ou usuário para efetuar o delete do banco de dados.`,
            ephemeral: true
        })

    return await interaction.reply({ content: responseMessage })

    async function deleteUser() {

        if (!userId) return

        const hasUser = await Database.User.exists({ id: userId })

        if (!hasUser)
            return responseMessage += `\n${e.Deny} | Esse usuário não existe no banco de dados.`

        await Database.deleteUser(userId)
        return responseMessage += `\n${e.Check} | Esse usuário foi deletado com sucesso do banco de dados.`
    }

    async function deleteServer() {

        if (!serverId) return

        const hasGuild = await Database.Guild.exists({ id: serverId })

        if (!hasGuild)
            return responseMessage += `\n${e.Deny} | Esse servidor não existe no banco de dados.`

        Database.deleteGuild(serverId)
        return responseMessage += `\n${e.Check} | Servidor deletado com sucesso do banco de dados.`
    }

}