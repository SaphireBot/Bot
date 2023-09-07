import { Database, SaphireClient as client } from '../../../../classes/index.js';
import { ButtonStyle, Message } from 'discord.js';
import { Emojis as e } from '../../../../util/util.js';

export default {
    name: 'help',
    description: 'Comando de ajuda da Saphire',
    aliases: ['h', 'ajuda', 'commands', 'comandos'],
    category: "bot",
    /**
     * @param { Message } message
     */
    async execute(message) {

        const commands = client.prefixCommands.toJSON()
        const prefix = Database.getPrefix(message.guild.id).random()
        const embeds = EmbedGenerator(commands)

        const components = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: "⬅️",
                        custom_id: 'left',
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        emoji: "➡️",
                        custom_id: 'right',
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        emoji: e.Trash,
                        custom_id: 'cancel',
                        style: ButtonStyle.Danger
                    },
                    {
                        type: 2,
                        label: "Todos os Comandos",
                        url: client.url + '/commands',
                        style: ButtonStyle.Link
                    }
                ]
            }
        ]

        const msg = await message.reply({ embeds: [embeds[0]], components: embeds.length > 1 ? components : [] })

        if (!embeds.length) return

        let index = 0
        const collector = msg.createMessageComponentCollector({
            filter: int => int.user.id == message.author.id,
            idle: 1000 * 60 * 5
        })
            .on("collect", int => {

                const { customId } = int

                if (customId == "cancel") return collector.stop()

                switch (customId) {
                    case 'left':
                        index--
                        if (index < 0) index = embeds.length - 1
                        break;
                    case 'right':
                        index++
                        if (index >= embeds.length) index = 0
                        break;
                }

                return int.update({ embeds: [embeds[index]] }).catch(() => { })
            })
            .on('end', () => msg.edit({ components: [] }))

        function EmbedGenerator(array) {

            let amount = 5
            let page = 1
            let embeds = []
            let length = array.length / 5 <= 1 ? 1 : parseInt((array.length / 5))

            for (let i = 0; i < array.length; i += 5) {

                let current = array.slice(i, amount)
                let description = current.map(cmd => `\`${prefix}${cmd.name}\` - ${cmd.description}`).join('\n')
                let pageCount = length > 1 ? ` ${page}/${length}` : ''

                embeds.push({
                    color: client.blue,
                    title: `${e.Commands} Comandos em Prefixos${pageCount}`,
                    url: client.url + '/commands',
                    description,
                    fields: [
                        {
                            name: "Comandos Disponíves",
                            value: `Prefix: ${client.prefixCommands.size} Comandos\nSlash: ${client.slashCommands.size} Comandos`
                        },
                        {
                            name: "Prefixos do Servidor",
                            value: Database.getPrefix(message.guild.id).map(prefix => `\`${prefix}\``).join(', ')
                        }
                    ],
                })

                page++
                amount += 5

            }

            return embeds
        }

    }
}