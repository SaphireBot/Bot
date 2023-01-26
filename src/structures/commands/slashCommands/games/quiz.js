import { Emojis as e } from '../../../../util/util.js'
import { ApplicationCommandOptionType } from 'discord.js'
import logomarca from './quiz/logomarca.quiz.js'
import bandeiras from './quiz/bandeiras.quiz.js'
import anime from './quiz/anime.quiz.js'

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
        },
        {
            name: 'anime',
            description: '[game] Um quiz de anime',
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'suggest',
                    description: 'Sugira um novo personagem/anime para o Quiz',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'image',
                            description: 'Imagem do personagem/anime',
                            type: ApplicationCommandOptionType.Attachment,
                            required: true
                        },
                        {
                            name: 'name',
                            description: 'Nome do anime/personagem',
                            type: ApplicationCommandOptionType.String,
                            required: true
                        },
                        {
                            name: 'anime',
                            description: 'De qual anime é este personagem? (Se for anime, coloque o mesmo nome)',
                            type: ApplicationCommandOptionType.String,
                            required: true
                        },
                        {
                            name: 'type',
                            description: 'Quem/oque é?',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            choices: [
                                {
                                    name: 'Anime',
                                    value: 'anime'
                                },
                                {
                                    name: 'Personagem Masculino',
                                    value: 'male'
                                },
                                {
                                    name: 'Personagem Feminino',
                                    value: 'female'
                                },
                                {
                                    name: 'Outros',
                                    value: 'others'
                                }
                            ]
                        }
                    ]
                },
                {
                    name: 'options',
                    description: 'Mais opções do comando aqui',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'method',
                            description: 'Saphire\'s Team Only - Método a ser executado',
                            type: ApplicationCommandOptionType.String,
                            autocomplete: true
                        },
                        {
                            name: 'search',
                            description: 'Pesquise por qualquer personagens/animes armazenados no banco de dados',
                            type: ApplicationCommandOptionType.String,
                            autocomplete: true
                        },
                        {
                            name: 'my_content',
                            description: 'Pesquise pelos seus personagens/animes aceitos',
                            type: ApplicationCommandOptionType.String,
                            autocomplete: true
                        }
                    ]
                },
                {
                    name: 'start',
                    description: 'Inicie um novo jogo',
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'category',
                            description: 'Escolha a categoria do Quiz',
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            choices: [
                                {
                                    name: 'Quiz de Animes',
                                    value: 'anime'
                                },
                                {
                                    name: 'Quiz de Personagens Masculinos',
                                    value: 'male'
                                },
                                {
                                    name: 'Quiz de Personagens Femininos',
                                    value: 'female'
                                },
                                {
                                    name: 'Quiz de Personagens Outros (Pets, dragões, robos, etc...)',
                                    value: 'others'
                                },
                                {
                                    name: 'Hiper Mix - Tudo Misturado',
                                    value: 'all'
                                },
                                {
                                    name: '[ADMIN ONLY] Liberar Canal',
                                    value: 'liberate'
                                }
                            ]
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
    async execute({ interaction }) {

        const { options } = interaction
        const quiz = options.getSubcommandGroup() || options.getSubcommand()
        const game = { logomarca, bandeiras, anime }[quiz]

        if (!game)
            return await interaction.reply({
                content: `${e.Deny} | Jogo não encontrado. #2498498`,
                ephemeral: true
            })

        return game(interaction)

    }
}