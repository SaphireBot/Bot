import {
    SaphireClient as client,
    Database
} from '../../../../classes/index.js'
import {
    Emojis as e
} from '../../../../util/util.js'

export default async interaction => {

    const { options, user } = interaction
    const subCommandGroup = options.getSubcommandGroup()
    const subCommand = options.getSubcommand()

    // if (subCommandGroup === 'logomarca') return logoMarca()
    // if (subCommandGroup === 'quiz') return quiz()
    if (subCommandGroup === 'wallpaper') return wallpaper()

    // async function logoMarca() {

    //     switch (subCommand) {
    //         case 'new': require('./logomarca/new.LogoMarca')(interaction); break;
    //         case 'view': require('./logomarca/view.LogoMarca')(interaction); break;
    //         case 'edit': require('./logomarca/edit.LogoMarca')(interaction); break;
    //         case 'delete': require('./logomarca/delete.LogoMarca')(interaction); break;
    //         default: await interaction.reply({
    //             content: `${e.Deny} | Nenhuma função foi encontrada`,
    //             ephemeral: true
    //         });
    //             break;
    //     }

    //     return
    // }

    // async function quiz() {

    //     switch (subCommand) {
    //         case 'new': require('./quiz/add.Quiz')(interaction); break;
    //         case 'delete': require('./quiz/delete.Quiz')(interaction); break;
    //         case 'add_answers': require('./quiz/newAnswers.Quiz')(interaction); break;
    //         case 'del_answers': require('./quiz/delAnswers.Quiz')(interaction); break;
    //         case 'edit': require('./quiz/edit.Quiz')(interaction); break;
    //         case 'list': require('./quiz/list.Quiz')(interaction); break;
    //         case 'view': require('./quiz/view.Quiz')(interaction); break;
    //         default: await interaction.reply({
    //             content: `${e.Deny} | Nenhuma função foi encontrada`,
    //             ephemeral: true
    //         });
    //             break;
    //     }

    //     return
    // }

    async function wallpaper() {

        const availableMembers = [...client.admins, Database.Names.Gowther, Database.Names.Rody]

        if (!availableMembers.includes(user.id))
            return await interaction.reply({
                content: `${e.Deny} | Você não tem permissão para usar este comando.`,
                ephemeral: true
            })

        switch (subCommand) {
            case 'add': import('./wallpaper/add.wallpaper.js').then(add => add.default(interaction)); break;
            case 'create': import('./wallpaper/create.wallpaper.js').then(create => create.default(interaction)); break;
            case 'delete_anime': import('./wallpaper/delete.wallpaper.js').then(deleteAnime => deleteAnime.default(interaction)); break;
            case 'delete_wallpaper': import('./wallpaper/deleteWallpaper.wallpaper.js').then(deleteWallpaper => deleteWallpaper.default(interaction)); break;
            default: await interaction.reply({
                content: `${e.Deny} | Nenhuma função foi encontrada`,
                ephemeral: true
            });
                break;
        }

        return
    }
}