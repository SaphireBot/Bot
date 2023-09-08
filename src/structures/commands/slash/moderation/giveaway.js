import { ApplicationCommandOptionType, PermissionsBitField } from 'discord.js';
import { DiscordPermissons, PermissionsTranslate } from '../../../../util/Constants.js';
import createGiveaway from '../../functions/giveaway/create.giveaway.js';
import deleteGiveaway from '../../functions/giveaway/delete.giveaway.js';
import finishGiveaway from '../../functions/giveaway/finish.giveaway.js';
import infoGiveaway from '../../functions/giveaway/info.giveaway.js';
import listGiveaway from '../../functions/giveaway/list.giveaway.js';
import rerollGiveaway from '../../functions/giveaway/reroll.giveaway.js';
import resetGiveaway from '../../functions/giveaway/reset.giveaway.js';

export default {
    name: 'giveaway',
    description: '[moderation] Crie sorteios no servidor',
    category: "moderation",
    type: 1,
    name_localizations: { 'pt-BR': 'sorteio' },
    description_localizations: { "en-US": "[moderation] Create a giveaway in guild", 'pt-BR': '[moderação] Crie sorteios no servidor' },
    dm_permission: false,
    options: [
        {
            name: 'create',
            name_localizations: { 'pt-BR': 'criar' },
            description: '[moderation] Crie um novo sorteio',
            type: 1,
            options: [
                {
                    name: 'prize',
                    name_localizations: { 'pt-BR': 'prêmio' },
                    description: 'Prêmio do sorteio (2~150 caracteres)',
                    min_length: 2,
                    max_length: 150,
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'time',
                    name_localizations: { 'pt-BR': 'tempo' },
                    description: 'Para quando é o sorteio? (Ex: 1d 2h 3m) (Limite: 5 segundos a 2 anos)',
                    max_length: 100,
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'channel',
                    name_localizations: { 'pt-BR': 'canal' },
                    description: 'Canal do sorteio',
                    type: ApplicationCommandOptionType.Channel,
                    required: true,
                    channel_types: [0, 5]
                },
                {
                    name: 'winners',
                    name_localizations: { 'pt-BR': 'vencedores' },
                    description: 'Quantidade de vencedores (1~250)',
                    type: ApplicationCommandOptionType.Integer,
                    max_value: 250,
                    min_value: 1,
                    required: true
                },
                {
                    name: 'requires',
                    name_localizations: { 'pt-BR': 'requisitos' },
                    description: 'Quais os requisitos para este sorteio',
                    max_length: 1024,
                    type: ApplicationCommandOptionType.String,
                },
                {
                    name: 'imageurl',
                    name_localizations: { 'pt-BR': 'url_da_imagem' },
                    description: 'Quer alguma imagem no sorteio?',
                    type: ApplicationCommandOptionType.String,
                },
                {
                    name: 'color',
                    name_localizations: { 'pt-BR': 'cor' },
                    description: 'Selecione a cor da embed',
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true
                },
                {
                    name: 'sponsor',
                    name_localizations: { 'pt-BR': 'patrocinador' },
                    description: 'Patrocinador do sorteio',
                    type: ApplicationCommandOptionType.User,
                    autocomplete: true
                },
                {
                    name: 'account_days',
                    name_localizations: { 'pt-BR': 'dias_de_conta_criada' },
                    description: 'Quantidade mínima de dias com a conta criada',
                    type: ApplicationCommandOptionType.Integer,
                    autocomplete: true,
                    min_value: 0
                },
                {
                    name: 'server_days',
                    name_localizations: { 'pt-BR': 'dias_dentro_do_servidor' },
                    description: 'Quantidade mínima de dias dentro do servidor',
                    type: ApplicationCommandOptionType.Integer,
                    autocomplete: true,
                    min_value: 0
                }
            ]
        },
        {
            name: 'list',
            name_localizations: { "en-US": "list", 'pt-BR': 'lista' },
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
                    name_localizations: { "en-US": "id", 'pt-BR': 'id_do_sorteio' },
                    description: 'ID do sorteio (Id da mensagem do sorteio)',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                },
                {
                    name: 'winners',
                    name_localizations: { "en-US": "winners", 'pt-BR': 'vencedores' },
                    description: 'Quantidade de vencedores (1 ~ 250)',
                    type: ApplicationCommandOptionType.Integer,
                    min_value: 1,
                    max_value: 250,
                    required: true
                }
            ]
        },
        {
            name: 'options',
            name_localizations: { "en-US": "options", 'pt-BR': 'opções' },
            description: '[moderation] Opções e funções adicionais',
            type: 1,
            options: [
                {
                    name: 'method',
                    name_localizations: { "en-US": "method", 'pt-BR': 'função' },
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
                    name_localizations: { "en-US": "select_giveaway", 'pt-BR': 'selecionar_sorteio' },
                    description: 'Selecione o sorteio relacionado',
                    type: 3,
                    required: true,
                    autocomplete: true
                }
            ]
        }
    ],
    apiData: {
        name: "giveaway",
        description: "Um super e poderoso sistema/comando de sorteios para o seu servidor se destacar dos demais.",
        category: "Moderação",
        synonyms: ["sorteio"],
        tags: [],
perms: {
            user: [DiscordPermissons.ManageEvents],
            bot: [DiscordPermissons.SendMessages]
        }
    },
    async execute({ interaction, guildData, e, client }) {

        const { options, guild } = interaction
        const me = await guild.members.fetch(client.user.id).catch(() => null)

        if (!me)
            return interaction.reply({
                content: `${e.DenyX} | Client Not Found At Guild Priority Members Fetcher #164845`,
                ephemeral: true
            })

        if (!me.permissions.has(PermissionsBitField.Flags.SendMessages, true))
            return interaction.reply({
                content: `❌ | Eu preciso da permissão **\`${PermissionsTranslate.ManageMessages}\`**. Por favor, me dê esta permissão que eu vou conseguir fazer o sorteio.`,
                ephemeral: true
            })

        const member = await guild.members.fetch(interaction.user.id).catch(() => null)

        if (!member)
            return interaction.reply({
                content: `${e.DenyX} | Command Member Not Found At Guild Priority Members Fetcher #164846`,
                ephemeral: true
            })

        if (!member.permissions.has(PermissionsBitField.Flags.ManageEvents, true))
            return interaction.reply({
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
                case 'finish': finishGiveaway(interaction); break;
                case 'info': infoGiveaway(interaction, guildData); break;
            }
            return

        }

    }
}