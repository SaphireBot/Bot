import {
    SaphireClient as client,
    Database
} from "../../../../classes/index.js"
import pollManager from "../../../../functions/update/polls/poll.manager.js"
import { DiscordPermissons, PermissionsTranslate } from "../../../../util/Constants.js"
import { Emojis as e } from "../../../../util/util.js"
import resultPoll from "./result.poll.js"

export default async ({ interaction, guild, message, user, member }, commandData) => {

    const guildPolls = await Database.Cache.Polls.get(`${client.shardId}.${guild.id}`) || []
    const poll = guildPolls.find(p => p.MessageID === message.id || p.MessageID === commandData.messageId)
    const voteType = commandData.type

    if (!poll) {

        const embed = message?.embeds[0]?.data

        if (!embed)
            return await interaction.update({
                content: `${e.Deny} | Embed da votação não encontrada.`,
                embeds: [],
                components: []
            }).catch(() => { })

        embed.fields[1].value = embed.fields[1].value.replace('Encerrando', 'Tempo esgotado')

        return await interaction.update({ embeds: [embed], components: [] }).catch(() => { })
    }

    if (voteType === 'result')
        return resultPoll({ interaction, poll })

    if (voteType === 'review') {

        if ((!member.permissions.has(DiscordPermissons.Administrator) && ![commandData.userId].includes(user.id)))
            return await interaction.reply({
                content: `${e.Deny} | Você precisa da permissão **${PermissionsTranslate.Administrator}** ou ser o autor da votação para executar este comando.`,
                ephemeral: true
            })

        message.delete().catch(() => { })
        return pollManager.cancel(poll, message)
    }

    let votes = {
        up: poll.votes.up || [],
        down: poll.votes.down || [],
        question: poll.votes.question || []
    }

    if (votes[voteType].find(v => v?.includes(user.id)))
        return await interaction.reply({
            content: `${e.Info} | Você já votou nesta opção.`,
            ephemeral: true
        })

    const { embeds } = message
    const embed = embeds[0]?.data

    if (!embed) {
        await Database.Cache.Polls.delete(`${client.shardId}.${guild.id}.${message.id}`)
        return await interaction.update({
            content: `${e.Deny} | Embed da votação não encontrada.`,
            embeds: [],
            components: []
        }).catch(() => { })
    }

    if (embed.fields[1]) {

        const timestamp = embed.fields[1].value.replace(/[^0-9]/g, '')
        const time = new Date(timestamp * 1000).valueOf()

        if (!poll || time < Date.now()) {

            embed.fields[1].value = embed.fields[1].value.replace('Encerrando', 'Tempo esgotado')
            embed.color = client.red
            embed.title = `🎫 Votação anônima encerrada`

            const counter = {
                up: votes?.up?.length || 0,
                question: votes?.question?.length || 0,
                down: votes?.down?.length || 0
            }

            const total = Object.values(counter || {}).reduce((acc, value) => acc += value, 0)

            const percent = {
                up: parseInt((counter.up / total) * 100).toFixed(0) || 0,
                question: parseInt((counter.question / total) * 100).toFixed(0) || 0,
                down: parseInt((counter.down / total) * 100).toFixed(0) || 0
            }

            embed.fields[0].value = `${e.Upvote} ${counter.up} - ${percent.up}%\n${e.QuestionMark} ${counter.question} - ${percent.question}%\n${e.DownVote} ${counter.down} - ${percent.down}%\n${e.saphireRight} ${total} votos coletados`

            if (!poll)
                embed.fields[1].value = embed.fields[1].value.replace('Encerrando', 'Tempo esgotado')
            else pollManager.delete(message.id, message.guild.id)

            return await interaction.update({ embeds: [embed], components: [] }).catch(() => { })
        }
    }

    const pullOptions = {
        up: 'down',
        down: 'question',
        question: 'up'
    }

    const pullOptions2 = {
        up: 'question',
        down: 'up',
        question: 'down'
    }

    const voteData = await Database.Guild.findOneAndUpdate(
        { id: guild.id, "Polls.MessageID": message.id },
        {
            $push: {
                [`Polls.$.votes.${voteType}`]: user.id
            },
            $pull: {
                [`Polls.$.votes.${pullOptions[voteType]}`]: user.id,
                [`Polls.$.votes.${pullOptions2[voteType]}`]: user.id
            }
        },
        {
            upsert: true,
            new: true,
            fields: 'Polls'
        }
    )

    votes = voteData.Polls.find(v => v.MessageID === message.id).votes
    guildPolls.find(p => p.MessageID === message.id).votes = votes
    await Database.Cache.Polls.set(`${client.shardId}.${guild.id}`, guildPolls)
    const pollVotes = pollManager.Polls.find(v => v.MessageID === message.id)
    if (pollVotes?.votes) pollVotes.votes = votes

    const counter = {
        up: votes?.up?.length || 0,
        question: votes?.question?.length || 0,
        down: votes?.down?.length || 0
    }

    const total = Object.values(counter || {}).reduce((acc, value) => acc += value, 0)

    embed.fields[0].value = `${e.Upvote} 0 - 0%\n${e.QuestionMark} 0 - 0%\n${e.DownVote} 0 - 0%\n${e.saphireRight} ${total} votos coletados\n${e.Loading} Aguardando finalização`

    await interaction.update({ embeds: [embed] }).catch(() => { })

    return await interaction.followUp({
        content: `${e.Check} | Seu voto foi contabilizado com sucesso!`,
        ephemeral: true
    })
}