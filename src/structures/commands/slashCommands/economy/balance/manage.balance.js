import { ButtonStyle } from "discord.js"
import { Emojis as e } from "../../../../../util/util.js"
import {
    SaphireClient as client,
    Database,
    Modals
} from "../../../../../classes/index.js"

export default async (interaction, option, user) => {

    const { user: author } = interaction

    if (!client.admins.includes(author.id))
        return await interaction.reply({
            content: `${e.Deny} | Você não faz parte da equipe administrativa.`,
            ephemeral: true
        })

    if (option === 'delete') return deleteBalance()

    const userMoney = await user.balance() || 0

    return await interaction.showModal(Modals.BalanceModal(option, user, userMoney))

    async function deleteBalance() {

        const msg = await interaction.reply({
            content: `${e.QuestionMark} | Você realmente deseja **deletar** o dinheiro de ${user.tag} \`${user.id}\`?`,
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

                await Database.User.updateOne(
                    { id: user.id },
                    {
                        $unset: {
                            Balance: 1
                        },
                        $push: {
                            Transactions: {
                                $each: [{
                                    time: `${Date.format(0, true)}`,
                                    data: `${e.Admin} Safiras deletadas por um Administrador`
                                }],
                                $position: 0
                            }
                        }
                    }
                )

                return await interaction.editReply({
                    content: `${e.Check} | O dinheiro de ${user.tag} \`${user.id}\` foi deletado com sucesso.`,
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