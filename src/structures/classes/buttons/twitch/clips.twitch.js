import { parseEmoji } from "discord.js"
import { ButtonInteraction, TwitchManager } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

/**
 * @param { ButtonInteraction } interaction
 * @param { { c: 'twitch', src: 'clips', streamerId: streamerId } } commandData
 */
export default async (interaction, commandData) => {

    await interaction.reply({
        content: `${e.Loading} | Carregando os clips...`,
        ephemeral: true
    })

    const { message, user } = interaction
    const streamerCrips = await TwitchManager.fetcher(`https://api.twitch.tv/helix/clips?broadcaster_id=${commandData.streamerId}&first=25`)

    if (streamerCrips == 'TIMEOUT')
        return interaction.editReply({
            content: `${e.SaphireDesespero} | Aaaaah, o sistema da Twitch está pegando FOOOOGO 🔥\n🧑‍🚒 | Fica tranquilo, que tudo está normal em menos de 1 minuto. ||Rate limit é uma coisinha chata||`
        }).catch(() => { })

    if (!streamerCrips.length)
        return interaction.editReply({
            content: `${e.Animated.SaphireCry} | Nenhum clip foi encontrado.`,
            ephemeral: true
        }).catch(() => { })

    const selectMenu = {
        type: 1,
        components: [{
            type: 3,
            custom_id: JSON.stringify({ c: 'twitch', src: 'clips' }),
            placeholder: `${user.tag} liberou ${streamerCrips.length} clips de ${streamerCrips[0].broadcaster_name}`.limit('SelectMenuPlaceholder'),
            options: []
        }]
    }

    for (const clip of streamerCrips)
        selectMenu.components[0].options.push({
            label: `${clip.title}`.limit('SelectMenuLabel'),
            emoji: parseEmoji('🎬'),
            description: `${clip.creator_name} criou este clip`,
            value: clip.url.split('/').pop(),
        })

    return message.edit({ components: [selectMenu] })
        .then(() => interaction.editReply({ content: `${e.Check} | Ok ok, clips liberados.` }))
        .catch(err => interaction.editReply({ content: `${e.SaphireDesespero} | DEU RUIIIM\n${e.bug} | \`${err}\`` }))

}