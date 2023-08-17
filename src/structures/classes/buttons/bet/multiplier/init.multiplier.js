import { ButtonInteraction } from "discord.js";
import { Database, SaphireClient as client } from "../../../../../classes/index.js";
import { Emojis as e } from "../../../../../util/util.js";
import buttonGenerator from "../../../../commands/slashCommands/economy/bet/functions/button.multiplier.js"

/**
 * @param { ButtonInteraction } interaction
 */
export default async interaction => {

    const { user, message } = interaction

    if (user.id !== message.interaction.user.id)
        return interaction.reply({
            content: `${e.DenyX} | Cai fora, você não usou esse comando.`,
            ephemeral: true
        })

    await interaction.update({
        content: `${e.Loading} | Buscando dados do jogo e construindo o campo...`,
        embeds: [], components: []
    }).catch(() => { })

    /**
     * @type { value: Number, mines: Number, prize: Number, multiplierValue: Number }
     */
    const data = await Database.Cache.Multiplier.get(`${user.id}.${message.id}`)

    if (!data)
        return interaction.editReply({
            content: `${e.saphireDesespero} | Nenhum dado deste jogo foi encontrado.`
        }).catch(() => { })

    const buttons = buttonGenerator(data?.mines)

    if (!buttons || !buttons?.length) {
        refund()
        return interaction.editReply({
            content: `${e.Animated.SaphireCry} | Não foi possível construir os botões do campo. O dinheiro da aposta foi devolvido.`
        }).catch(() => { })
    }

    return interaction.editReply({
        content: null,
        embeds: [{
            color: client.blue,
            title: `💣 ${client.user.username}'s Multiplicador`,
            description: 'Clique nos botões e boa sorte!\nPara cada diamante encontrado, o prêmio irá aumentar.\nSe pegar uma mina, acabou para você.',
            fields: [
                {
                    name: `${e.Animated.SaphireReading} Status do Jogo`,
                    value: `💸 ${data?.value?.currency()} => ${data.value?.currency()} (+${data.multiplierValue?.currency()} por diamante)\n💎 ${24 - data?.mines} (x${(data.mines * 0.041666666).toFixed(3)} por cada diamante encontrado)\n💣 ${data?.mines}`
                }
            ],
            footer: {
                text: 'Clique em "Parar" para pegar o prêmio.'
            }
        }],
        components: buttons
    }).catch(() => { })

    async function refund() {
        await Database.User.findOneAndUpdate(
            { id: user.id },
            { $inc: { Balance: data?.value || 0 } },
            { upsert: true, new: true }
        )
            .then(data => Database.saveUserCache(data?.id, data))
        await Database.Cache.Multiplier.delete(`${user.id}.${message.id}`)
        return
    }
}