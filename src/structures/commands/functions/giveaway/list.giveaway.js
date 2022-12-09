import { ButtonStyle } from "discord.js"
import { SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async (interaction, guildData) => {

    const Giveaways = guildData.Giveaways || []

    if (!Giveaways.length)
        return await interaction.reply({
            content: `${e.Deny} | Esse servidor não possui nenhum sorteio no banco de dados.`,
            ephemeral: true
        })

    const GwMapped = Giveaways.map(gw => `[${gw.Actived ? 'Ativo' : 'Sorteado'}] [${format30(gw.Prize)}](${gw.MessageLink})`)
    const embeds = EmbedGenerator(GwMapped)

    if (!embeds.length)
        return await interaction.reply({
            content: `${e.Deny} | Não foi possível gerar a embed de visualização.`,
            ephemeral: true
        })

    if (embeds.length <= 1)
        return await interaction.reply({ embeds: [embeds[0]] })

    const msg = await interaction.reply({
        embeds: [embeds[0]],
        components: [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Anterior',
                    custom_id: 'left',
                    style: ButtonStyle.Primary
                },
                {
                    type: 2,
                    label: 'Próximo',
                    custom_id: 'right',
                    style: ButtonStyle.Primary
                },
                {
                    type: 2,
                    label: 'Cancelar',
                    custom_id: 'cancel',
                    style: ButtonStyle.Danger,
                },
            ]
        }],
        fetchReply: true
    })

    let index = 0

    const collector = msg.createMessageComponentCollector({
        filter: int => int.user.id === interaction.user.id,
        idle: 60000,
        errors: ['idle']
    })
        .on('collect', async int => {

            const { customId } = int

            if (customId === 'cancel') return collector.stop()

            if (customId === 'right') {
                index++
                if (!embeds[index]) index = 0
            }

            if (customId === 'left') {
                index--
                if (!embeds[index]) index = embeds.length - 1
            }

            return await int.update({ embeds: [embeds[index]] }).catch(() => { })
        })
        .on('end', async () => {
            embeds[index].color = client.red
            return await msg.edit({
                embeds: [embeds[index]],
                components: []
            }).catch(() => { })
        })

    function EmbedGenerator(array) {

        let amount = 10
        let page = 1
        let embeds = []
        let length = array.length / 10 <= 1 ? 1 : parseInt((array.length / 10) + 1)

        for (let i = 0; i < array.length; i += 10) {

            const current = array.slice(i, amount)
            const description = current.join('\n')
            const pageCount = length > 1 ? ` ${page}/${length}` : ''

            embeds.push({
                color: client.blue,
                title: `${e.Commands} Lista de Sorteios${pageCount}`,
                description,
                footer: {
                    text: `Este servidor possui ${Giveaways.length || 0} sorteio${Giveaways.length > 1 ? 's': ''}`,
                }
            })

            page++
            amount += 10
        }

        return embeds
    }

    function format30(string) {

        if (string.length > 30)
            return `${string.slice(0, 27)}...`

        return string
    }
}