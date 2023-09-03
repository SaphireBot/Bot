import { SaphireClient as client } from "../../../../../../classes/index.js";
import { Emojis as e } from "../../../../../../util/util.js";
import { time } from "discord.js";
import axios from "axios";

export default async interaction => {

    const { options } = interaction
    const guildId = options.getString('server')

    const invites = await axios({
        url: `https://discord.com/api/v10/guilds/${guildId}/invites`,
        method: 'GET',
        headers: {
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`
        }
    })
        .then(res => res.data)
        .catch(() => null)

    if (!invites)
        return await interaction.reply({
            content: `${e.Deny} | Não foi possível obter nenhum link de convite deste servidor.`,
            ephemeral: true
        })

    if (!invites.length)
        return await interaction.reply({
            content: `${e.Deny} | Servidor sem nenhum convite.`,
            ephemeral: true
        })

    const description = invites
        .slice(0, 50)
        .map(inv => `[${inv.code}](https://discord.gg/${inv.code}) ${inv.expires_at ? `${time(new Date(inv.expires_at), 'R')}` : 'Permanente'}`)
        .join('\n')
        .limit("MessageEmbedDescription")

    return interaction.reply({
        embeds: [{
            color: client.blue,
            title: '🔍 Convites do Servidor Requisitado',
            description: description || 'Nenhum convite disponível'
        }]
    })
}