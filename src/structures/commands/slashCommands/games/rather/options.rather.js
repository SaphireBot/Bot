import { Emojis as e } from "../../../../../util/util.js"
import deleteRather from "./functions/delete.rather.js"
import editRather from "./functions/edit.rather.js"
import {
    SaphireClient as client,
    Modals
} from "../../../../../classes/index.js"
import personalListRather from "./functions/personalList.rather.js"
import listRather from "./functions/list.rather.js"

export default async interaction => {

    const { options } = interaction
    const optionName = options.data[0].options[0].name
    const optionValue = options.data[0].options[0].value // TO OFF

    if (optionValue === 'suggest')
        return await interaction.showModal(Modals.vocePrefere())

    if (optionValue === 'myQuestions')
        return personalListRather(interaction)

    if (optionValue === 'fullList')
        return listRather(interaction)

    switch (optionName) {
        case 'delete': deleteRather(interaction, optionValue); break;
        case 'edit': editRather(interaction, optionValue); break;
        default:
            await interaction.reply({
                content: `${e.Deny} | Nenhuma sub-função definida.`,
                ephemeral: true
            })
            break;
    }

    return
}