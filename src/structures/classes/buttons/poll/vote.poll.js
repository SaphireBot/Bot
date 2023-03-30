import {
    SaphireClient as client,
    Database
} from '../../../../classes/index.js'
import PollManager from '../../../../functions/update/polls/poll.manager.js'
import { Emojis as e } from '../../../../util/util.js'

export default async ({ message }) => {

    const guildPolls = await Database.Cache.Polls.get(`${client.shardId}.${message.guild.id}`) || []
    const poll = guildPolls.find(p => p?.MessageID === message.id)

    const keyNames = ['upvote', 'QuestionMark', 'downvote']
    const reactions = message.reactions.cache
        .filter(reaction => keyNames.includes(reaction.emoji.name))
        .map(reaction => ({
            [reaction.emoji.name]: reaction.count
        }))

    const { embeds } = message
    const embed = embeds[0]?.data

    if (!embed) {
        message.reactions.removeAll().catch(() => { })
        await Database.Cache.Polls.delete(`${client.shardId}.${message.guild.id}.${message.id}`)
        return message.edit({ content: `${e.Deny} | Embed da votação não encontrada.` }).catch(() => { })
    }

    if (embed.fields[1]) {

        const timestamp = embed.fields[1].value.replace(/[^0-9]/g, '')
        const time = new Date(timestamp * 1000).valueOf()

        if (!poll || time < Date.now()) {

            message.reactions.removeAll().catch(() => { })
            embed.fields[1].value = embed.fields[1].value.replace('Encerrando', 'Tempo esgotado')
            embed.color = client.red
            embed.title = '🎫 Votação encerrada'

            if (!poll)
                embed.fields[1].value = 'Votação encerrada.'
            else PollManager.delete(message.id, message.guild.id)

            message.reactions.removeAll().catch(() => { })
            return await message.edit({ embeds: [embed] }).catch(() => { })
        }
    }

    const counter = {
        upvote: (reactions[0]?.upvote || 0) - 1,
        QuestionMark: (reactions[1]?.QuestionMark || 0) - 1,
        downvote: (reactions[2]?.downvote || 0) - 1
    }

    if (counter.upvote < 0) counter.upvote = 0
    if (counter.QuestionMark < 0) counter.QuestionMark = 0
    if (counter.downvote < 0) counter.downvote = 0

    const total = Object.values(counter || {}).reduce((acc, value) => acc += value, 0)

    const percent = {
        upvote: parseInt((counter.upvote / total) * 100).toFixed(0) || 0,
        QuestionMark: parseInt((counter.QuestionMark / total) * 100).toFixed(0) || 0,
        downvote: parseInt((counter.downvote / total) * 100).toFixed(0) || 0
    }

    embed.fields[0].value = `${e.Upvote} ${counter.upvote} - ${percent.upvote}%\n${e.QuestionMark} ${counter.QuestionMark} - ${percent.QuestionMark}%\n${e.DownVote} ${counter.downvote} - ${percent.downvote}%\n${e.saphireRight} ${total} votos coletados`

    return await message.edit({ embeds: [embed] }).catch(() => { })
}