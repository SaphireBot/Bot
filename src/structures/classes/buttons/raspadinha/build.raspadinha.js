import { ButtonStyle } from "discord.js"
import { Database } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async interaction => {

    await interaction.update({ content: `${e.Loading} | Carregando raspadinha...`, components: [] }).catch(() => { })
    const { user } = interaction

    /* 
     *  BUILDING's ID
     *  a1 a2 a3 a4
     *  b1 b2 b3 b4
     *  c1 c2 c3 c4
     *  d1 d2 d3 d4
     */

    const allButtonIds = [
        ['a1', 'a2', 'a3', 'a4'],
        ['b1', 'b2', 'b3', 'b4'],
        ['c1', 'c2', 'c3', 'c4'],
        ['d1', 'd2', 'd3', 'd4'],
    ]

    const components = []

    for (const buttonIds of allButtonIds) {
        const row = []
        for (const buttonId of buttonIds) {
            row.push({
                type: 2,
                emoji: e.raspadinha,
                custom_id: JSON.stringify({ c: 'rasp', src: 'click', id: interaction.user.id, buttonId }),
                style: ButtonStyle.Secondary
            })
            continue
        }
        components.push({ type: 1, components: row })
        continue
    }

    return interaction.editReply({
        content: `${e.Loading} | Clique calmamente nos botões e boa sorte!`,
        components
    })
        .catch(async err => {
            await Database.User.findOneAndUpdate(
                { id: user.id },
                { $inc: { Balance: 100 } },
                { upsert: true, new: true }
            )
                .then(doc => Database.saveUserCache(doc?.id, doc))
            return await interaction.editReply({
                content: `${e.Deny} | Não foi possível concluir o ButtonRaspBuilder. O dinheiro foi devolvido.\n${e.bug} | \`${err}\``
            })
        })
}