import {
    SaphireClient as client,
    Database
} from "../../../../../classes/index.js"
import fs from 'fs'
import { Emojis as e } from "../../../../../util/util.js"

export default async ({ interaction, code, clientData }) => {

    const { user, guild } = interaction
    const vip = await user.isVip()
    const moeda = await guild?.getCoin() || `${e.Coin} Safiras`
    const userData = await Database.User.findOne({ id: user.id })
    const BgLevel = Database.BgLevel
    const wallpaperData = BgLevel[code]

    if (!wallpaperData)
        return await interaction.reply({
            content: `${e.Deny} | Por favor, selecione um wallpaper existe na lista de wallpapers.`,
            ephemeral: true
        })

    const name = wallpaperData.Name
    const designerId = wallpaperData.Designer
    const limite = wallpaperData.Limit
    const image = wallpaperData.Image
    const money = userData?.Balance || 0
    let price = wallpaperData.Price

    if (userData.Walls?.Bg?.includes(code) || clientData?.BackgroundAcess?.includes(user.id))
        return await interaction.reply({
            content: `${e.Deny} | Você já possui esse background.`,
            ephemeral: true
        })

    if (vip)
        price -= parseInt(price * 0.3)

    if (price < 1) price = 0

    if (price > money)
        return await interaction.reply({
            content: `${e.Deny} | ${user}, você precisa de pelo menos **${price} ${moeda}** para comprar o fundo **${name}**`,
            ephemeral: true
        })

    const msg = await interaction.reply({
        embeds: [{
            color: client.blue,
            description: `${e.QuestionMark} | ${user}, você realmente quer comprar o wallpaper \`${name}\` por **${price} ${moeda}**?`,
            image: { url: image }
        }],
        fetchReply: true
    })
    const emojis = ['✅', '❌']

    for (let i of emojis) msg.react(i).catch(() => { })

    return msg.createReactionCollector({
        filter: (r, u) => emojis.includes(r.emoji.name) && u.id === user.id,
        max: 1,
        time: 60000,
        errors: ['time']
    })
        .on('collect', async (reaction) => {

            if (reaction.emoji.name === emojis[0])
                return newFastBuy()

            return await interaction.editReply({
                content: `${e.Deny} | Compra cancelada.`,
                embeds: []
            })
        })

        .on('end', async (_, r) => {
            msg.reactions.removeAll().catch(() => { })
            if (['user', 'limit'].includes(r)) return
            return await interaction.editReply({
                content: `${e.Deny} | Compra cancelada por falta de resposta.`,
                embeds: []
            })
        })

    async function newFastBuy() {

        let comissao = parseInt(price * 0.02)

        if (comissao < 1) comissao = 0

        Database.pushUserData(user.id, 'Walls.Bg', code)

        if (await client.users.fetch(designerId).catch(() => null) && comissao > 0) {
            Database.PushTransaction(designerId, `${e.gain} Ganhou ${comissao} Safiras via *Wallpaper Designers CashBack*`)
            Database.add(designerId, comissao)
        }

        if (limite > 0) subtractWallpaper(code, 1)

        if (price > 0) {
            Database.subtract(user.id, price)
            Database.PushTransaction(
                user.id,
                `${e.loss} Gastou ${price} Safiras comprando o *Wallpaper ${code}*`
            )
        }

        return await interaction.editReply({
            embeds: [{
                color: client.green,
                title: '💳 Compra de Wallpaper efetuada com sucesso.',
                description: `${e.Info} | Você comprou o wallpaper \`${code} - ${name}\`. Você pode colocar este wallpaper usando \`/level change_background: ${code}\``,
                image: { url: image }
            }]
        })
    }
}

function subtractWallpaper(code, quantity) {

    const allJsonData = JSON.parse(fs.readFileSync('./JSON/levelwallpapers.json'))

    allJsonData[code].Limit -= quantity

    fs.writeFile(
        './JSON/levelwallpapers.json',
        JSON.stringify(allJsonData, null, 4),
        (err) => {
            if (err) console.log(err)
            return
        }
    )
}