import { PostgresComparator } from "./postgres-comparator"
import { PostgresComparatorOperator } from "./postgres-comparator-operator"

export class PostgresMatcher {
    propertyToMatch: string
    comparatorOperator: PostgresComparatorOperator
    comparator: PostgresComparator
    queryToMatch: string

    constructor(
        propertyToMatch: string,
        comparatorOperator: PostgresComparatorOperator | undefined,
        comparator: PostgresComparator | undefined
    ) {
        
    }
}