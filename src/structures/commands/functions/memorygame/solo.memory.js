import emojisArray from './emojis.js'
import buttonGenerator from './functions/generator.memory.js'
import disable from './functions/disable.memory.js'

export default async (interaction, Database, e) => {

    const { options } = interaction
    const mode = options.getString('mode')
    const limitedMinutes = mode === 'minutes'
    const emojiOption = options.getInteger('emojis') ?? -1
    const emojis = emojiOption === -1 ? emojisArray.random() : emojisArray[emojiOption]

    const msg = await interaction.reply({
        content: `${e.Loading} | Construindo novo jogo...\n${limitedMinutes ? '⏱ | Modo limitado a 2 minutos' : ''}`,
        fetchReply: true
    }).catch(() => { })

    const buttons = buttonGenerator(emojis, e, limitedMinutes)

    if (limitedMinutes) disable(msg, 119000)

    return await interaction.editReply({
        content: `${e.Loading} | Tente achar os pares de emojis iguais.\n${e.Info} | Clique nos botões com calma para não estragar o jogo.\n${limitedMinutes ? `⏱ | ${Date.GetTimeout(120000, Date.now(), 'R')}` : ''}`,
        components: buttons.default
    }).catch(() => { })
}