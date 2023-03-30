import { ButtonStyle } from 'discord.js'
import {
    SaphireClient as client,
    Database,
} from '../../../classes/index.js'
import { Emojis as e } from '../../../util/util.js'
import { pollInterval } from '../../global/setIntervals.js'

export default new class PollManager {
    constructor() {
        this.toCancel = []
        this.Polls = []
    }

    async set() {

        const PollsFromGuilds = await Database.Guild.find({
            id: { $in: [...client.guilds.cache.keys()] }
        }, 'id Polls')

        if (!PollsFromGuilds || !PollsFromGuilds.length) return

        const guildsWithPolls = PollsFromGuilds
            .filter(data => data.Polls?.length > 0)
            .map(data => ({ id: data.id, Polls: data.Polls }))

        pollInterval()
        if (!guildsWithPolls || guildsWithPolls.length === 0) return

        for await (let data of guildsWithPolls) {
            await Database.Cache.Polls.set(`${client.shardId}.${data.id}`, [...data.Polls])
            this.Polls.push(...data.Polls)
        }

        return
    }

    async cancel(poll) {

        const guild = await client.guilds.fetch(poll?.GuildId || '0').catch(() => null)
        const channel = await guild?.channels?.fetch(poll?.ChannelId || '0').catch(() => null)
        if (!guild || !channel) return this.pull(poll?.MessageID)

        const message = await channel.messages?.fetch(poll.MessageID || '0').catch(() => null)
        if (!message) return this.pull(poll.MessageID)
        if (message.partial) message = await message.fetch()

        const embed = message?.embeds[0]?.data
        if (!embed || !embed.fields?.length || ['Votação encerrada', 'Tempo esgotado'].includes(embed?.fields[1]?.value)) return this.pull(poll.MessageID)

        if (embed.title.includes("anônima") || poll.anonymous)
            return this.showResults(message, poll)

        embed.fields[1] = {
            name: '⏱️ Tempo',
            value: embed.fields[1]?.value?.replace('Encerrando', 'Tempo esgotado') || "Tempo esgotado"
        }
        embed.color = client.red
        embed.title = `🎫 Votação ${poll.anonymous ? 'anônima' : ''} encerrada`

        this.pull(poll.MessageID)
        this.delete(poll.MessageID, poll.GuildId)
        message.reactions?.removeAll().catch(() => { })
        message.edit({ embeds: [embed], components: [] }).catch(() => { })
        return
    }

    async showResults(message, poll) {

        poll = poll ? poll : this.Polls.find(p => p?.MessageID === message.id)
        if (!poll) return this.pull(message.id)

        const { votes, MessageID } = poll
        const { embeds } = message
        const embed = embeds[0]?.data
        if (!embed) return this.pull(MessageID)

        const base = {
            up: votes?.up || [],
            question: votes?.question || [],
            down: votes?.down || [],
        }

        const counter = {
            up: base.up?.length || 0,
            question: base.question?.length || 0,
            down: base.down?.length || 0
        }

        const total = Object.values(counter || {}).reduce((acc, value) => acc += value, 0)

        const percent = {
            up: parseInt((counter.up / total) * 100).toFixed(0) || 0,
            question: parseInt((counter.question / total) * 100).toFixed(0) || 0,
            down: parseInt((counter.down / total) * 100).toFixed(0) || 0
        }

        if (isNaN(percent.up)) percent.up = 0
        if (isNaN(percent.question)) percent.question = 0
        if (isNaN(percent.down)) percent.down = 0

        embed.fields[0].value = `${e.Upvote} ${counter.up} - ${percent.up}%\n${e.QuestionMark} ${counter.question} - ${percent.question}%\n${e.DownVote} ${counter.down} - ${percent.down}%\n${e.saphireRight} ${total} votos coletados`

        embed.fields[1]
            ? embed.fields[1].value = embed.fields[1].value.replace('Encerrando', 'Tempo esgotado')
            : embed.fields.push({ name: '⏱ Tempo', value: 'Votação encerrada' })

        embed.title = '🎫 Votação anônima cancelada'

        this.pull(MessageID)
        this.delete(MessageID, message.guild.id)
        return await message.edit({ embeds: [embed], components: [] }).catch(() => { })
    }

    pull(MessageId) {
        this.Polls.splice(this.Polls.indexOf(poll => poll.MessageID === MessageId), 1)
        return true
    }

    async close(interaction, MessageId) {

        const pollGuildData = await Database.Guild.findOne({ id: interaction.guild.id }, 'Polls')

        if (!pollGuildData || !pollGuildData.Polls || !pollGuildData.Polls.length)
            return await interaction.reply({
                content: `${e.Deny} | Nenhum votação foi encontrada.`,
                ephemeral: true
            })

        const poll = pollGuildData.Polls.find(poll => poll.MessageID === MessageId)

        if (!poll)
            return await interaction.reply({
                content: `${e.Deny} | A sua votação não foi encontrada.`,
                ephemeral: true
            })

        this.cancel(poll)
        return await interaction.reply({
            content: `${e.Check} | A sua votação foi encerrada com sucesso.`,
            components: [{
                type: 1,
                components: [{
                    type: 2,
                    label: 'Votação',
                    url: poll.MessageLink,
                    style: ButtonStyle.Link
                }]
            }]
        })
    }

    async delete(messageId, guildId) {

        if (!messageId || !guildId) return

        await Database.Guild.updateOne(
            { id: guildId },
            { $pull: { Polls: { MessageID: messageId } } }
        )

        await Database.Cache.Polls.pull(`${client.shardId}.${guildId}`, p => p?.MessageID === messageId)
        return

    }
}