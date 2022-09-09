export function getAllObjectPropertyNames(
    obj: Object,
    maxChainLength: number = 10
): [string[], [fieldName: string, fieldType: any][]] {
    let propertyNames: string[] = []
    let properties: [fieldName: string, fieldType: any][] = [];
    let o: Object = obj;
    const excludeProperties: string[] = ['constructor']

    for (let index = 0; o.constructor !== Object && index < maxChainLength; index++) {
        Object.getOwnPropertyNames(o).forEach(n => {
            if (!excludeProperties.includes(n)) {
                propertyNames.push(n);
                properties.push([n, obj[n as keyof typeof obj]]);
            }
        });
        o = Object.getPrototypeOf(o);
    }
    return [propertyNames, properties];
}
