import { Colors } from '../../../../util/Constants.js'
import { ApplicationCommandOptionType } from 'discord.js'
import { CodeGenerator } from '../../../../functions/plugins/plugins.js'
import { Database } from '../../../../classes/index.js'
import { socket } from '../../../../websocket/websocket.js'

export default {
    name: 'bitcoin',
    description: '[economy] Farme bitcoins e fique milhonário',
    category: "economy",
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'lembrete',
            description: 'Ative um lembrete automático para você não se esquecer',
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'Ativar lembrete automático',
                    value: 'reminder'
                },
                {
                    name: 'Não quero lembrete automático',
                    value: 'no'
                }
            ]
        },
        {
            name: 'user',
            description: 'Veja a sequência de bitcoins de alguém',
            type: ApplicationCommandOptionType.User
        }
    ],
    helpData: {
        color: Colors.Gold,
        description: 'Quando você atingir 1000 Bitcoins você irá ficar milhonário',
        permissions: [],
        fields: []
    },
    apiData: {
        name: "bitcoin",
        description: "Farm bitcoins e receba uma bolada de Safiras.",
        category: "Economia",
        synonyms: [],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    async execute({ interaction, e }) {

        const { options, user: author, guild } = interaction
        const user = options.getUser('user')
        const isReminder = options.getString('lembrete') === 'reminder'

        if (user) {

            const userData = await Database.getUser(user.id)

            if (!userData)
                return await interaction.reply({
                    content: `${e.Database} | DATABASE | Nenhum usuário detectado.`,
                    ephemeral: true
                })

            const BitUserFarm = userData?.Perfil?.Bits
            const BitUser = userData?.Perfil?.Bitcoins || 0
            const avatar = user.displayAvatarURL({ forceStatic: false, format: "png", size: 1024 })

            return await interaction.reply({
                embeds: [{
                    color: Colors.Gold,
                    author: { name: user.username, iconURL: avatar },
                    fields: [
                        {
                            name: 'Bitcoins',
                            value: `${e.BitCoin} ${BitUser}`,
                            inline: true
                        },
                        {
                            name: 'BitFarm',
                            value: `${e.BitCoin} \`${BitUserFarm || "0"}/1000\``,
                            inline: true
                        }
                    ]
                }]
            })
        }

        const authorData = await Database.getUser(author.id)
        const Bits = authorData?.Perfil?.Bits || 0
        const moeda = await guild.getCoin()
        const timeout = authorData?.Timeouts?.Bitcoin

        if (Date.Timeout(7200000, timeout))
            return await interaction.reply({
                content: `${e.Loading} | Seu farming está em \`${Bits}/1000\` e o reset é ${Date.Timestamp(new Date(timeout + 7200000), 'R', true)}`
            })

        return Bits >= 1000 ? NewBitCoin() : MineBitCoin()

        async function NewBitCoin() {

            const transaction = {
                time: `${Date.format(0, true)}`,
                data: `${e.gain} Recebeu 5000000 Safiras por ter adquirido um Bitcoin`
            }

            socket?.send({
                type: "transactions",
                transactionsData: { value: 5000000, userId: author.id, transaction }
            })

            await Database.User.findOneAndUpdate(
                { id: author.id },
                {
                    $inc: {
                        'Perfil.Bits': -999,
                        'Perfil.Bitcoins': 1,
                        'Balance': 5000000
                    },
                    $push: {
                        Transactions: {
                            $each: [transaction],
                            $position: 0
                        }
                    }
                },
                { upsert: true, new: true }
            )
                .then(doc => Database.saveUserCache(doc?.id, doc))

            return await interaction.reply({
                content: `${e.Tada} | Você obteve **1 ${e.BitCoin} BitCoin**\n${e.PandaProfit} +5000000 ${moeda}`
            })
        }

        async function MineBitCoin() {

            await Database.User.findOneAndUpdate(
                { id: author.id },
                {
                    $inc: { 'Perfil.Bits': 1 },
                    'Timeouts.Bitcoin': Date.now()
                },
                { upsert: true, new: true }
            )
                .then(doc => Database.saveUserCache(doc?.id, doc))

            let returnContent = `${e.BitCoin} | Mais 1 fragmento de Bitcoin pra sua conta \`${Bits + 1}/1000\`\n⏱ | Próximo reset ${Date.Timestamp(new Date(Date.now() + 7200000), 'R', true)}`

            if (isReminder) {
                socket?.send({
                    type: "postReminder",
                    reminderData: {
                        id: CodeGenerator(7).toUpperCase(),
                        userId: author.id,
                        guildId: guild.id,
                        RemindMessage: 'Bitcoin Farming Disponível',
                        Time: 7200000,
                        DateNow: Date.now(),
                        isAutomatic: true,
                        ChannelId: interaction.channel.id
                    }
                })
                returnContent += '\n⏰ | Lembrete Automático Ativado.'
            }

            return await interaction.reply({ content: returnContent })
        }
    }
}