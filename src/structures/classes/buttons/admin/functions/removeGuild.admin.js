import { ButtonInteraction, ButtonStyle } from "discord.js";
import { Emojis as e } from "../../../../../util/util.js";

/**
 * @param { ButtonInteraction } interaction
 */
export default async interaction => {

    const { customId, user } = interaction
    const data = JSON.parse(customId)
    const guildId = data?.id

    if (!guildId)
        return interaction.reply({
            content: `${e.DenyX} | Nenhum ID de servidor foi definido.`,
            ephemeral: true
        })

    const guildData = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}`,
        {
            method: "GET",
            headers: { authorization: `Bot ${process.env.DISCORD_TOKEN}` }
        }
    )
        .then(async res => await res.json())
        .catch(() => null)

    if (!guildData || guildData?.code == 10004)
        return interaction.reply({
            content: `${e.DenyX} | Os dados deste servidor não foram encontrado.`,
            ephemeral: true
        })

    return interaction.reply({
        content: `${e.QuestionMark} | Confirmar a minha saída do servidor?`,
        ephemeral: true,
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Remover',
                        emoji: e.CheckV,
                        custom_id: JSON.stringify({ c: 'admin', src: 'leave', id: guildId }),
                        style: ButtonStyle.Danger
                    }
                ]
            }
        ]
    })

}