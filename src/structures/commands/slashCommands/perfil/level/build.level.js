import { AttachmentBuilder } from "discord.js"
import { registerFont, createCanvas, loadImage } from 'canvas'
import { Emojis as e } from "../../../../../util/util.js"

export default async (interaction, options = []) => {

    try {

        registerFont('./src/structures/commands/slashCommands/perfil/level/Poppins-SemiBold.ttf', {
            family: "Poppins-Regular"
        });
        registerFont('./src/structures/commands/slashCommands/perfil/level/Poppins-SemiBold.ttf', {
            family: "Poppins-Bold"
        });

        const { user, backgroundUrl } = options
        const canvas = createCanvas(1080, 400)
        const ctx = canvas.getContext("2d");

        const name = (() => {
            let tag = user.username

            if (!tag) return 'Tag Not Found'

            if (tag.length > 15)
                tag = tag.slice(0, 15) + '...'

            return tag
        })();

        const BackgroundRadius = "20"
        const Username = name.replace(/[\u007f-\uffff]/g, "")
        const AvatarRoundRadius = "50"
        const DrawLayerColor = "#000000"
        const DrawLayerOpacity = "0.4"
        const BoxColor = options.color || "#096DD1"
        const LevelBarFill = "#ffffff"
        const LevelBarBackground = "#ffffff"
        const Rank = options.rank
        const TextEXP = shortener(options.currentXP) + " xp"
        const LvlText = `Level ${shortener(options.level)}`
        const BarRadius = "20"
        const TextXpNeded = "{current}/{needed}"
        const CurrentXP = options.currentXP
        const NeededXP = options.neededXP

        ctx.beginPath();
        ctx.moveTo(0 + Number(BackgroundRadius), 0);
        ctx.lineTo(0 + 1080 - Number(BackgroundRadius), 0);
        ctx.quadraticCurveTo(0 + 1080, 0, 0 + 1080, 0 + Number(BackgroundRadius));
        ctx.lineTo(0 + 1080, 0 + 400 - Number(BackgroundRadius));
        ctx.quadraticCurveTo(
            0 + 1080,
            0 + 400,
            0 + 1080 - Number(BackgroundRadius),
            0 + 400
        );

        ctx.lineTo(0 + Number(BackgroundRadius), 0 + 400);
        ctx.quadraticCurveTo(0, 0 + 400, 0, 0 + 400 - Number(BackgroundRadius));
        ctx.lineTo(0, 0 + Number(BackgroundRadius));
        ctx.quadraticCurveTo(0, 0, 0 + Number(BackgroundRadius), 0);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, 1080, 400);
        const background = await loadImage(backgroundUrl || "https://media.discordapp.net/attachments/899493577623756801/899852259154866276/unknown.png?width=708&height=409");
        ctx.globalAlpha = 0.7;
        ctx.drawImage(background, 0, 0, 1080, 400);
        ctx.restore();

        ctx.fillStyle = DrawLayerColor;
        ctx.globalAlpha = DrawLayerOpacity;
        ctx.fillRect(40, 0, 240, canvas.height);
        ctx.globalAlpha = 1;

        const avatar = await loadImage(user.avatarURL({ forceStatic: false, format: "png" })?.replace('webp', 'png'));

        ctx.save();
        RoundedBox(ctx, 40 + 30, 30, 180, 180, Number(AvatarRoundRadius));
        ctx.strokeStyle = BoxColor;
        ctx.lineWidth = "10";
        ctx.stroke();
        ctx.clip();
        ctx.drawImage(avatar, 40 + 30, 30, 180, 180);
        ctx.restore();

        ctx.save();
        RoundedBox(ctx, 40 + 30, 30 + 180 + 30 + 50 + 30, 180, 50, 20);
        ctx.strokeStyle = "#BFC85A22";
        ctx.stroke();
        ctx.clip();
        ctx.fillStyle = BoxColor;
        ctx.globalAlpha = "1";
        ctx.fillRect(40 + 30, 30 + 180 + 30 + 50 + 30, 180, 50);
        ctx.globalAlpha = 1;
        ctx.fillStyle = BoxColor === "#ffffff" ? "#050404" : "#ffffff";
        ctx.font = '32px "Poppins-Bold"';
        ctx.textAlign = "center";
        ctx.fillText(TextEXP, 40 + 30 + 180 / 2, 30 + 180 + 30 + 30 + 50 + 38);
        ctx.restore();

        ctx.save();
        RoundedBox(ctx, 40 + 30, 30 + 180 + 30, 180, 50, 20);
        ctx.strokeStyle = "#BFC85A22";
        ctx.stroke();
        ctx.clip();
        ctx.fillStyle = BoxColor;
        ctx.globalAlpha = "1";
        ctx.fillRect(40 + 30, 30 + 180 + 30, 180, 50, 50);
        ctx.globalAlpha = 1;
        ctx.fillStyle = BoxColor === "#ffffff" ? "#050404" : "#ffffff";
        ctx.font = '32px "Poppins-Bold"';
        ctx.textAlign = "center";
        ctx.fillText(LvlText, 40 + 30 + 180 / 2, 30 + 180 + 30 + 38);
        ctx.restore();

        ctx.save();
        ctx.textAlign = "left";
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.font = '39px "Poppins-Bold"';
        ctx.fillText(Username, 390, 80);
        ctx.restore();

        ctx.save();
        ctx.textAlign = "right";
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.font = '55px "Poppins-Bold"';
        ctx.fillText("#" + Rank, canvas.width - 50 - 5, 80);
        ctx.restore();

        ctx.save();
        RoundedBox(ctx, 390, 305, 660, 70, Number(20));
        ctx.strokeStyle = "#BFC85A22";
        ctx.stroke();
        ctx.clip();
        ctx.fillStyle = "#ffffff";
        ctx.font = '45px "Poppins-Bold"';
        ctx.fillText(interaction.guild.name, 75 + 450, 355);
        ctx.globalAlpha = "0.2";
        ctx.fillRect(390, 305, 660, 70);
        ctx.restore();

        ctx.save();
        RoundedBox(ctx, 390, 145, 660, 50, Number(BarRadius));
        ctx.strokeStyle = "#BFC85A22";
        ctx.stroke();
        ctx.clip();
        ctx.fillStyle = LevelBarBackground;
        ctx.globalAlpha = "0.2";
        ctx.fillRect(390, 145, 660, 50, 50);
        ctx.restore();

        const percent = (100 * CurrentXP) / NeededXP;
        const progress = (percent * 660) / 100;

        ctx.save();
        RoundedBox(ctx, 390, 145, progress > 660 ? 660 : progress, 50, Number(BarRadius));
        ctx.strokeStyle = "#BFC85A22";
        ctx.stroke();
        ctx.clip();
        ctx.fillStyle = LevelBarFill;
        ctx.globalAlpha = "0.5";
        ctx.fillRect(390, 145, progress > 660 ? 660 : progress, 50, 50);
        ctx.restore();

        ctx.save();
        ctx.textAlign = "left";
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = "0.8";
        ctx.font = '30px "Poppins-Bold"';
        ctx.fillText("Falta " + shortener((NeededXP - CurrentXP) || 0) + " xp para o próximo level", 390, 230);
        ctx.restore();

        const latestXP = Number(CurrentXP) - Number(NeededXP);
        const textXPEdited = TextXpNeded.replace(/{needed}/g, shortener(NeededXP))
            .replace(/{current}/g, shortener(CurrentXP))
            .replace(/{latest}/g, latestXP);

        ctx.textAlign = "center";
        ctx.fillStyle = "#474747";
        ctx.globalAlpha = 1;
        ctx.font = '30px "Poppins-Bold"';
        ctx.fillText(textXPEdited, 730, 180);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), {
            description: 'Saphire Level ranking card',
            name: 'rankLevelCard.png'
        })

        return await interaction.editReply({ files: [attachment] })
            .catch(async () => await interaction.deleteReply(() => { }))

    } catch (err) {
        return await interaction.editReply({
            content: `${e.Deny} | Não foi possível carregar este rank card.`
        })
            .catch(async () => await interaction.deleteReply(() => { }))
    }
}

function RoundedBox(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height
    );
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function shortener(count) {
    if (!count || count <= 0) return 0

    const COUNT_ABBRS = ["", "k", "M", "T"];

    const i =
        0 === count ? count : Math.floor(Math.log(count) / Math.log(1000));
    let result = parseFloat((count / Math.pow(1000, i)).toFixed(2));
    result += `${COUNT_ABBRS[i]}`;
    return result;
}