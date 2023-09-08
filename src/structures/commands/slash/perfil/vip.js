import { ApplicationCommandOptionType } from 'discord.js';
import { Emojis as e } from '../../../../util/util.js';
import viewer from './vip/viewer.vip.js';
import buy from './vip/buy.vip.js';

export default {
    name: 'vip',
    description: '[perfil] Gerencie o seu vip aqui',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'buy',
            name_localizations: { 'pt-BR': 'comprar' },
            description: 'Compre mais tempo de VIP',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'time',
                    name_localizations: { 'pt-BR': 'tempo' },
                    description: 'O tempo do VIP',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: '1 Semana (150.000 Safiras)',
                            value: 'week'
                        },
                        {
                            name: '1 Mês (500.000 Safiras)',
                            value: 'month'
                        },
                        {
                            name: '1 Ano (5.000.000 Safiras)',
                            value: 'year'
                        }
                    ]
                },
                {
                    name: 'donate',
                    name_localizations: { 'pt-BR': 'doar' },
                    description: 'Doe o tempo de VIP para um usuário',
                    type: ApplicationCommandOptionType.User
                }
            ]
        },
        {
            name: 'view',
            name_localizations: { 'pt-BR': 'ver' },
            description: 'Veja o tempo de VIP de um usuário',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'user',
                    name_localizations: { 'pt-BR': 'usuário' },
                    description: 'Selecione um usuário',
                    type: ApplicationCommandOptionType.User
                }
            ]
        }
    ],
    apiData: {
        name: "vip",
        description: "Compre e confira seu VIP dentro da Saphire.",
        category: "Perfil",
        synonyms: [],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction }) {

        const { options } = interaction
        const subCommand = options.getSubcommand()

        if (subCommand == 'view') return viewer(interaction)
        if (subCommand == 'buy') return buy(interaction)

        return interaction.reply({
            content: `${e.Animated.SaphirePanic} | Nenhuma função foi encontrada.`,
            ephemeral: true
        })
    }
}