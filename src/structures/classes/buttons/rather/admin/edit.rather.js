import { Database } from "../../../../../classes/index.js"

export default async ({ interaction, customId, message, modals, client, emojis: e }) => {

    const { user } = interaction

    if (!client.staff.includes(user.id))
        if (user.id !== message.interaction?.user.id) return

    if (customId === 'cancel')
        return message.delete().catch(() => { })

    const { embeds } = message
    const embed = embeds[0]?.data

    if (customId === 'edit') {

        if (!embed)
            return await interaction.update({
                content: `${e.Deny} | Embed não encontrada.`,
                components: []
            })

        const questionOne = embed.fields[3]?.value || embed.fields[0].value
        const questionTwo = embed.fields[4]?.value || embed.fields[1].value

        return await interaction.showModal(modals.adminEditVocePrefere(questionOne, questionTwo, embed.footer.text))
    }

    if (customId === 'confirm')
        return import('./confirm.rather.js').then(confirm => confirm.default({ interaction, customId, message, modals, client, e, Database, embed }))

    if (customId === 'request')
        return import('./request.rather.js').then(config => config.default({ interaction, e, client, embed, message }))
}