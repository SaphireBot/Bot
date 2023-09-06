import betInvest from "./bet.invest.js"

export default async (interaction) => {

    const command = interaction.options.getString('options')

    if (command === 'bet')
        return betInvest(interaction)

    // if (command === 'view')

}