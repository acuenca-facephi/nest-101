export class ObjectUtils {
    static getAllObjectPropertyNames(
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

    static mergeObjects(target: object, source: object, overwrite: boolean = false): object {
        /**
         * Returns two object merged with and without overwriting.
         *
         * @param target - Target object to merge.
         * @param source - Source object to merge.
         * @param overwrite - If true "source" param will overwrite "target", else 
         *                      "source" properties will be added to "target" object.
         * @returns Merge result.
         */
        return overwrite ? { ...target, ...source } : { ...source, ...target };
    }
}
