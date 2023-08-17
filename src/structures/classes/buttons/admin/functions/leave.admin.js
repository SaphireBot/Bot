import { SaphireClient as client } from "../../../../../classes/index.js";
import { ButtonInteraction, Routes } from "discord.js";
import { Emojis as e } from "../../../../../util/util.js";

/**
 * @param { ButtonInteraction } interaction
 */
export default async interaction => {

    const { customId, user } = interaction

    if (!client.admins.includes(user.id))
        return interaction.reply({
            content: `${e.Animated.SaphireSleeping} | Você não pode clicar aqui, cai fora.`,
            ephemeral: true
        })

    const data = JSON.parse(customId)
    const guildId = data?.id

    await interaction.update({ content: `${e.Loading} | Saindo do servidor solicitado...`, components: [] })


    const removedStatus = await fetch(
        `https://discord.com/api/v10/users/@me/guilds/${guildId}`,
        {
            method: "DELETE",
            headers: { authorization: `Bot ${process.env.DISCORD_TOKEN}` }
        }
    )
        .then(res => res.status)
        .catch(err => err)

    if (removedStatus !== 204)
        return interaction.editReply({ content: `${e.DenyX} | Não foi possível sair do servidor.\n${e.bug} | \`${err}\`` }).catch(() => { })

    return interaction.editReply({ content: `${e.CheckV} | Remoção concluída.` }).catch(() => { })
}