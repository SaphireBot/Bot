import { ApplicationCommandOptionType, ButtonStyle } from 'discord.js'
import { Database, SlashCommandInteraction } from '../../../../classes/index.js'
import clientPlay from './jokempo/client.jokempo.js'

export default {
    name: 'jokempo',
    description: '[fun] O clássico jokempo',
    dm_permission: false,
    type: 1,
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
    ],
    helpData: {},
    /**
     * @param { SlashCommandInteraction } SlashCommand 
     */
    async execute(SlashCommand) {
        const { interaction, client, e } = SlashCommand
        // return await interaction.reply({ content: `${e.Loading} | Em breve` })
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
                content: `${e.cry} | ${opponent} não tem **${value.currency()} ${MoedaCustom}** para apostar com você.`,
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
}