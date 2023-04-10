import { ButtonStyle } from 'discord.js'
import { Config as config, ErrorsToIgnore, ErrorResponse } from '../../../util/Constants.js'
import { Emojis as e } from '../../../util/util.js'
import reply from './functions/reply.errors.js'
import { ChannelType } from 'discord.js'

export default
    async ({ interaction, Database, user, guild, channel, client }, err) => {
        console.log(err)
        if (
            !err
            || !interaction
            || !interaction?.commandName
            || [10062].includes(err.code)
            || err.message === 'Unknown interaction'
        ) return

        const { commandName, commandId } = interaction
        const isTextChannel = channel.type === ChannelType.GuildText

        const errorCode = err.code
        if (ErrorsToIgnore.includes(errorCode)) return reply(interaction, ErrorResponse[errorCode])

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

        if (owner)
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
                            // value: `</${commandName}${interaction?.options.getSubcommandGroup() ? ` ${interaction?.options.getSubcommandGroup()}` : ''}${interaction?.options.getSubcommand(false) ? ` ${interaction?.options.getSubcommand(false)}` : ''}:${commandId}>`,
                            value: interaction.mention,
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
            }).catch(() => { })

        client.sendWebhook(
            process.env.WEBHOOK_DATABASE_LOGS,
            {
                username: `[Saphire] Error Reporter`,
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
                }]
            }
        )

        Database.add(user.id, 1500, `${e.gain} Ganhou 1500 Safiras descobrindo um bug no comando *${commandName}*`)

        return await interaction.reply({
            content: `${e.Warn} | Ocorreu um erro neste comando. Mas não se preocupe! Eu já avisei meu criador e ele vai arrumar isso rapidinho.\n${e.gain} | Te dei **+1500 ${moeda}** por ter descoberto esse bug.`,
            ephemeral: true
        }).catch(async () => await interaction.followUp({
            content: `${e.Warn} | Ocorreu um erro neste comando. Mas não se preocupe! Eu já avisei meu criador e ele vai arrumar isso rapidinho.\n${e.gain} | Te dei **+1500 ${moeda}** por ter descoberto esse bug.`,
            ephemeral: true
        }).catch(() => { }))

    }