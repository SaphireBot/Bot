import { Modals } from '../../../../classes/index.js'
import { Permissions } from '../../../../util/Constants.js'
import { Emojis as e } from '../../../../util/util.js'

export default {
    name: 'logomarcas',
    description: '[games] Você é bom em adivinhar as marcas?',
    dm_permission: false,
    type: 1,
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
                            name: '[Admin] Liberar canal para outro jogo',
                            value: 'liberate'
                        }
                    ]
                }
            ]
        }
    ],
    helpData: {
        description: 'Um simples jogo para adivinhar as logomarcas',
        fields: [
            {
                name: `${e.Admin} Liberar novo jogo`,
                value: 'Essa função permite liberar criar um novo jogo no canal. Caso você retire o canal do registro do jogo tendo um jogo rodando, dois jogos poderão ser iniciados, causando lag e confusão no chat.\nEssa função é útil caso algum jogo por algum motivo não tenha sido retirado do registro na sua finalização.'
            }
        ]
    },
    async execute({ interaction, client, Database }) {

        const { options, channel, member } = interaction
        const subCommand = options.getSubcommand()

        switch (subCommand) {
            case 'list': import('../../functions/logomarca/list.logomarca.js').then(list => list.default(interaction)); break;
            case 'view': import('../../functions/logomarca/view.logomarca.js').then(view => view.default(interaction)); break;
            case 'game': import('../../functions/logomarca/game.logomarca.js').then(game => game.default(interaction)); break;
            case 'options': adicitionalOptions(); break;
            default:
                await interaction.reply({
                    content: `${e.Loading} | Nenhuma sub-função foi encontrada.`
                });
                break;
        }
        return

        async function adicitionalOptions() {

            const func = options.getString('option')
            if (func === 'liberate') return liberate()
            if (func === 'bug') return await interaction.showModal(Modals.logomarcaBug)

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
                                    value: 'Calma aí coisinha fofa! Apenas os 7 primeiros com mais pontos aparecem no ranking, mas o pontos são contatos e vai pro ranking assim que o jogo terminar.'
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
}