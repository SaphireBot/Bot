import {
    Flags,
    Emojis as e
} from '../../../../util/util.js'

export default async (interaction) => {

    const msg = await interaction.reply({
        content: `${e.Loading} | Construindo novo jogo...`,
        fetchReply: true
    })

    

}