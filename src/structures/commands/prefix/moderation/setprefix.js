import { ButtonStyle, Message, PermissionFlagsBits } from 'discord.js';
import { SaphireClient as client, Database } from '../../../../classes/index.js';
import { Emojis as e } from '../../../../util/util.js';

export default {
    name: 'setprefix',
    description: 'Configure os prefixos do servidor',
    aliases: ['prefix', 'prefixes', 'setprefixes'],
    category: "Moderação",
    api_data: {
        tags: [],
        perms: { user: [], bot: [] }
    },
    /**
     * @param { Message } message
     * @param { string[] } args
     */
    async execute(message) {

        const { member, guild, author } = message

        if (!member.permissions.any(PermissionFlagsBits.ManageGuild, true))
            return message.react(e.DenyX).catch(() => { })

        return message.reply({
            embeds: [{
                color: client.blue,
                title: `${e.Animated.SaphireReading} ${guild.name}'s Prefixes`,
                description: Database.getPrefix(guild.id).map((pr, i) => `${i + 1}. **${pr}**`).join('\n'),
                fields: [
                    {
                        name: `${e.Info} Limites`,
                        value: "Cada servidor tem direito a 5 prefixos customizados."
                    }
                ]
            }],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Configurar',
                            emoji: e.Commands,
                            custom_id: JSON.stringify({ c: 'prefix', userId: author.id }),
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Resetar',
                            emoji: '🧹',
                            custom_id: JSON.stringify({ c: 'prefix', userId: author.id, src: "refresh" }),
                            style: ButtonStyle.Primary
                        },
                        {
                            type: 2,
                            label: 'Cancelar Comando',
                            emoji: e.Trash,
                            custom_id: JSON.stringify({ c: 'delete', userId: author.id }),
                            style: ButtonStyle.Danger
                        },
                        {
                            type: 2,
                            label: "Ver Comandos",
                            emoji: '🔎',
                            url: client.url + "/commands",
                            style: ButtonStyle.Link
                        }
                    ]
                }
            ]
        })
    }
}