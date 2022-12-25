import { parseEmoji } from "discord.js"
import { Emojis as e } from "../../../../../util/util.js"

export default async (interaction, emoji) => {

    const emojiParsed = parseEmoji(emoji)

    if (!emojiParsed)
        return await interaction.reply({
            content: `${e.Deny} | Forneça um emoji válido para utulizar este comando.`,
            ephemeral: true
        })

    const emojiData = {
        id: emojiParsed?.id || null,
        name: emojiParsed?.name || null,
        animated: emojiParsed?.animated ? ".gif" : ".png",
        url: `https://cdn.discordapp.com/emojis/${emojiParsed.id}${emojiParsed?.animated ? ".gif" : ".png"}`
    }

    if (!emojiData.id || !emojiData.name)
        return await interaction.reply({
            content: `${e.Deny} | Emoji não reconhecido.`,
            ephemeral: true
        })

    return await interaction.reply({ content: emojiData.url })

}