import { SaphireClient as client, Database } from "../../../../../../classes/index.js";
import { Emojis as e } from "../../../../../../util/util.js";
import { Routes } from "discord.js";

export default async interaction => {

    const { options } = interaction
    const userId = options.getString('user')
    const guildId = options.getString('server')
    let responseMessage = ''

    await registerUser()
    await registerServer()

    if (!responseMessage)
        return await interaction.reply({
            content: `${e.Deny} | Forneça um ID de um servidor ou usuário para efetuar o registro.`,
            ephemeral: true
        })

    return await interaction.reply({ content: responseMessage })

    async function registerUser() {

        if (!userId) return

        const user = await client.users.fetch(userId).catch(() => null)

        if (!user)
            return responseMessage += `\n${e.Deny} | Usuário não encontrado para registro.`

        if (user.bot)
            return responseMessage += `\n${e.Deny} | Bots não podem ser cadastrados no banco de dados.`

        const hasUser = await Database.User.exists({ id: user.id })

        if (hasUser)
            return responseMessage += `\n${e.Deny} | O usuário ${user.username} - \`${user.id}\` já está cadastrado no banco de dados.`

        await Database.registerUser(user)
        return responseMessage += `\n${e.Check} | O usuário ${user.username} - \`${user.id}\` foi registrado com sucesso no banco de dados.`
    }

    async function registerServer() {

        if (!guildId) return

        const guild = await client.rest.get(Routes.guild(guildId)).catch(() => null)

        if (!guild)
            return responseMessage += `\n${e.Deny} | Servidor não encontrado para registro.`

        const hasGuild = await Database.Guild.exists({ id: guild.id })

        if (hasGuild)
            return responseMessage += `\n${e.Deny} | O servidor ${guild.name} - \`${guild.id}\` já está cadastrado no banco de dados.`

        await Database.registerServer(guild)
        return responseMessage += `\n${e.Check} | O servidor ${guild.name} - \`${guild.id}\` foi registrado com sucesso no banco de dados.`
    }

}