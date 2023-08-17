import { ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, time } from "discord.js";
import { SaphireClient as client } from "../../../../classes/index.js";
import { setTimeout as sleep } from 'node:timers/promises'
import { Emojis as e } from "../../../../util/util.js";

/**
 * @param { ChatInputCommandInteraction | ButtonInteraction } interaction
 */
export default async (interaction, isRefresh) => {

    const { user, message } = interaction

    if (isRefresh) {

        if (user.id !== message.interaction.user.id)
            return interaction.reply({
                content: `${e.Deny} | Você não pode clicar aqui, ok?`,
                ephemeral: true
            })

        await interaction.update({
            content: `${e.Loading} | Carregando dados...`,
            components: [{
                type: 1,
                components: [{
                    type: 2,
                    label: 'Atualizando',
                    emoji: e.Loading,
                    custom_id: 'loading',
                    style: ButtonStyle.Primary,
                    disabled: true
                }]
            }]
        })
        await sleep(2000)
    } else await interaction.reply({ content: `${e.Loading} | Carregando dados...` })

    const command = client.application.commands.cache
    const format = commandName => {
        if (/[A-Z]+/.test(commandName)) return `APP | ${commandName}`
        const cmdId = command.find(cmd => cmd?.name == commandName)?.id
        if (cmdId) return `</${commandName}:${cmdId}>`
        return `/${commandName}`
    }

    const commandsEntries = Object.entries(client.commandsUsed)
    const commands = commandsEntries
        .sort((a, b) => b[1] - a[1])
        .map(([commandName, amount]) => `${format(commandName)}: ${amount}`)
        .join('\n')

    const uptimeDate = new Date(Date.now() - client.uptime)

    return interaction.editReply({
        content: null,
        embeds: [{
            color: client.blue,
            title: `${e.Gear} Contador de Comandos`,
            description: commands,
            fields: [
                {
                    name: '📋 Contagem Completa',
                    value: `${Object.values(client.commandsUsed).reduce((a, b) => a += b, 0) || 0} Comandos foram usados nesta sessão\n${commandsEntries.length} Comandos ativos`
                },
                {
                    name: '⏱️ Tempo de Contagem',
                    value: `${time(uptimeDate, 'F')} ${time(uptimeDate, 'R')}`
                }
            ]
        }],
        components: [{
            type: 1,
            components: [{
                type: 2,
                label: 'Atualizar',
                emoji: '🔄',
                custom_id: JSON.stringify({ c: 'commands' }),
                style: ButtonStyle.Primary
            }]
        }]
    })
        .catch(err => interaction.editReply({
            content: `${e.Animated.SaphirePanic} | Não foi possível mostrar os resultados.\n${e.bug} | \`${err}\``,
            embeds: [],
            components: [{
                type: 1,
                components: [{
                    type: 2,
                    label: 'Tentar Novamente',
                    emoji: '🔄',
                    custom_id: JSON.stringify({ c: 'commands' }),
                    style: ButtonStyle.Primary
                }]
            }]
        }).catch(() => { }))
}