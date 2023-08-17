import { ButtonInteraction, ButtonStyle } from "discord.js"
import { Database, SaphireClient as client } from "../../../../../classes/index.js"
import { Emojis as e } from "../../../../../util/util.js"
import finish from "./finish.multiplier.js"
import explode from "./explode.multiplier.js"

/**
 * @param { ButtonInteraction } interaction
 * @param { { c: 'bet', src: 'multi', id: Number | 'finish' } } commandData
 */
export default async (interaction, commandData) => {

    const { user, message } = interaction

    if (user.id !== message.interaction.user.id) {
        const commandId = client.application.commands.cache.find(cmd => cmd?.name == 'bet')?.id
        return interaction.reply({
            content: `${e.Deny} | Você não pode jogar no jogo de outra pessoa.${commandId ? ` Use </bet multiplier:${commandId}>` : ''}`,
            ephemeral: true
        })
    }

    await interaction.deferUpdate().catch(() => { })
    /**
     * @type { value: Number, mines: Number, prize: Number, multiplierValue: Number }
     */
    const data = await Database.Cache.Multiplier.get(`${user.id}.${message.id}`)

    if (!data)
        return interaction.editReply({
            content: `${e.DenyX} | Nenhum jogo foi encontrado.`,
            embeds: [], components: []
        }).catch(() => { })

    if (commandData.id == 'finish') return finish(interaction, data)

    const customId = JSON.parse(interaction.customId)
    const components = [
        message.components[0].toJSON(),
        message.components[1].toJSON(),
        message.components[2].toJSON(),
        message.components[3].toJSON(),
        message.components[4].toJSON()
    ]

    for await (const row of components)
        for await (const button of row.components)
            if (button.custom_id == interaction.customId) {
                if (customId.e == 1) return explode(interaction, data)
                if (customId.e == 0) {
                    button.disabled = true
                    button.style = ButtonStyle.Success
                    button.emoji = '💎'
                    await addPrize()
                }
            }

    return interaction.editReply({
        embeds: [{
            color: client.blue,
            title: `💣 ${client.user.username}'s Multiplicador`,
            description: 'Clique nos botões e boa sorte!\nPara cada diamante encontrado, o prêmio irá aumentar.\nSe pegar uma mina, acabou para você.',
            fields: [
                {
                    name: `${e.Animated.SaphireReading} Status do Jogo`,
                    value: `💸 ${data?.value?.currency()} => ${(data.prize + data.multiplierValue)?.currency()} (+${data.multiplierValue?.currency()} por diamante)\n💎 ${24 - data?.mines} (x${(data.mines * 0.041666666).toFixed(3)} por cada diamante encontrado)\n💣 ${data?.mines}`
                }
            ],
            footer: {
                text: 'Clique em "Parar" para pegar o prêmio.'
            }
        }],
        components
    }).catch(() => { })

    async function addPrize() {
        await Database.Cache.Multiplier.add(`${user.id}.${message.id}.prize`, data.multiplierValue)
    }
}