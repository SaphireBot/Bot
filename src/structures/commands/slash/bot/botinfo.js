import botinfoSaphire from "../../functions/bot/botinfo.saphire.js";

export default {
    name: 'botinfo',
    description: '[bot] Informações gerais referente ao bot',
    category: "bot",
    dm_permission: false,
    database: false,
    type: 1,
    apiData: {
        name: "botinfo",
        description: "Veja as informações técnicas da Saphire",
        category: "Saphire",
        synonyms: [],
        tags: [],
perms: {
            user: [],
            bot: []
        }
    },
    execute: async ({ interaction }) => botinfoSaphire(interaction)
}