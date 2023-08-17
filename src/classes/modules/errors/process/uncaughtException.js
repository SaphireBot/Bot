export default async function (error, origin) {
    if (error?.code == 10062) return
    return console.log(error, origin)
}