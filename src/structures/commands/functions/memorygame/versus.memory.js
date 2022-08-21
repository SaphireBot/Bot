import emojisArray from './emojis.js'
import buttonGenerator from './functions/generator.versus.memory.js'

export default async (interaction, e) => {

    const { options, user } = interaction
    const member = options.getUser('member')

    if (member.id === user.id || member.bot)
        return await interaction.reply({
            content: `${e.Deny} | Você não pode jogar com bots ou com você mesmo.`,
            ephemeral: true
        })

    const emojiOption = options.getInteger('emojis') ?? -1
    const emojis = emojiOption === -1 ? emojisArray.random() : emojisArray[emojiOption]
    const playNow = [member, user].random()

    await interaction.reply({
        content: `${e.Loading} | Construindo novo jogo competitivo...`
    }).catch(console.log)

    const buttons = buttonGenerator(emojis, e, member.id)

    return await interaction.editReply({
        content: `${e.Loading} | Tente achar os pares de emojis iguais.\n${e.Info} | Clique nos botões com calma para não estragar o jogo.\n🆚 | Modo competitivo: ${playNow}, é sua vez.\n📉 | ${user.username} 0 x 0 ${member.username}`,
        components: buttons.default
    }).catch(console.log)
}