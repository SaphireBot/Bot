export default async (interaction, targetUser, measurerType) => {

    const measurer = {
        lgbt: `🏳️‍🌈 | Analisando o perfil de ${targetUser}, posso afirmar que é **{percent}% LGBTQIA+**.`,
        gado: `🐂 | Vendo o jeito de ${targetUser}, poderia falar que é **{percent}% gado**.`,
        cognitive: `🧠 | Pelo jeito que ${targetUser} fala, a **Capacidade Cognitiva** deste ser, está na faixa de **{percent}%**.`,
        future: `🗒️ | A chance de ${targetUser} ser alguém na vida, é mais ou menos **{percent}%**.`,
    }[measurerType]

    const percent = (Math.floor(Math.random() * 100) + 1).toFixed(0)
    const content = measurer.replace('{percent}', percent)

    return await interaction.reply({ content })
}  