import {
    Config as config,
    ErrorsToIgnore,
    ErrorResponse
} from '../../../util/Constants.js'
import createWebhook from './functions/createWebhook.errors.js'
import reply from './functions/reply.errors.js'

export default
    async ({ interaction, Database, user, guild, channel, client, e }, err) => {

        if (!interaction || !interaction?.commandName) return

        const centralGuild = await client.guilds.fetchGuild(config.guildId)
        if (!centralGuild) return

        const channelReporter = centralGuild.channels.cache.get(config.clientErrorChannelId)
        if (!channelReporter) return

        const errorCode = err.code

        if (ErrorsToIgnore.includes(errorCode)) return reply(interaction, ErrorResponse[errorCode])

        const webhooks = await channelReporter.fetchWebhooks()

        let webhook = webhooks.find(wh => wh?.name === client.user.id) || await createWebhook(channelReporter, client.user.id, config.ErrorWebhookProfileIcon)

        if (!webhook) return

        const moeda = await guild.getCoin()

        webhook.send({
            content: 'SOCORRO DEU ERRO',
            username: `${client.user.username} Error Reporter`
        })

    }