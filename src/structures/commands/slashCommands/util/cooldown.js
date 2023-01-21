import { ApplicationCommandOptionType } from "discord.js"

export default {
    name: 'cooldown',
    description: '[util] Veja todos os seus cooldown em todos os meus comandos',
    category: "util",
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'user',
            description: 'Cooldown de um usuário',
            type: ApplicationCommandOptionType.User
        }
    ],
    async execute({ interaction, client, Database, e }) {

        const { options } = interaction

        const user = options.getUser('user') || interaction.user
        const isGlobal = user.id === client.user.id

        const msg = await interaction.reply({
            embeds: [{
                color: client.blue,
                description: `${e.Loading} | Carregando...`
            }],
            fetchReply: true
        })

        const data = await Database.User.findOne({ id: user.id }, 'Timeouts Vip')
        const clientData = await Database.Client.findOne({ id: client.user.id }, 'Timeouts')
        const color = data?.Color?.Set || client.blue
        const timeouts = data?.Timeouts
        const clientTimeouts = clientData?.Timeouts

        let TDaily, TPig, TBit, TLikes, TVip

        if (isGlobal)
            return SendCooldownsSaphire()

        if (!timeouts)
            return await interaction.editReply({
                content: `${e.Database} | DATABASE | Nenhum dado foi encontrado para: **${user.tag} \`${user.id}\`**`
            })

        const Daily = timeouts.Daily
        const Porquinho = timeouts.Porquinho
        const Bitcoin = timeouts.Bitcoin
        const Rep = timeouts.Rep
        const Vip = {
            DateNow: data.Vip.DateNow,
            TimeRemaing: data.Vip.TimeRemaing || 0,
            Permanent: data.Vip.Permanent
        }

        // Timeout Daily
        TDaily = cooldown(86400000, Daily)

        // Timeout Pig
        TPig = cooldown(30000, Porquinho)

        // Timeout Bitcoin
        TBit = cooldown(7200000, Bitcoin)

        // Timeout Likes
        TLikes = cooldown(1800000, Rep)

        // Timeout Vip
        TVip = cooldown(Vip.TimeRemaing, Vip.DateNow, true)

        return msg.edit({
            embeds: [
                {
                    color: color,
                    title: `⏱️ ${client.user.username} Timeouts | ${user?.username || "User not found."}`,
                    description: 'Aqui você pode conferir todos os timeouts.',
                    fields: [
                        {
                            name: `${e.VipStar} Vip`,
                            value: TVip || `\`Você não deveria ver essa mensagem... Usa "/bug", por favor?\``
                        },
                        {
                            name: `${e.MoneyWings} Daily`,
                            value: TDaily || `\`Você não deveria ver essa mensagem... Usa "/bug", por favor?\``
                        },
                        {
                            name: `${e.Pig} Pig`,
                            value: TPig || `\`Você não deveria ver essa mensagem... Usa "/bug", por favor?\``
                        },
                        {
                            name: `${e.BitCoin} Bitcoin`,
                            value: TBit || `\`Você não deveria ver essa mensagem... Usa "/bug", por favor?\``
                        },
                        {
                            name: `${e.Like} Like`,
                            value: TLikes || `\`Você não deveria ver essa mensagem... Usa "/bug", por favor?\``
                        }
                    ]
                }
            ]
        }).catch(() => { })

        function SendCooldownsSaphire() {
            return msg.edit({
                embeds: [
                    {
                        color: color,
                        title: `⏱️ ${client.user.username} Timeouts | Global`,
                        description: 'Timeouts Globais',
                        fields: [{
                            name: `${e.MoneyWings} Restaurar Dívida`,
                            value: cooldown(86400000, clientTimeouts.RestoreDividas) || `\`Você não deveria ver essa mensagem... Usa "/bug", por favor?\``
                        }]
                    }
                ]
            }).catch(() => { })
        }

        function cooldown(ms, timeDatabase = 0, vip = false) {

            if (vip) {
                if (Vip.Permanent) return `\`Permanente\``
                return ms - (Date.now() - timeDatabase) > 0 ? cooldown(ms, timeDatabase) : '\`Indisponível\`'
            }

            return Date.Timeout(ms, timeDatabase) ? `${e.Loading} ${Date.Timestamp(new Date(timeDatabase + ms), 'R', true)}` : `${e.CheckV} \`Disponível\``
        }

    }
}