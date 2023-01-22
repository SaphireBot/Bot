import { Emojis as e } from '../../../../util/util.js'
import { Database, Modals } from '../../../../classes/index.js'
import { ApplicationCommandOptionType } from 'discord.js'
import { Permissions } from '../../../../util/Constants.js'
import FlagGame from './bandeiras/manager.bandeiras.js'

export default {
    name: 'quiz',
    description: '[game] Todos os Quiz da Saphire em um só lugar',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'logomarca',
            description: '[game] Um quiz de logomarcas',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'view',
                    description: '[games] Veja uma única marca',
                    type: 1,
                    options: [
                        {
                            name: 'select_logo_marca',
                            description: 'Veja as marcas disponíveis do comando',
                            type: 3,
                            required: true,
                            autocomplete: true
                        }
                    ]
                },
                {
                    name: 'list',
                    description: '[games] Ver a lista de logo/marcas',
                    type: 1,
                    options: [
                        {
                            name: 'filter',
                            description: 'Filtre as marcas pelas primeiras letras (ou não)',
                            type: 3
                        }
                    ]
                },
                {
                    name: 'game',
                    description: '[games] Começar o quiz de logo/marcas',
                    type: 1,
                    options: [
                        {
                            name: 'color',
                            description: 'Escolher cor da embed do jogo',
                            type: 3,
                            autocomplete: true
                        }
                    ]
                },
                {
                    name: 'options',
                    description: '[games] Opções gerais do comando',
                    type: 1,
                    options: [
                        {
                            name: 'option',
                            description: 'Opções gerais do comando',
                            type: 3,
                            required: true,
                            choices: [
                                {
                                    name: 'Informações',
                                    value: 'info'
                                },
                                {
                                    name: 'Reportar um erro/bug',
                                    value: 'bug'
                                },
                                {
                                    name: 'Enviar uma sugestão de logomarca',
                                    value: 'suggest'
                                },
                                {
                                    name: '[Admin] Liberar canal para outro jogo',
                                    value: 'liberate'
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            name: 'bandeiras',
            description: '[game] Um quiz de bandeiras',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'options',
                    description: 'Opções disponíveis do jogo bandeiras',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: 'Nova Partida',
                            value: 'play'
                        },
                        {
                            name: 'Minha Pontuação',
                            value: 'points'
                        },
                        {
                            name: 'Créditos',
                            value: 'credits'
                        }
                    ]
                }
            ]
        }
    ],
    helpData: {
        color: '',
        description: '',
        permissions: [],
        fields: []
    },
    async execute({ interaction, client }) {

        const { options, channel, member, user } = interaction
        const quiz = options.getSubcommandGroup() || options.getSubcommand()

        const game = {
            logomarca,
            bandeiras
        }[quiz]

        if (!game)
            return await interaction.reply({
                content: `${e.Deny} | Jogo não encontrado. #2498498`,
                ephemeral: true
            })

        return game()

        async function logomarca() {

            const subCommand = options.getSubcommand()

            if (subCommand === 'options') return adicitionalOptions()
            return import(`../../functions/logomarca/${subCommand}.logomarca.js`).then(execute => execute.default(interaction))

            async function adicitionalOptions() {

                const func = options.getString('option')
                if (func === 'liberate') return liberate()
                if (func === 'bug') return await interaction.showModal(Modals.logomarcaBug)
                if (func === 'suggest') return await interaction.showModal(Modals.indicateLogomarca)

                if (func === 'info')
                    return await interaction.reply({
                        embeds: [
                            {
                                color: client.blue,
                                title: `${e.logomarca} ${client.user.username}'s Logo & Marca Info`,
                                description: `O jogo Logo & Marca é um Quiz. O objetivo é simples, acertar o máximo de logos e marcas que aparecer.`,
                                fields: [
                                    {
                                        name: '🔄 Reset',
                                        value: 'Quando ninguém acertar a marca, você pode recomeçar um novo jogo sem ter que usar o comando novamente. E claro, o reset é para começar tudo novamente.'
                                    },
                                    {
                                        name: '😨 HO MEU DEUS, EU NÃO APAREÇO NO RANKING',
                                        value: 'Calma aí coisinha fofa! Apenas os 7 primeiros com mais pontos aparecem no ranking, mas o pontos serão contados e irão pro ranking assim que o jogo terminar.'
                                    },
                                    {
                                        name: `${e.bug} Bugou, e agora?`,
                                        value: `Reporte o problema atráves do comando </logomarcas options:${interaction.commandId}> e use a opção \`Reportar um erro/bug\``
                                    },
                                    {
                                        name: `${e.saphireOlhadinha} Intelligence`,
                                        value: 'Já pensou você com mais de 100 pontos e meu criador me reinicia ou por algum motivo no universo o comando buga? Então, com o Intelligence, você não irá perder seus pontos. É só começar outro jogo e ao final dele, todos os pontos de todos os seus jogos serão adicionados ao seu perfil. Legal, né?'
                                    },
                                    {
                                        name: `${e.logomarca} Créditos`,
                                        value: `${e.Gear} Código Fonte: ${client.users.resolve(Database.Names.Rody)?.tag || 'Rody#1000'}\n🖌 Designer e Edição: ${client.users.resolve(Database.Names.San)?.tag || 'San O.#0001'}\n${e.boxes} Recursos: ${client.users.resolve(Database.Names.Khetlyn)?.tag || 'Khetlyn#4323'} & ${client.users.resolve(Database.Names.Moana)?.tag || 'moana#6370'}`
                                    }
                                ],
                                footer: { text: `${Database.Logomarca.length || 0} Logos & Marcas` }
                            }
                        ]
                    })
            }

            async function liberate() {

                const inChannelsGame = await Database.Cache.Logomarca.get(`${client.shardId}.Channels`)

                if (!inChannelsGame || !inChannelsGame.length || !inChannelsGame?.includes(channel.id))
                    return await interaction.reply({
                        content: `${e.Deny} | Esse canal não está cadastrado no canais em jogo.`,
                        ephemeral: true
                    })

                if (!member.memberPermissions(Permissions.Administrator))
                    return await interaction.reply({
                        content: `${e.Deny} | Apenas um administrador do servidor pode liberar outro jogo neste canal.`,
                        ephemeral: true
                    })

                await Database.Cache.Logomarca.pull(`${client.shardId}.Channels`, channel.id)

                return await interaction.reply({
                    content: `${e.Check} | Esse canal foi retirado dos canais registrados e pode começar um novo jogo.`
                })

            }
        }

        async function bandeiras() {
            const option = options.getString('options')

            if (option === 'play')
                return new FlagGame(interaction).register()

            if (option === 'credits') {

                const rody = await client.users.fetch(Database.Names.Rody).then(u => `${u.tag} - \`${u.id}\``).catch(() => `Rody - \`${Database.Names.Rody}\``)
                const lereo = await client.users.fetch(Database.Names.Lereo).then(u => `${u.tag} - \`${u.id}\``).catch(() => `Lereo - \`${Database.Names.Lereo}\``)
                const moana = await client.users.fetch(Database.Names.Moana).then(u => `${u.tag} - \`${u.id}\``).catch(() => `Moana - \`${Database.Names.Moana}\``)
                const andre = await client.users.fetch(Database.Names.Andre).then(u => `${u.tag} - \`${u.id}\``).catch(() => `Andre - \`${Database.Names.Andre}\``)
                const pandinho = await client.users.fetch(Database.Names.Pandinho).then(u => `${u.tag} - \`${u.id}\``).catch(() => `Pandinho - \`${Database.Names.Pandinho}\``)
                const gorniaky = await client.users.fetch(Database.Names.Gorniaky).then(u => `${u.tag} - \`${u.id}\``).catch(() => `Gorniaky - \`${Database.Names.Gorniaky}\``)
                const mari = await client.users.fetch(Database.Names.Mari).then(u => `${u.tag} - \`${u.id}\``).catch(() => `Mari - \`${Database.Names.Mari}\``)

                return await interaction.reply({
                    embeds: [{
                        color: client.blue,
                        title: '📝 Créditos aos envolvidos',
                        description: 'Pessoas que fizeram este comando acontecer',
                        fields: [
                            {
                                name: '🫡 Supervisão Geral',
                                value: `${mari}`
                            },
                            {
                                name: '⚙️ Código Fonte',
                                value: `${rody}`
                            },
                            {
                                name: '👨‍💻 Suporte ao Código Fonte',
                                value: `${andre}\n${pandinho}\n${gorniaky}`
                            },
                            {
                                name: '🗺️ Coleta e Disponibilidade de Bandeiras',
                                value: `${lereo}\n${moana}`
                            }
                        ],
                        footer: {
                            text: '❤️ Powered By: Com muito carinho'
                        }
                    }]
                })
            }

            if (option === 'points') {

                const userData = await Database.User.findOne({ id: user.id }, 'GamingCount.FlagCount')
                const points = userData?.GamingCount?.FlagCount || 0
                return await interaction.reply({
                    content: `${e.Check} | Você tem exatamente **${points} acertos** no Bandeira Quiz.`
                })
            }

            return await interaction.reply({
                content: `${e.Deny} | Nenhuma função foi encontrada. #165651`,
                ephemeral: true
            })
        }

    }
}