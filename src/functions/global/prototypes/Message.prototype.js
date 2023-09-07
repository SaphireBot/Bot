import { SaphireClient as client } from "../../../classes/index.js";
import { Message, Routes } from "discord.js";

Message.prototype.getUser = async function (id = "") {

    if (/^\w+$/.test(id))
        return this.mentions.members.get(id)?.user
            || client.users.cache.get(id)
            || await client.users.fetch(id).catch(() => undefined)
            || await client.rest.get(Routes.user(id))
                .then(user => {
                    client.users.cache.set(user.id, user)
                    return client.users.cache.get(user.id)
                })
                .catch(() => undefined)

    return this.mentions.members.first()?.user || this.author
}

Message.prototype.getMember = async function (id = "") {

    if (/^\w+$/.test(id))
        return this.mentions.members.get(id)
            || this.guild.members.cache.get(id)
            || await this.guild.members.fetch(id).catch(() => null)

    return this.mentions.members.first() || this.member
}

Message.prototype.getUsers = async function (ids = []) {

    const users = []
    if (ids?.length) {
        for await (const id of ids.filter(i => /^\w+$/.test(i)))
            users.push(await this.getUser(id))
        return users
    }

    return this.mentions.members.map(member => member.user)
}

Message.prototype.getMultipleUsers = async function () {
    const ids = this.formatIds()

    const users = []
    if (ids?.length) {
        for await (const id of ids.filter(i => /^\w+$/.test(i)))
            users.push(await this.getUser(id))
        return users
    }

    return this.mentions.members.map(member => member.user)
}

Message.prototype.getMembers = async function (ids = []) {

    const members = []
    if (ids.length) {
        for await (const id of ids.filter(i => /^\w+$/.test(i)))
            members.push(await this.getMember(id))
        return members
    }

    return this.mentions.members.toJSON()
}

Message.prototype.formatIds = function () {
    const ids = new Set()
    this.mentions.members.forEach(member => ids.add(member.id))

    for (
        const id
        of this.content
            .trim()
            .split(/ +/g)
            .filter(str => /^\w+$/.test(str))
    )
        ids.add(id)

    return Array.from(ids)
}