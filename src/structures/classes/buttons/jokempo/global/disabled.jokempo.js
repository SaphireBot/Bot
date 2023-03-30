import { ButtonInteraction, Routes } from "discord.js";
import { Database, SaphireClient as client } from "../../../../../classes/index.js";
import { Emojis as e } from "../../../../../util/util.js";

/**
 * @param { ButtonInteraction } interaction
 * @param { { messageId: messageId } } customData
 */
export default async (interaction, customData) => {

    const { user } = interaction

    // {
    //     id: jokempo.id,
    //     value: jokempo.value,
    //     webhookUrl: jokempo.webhookUrl,
    //     creatorId: jokempo.creatorId,
    //     creatorOption: jokempo.creatorOption,
    //     userId: user.id,
    //     channelId: message.channel.id
    // }
    const jokempo = await Database.Cache.Jokempo.get(`Global.${customData.messageId}`)

    if (!jokempo)
        return interaction.update({
            content: `${e.DenyX} | Jogo global não encontrado.`,
            components: []
        }).catch(() => { })

    if (user.id !== jokempo.userId)
        return interaction.reply({
            content: `${e.Deny} | Hey, você não pode fazer isso coisinha fofa.`,
            ephemeral: true
        })

    await interaction.update({ content: `${e.Loading} | Cancelando...`, components: [] }).catch(() => { })
    await Database.Cache.Jokempo.delete(`Global.${customData.messageId}`)
    await client.rest.delete(Routes.channelMessage(jokempo.channelId, customData.messageId))
        .catch(() => { })

    await restore()

    return interaction.message.edit({ content: `${e.CheckV} | Jogo cancelado`, components: [] }).catch(() => { })

    async function restore() {
        new Database.Jokempo({
            creatorId: jokempo.creatorId,
            creatorOption: jokempo.creatorOption,
            id: jokempo.id,
            value: jokempo.value,
            webhookUrl: jokempo.webhookUrl
        }).save()

        await Database.User.updateOne(
            { id: jokempo.userId },
            {
                $inc: { Balance: jokempo.value },
                $push: {
                    Transactions: {
                        $each: [{
                            time: `${Date.format(0, true)}`,
                            data: `${e.gain} Recebeu ${jokempo.value || 0} Safiras atráves do *Bet Delete System (canceled)*`
                        }],
                        $position: 0
                    }
                }
            }
        )
    }
}