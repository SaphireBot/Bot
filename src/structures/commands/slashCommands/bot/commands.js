import { Emojis as e } from '../../../../util/util.js'
import { ApplicationCommandOptionType, ButtonStyle } from 'discord.js'

export default {
    name: 'commands',
    name_localizations: { "en-US": "commands", 'pt-BR': 'comandos' },
    description: '[bot] Veja seus últimos comandos usados',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'user',
            description: 'Veja os comandos de algum usuário',
            type: ApplicationCommandOptionType.User
        }
    ],
    helpData: {
        description: 'Comando simples para ver os comandos que alguém usou'
    },
    apiData: {
        name: "commands",
        description: "Veja os comandos mais usados desde o último reinício",
        category: "Saphire",
        synonyms: ["comandos"],
        perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, client, Database }) {

        const { options, user: author } = interaction
        const user = options.getUser('user') || author
        const commandsCached = await Database.Cache.Commands.get(`${user.id}`)

        if (!commandsCached)
            return interaction.reply({
                content: `${e.Deny} | Nenhum comando usado foi encontrado.`,
                ephemeral: true
            })

        const commands = Object.entries(commandsCached || {})
        const embeds = EmbedGenerator(commands)

        if (!embeds[1])
            return interaction.reply({ embeds: [embeds[0]] })

        const msg = await interaction.reply({
            embeds: [embeds[0]],
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: '⏮️',
                        custom_id: '0',
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        emoji: '⬅️',
                        custom_id: '-1',
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        emoji: '➡️',
                        custom_id: '+1',
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        emoji: '⏭️',
                        custom_id: 'last',
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        emoji: e.Trash,
                        custom_id: 'cancel',
                        style: ButtonStyle.Danger
                    }
                ]
            }],
            fetchReply: true
        })

        let index = 0
        const collector = msg.createMessageComponentCollector({
            filter: int => int.user.id === interaction.user.id,
            idle: 60000,
            errors: ['idle']
        })
            .on('collect', async int => {

                const { customId } = int

                if (customId === 'cancel')
                    return collector.stop()

                if (customId === '0') index = 0

                if (customId === '-1') {
                    index--
                    if (!embeds[index]) index = embeds.length - 1
                }

                if (customId === '+1') {
                    index++
                    if (!embeds[index]) index = 0
                }

                if (customId === 'last') index = embeds.length - 1

                return await int.update({ embeds: [embeds[index]] }).catch(() => { })
            })
            .on('end', () => {
                const embed = embeds[index]
                embed.color = client.red
                return interaction.editReply({ content: `${e.Deny} | Tempo acabou.`, embeds: [embed], components: [] }).catch(() => { })
            })

        function EmbedGenerator(array) {

            let amount = 4
            let page = 1
            let embeds = []
            let length = array.length / 4 <= 1 ? 1 : parseInt((array.length / 4) + 1)

            for (let i = 0; i < array.length; i += 4) {

                let current = array.slice(i, amount)
                let fields = current.map(data => ({ name: `/${data[0]} (${data[1].length}x)`, value: `${data[1].sort((a, b) => b - a).slice(0, 10).map(dateNow => `\`${Date.format(dateNow, false, false)}\``).join('\n')}`.limit('MessageEmbedFieldValue') }))
                let pageCount = length > 1 ? ` ${page}/${length}` : ''

                embeds.push({
                    color: client.blue,
                    title: `${e.Gear} ${client.user.username}'s Command Search System${pageCount}`,
                    description: `${user.username} - \`${user.id}\``,
                    fields,
                    footer: {
                        text: `${commands.reduce((acc, value) => acc += value[1].length, 0)} comandos usados`,
                    }
                })

                page++
                amount += 4

            }

            return embeds
        }
    }
}