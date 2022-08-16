import emojisArray from './emojis.js'
import buttonGenerator from './functions/generator.memory.js'

export default async (interaction, Database, e) => {

    const { options, user } = interaction
    const emojiOption = options.getInteger('emojis') ?? -1
    const emojis = emojiOption === -1 ? emojisArray.random() : emojisArray[emojiOption]

    const msg = await interaction.reply({
        content: `${e.Loading} | Construindo novo jogo...`,
        fetchReply: true
    }).catch(console.log)

    const buttons = buttonGenerator(emojis, e)

    await Database.Cache.Memory.push(user.id, {
        id: msg.id,
        messageURL: msg.url
    })

    return await interaction.editReply({
        content: `${e.Loading} | **Memory Game** | Tente achar os pares de emojis iguais.\n${e.Info} | Clique nos botões com calma para não estragar o jogo.`,
        components: buttons.default
    })
}