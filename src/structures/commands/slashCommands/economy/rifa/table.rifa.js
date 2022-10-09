import { ButtonStyle } from "discord.js"
import {
    SaphireClient as client,
    Database
} from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"

export default async interaction => {

    const { user, guild } = interaction
    const document = await Database.Economy.findOne({ id: client.user.id }, 'Rifa')
    const rifaData = document?.Rifa

    if (!rifaData)
        return await interaction.reply({
            content: `${e.Deny} | Não há nenhum dado registrado sobre a Rifa no banco de dados.`,
            ephemeral: true
        })

    const numbers = [...Array(91).keys()].slice(1)
    const numbersMapped = numbers
        .map(number => {
            const data = rifaData.Numbers.find(num => num.number === number)
            return {
                number: number < 10 ? `0${number}` : `${number}`,
                user: data
                    ? `${client.users.resolve(data.userId)?.tag || 'User Not Found'} - \`${data.userId}\``
                    : 'Disponível'
            }
        })

    const embeds = await EmbedGenerator(numbersMapped)
    let index = 0

    const selectMenuObject = {
        type: 1,
        components: [{
            type: 3,
            custom_id: 'menu',
            placeholder: 'Escolher uma página',
            options: []
        }]
    }

    for (let i = 0; i < embeds.length; i++)
        selectMenuObject.components[0].options.push({
            label: `Página ${i + 1}`,
            emoji: e.saphireLendo,
            value: `${i}`,
        })

    const buttons = {
        type: 1,
        components: [
            {
                type: 2,
                label: 'Anterior',
                emoji: e.saphireLeft,
                custom_id: 'left',
                style: ButtonStyle.Primary
            },
            {
                type: 2,
                label: 'Próximo',
                emoji: e.saphireRight,
                custom_id: 'right',
                style: ButtonStyle.Primary
            },
            {
                type: 2,
                label: 'Cancelar',
                custom_id: JSON.stringify({ c: 'delete' }),
                style: ButtonStyle.Danger
            }
        ]
    }

    const msg = await interaction.reply({
        embeds: [embeds[0]],
        components: [selectMenuObject, buttons],
        fetchReply: true
    })

    const collector = msg.createMessageComponentCollector({
        filter: int => int.user.id === user.id,
        idle: 60000,
        errors: ['idle']
    })
        .on('collect', async int => {

            const customId = int.values
                ? int.values[0]
                : int.customId

            if (customId.includes('delete')) return

            if (parseInt(customId))
                index = parseInt(customId)

            if (customId === 'right') {
                index++
                if (!embeds[index]) index = 0
            }

            if (customId === 'left') {
                index--
                if (!embeds[index]) index = embeds.length - 1
            }

            return await int.update({ embeds: [embeds[index]] }).catch(() => collector.stop())
        })
        .on('end', async () => {

            const embed = embeds[index]
            embed.color = client.red
            embed.footer = {
                text: embed.footer.text + ' | Comando cancelado'
            }

            return await interaction.editReply({
                embeds: [embed],
                components: []
            }).catch(() => { })

        })

    async function EmbedGenerator(array) {

        const moeda = await guild.getCoin()
        const embeds = []
        let amount = 15
        let page = 1
        const length = array.length / 15 <= 1 ? 1 : parseInt((array.length / 15))

        for (let i = 0; i < array.length; i += 15) {

            const current = array.slice(i, amount)
            const description = current.map(data => `**N° \`${data.number}\`** - ${data.user}`).join('\n')
            const pageCount = length > 1 ? ` - ${page}/${length}` : ''

            embeds.push({
                color: client.blue,
                title: `🔢 ${client.user.username}'s Rifa - Tabela${pageCount}`,
                description,
                fields: [
                    {
                        name: `${e.Info} Status`,
                        value: `Prêmio: ${rifaData.Numbers.length * 1000} ${moeda}\n👥 Ainda falta ${90 - rifaData.Numbers.length} rifas serem compradas para o sorteio do prêmio.`
                    }
                ],
                footer: {
                    text: `${rifaData.Numbers.length} rifas foram compradas`
                }
            })

            page++
            amount += 15

        }

        return embeds
    }
}