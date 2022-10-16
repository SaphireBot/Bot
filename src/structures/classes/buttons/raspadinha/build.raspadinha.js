import { ButtonStyle } from "discord.js"
import { Database } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async interaction => {

    const { user } = interaction
    const emojiDefault = e.raspadinha

    /*  BUILDING ID
        a1 a2 a3 a4
        b1 b2 b3 b4
        c1 c2 c3 c4
        d1 d2 d3 d4
    */

    return await interaction.update({
        content: `${e.Loading} | Clique nos botões e boa sorte!`,
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: emojiDefault,
                        custom_id: JSON.stringify({ c: 'rasp', src: 'click', id: user.id, buttonId: 'a1' }),
                        style: ButtonStyle.Secondary
                    },
                    {
                        type: 2,
                        emoji: emojiDefault,
                        custom_id: JSON.stringify({ c: 'rasp', src: 'click', id: user.id, buttonId: 'a2' }),
                        style: ButtonStyle.Secondary
                    },
                    {
                        type: 2,
                        emoji: emojiDefault,
                        custom_id: JSON.stringify({ c: 'rasp', src: 'click', id: user.id, buttonId: 'a3' }),
                        style: ButtonStyle.Secondary
                    },
                    {
                        type: 2,
                        emoji: emojiDefault,
                        custom_id: JSON.stringify({ c: 'rasp', src: 'click', id: user.id, buttonId: 'a4' }),
                        style: ButtonStyle.Secondary
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: emojiDefault,
                        custom_id: JSON.stringify({ c: 'rasp', src: 'click', id: user.id, buttonId: 'b1' }),
                        style: ButtonStyle.Secondary
                    },
                    {
                        type: 2,
                        emoji: emojiDefault,
                        custom_id: JSON.stringify({ c: 'rasp', src: 'click', id: user.id, buttonId: 'b2' }),
                        style: ButtonStyle.Secondary
                    },
                    {
                        type: 2,
                        emoji: emojiDefault,
                        custom_id: JSON.stringify({ c: 'rasp', src: 'click', id: user.id, buttonId: 'b3' }),
                        style: ButtonStyle.Secondary
                    },
                    {
                        type: 2,
                        emoji: emojiDefault,
                        custom_id: JSON.stringify({ c: 'rasp', src: 'click', id: user.id, buttonId: 'b4' }),
                        style: ButtonStyle.Secondary
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: emojiDefault,
                        custom_id: JSON.stringify({ c: 'rasp', src: 'click', id: user.id, buttonId: 'c1' }),
                        style: ButtonStyle.Secondary
                    },
                    {
                        type: 2,
                        emoji: emojiDefault,
                        custom_id: JSON.stringify({ c: 'rasp', src: 'click', id: user.id, buttonId: 'c2' }),
                        style: ButtonStyle.Secondary
                    },
                    {
                        type: 2,
                        emoji: emojiDefault,
                        custom_id: JSON.stringify({ c: 'rasp', src: 'click', id: user.id, buttonId: 'c3' }),
                        style: ButtonStyle.Secondary
                    },
                    {
                        type: 2,
                        emoji: emojiDefault,
                        custom_id: JSON.stringify({ c: 'rasp', src: 'click', id: user.id, buttonId: 'c4' }),
                        style: ButtonStyle.Secondary
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: emojiDefault,
                        custom_id: JSON.stringify({ c: 'rasp', src: 'click', id: user.id, buttonId: 'd1' }),
                        style: ButtonStyle.Secondary
                    },
                    {
                        type: 2,
                        emoji: emojiDefault,
                        custom_id: JSON.stringify({ c: 'rasp', src: 'click', id: user.id, buttonId: 'd2' }),
                        style: ButtonStyle.Secondary
                    },
                    {
                        type: 2,
                        emoji: emojiDefault,
                        custom_id: JSON.stringify({ c: 'rasp', src: 'click', id: user.id, buttonId: 'd3' }),
                        style: ButtonStyle.Secondary
                    },
                    {
                        type: 2,
                        emoji: emojiDefault,
                        custom_id: JSON.stringify({ c: 'rasp', src: 'click', id: user.id, buttonId: 'd4' }),
                        style: ButtonStyle.Secondary
                    }
                ]
            }
        ]
    })
        .catch(async err => {

            await Database.User.updateOne(
                { id: user.id },
                {
                    $inc: {
                        Balance: 100
                    }
                }
            )

            return await interaction.followUp({
                content: `${e.Deny} | Não foi possível concluir o ButtonRaspBuilder. O dinheiro foi devolvido. \`(${err.code || 0})\``
            })
        })
}