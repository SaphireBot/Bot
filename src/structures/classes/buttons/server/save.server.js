import { ButtonInteraction } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import { Database } from "../../../../classes/index.js"

/**
 * @param { ButtonInteraction } interaction
 * @param { { content: String | null, embeds: Array, channelId: String } } data
 * @param { 'welcome' | 'leave' } data
 */
export default async (interaction, data, type) => {

    if (!data || !data.channelId || (!data.content && !data.embeds[0]))
        return interaction.update({
            content: `${e.SaphireDesespero} | Formato inválido para salvar.`,
            components: [], embeds: []
        }).catch(() => { })

    return await Database.Guild.findOneAndUpdate(
        { id: interaction.guildId },
        {
            $set: {
                [
                    type == 'welcome' ? 'WelcomeChannel' : 'LeaveChannel'
                ]: {
                    channelId: data.channelId,
                    body: {
                        content: data.content ?? null,
                        embeds: data.embeds
                    }
                }
            }
        },
        { new: true }
    )
        .then(data => {
            Database.saveGuildCache(data.id, data)
            interaction.update({
                content: `${e.Check} | Muito bem, tudo foi salvo sem nenhum problemas.`,
                components: [], embeds: []
            }).catch(() => { })
            return
        })
        .catch(err => interaction.update({
            content: `${e.SaphireDesespero} | Algo de errado não está certo.\n${e.bug} | \`${err}\``,
            components: [], embeds: []
        }).catch(() => { }))
}