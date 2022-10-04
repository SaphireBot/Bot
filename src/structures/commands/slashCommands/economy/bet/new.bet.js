import { Gifs } from '../../../../../util/util.js'
import { Colors } from '../../../../../util/Constants.js'
import BetClass from './class.bet.js'
import { Database } from '../../../../../classes/index.js'

export default async ({ interaction, e, amount, client }) => {

    const { options, user: author, guild, channel } = interaction
    let playersCount = options.getInteger('players') || 30
    const finishTime = options.getInteger('finish') || 60000
    const member = options.getMember('versus')
    const warnText = `Dinheiro perdido nos comandos de apostas não será extornado.\nCuidado com promessas de jogadores e sua ganância.\nA equipe de administração da ${client.user.username} não é responsável pelas transações deste jogo.`
    const coin = await guild.getCoin()
    const emojis = ['💸', '✅']

    if (member) playersCount = 2

    const embed = {
        title: '🎲 Aposta Simples',
        color: Colors.Blue,
        description: warnText,
        thumbnail: { url: Gifs.Embed.MoneyWithWings },
        fields: [
            {
                name: `👥 Jogadores - 1/${playersCount}`,
                value: `${e.OwnerCrow} ${author}${member ? `\n${e.Loading} ${member}` : ''}`
            },
            {
                name: '💰 Valor da aposta',
                value: `**${amount} ${coin}**`
            },
            {
                name: '⏱ Tempo',
                value: Date.Timestamp(new Date(finishTime).valueOf(), 'R')
            }
        ]
    }

    const msg = await interaction.reply({
        embeds: [embed],
        fetchReply: true
    })

    for (let emoji of emojis) msg.react(emoji).catch(() => { })

    const Bet = new BetClass(msg)

    setTimeout(() => Bet.finish(msg), finishTime)

    await Bet.save(msg.id, {
        messageId: msg.id,
        channelId: channel.id,
        amount: amount,
        authorId: author.id,
        finishTime: finishTime,
        players: [author.id],
        versus: member?.id || '',
        playersCount: playersCount
    })

    return Database.sub(author.id, amount)
}