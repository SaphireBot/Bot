export default async (interaction, ephemeral = false) => {

    const signs = {
        "Homem": "👨",
        "Mulher": "👩",
        "LGBTQIA+": "🏳️‍🌈",
        "Helicóptero de Guerra": "🚁"
    }

    const selectMenuObject = {
        type: 1,
        components: [{
            type: 3,
            custom_id: ephemeral ? 'genderEphemeral' : 'gender',
            placeholder: 'Selecione o seu sexo',
            options:
                Object.entries(signs)
                    .map(sign => ({
                        label: sign[0],
                        emoji:  `${sign[1]}`,
                        value: `${sign[1]} ${sign[0]}`
                    }))
        }]
    }

    return await interaction.reply({
        components: [selectMenuObject],
        ephemeral
    })
}