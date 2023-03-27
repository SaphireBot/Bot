import { ButtonStyle } from "discord.js"

export default question => {
    const component = [{ type: 1, components: [] }]
    const answers = question.answers.randomize()
    for (const answer of answers)
        component[0].components.push({
            type: 2,
            label: answer.answer.captalize(),
            custom_id: answer.answer,
            style: ButtonStyle.Primary
        })

    return component
}