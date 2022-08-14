import { Emojis as e } from '../../../util/util.js'
import { Config as config } from '../../../util/Constants.js'
import { SaphireClient as client } from '../../index.js'
import { PermissionsBitField } from 'discord.js'

export default async ({ interaction, Database, user, guild, channel }, err) => {

    if (!interaction || !interaction?.commandName) return

    const centralGuild = await client.guilds.fetchGuild(config.guildId)
    if (!centralGuild) return

    const channelReporter = centralGuild.channels.cache.get(config.clientErrorChannelId)
    if (!channelReporter) return
 
    /*
    * 10062 - DiscordAPIError: Unknown interaction
    * 50001 - Missing Access
    * 50013 - Missing Permissions
    */
    return reply(err.code)
    if ([10062, 50001, 50013].includes(err.code)) return reply(err.code)

    const moeda = await guild.getCoin()
    const webhooks = await channelReporter.fetchWebhooks()

    let webhook = webhooks.find(wh => wh?.name === client.user.id)

    if (!webhook) webhook = await createWebhook()
    if (!webhook) return

    webhook.send({
        content: 'SOCORRO DEU ERRO',
        username: `${client.user.username} Error Reporter`
    })

    async function createWebhook() {

        return channelReporter.createWebhook({
            name: client.user.id,
            avatar: 'https://media.discordapp.net/attachments/893361065084198954/1007839310772449400/Saphire_Panic.png',
            reason: 'Nenhuma webhook encontrada'
        })

    }

    async function reply(data) {

        const response = {
            10062: `${e.Info} | Interação desconhecida. Por favor, tente novamente.`,
            50001: `${e.Info} | Eu não tenho permissão para **ver** este canal. Por favor, me deixe livre no canal para que eu possa executar os comandos normalmente.`,
            50013: `${e.Info} | Eu não tenho permissão para **enviar mensagens** neste canal. Por favor, me deixe livre no canal para que eu possa executar os comandos normalmente.`
        }[data] || data

        return interaction.deferred
            ? await interaction.editReply({
                content: `${response || data}`.limit('MessageContent'),
                embeds: [],
                components: []
            })
            : await interaction.reply({
                content: `${response || data}`.limit('MessageContent'),
                ephemeral: true
            })
                .catch(async () => await interaction.followUp({
                    content: `${response || data}`.limit('MessageContent'),
                    ephemeral: true
                }))
    }

}