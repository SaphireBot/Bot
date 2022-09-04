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

    async setPolls() {

        const PollsFromGuilds = await Database.Guild.find({
            id: { $in: [...client.guilds.cache.keys()] }
        }, 'id Polls')

        if (!PollsFromGuilds || !PollsFromGuilds.length) return

        const guildsWithPolls = PollsFromGuilds
            .filter(data => data.Polls?.length > 0)
            .map(data => ({ id: data.id, Polls: data.Polls }))
            .filter(data => data.Polls.TimeMs > 0)

        pollInterval()
        if (!guildsWithPolls || guildsWithPolls.length === 0) return

        for await (let data of guildsWithPolls) {
            await Database.Cache.Polls.set(`${client.shardId}.${data.id}`, [...data.Polls])
            this.Polls.push(...data.Polls)
        }

        return
    }

    async newCancel(poll) {

        await Database.Guild.updateOne(
            { id: poll.GuildId },
            { $pull: { Polls: { MessageId: poll.MessageId } } }
        )
        await Database.Cache.Polls.pull(`${client.shardId}.${poll.GuildId}`, p => p.MessageID === poll.MessageID)

        const guild = client.guilds.cache.get(poll.GuildId)
        const channel = guild?.channels?.cache?.get(poll.ChannelId)
        if (!guild || !channel) return this.pull(poll.MessageId)

        let message = channel.messages.cache.get(poll.MessageId)
            || await (async () => {
                const fetched = await channel.messages?.fetch(poll.MessageId)
                return fetched.first()
            })()

        if (!message) return this.pull(poll.MessageId)
        if (message.partial) message = await message.fetch()

        const { embeds } = message
        const embed = embeds[0]?.data
        if (!embed) return this.pull(poll.MessageId)

        embed.fields[1].value = embed.fields[1].value.replace('Encerrando', 'Tempo esgotado')
        embed.color = client.red
        embed.title = '🎫 Votação encerrada'

        this.pull(poll.MessageId)
        message.edit({
            embeds: [embed],
            components: [componentsJSON]
        }).catch(console.log)
        return
    }

    pull(MessageId) {
        this.Polls.splice(this.Polls.indexOf(poll => poll.MessageId === MessageId), 1)
        return true
    }

    async close(interaction, MessageId) {

        const pollGuildData = await Database.Guild.findOne({ 'Polls.MessageID': MessageId }, 'Polls')

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

        this.deletePoll(MessageId, interaction.guild.id)
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

    async deletePoll(messageId, guildId) {
        
        await Database.Guild.updateOne(
            { id: guildId },
            {
                $pull: {
                    Polls: {
                        MessageID: messageId
                    }
                }
            }
        )
        await Database.Cache.Polls.pull(`${client.shardId}.${guildId}`, p => p.MessageID === messageId)
        return

    }
}