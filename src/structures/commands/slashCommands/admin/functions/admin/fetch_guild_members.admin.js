import { SaphireClient as client } from "../../../../../../classes/index.js"
import { Emojis as e } from "../../../../../../util/util.js"

export default async interaction => {

    const { options } = interaction
    const guildId = options.getString('guild_id')
    await interaction.reply({ content: `${e.Loading} | Fetching...`, ephemeral: true })

    const guild = await client.guilds.fetch(guildId).catch(() => null)

    if (!guild)
        return await interaction.editReply({ content: `${e.DenyX} | Servidor não encontrado.` }).catch(() => { })

    const members = await guild.members.fetch().catch(() => null)

    if (!members)
        return await interaction.editReply({ content: `${e.DenyX} | Não foi possível executar o fetch dos membros do servidor \`${guild?.name || `Not Found`} - ${guildId}\`` }).catch(() => { })

    return await interaction.editReply({ content: `${e.CheckV} | ${members.size} membros coletados neste fetch do servidor \`${guild?.name || `Not Found`} - ${guildId}\`.` }).catch(() => { })
}