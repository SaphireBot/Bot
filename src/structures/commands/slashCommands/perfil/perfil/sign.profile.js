export default async (interaction, ephemeral = false) => {

    const signs = {
        "Aries": "♈",
        "Touro": "♉",
        "Gêmeos": "♊",
        "Câncer": "♋",
        "Leão": "♌",
        "Virgem": "♍",
        "Libra": "♎",
        "Escorpião": "♏",
        "Sagitário": "♐",
        "Capricórnio": "♑",
        "Aquário": "♒",
        "Peixes": "♓"
    }

    const selectMenuObject = {
        type: 1,
        components: [{
            type: 3,
            custom_id: ephemeral ? 'signEphemeral' : 'sign',
            placeholder: 'Selecione o seu signo',
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