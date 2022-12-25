import betInvest from "./bet.invest.js"

export default async (interaction, command) => {
    if (command === 'bet')
        return betInvest(interaction)

    // if (command === 'view')

}