export function bindFunctions(instance) {
    if (!instance) return;

    const propertyNames = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));

    for (const propertyName of propertyNames)
        if (typeof instance[propertyName] === "function")
            (instance)[propertyName] = instance[propertyName].bind(instance);
}