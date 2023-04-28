import { ApplicationCommandOptionType, ButtonStyle } from 'discord.js'
import { Database, SlashCommandInteraction, SaphireClient as client } from '../../../../classes/index.js'
import { JokempoValues } from '../../../../util/Constants.js'
import { Emojis as e } from '../../../../util/util.js'
import clientPlay from './jokempo/client.jokempo.js'

export default {
    name: 'jokempo',
    description: '[fun] O clássico jokempo',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'local',
            description: '[fun] Jogue um jokempo neste servidor',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'adversário',
                    description: 'Quem será o seu oponente? (Bots não contam)',
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: 'apostar',
                    description: 'Quantidade de Safiras a ser apostada',
                    type: ApplicationCommandOptionType.Integer,
                    min_value: 1,
                    max_value: 1000000
                }
            ]
        },
        {
            name: 'global',
            description: '[fun] Jogue um jokempo com qualquer outro usuário',
            type: ApplicationCommandOptionType.Subcommand,
            options: []
        }
    ],
    helpData: {},
    /**
     * @param { SlashCommandInteraction } SlashCommand 
     */
    async execute(SlashCommand) {
        return SlashCommand.interaction.options.getSubcommand() == 'local'
            ? local(SlashCommand) : global(SlashCommand)
    }
}

/**
 * @param { SlashCommandInteraction } SlashCommand 
 */
async function local(SlashCommand) {

    const { interaction } = SlashCommand
    const { options, user, guild } = interaction
    const opponent = options.getMember('adversário')
    const value = options.getInteger('apostar') || 0

    if (!opponent)
        return await interaction.reply({
            content: `${e.Deny} | Opa opa, você tem que escolher um usuário aqui do servidor, certo?`,
            ephemeral: true
        })

    if (opponent.id == user.id)
        return interaction.reply({
            content: `${e.DenyX} | Você não pode jogar contra você mesmo, né?`,
            ephemeral: true
        })

    if (opponent.id == client.user.id)
        return clientPlay(interaction)

    if (opponent.user.bot)
        return await interaction.reply({
            content: `${e.Deny} | Hey, você não acha que eu roubaria para os meus amigos bots?`,
            ephemeral: true
        })

    const usersData = await Database.User.find({ id: { $in: [user.id, opponent.id] } }, 'Balance id')
    const userBalance = usersData.find(data => data.id == user.id)?.Balance || 0
    const opponentBalance = usersData.find(data => data.id == opponent.id)?.Balance || 0
    const MoedaCustom = await guild.getCoin()

    if (value > 0 && userBalance < value)
        return interaction.reply({
            content: `${e.DenyX} | Infelizmente você não tem todo esse dinheiro para iniciar um Jokempo com aposta.\n${e.Info} | Faltam exatamente **${(value - userBalance).currency()} ${MoedaCustom}** para você atingir o valor de **${value.currency()} ${MoedaCustom}**\n> *Obs: Você possui **${userBalance.currency()} ${MoedaCustom}***`,
            ephemeral: true
        })

    if (value > 0 && opponentBalance < value)
        return interaction.reply({
            content: `${e.SaphireChorando} | ${opponent} não tem **${value.currency()} ${MoedaCustom}** para apostar com você.`,
            ephemeral: true
        })

    return await interaction.reply({
        content: `${e.QuestionMark} | ${opponent}, você está sendo desafio por ${user} para uma partida de Jokempo.\n${e.Taxa} | Valor da aposta: **${value.currency()} ${MoedaCustom}.**`,
        components: [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Aceitar',
                    custom_id: JSON.stringify({ c: 'jkp', type: 'start', value, userId: opponent.id }),
                    style: ButtonStyle.Success
                },
                {
                    type: 2,
                    label: 'Recusar',
                    custom_id: JSON.stringify({ c: 'jkp', type: 'deny', userId: opponent.id }),
                    style: ButtonStyle.Danger
                },
            ]
        }],
        fetchReply: true
    })
        .then(async message => {

            if (value > 0)
                await Database.User.updateOne(
                    { id: user.id },
                    {
                        $inc: { Balance: -value },
                        $push: {
                            Transactions: {
                                $each: [{
                                    time: `${Date.format(0, true)}`,
                                    data: `${e.loss} Apostou ${value} Safiras no Jokempo`
                                }],
                                $position: 0
                            }
                        }
                    }

                )

            Database.Cache.Jokempo.set(
                message.id,
                {
                    players: [user.id],
                    value,
                    clicks: {
                        [user.id]: null,
                        [opponent.id]: null
                    }
                }
            )

        })

}

/**
 * @param { SlashCommandInteraction } SlashCommand
 */
async function global(SlashCommand) {
    const { interaction } = SlashCommand
    // return interaction.reply({ content: `${e.Loading} | Recurso em construção.`, ephemeral: true })
    return interaction.reply({
        embeds: [{
            color: client.blue,
            title: `${e.Planet} ${client.user.username}'s Jokempo Global`,
            description: 'Este é um sistema inteligente onde permite que você jogue contra qualquer pessoa que um em qualquer servidor que tenha a Saphire.',
            fields: [
                {
                    name: '📨 Lançar',
                    value: 'Você pode lançar um Jokempo, para que outra pessoa aposte contra você em algum lugar do mundo.'
                },
                {
                    name: `${e.Taxa} Apostar`,
                    value: 'Aposte contra alguém. Esse alguém está em algum lugar do Discord.'
                },
                {
                    name: '📝 Preços das Apostas',
                    value: JokempoValues.map(number => `\`${number.currency()}\``).join(', ')
                },
                {
                    name: '🛰️ Global System Notification',
                    value: 'Este sistema irá te manter notificado sobre as suas apostas. Independente do tempo e local. Para que isso funcione bem, eu preciso da permissão **Gerenciar Webhooks**.'
                }
            ]
        }],
        components: [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Lançar',
                    emoji: '📨',
                    custom_id: JSON.stringify({ c: 'jkp', type: 'send' }),
                    style: ButtonStyle.Primary
                },
                {
                    type: 2,
                    label: 'Apostar',
                    emoji: e.Taxa,
                    custom_id: JSON.stringify({ c: 'jkp', type: 'bet' }),
                    style: ButtonStyle.Primary
                }
            ]
        }]
    })
}