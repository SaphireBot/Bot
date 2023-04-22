import { Database } from "../../../../../classes/index.js"

export default async (interaction) => {
    const status = await Database.Cache.General.get('DISABLE') || false
    await Database.Cache.General.set('DISABLE', !status)
    return interaction.reply({
        content: !status ? 'Desativado' : 'Ativado'
    })
}