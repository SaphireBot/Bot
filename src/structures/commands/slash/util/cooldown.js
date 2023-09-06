import { ApplicationCommandOptionType } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"

export default {
    name: 'cooldown',
    description: '[util] Veja todos os seus cooldown em todos os meus comandos',
    category: "util",
    name_localizations: { "en-US": "timeout", 'pt-BR': 'timeout' },
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'user',
            description: 'Cooldown de um usuário',
            type: ApplicationCommandOptionType.User
        }
    ],
    apiData: {
        name: "cooldown",
        description: "Confira todos os seus timeouts",
        category: "Utilidades",
        synonyms: ["timeout"],
        perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, client, Database }) {

        const { options } = interaction

        const user = options.getUser('user') || interaction.user
        const isGlobal = user.id === client.user.id

        await interaction.reply({
            embeds: [{
                color: client.blue,
                description: `${e.Loading} | Carregando...`
            }]
        })

        const data = await Database.getUser(user.id)
        const clientData = await Database.Client.findOne({ id: client.user.id }, 'Timeouts')
        const timeouts = data?.Timeouts
        const clientTimeouts = clientData?.Timeouts

        if (isGlobal)
            return SendCooldownsSaphire()

        if (!timeouts)
            return interaction.editReply({
                content: `${e.Database} | DATABASE | Nenhum dado foi encontrado para: **${user.username} \`${user.id}\`**`
            })

        const Vip = {
            DateNow: data.Vip?.DateNow || 0,
            TimeRemaing: data.Vip?.TimeRemaing || 0,
            Permanent: data.Vip?.Permanent || false
        }

        return interaction.editReply({
            embeds: [
                {
                    color: client.blue,
                    title: `⏱️ ${client.user.username} Timeouts | ${user?.username || "User not found."}`,
                    description: 'Aqui você pode conferir todos os timeouts.',
                    fields: [
                        {
                            name: `${e.VipStar} Vip`,
                            value: `${cooldown(Vip.TimeRemaing, Vip.DateNow, true) || `\`Você não deveria ver essa mensagem... Usa "/bug", por favor?\``}`
                        },
                        {
                            name: `${e.topgg} Top.gg`,
                            value: `${cooldown(1000 * 60 * 60 * 12, timeouts.TopGGVote) || `\`Você não deveria ver essa mensagem... Usa "/bug", por favor?\``}`
                        },
                        {
                            name: `${e.MoneyWings} Daily`,
                            value: `${cooldown(86400000, timeouts.Daily) || `\`Você não deveria ver essa mensagem... Usa "/bug", por favor?\``}`
                        },
                        {
                            name: `${e.Pig} Pig`,
                            value: `${cooldown(30000, timeouts.Porquinho) || `\`Você não deveria ver essa mensagem... Usa "/bug", por favor?\``}`
                        },
                        {
                            name: `${e.BitCoin} Bitcoin`,
                            value: `${cooldown(7200000, timeouts.Bitcoin) || `\`Você não deveria ver essa mensagem... Usa "/bug", por favor?\``}`
                        },
                        {
                            name: `${e.Like} Like`,
                            value: `${cooldown(1800000, timeouts.Rep) || `\`Você não deveria ver essa mensagem... Usa "/bug", por favor?\``}`
                        }
                    ]
                }
            ]
        })
            .catch(err => interaction.editReply({
                content: `${e.DenyX} | Não foi possível editar a mensagem...\n${e.bug} | \`${err}\``,
                embeds: []
            }).catch(() => { }))

        function SendCooldownsSaphire() {
            return interaction.editReply({
                embeds: [
                    {
                        color: client.blue,
                        title: `⏱️ ${client.user.username} Timeouts | Global`,
                        description: 'Timeouts Globais',
                        fields: [{
                            name: `${e.MoneyWings} Restaurar Dívida`,
                            value: cooldown(86400000, clientTimeouts.RestoreDividas) || `\`Você não deveria ver essa mensagem... Usa "/bug", por favor?\``
                        }]
                    }
                ]
            })
                .catch(err => interaction.editReply({
                    content: `${e.DenyX} | Não foi possível editar a mensagem...\n${e.bug} | \`${err}\``,
                    embeds: []
                }).catch(() => { }))
        }

        function cooldown(ms = 0, timeDatabase = 0, vip = false) {

            if (vip) {
                if (Vip.Permanent) return `\`Permanente\``
                return ms - (Date.now() - timeDatabase) > 0 ? cooldown(ms, timeDatabase) : '\`Indisponível\`'
            }

            return Date.Timeout(ms, timeDatabase) ? `${e.Loading} ${Date.Timestamp(new Date(timeDatabase + ms), 'R', true)}` : `${e.CheckV} \`Disponível\``
        }

    }
}