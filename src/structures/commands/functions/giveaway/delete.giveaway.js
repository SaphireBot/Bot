import {
    Database
} from '../../../../classes/index.js'
import { Emojis as e } from '../../../../util/util.js'
import { ButtonStyle } from 'discord.js'

export default async (interaction, guildData) => {

    const { options, guild, user } = interaction
    const giveawayId = options.getString('select_giveaway')

    if (giveawayId === 'all') return deleteAll()

    const sorteio = guildData.Giveaways?.find(gw => gw.MessageID === giveawayId)

    if (!sorteio)
        return await interaction.reply({
            content: `${e.Deny} | Sorteio não encontrado. Verifique se o ID está correto.`,
            ephemeral: true
        })

    const msg = await interaction.reply({
        content: `${e.QuestionMark} | Deseja deletar o sorteio \`${giveawayId}\`?`,
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'DELETAR SORTEIO',
                        custom_id: 'delete',
                        style: ButtonStyle.Success
                    },
                    {
                        type: 2,
                        label: 'CANCELAR',
                        custom_id: 'cancel',
                        style: ButtonStyle.Danger
                    }
                ]
            }
        ],
        fetchReply: true
    })

    const collector = msg.createMessageComponentCollector({
        filter: int => int.user.id === user.id,
        time: 60000
    })
        .on('collect', async int => {

            const { customId } = int

            if (customId === 'cancel') return collector.stop()

            Database.deleteGiveaway(giveawayId, guild.id)
            return await int.update({
                content: `${e.Check} | Sorteio deletado com sucesso!`,
                components: []
            }).catch(() => { })

        })

        .on('end', async (_, reason) => {
            if (reason !== 'user') return
            return await interaction.editReply({ content: `${e.Deny} | Comando cancelado.`, components: [] }).catch(() => { })
        })

    async function deleteAll() {
        Database.deleteGiveaway(giveawayId, guild.id, true)
        return await interaction.reply({
            content: `${e.Check} | Todos os sorteios foram deletados com sucesso.`
        })
    }

}