import { ButtonStyle } from "discord.js"
import { Emojis as e } from "../../../../../util/util.js"
import { SaphireClient as client, Database, Modals } from "../../../../../classes/index.js"
import { socket } from "../../../../../websocket/websocket.js"

export default async (interaction, option, user) => {

    const { user: author } = interaction

    if (!client.admins.includes(author.id))
        return await interaction.reply({
            content: `${e.Deny} | Você não faz parte da equipe administrativa.`,
            ephemeral: true
        })

    if (!['add', 'remove', 'delete', 'reconfig'].includes(option)) return

    if (option === 'delete') return deleteBalance()
    if (option === 'report') return await interaction.showModal(Modals.reportBalance(author))

    const userData = await Database.getUser(user.id)
    const userMoney = userData?.Balance || 0

    return await interaction.showModal(Modals.BalanceModal(option, user, userMoney))

    async function deleteBalance() {

        const msg = await interaction.reply({
            content: `${e.QuestionMark} | Você realmente deseja **deletar** o dinheiro de ${user.username} \`${user.id}\`?`,
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Confirmar',
                        custom_id: 'allow',
                        style: ButtonStyle.Success
                    },
                    {
                        type: 2,
                        label: 'Cancelar',
                        custom_id: 'deny',
                        style: ButtonStyle.Danger
                    }
                ]
            }],
            fetchReply: true
        })

        const collector = msg.createMessageComponentCollector({
            filter: int => int.user.id === author.id,
            time: 60000,
            errors: ['time']
        })
            .on('collect', async int => {

                const { customId } = int

                if (customId === 'deny') return collector.stop()

                const transaction = {
                    time: `${Date.format(0, true)}`,
                    data: `${e.Admin} Safiras deletadas por um Administrador`
                }

                socket?.send({
                    type: "transactions",
                    transactionsData: { value: 0, userId: user.id, transaction }
                })

                await Database.User.findOneAndUpdate(
                    { id: user.id },
                    {
                        $unset: { Balance: 1 },
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

                return await interaction.editReply({
                    content: `${e.Check} | O dinheiro de ${user.username} \`${user.id}\` foi deletado com sucesso.`,
                    components: []
                }).catch(() => { })

            })
            .on('end', async (_, reason) => {

                if (reason === 'time') return

                return await interaction.editReply({
                    content: `${e.Deny} | Ação cancelada.`,
                    components: []
                }).catch(() => { })
            })

    }

}