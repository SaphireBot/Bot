import { Gifs } from '../../../../../util/util.js'
import { Colors } from '../../../../../util/Constants.js'
import BetClass from './class.bet.js'

export default async ({ interaction, economy, e, amount, client }) => {

    const { options, user: author, guild } = interaction
    const playersCount = options.getInteger('players') || 30
    const finishTime = options.getInteger('finish') || 60000
    const warnText = `Dinheiro perdido nos comandos de apostas não será extornado.\nCuidado com promessas de jogadores e sua ganância.\nA equipe de administração da ${client.user.username} não é responsável pelas transações deste jogo.`
    const coin = await guild.getCoin()
    const emojis = ['💸', '✅', '❌']
    const players = [author.id]
    const endedReason = {
        messageDelete: 'Mensagem deletada',
        time: 'Tempo encerrado',
        user: `Aposta encerrada por ${author}`
    }

    const embed = {
        title: '🎲 Aposta Simples',
        color: Colors.Blue,
        description: warnText,
        thumbnail: { url: Gifs.Embed.MoneyWithWings },
        fields: [
            {
                name: `👥 Jogadores - 1/${playersCount}`,
                value: `${e.OwnerCrow} ${author}`
            },
            {
                name: '💰 Valor da aposta',
                value: `**${amount} ${coin}**`
            }
        ]
    }

    const msg = await interaction.reply({
        embeds: [embed],
        fetchReply: true
    })

    for (let emoji of emojis) msg.react(emoji).catch(() => { })

    const collector = msg.createReactionCollector({
        filter: (r, u) => emojis.includes(r.emoji.name) && !u.bot,
        time: finishTime,
        dispose: true
    });

    const Bet = new BetClass(collector)
    for (let event of Object.entries(Bet.events))
        collector.on(event[0], (...args) => event[1](...args))
    return
}