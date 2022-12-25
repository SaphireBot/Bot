import buyRaspadinha from "./buy.raspadinha.js"
import click from './click.raspadinha.js'

export default async (interaction, { src, id: userId, buttonId = undefined }) => {

    const { user } = interaction

    if (userId !== user.id) return

    if (src === 'buy')
        return buyRaspadinha(interaction)

    if (src === 'click')
        return click(interaction, buttonId)

}