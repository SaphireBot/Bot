import { Database, GiveawayManager, SaphireClient as client } from '../../../../classes/index.js'
import { Emojis as e } from '../../../../util/util.js'
import { ButtonStyle } from 'discord.js'

export default async (interaction, guildData, giveawayId) => {

    const { options, guild, user } = interaction
    const gwId = giveawayId || options.getString('select_giveaway')

    if (gwId === 'all') return deleteAll()

    const sorteio = guildData.Giveaways?.find(gw => gw.MessageID === gwId) || guildData?.Giveaways?.find(gw => gw.MessageID === gwId)

    if (!sorteio)
        return await interaction.reply({
            content: `${e.Deny} | Sorteio não encontrado. Verifique se o ID está correto.`,
            ephemeral: true
        })

    const msg = await interaction.reply({
        content: `${e.QuestionMark} | Deseja mesmo deletar o sorteio \`${gwId}\` do banco de dados?`,
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Confirmar',
                        custom_id: 'delete',
                        style: ButtonStyle.Danger
                    },
                    {
                        type: 2,
                        label: 'Cancelar',
                        custom_id: 'cancel',
                        style: ButtonStyle.Success
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

            GiveawayManager.deleteGiveaway(sorteio)

            client.pushMessage({
                method: 'delete',
                channelId: sorteio?.ChannelId,
                messageId: gwId
            })

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
        Database.deleteGiveaway(null, guild.id, true)
        return await interaction.reply({ content: `${e.Check} | Todos os sorteios foram deletados com sucesso.` })
    }

}