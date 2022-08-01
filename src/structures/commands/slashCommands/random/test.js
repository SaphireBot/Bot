import dicio from 'dicionario.js'

export default {
    name: 'test',
    description: 'test',
    dm_permission: false,
    type: 1,
    admin: true,
    options: [],
    async execute({ interaction, client, Database }) {

        const query = interaction.options.getString('word')

        try {
            const word = await dicio.significado(query)
            console.log(word)
        } catch (err) {
            console.log('Não encontrado')
         }

        return await interaction.reply({ content: 'ok' })
    }
}