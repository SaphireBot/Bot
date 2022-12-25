export default async (interaction, client, e, Gifs, gifData) => {

    const { options, user } = interaction
    const gifRequest = options.getString('action')
    const option = gifData.find(g => g.JSON === gifRequest)
    const gifs = Gifs[gifRequest]

    if (!option || !gifs || !gifs.length)
        return await interaction.reply({
            content: `${e.Deny} | Solicitação de GIF não reconhecida.`,
            ephemeral: true
        })

    const member = options.getMember('user')

    if (!member)
        return await interaction.reply({
            content: `${e.Deny} | Nenhum usuário foi encontrado.`,
            ephemeral: true
        })

    const textOne = option.embedTextOne?.replace('$user', user)?.replace('$member', member)
    const textTwo = option.embedTextTwo?.replace('$user', user)?.replace('$member', member)
    const rand = [...gifs?.random(2) || null]

    if (member.id === client.user.id)
        return await interaction.reply({
            content: `${e.Deny} | Fico feliz por você interagir comigo, mas nas interações, pelo menos por enquanto, eu estou fora de área.`,
            ephemeral: true
        })

    if (member.id === user.id)
        return await interaction.reply({
            content: `${e.Deny} | Sem interações próprias por aqui.`,
            ephemeral: true
        })

    const isBot = member.user.bot

    const embed = {
        color: client.blue,
        description: textOne,
        image: { url: rand[0] },
        footer: { text: isBot ? null : '🔁 retribuir' }
    }

    if (!option.embedTextTwo) {
        embed.footer = null
        return await interaction.reply({ embeds: [embed], fetchReply: true })
    }

    const msg = await interaction.reply({
        embeds: [embed],
        fetchReply: !isBot
    })

    if (isBot) return

    msg.react('🔁').catch(() => { })

    return msg.createReactionCollector({
        filter: (r, u) => u.id === member.id && r.emoji.name === '🔁',
        time: 60000,
        max: 1,
        errors: ['time', 'max']
    })
        .on('collect', () => {

            return msg.edit({
                embeds: [{
                    color: client.blue,
                    description: textTwo,
                    image: { url: rand[1] }
                }]
            }).catch(() => { })

        })
        .on('end', (_, reason) => {
            msg.reactions.removeAll().catch(() => { })

            if (reason === 'limit') return
            const embed = msg.embeds[0]?.data
            if (!embed) return

            embed.color = client.red
            embed.footer = { text: 'Comando cancelado' }
            return msg.edit({ embeds: [embed] }).catch(() => { })
        })

}