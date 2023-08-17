import { ButtonInteraction } from "discord.js"
import { Emojis as e } from "../../../../util/util.js"
import { Database } from "../../../../classes/index.js"

/**
 * @param { ButtonInteraction } interaction
 */
export default async interaction => {

    const { customId, user, message } = interaction
    const buttonData = JSON.parse(customId)

    if (user.id !== message.interaction.user.id)
        return interaction.reply({
            content: `${e.Deny} | Você não pode clicar aqui, vai embora.`,
            ephemeral: true
        })

    const oneDay = 1000 * 60 * 60 * 24
    const data = {
        week: {
            time: oneDay * 7,
            price: 150000,
            text: 'Uma Semana (7 Dias)'
        },
        month: {
            time: oneDay * 30,
            price: 500000,
            text: 'Um Mês (30 Dias)'
        },
        year: {
            time: oneDay * 365,
            price: 5000000,
            text: 'Um Ano (365 Dias)'
        }
    }[buttonData.type]

    if (buttonData.src == 'confirm') return confirm()
    if (buttonData.src == 'cancel')
        return interaction.update({ content: `${e.Animated.SaphireReading} | Compra cancelada.`, components: [] }).catch(() => { })

    async function confirm() {

        await interaction.update({ content: `${e.Loading} | Checando dados...`, components: [] }).catch(() => { })

        const userData = await Database.getUser(user.id)
        let userDonateData = buttonData.dnt && await Database.getUser(buttonData.dnt)

        if (userData?.Balance < data.price)
            return interaction.editReply({
                content: `${e.Deny} | Você precisa de pelo menos **${data.price.currency()} safiras** para comprar este vip.`,
            }).catch(() => { })

        if (buttonData.dnt)
            await Database.User.findOneAndUpdate({ id: user.id }, { $inc: { Balance: -data.price } }, { new: true, upsert: true })
                .then(doc => Database.saveUserCache(doc.id, doc))

        const params = isVip(userDonateData || userData)
            ? {
                $inc: {
                    Balance: buttonData.dnt ? 0 : -data.price,
                    "Vip.TimeRemaing": data.time
                }
            }
            : {
                $inc: {
                    Balance: buttonData.dnt ? 0 : -data.price,
                },
                $set: {
                    "Vip.DateNow": Date.now(),
                    "Vip.TimeRemaing": data.time
                }
            }

        return await Database.User.findOneAndUpdate({ id: userDonateData?.id || userData?.id }, params, { new: true, upsert: true })
            .then(doc => {
                Database.saveUserCache(doc.id, doc)

                const content = buttonData.dnt
                    ? `${e.Animated.SaphireDance} | Okay okay! Você comprou mais **${data.text}** de vip para <@${userDonateData?.id}>.\n${e.Animated.SaphireReading} | Agora <@${userDonateData?.id}> possui \`${Date.stringDate(((doc.Vip.DateNow || 0) + (doc.Vip.TimeRemaing || 0)) - Date.now())}\` de vip.`
                    : `${e.Animated.SaphireDance} | Tudo certo! Você comprou mais **${data.text}** de vip.\n${e.Animated.SaphireReading} | Agora você possui \`${Date.stringDate(((doc.Vip.DateNow || 0) + (doc.Vip.TimeRemaing || 0)) - Date.now())}\` de vip.`

                return interaction.editReply({ content }).catch(() => { })
            })
            .catch(err => interaction.editReply({ content: `${e.Animated.SaphirePanic} | Deu tudo errado!\nERRO: \`${err}\`` }).catch(() => { }))
    }

    function isVip(userData) {

        if (userData?.Vip?.Permanent) return true
        const DateNow = userData?.Vip?.DateNow || null
        const TimeRemaing = userData?.Vip?.TimeRemaing || 0

        return TimeRemaing - (Date.now() - DateNow) > 0
    }

}