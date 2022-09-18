import { ButtonStyle, makeError } from 'discord.js'
import {
    Config as config,
    ErrorsToIgnore,
    ErrorResponse
} from '../../../util/Constants.js'
import { economy, Emojis as e } from '../../../util/util.js'
import createWebhook from './functions/createWebhook.errors.js'
import reply from './functions/reply.errors.js'
import { ChannelType } from 'discord.js'

export default
    async ({ interaction, Database, user, guild, channel, client }, err) => {
        console.log(err)

        if (!interaction || !interaction?.commandName) return

        const { commandName, commandId } = interaction
        const isTextChannel = channel.type === ChannelType.GuildText

        const centralGuild = await client.guilds.fetchGuild(config.guildId)
        if (!centralGuild) return

        const channelReporter = centralGuild.channels.cache.get(config.clientErrorChannelId)
        if (!channelReporter) return

        const errorCode = err.code
        if (ErrorsToIgnore.includes(errorCode)) return reply(interaction, ErrorResponse[errorCode])

        const webhooks = await channelReporter.fetchWebhooks()
        const webhook = webhooks.find(wh => wh?.name === client.user.id)
            || await createWebhook(channelReporter, client.user.id, config.ErrorWebhookProfileIcon)
                .catch(() => null)

        const moeda = await guild?.getCoin() || `${e.Coin} Safiras`

        if (commandName)
            await Database.Client.updateOne(
                { id: client.user.id },
                {
                    $push: {
                        ComandosBloqueadosSlash: {
                            $each: [
                                {
                                    cmd: commandName,
                                    error: err?.message || 'Indefinido'
                                }
                            ],
                            $position: 0
                        }
                    }
                }
            )

        const ChannelInvite = isTextChannel
            ? await channel.createInvite({ maxAge: 0 }).catch(() => null)
            : null

        const owner = await client.users.fetch(config.ownerId).catch(() => null)

        owner?.send({
            embeds: [{
                color: client.red,
                title: `${e.Loud} Error Handler | Interaction Command`,
                description: `\`\`\`js\n${err.stack?.slice(0, 4000)}\`\`\``,
                fields: [
                    {
                        name: '👤 Author',
                        value: `${user} | ${user?.tag} | *\`${user.id}\`*`
                    },
                    {
                        name: '✍ Locale',
                        value: isTextChannel ? `Channel: ${channel} - ${channel?.name}` : 'Direct Messages'
                    },
                    {
                        name: '⚙ Command',
                        value: `</${commandName}${interaction?.options.getSubcommandGroup() ? ` ${interaction?.options.getSubcommandGroup()}` : ''}${interaction?.options.getSubcommand(false) ? ` ${interaction?.options.getSubcommand(false)}` : ''}:${commandId}>`,
                        inline: true
                    }
                ],
                footer: {
                    text: `Error Code: ${err.code || 'No error code'}`
                }
            }],
            components: ChannelInvite
                ? [{
                    type: 1,
                    components: [{
                        type: 2,
                        label: guild.name,
                        style: ButtonStyle.Link,
                        url: `https://discord.gg/${ChannelInvite.code}`
                    }]
                }]
                : []
        }).catch(console.log)

        if (webhook)
            webhook.send({
                embeds: [{
                    color: client.red,
                    title: `${e.Loud} Error Handler | Interaction Command`,
                    description: `\`\`\`js\n${err.stack?.slice(0, 4000)}\`\`\``,
                    fields: [
                        {
                            name: '👤 Author',
                            value: `${user} | ${user?.tag} | *\`${user.id}\`*`
                        },
                        {
                            name: '✍ Locale',
                            value: isTextChannel ? `Channel: ${channel} - ${channel?.name}` : 'Direct Messages'
                        },
                        {
                            name: '⚙ Command',
                            value: `</${commandName}${interaction?.options.getSubcommandGroup() ? ` ${interaction?.options.getSubcommandGroup()}` : ''}${interaction?.options.getSubcommand(false) ? ` ${interaction?.options.getSubcommand(false)}` : ''}:${commandId}>`,
                            inline: true

                        }
                    ],
                    footer: {
                        text: `Error Code: ${err.code || 'No error code'}`
                    }
                }],
                username: `${client.user.username} Error Reporter`
            }).catch(() => { })

        economy.add(user.id, 1500, `${e.gain} Ganhou 1500 Safiras descobrindo um bug no comando *${commandName}*`)

        return await interaction.reply({
            content: `${e.Warn} | Ocorreu um erro neste comando. Mas não se preocupe! Eu já avisei meu criador e ele vai arrumar isso rapidinho.\n${e.gain} | Te dei **+1500 ${moeda}** por ter descoberto esse bug.`,
            ephemeral: true
        }).catch(async () => {
            return await interaction.followUp({
                content: `${e.Warn} | Ocorreu um erro neste comando. Mas não se preocupe! Eu já avisei meu criador e ele vai arrumar isso rapidinho.\n${e.gain} | Te dei **+1500 ${moeda}** por ter descoberto esse bug.`,
                ephemeral: true
            }).catch(() => { })
        })

    }