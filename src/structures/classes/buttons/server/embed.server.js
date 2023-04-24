import { ButtonInteraction, ButtonStyle } from "discord.js"
import { SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import { ColorsTranslate, HexColors, Colors } from "../../../../util/Constants.js"
import { replacePlaceholder } from "../../../../functions/plugins/plugins.js"
import build from "./build.server.js"
import save from "./save.server.js"

/**
 * @param { ButtonInteraction } interaction
 * @param { { content: String | null, embeds: Array, channelId: String } } body
 * @param { 'welcome' | 'leave' } type
*/
export default (interaction, body, type) => {

    const { message, user, guild, channel, member } = interaction
    const channelSelected = guild.channels.cache.get(body.channelId)

    if (!channelSelected) {
        delete body.channelId
        return build(interaction, body)
    }

    const collectors = []
    const components = () => {
        return [
            {
                type: 1,
                components: [{
                    type: 3,
                    custom_id: 'menu',
                    placeholder: 'Editar Conteúdo da Embed',
                    options: [
                        {
                            label: 'Cor',
                            description: 'Escolha uma cor personalizada para a embed',
                            emoji: '🖌️',
                            value: 'color',
                        },
                        {
                            label: 'Título',
                            description: 'Títulos podem ter até 256 caracteres',
                            emoji: '📝',
                            value: 'title',
                        },
                        {
                            label: 'Link',
                            description: 'Este link deixará o título azul e clicavel',
                            emoji: '🖇️',
                            value: 'url'
                        },
                        {
                            label: 'Descrição',
                            description: 'Descrições podem ter até 4096 caracteres',
                            emoji: '📝',
                            value: 'description'
                        },
                        {
                            label: 'Thumbnail',
                            description: 'Link da imagem menor',
                            emoji: '🖼️',
                            value: 'thumbnail'
                        },
                        {
                            label: 'Imagem',
                            description: 'Link da imagem maior',
                            emoji: '🖼️',
                            value: 'image'
                        },
                        {
                            label: 'Footer/Rodapé',
                            description: 'Footers/Rodapés podem ter até 2048 caracteres',
                            emoji: '📝',
                            value: 'footer'
                        },
                        {
                            label: 'Imagem do Footer/Rodapé',
                            description: 'Footers/Rodapés pode possuir uma imagem',
                            emoji: '📝',
                            value: 'footerIcon'
                        }
                    ]
                }]
            },
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Editar Mensagem & Canal',
                        emoji: e.saphireLeft,
                        custom_id: 'messageContent',
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: !body.content?.length && !body.embeds[0] ? 'Adicione uma Embed ou Texto' : 'Salvar',
                        emoji: e.saphireRight,
                        custom_id: 'save',
                        style: ButtonStyle.Success,
                        disabled: !body.content?.length && !body.embeds[0]
                    },
                    {
                        type: 2,
                        label: 'Cancelar Configuração',
                        emoji: e.Trash,
                        custom_id: 'cancel',
                        style: ButtonStyle.Danger
                    }
                ]
            }
        ]
    }

    interaction.update({ content: replacePlaceholder(body.content, member), embeds: body.embeds, components: components() }).catch(() => { })

    const collector = message.createMessageComponentCollector({
        filter: int => int.user.id == user.id,
        idle: 1000 * 60 * 2
    })
        .on('collect', int => {

            const { customId } = int

            if (['custom', 'custom1'].includes(customId))
                return saveEdit(int)

            if (customId == 'menu')
                return editComponents(int)

            if (customId == 'back') {
                stopCollectors()
                return int.update({ components: components() }).catch(() => { })
            }

            if (customId == 'cancel')
                return collector.stop()

            if (customId == 'messageContent') {
                collector.stop("ignore")
                return build(int, body, type)
            }

            if (customId == 'save') {
                collector.stop("ignore")
                return save(int, body, type)
            }

            if (customId == 'embed') {
                collector.stop('ignore')
                return build(int)
            }

            return console.log(`#46841544 - Custom ID without function - ${customId}`)
        })
        .on('end', (_, reason) => {

            if (reason == 'messageDelete')
                return client.pushMessage({
                    channelId: channel.id,
                    method: 'post',
                    body: {
                        content: `${e.SaphireDesespero} | Haaaa, apagaram a mensagem. Poooxa. A configuração de mensagem de boas-vindas foi cancelada, ok?`
                    }
                })

            if (reason == 'user')
                return cancel()

            return;
        })

    return

    function stopCollectors() {
        for (const collector of collectors)
            if (!collector.ended)
                collector.stop("ignore")

        collectors.splice(0, collectors.length - 1)
        return
    }

    function cancel() {
        stopCollectors()
        interaction.editReply({
            content: `${e.sleep} | Tuuuudo cancelado.`,
            embeds: [], components: []
        }).catch(() => { })
        return
    }

    function editComponents(int) {

        if (int.values[0] == 'color')
            return color(int)

        const edit = {
            title: {
                text: "Digite seu Título",
                limit: 256,
                key: 'title'
            },
            description: {
                text: "Digite sua Descrição",
                limit: 4096,
                key: 'description'
            },
            footer: {
                text: "Digite seu Footer/Rodapé",
                limit: 2048,
                key: 'footer'
            },
            footerIcon: {
                text: "Digite seu Footer/Rodapé",
                limit: 2048,
                key: 'footerIcon'
            },
            url: {
                text: 'Digite a URL da Embed',
                limit: 0,
                key: 'url'
            },
            thumbnail: {
                text: 'Digite a URL da Thumbnail',
                limit: 0,
                key: 'thumbnail'
            },
            image: {
                text: 'Digite a URL da Imagem',
                limit: 0,
                key: 'image'
            }
        }[int.values[0]]

        if (!edit) {
            console.log(edit)
            return int.update({
                content: `${e.Warn} | Não foi possível continuar.`,
                embeds: [], components: []
            }).catch(() => { })
        }

        // return edit(int)
        return createCollector(int, edit.text, edit.limit, edit.key)
    }

    function saveEdit(int) {
        const data = JSON.parse(int.values[0])

        if (data.c == 'color') {
            if (!body.embeds[0]) body.embeds[0] = { description: null }
            body.embeds[0].color = Colors[data.src]
            return int.update({ embeds: body.embeds })
                .catch(() => interaction.editReply({ embeds: [{ color: Colors[data.src], description: 'Cor selecionada com sucesso.' }] }).catch(() => { }))
        }

    }

    function createCollector(int, loadButtonText, limit, key) {
        if (!body.embeds[0]) body.embeds[0] = {}

        const collector = channel.createMessageCollector({
            filter: msg => msg.author.id == user.id
        })
            .on('collect', msg => {

                if (['url', 'thumbnail', 'image', 'footerIcon'].includes(key) && !msg.content.isURL())
                    return msg.react(e.DenyX).catch(() => { })

                if (['url', 'thumbnail', 'image', 'footerIcon'].includes(key) && msg.content.isURL())
                    msg.react(e.CheckV).catch(() => { })

                const content = limit > 0 ? msg.content.slice(0, limit) : msg.content

                switch (key) {
                    case 'footer': body.embeds[0].footer = { text: content, icon_url: body.embeds[0]?.footer?.icon_url || null }; break;
                    case 'footerIcon': body.embeds[0].footer = { text: body.embeds[0]?.footer?.text || null, icon_url: content }; break;
                    case 'thumbnail': body.embeds[0][key] = { url: content }; break;
                    case 'image': body.embeds[0][key] = { url: content }; break;
                    default: body.embeds[0][key] = content; break;
                }

                const embed = body.embeds[0]

                client.pushMessage({
                    channelId: channel.id,
                    method: 'patch',
                    messageId: message.id,
                    body: {
                        embeds: (!embed && !embed.title?.length && !embed.description?.length)
                            ? [{ description: 'Embed Vazia' }]
                            : [embed]
                    }
                })
                return
            })

        collectors.push(collector)
        return int.update({
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Voltar',
                        emoji: e.saphireLeft,
                        custom_id: 'back',
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: loadButtonText,
                        emoji: e.Loading,
                        custom_id: 'ignore',
                        style: ButtonStyle.Secondary,
                        disabled: true
                    }
                ]
            }]
        })
    }

    function color(int) {

        const components = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Voltar',
                        emoji: e.saphireLeft,
                        custom_id: 'back',
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Cancelar Configuração',
                        emoji: e.Trash,
                        custom_id: 'cancel',
                        style: ButtonStyle.Danger
                    }
                ]
            }
        ]

        const colorsData = Object.entries(HexColors)

        let index = 0
        for (const colors of [colorsData.slice(0, 15), colorsData.slice(16, colorsData.length - 1)]) {

            const selectMenu = {
                type: 1,
                components: [{
                    type: 3,
                    custom_id: index == 0 ? 'custom' : 'custom1',
                    placeholder: 'Escolher uma cor',
                    options: []
                }]
            }

            for (const color of colors)
                selectMenu.components[0].options.push({
                    label: ColorsTranslate[color[0]] || color[0],
                    emoji: '🖌️',
                    description: color[1],
                    value: JSON.stringify({ c: 'color', src: color[0] })
                })

            components.unshift(selectMenu)
            index++
        }

        return int.update({ components }).catch(() => { })
    }

}