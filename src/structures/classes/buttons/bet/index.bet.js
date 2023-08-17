import chooiseBet from "./dice/chooise.bet.js"
import multiplier from './multiplier/redirect.multiplier.js'

export default async (data, commandData) => {

    const execute = {
        dice: chooiseBet,
        multi: multiplier
    }[commandData?.src]

    if (!execute)
        return await data.interaction.reply({
            content: `${data.e.Deny} | Sub-função não encontrada. \`#154874\``
        })

    return execute(data, commandData)

}