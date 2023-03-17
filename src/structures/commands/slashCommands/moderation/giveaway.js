import { ApplicationCommandOptionType } from 'discord.js'
import { DiscordPermissons, PermissionsTranslate } from '../../../../util/Constants.js'
import createGiveaway from '../../functions/giveaway/create.giveaway.js'
import deleteGiveaway from '../../functions/giveaway/delete.giveaway.js'
import finishGiveaway from '../../functions/giveaway/finish.giveaway.js'
import infoGiveaway from '../../functions/giveaway/info.giveaway.js'
import listGiveaway from '../../functions/giveaway/list.giveaway.js'
import rerollGiveaway from '../../functions/giveaway/reroll.giveaway.js'
import resetGiveaway from '../../functions/giveaway/reset.giveaway.js'

export default {
    name: 'giveaway',
    description: '[moderation] Crie sorteios no servidor',
    category: "moderation",
    type: 1,
    name_localizations: { "en-US": "giveaway", 'pt-BR': 'sorteio' },
    dm_permission: false,
    options: [
        {
            name: 'create',
            description: '[moderation] Crie um novo sorteio',
            type: 1,
            options: [
                {
                    name: 'prize',
                    description: 'Prêmio do sorteio (2~100 caracteres)',
                    min_length: 2,
                    max_length: 100,
                    type: 3,
                    required: true
                },
                {
                    name: 'time',
                    description: 'Para quando é o sorteio?',
                    max_length: 100,
                    type: 3,
                    required: true
                },
                {
                    name: 'channel',
                    description: 'Canal do sorteio',
                    type: 7,
                    required: true,
                    channel_types: [0, 5]
                },
                {
                    name: 'winners',
                    description: 'Quantidade de vencedores',
                    type: 4,
                    max_value: 20,
                    min_value: 1
                },
                {
                    name: 'requires',
                    description: 'Quais os requisitos para este sorteio',
                    max_length: 1024,
                    type: 3
                },
                {
                    name: 'imageurl',
                    description: 'Quer alguma imagem no sorteio?',
                    type: 3
                },
                {
                    name: 'color',
                    description: 'Selecione a cor da embed',
                    type: 3,
                    autocomplete: true
                }
            ]
        },
        {
            name: 'list',
            description: '[moderation] Lista de todos os sorteios',
            type: 1
        },
        {
            name: 'reroll',
            description: '[moderation] Resorteie um sorteio',
            type: 1,
            options: [
                {
                    name: 'id',
                    description: 'ID do sorteio (Id da mensagem do sorteio)',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                },
                {
                    name: 'winners',
                    description: 'Quantidade de vencedores',
                    type: ApplicationCommandOptionType.Integer,
                    min_value: 1,
                    max_value: 20
                }
            ]
        },
        {
            name: 'options',
            description: '[moderation] Opções e funções adicionais',
            type: 1,
            options: [
                {
                    name: 'method',
                    description: 'Escolha o método a ser utilizado',
                    type: 3,
                    required: true,
                    choices: [
                        {
                            name: 'Deletar',
                            value: 'delete'
                        },
                        {
                            name: 'Resetar',
                            value: 'reset'
                        },
                        {
                            name: 'Forçar Finalização',
                            value: 'finish'
                        },
                        {
                            name: 'Ver Informações',
                            value: 'info'
                        }
                    ]
                },
                {
                    name: 'select_giveaway',
                    description: 'Selecione o sorteio relacionado',
                    type: 3,
                    required: true,
                    autocomplete: true
                }
            ]
        }
    ],
    async execute({ interaction, guildData, e }) {

        const { options, guild } = interaction

        if (!guild.members.me.permissions.has(DiscordPermissons.ManageMessages, true))
            return await interaction.reply({
                content: `❌ | Eu preciso da permissão **\`${PermissionsTranslate.ManageMessages}\`**. Por favor, me dê esta permissão que eu vou conseguir fazer o sorteio.`,
                ephemeral: true
            })

        const member = guild.members.cache.get(interaction.user.id)

        if (!member)
            return await interaction.reply({ content: `${e.Deny} | Por favor, use o comando novamente.`, ephemeral: true })

        if (!member.permissions.has(DiscordPermissons.ManageEvents, true))
            return await interaction.reply({
                content: `${e.Deny} | Você precisa da permissão **${PermissionsTranslate.ManageEvents}** para executar este comando.`,
                ephemeral: true
            })

        const subCommand = options.getSubcommand()

        switch (subCommand) {
            case 'create': createGiveaway(interaction); break;
            case 'list': listGiveaway(interaction, guildData); break;
            case 'reroll': rerollGiveaway(interaction, guildData); break;
            case 'options': methodsGiveaway(); break;
        }

        return

        async function methodsGiveaway() {

            switch (options.getString('method')) {
                case 'delete': deleteGiveaway(interaction, guildData); break;
                case 'reset': resetGiveaway(interaction, guildData); break;
                case 'finish': finishGiveaway(interaction, guildData); break;
                case 'info': infoGiveaway(interaction, guildData); break;
            }
            return

        }

    }
}