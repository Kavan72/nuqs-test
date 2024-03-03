import {createParser, parseAsBoolean, parseAsString, Parser, useQueryStates} from "nuqs";
import {ChangeEvent, useState} from "react";
import {useComponentDidUpdate} from "@/hooks/useComponentDidUpdate";

export function safeParse<T>(parser: Parser<T>['parse'], value: string, key?: string) {
    try {
        return parser(value)
    } catch (error) {
        console.warn('[nuqs] Error while parsing value `%s`: %O' + (key ? ' (for key `%s`)' : ''), value, error, key)
        return null
    }
}

export function customParseAsArrayOf<ItemType>(itemParser: Parser<ItemType>, separator = ',') {
    const itemEq = itemParser.eq ?? ((a: ItemType, b: ItemType) => a === b)
    const encodedSeparator = encodeURIComponent(separator)
    // todo: Handle default item values and make return type non-nullable
    return createParser({
        parse: query => {
            if (query === '') {
                // Empty query should not go through the split/map/filter logic,
                // see https://github.com/47ng/nuqs/issues/329
                return [] as ItemType[]
            }
            return query
                .split(separator)
                .map((item, index) => safeParse(itemParser.parse, item.replaceAll(encodedSeparator, separator), `[${index}]`))
                .filter(value => value !== null && value !== undefined) as ItemType[]
        },
        serialize: values =>
            values
                .map<string>(value => {
                    const str = itemParser.serialize ? itemParser.serialize(value) : String(value)
                    return str.replaceAll(separator, encodedSeparator)
                })
                .join(separator),
        eq(a, b) {
            if (a === b) {
                return true // Referentially stable
            }
            if (a.length !== b.length) {
                return false
            }
            return a.reduce((aType, bType) => aType && b.includes(bType), true)
        }
    })
}

export const FilterType = {
    query: parseAsString.withDefault(''),
    leadStatus: customParseAsArrayOf(parseAsString).withDefault(['CONFIRMED', 'QUALIFIED', 'PENDING']),
    withRecognizedTerms: parseAsBoolean.withDefault(true)
}

interface Props {
  filters: ReturnType<typeof useQueryStates<typeof FilterType>>[0]
  setFilter: ReturnType<typeof useQueryStates<typeof FilterType>>[1]
}

const Test = ({ filters, setFilter }: Props) => {
    // ** Hook

    const [query, setQuery] = useState(filters.query)

    useComponentDidUpdate(() => {
        const timeoutId = setTimeout(
            () =>
                setFilter(previousState => {
                    return {
                        query: query
                    }
                }),
            1000
        )

        return () => clearTimeout(timeoutId)
    }, [query])

    const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        if (event.target.checked) {
            setFilter(previousState => {
                return {
                    leadStatus: [...previousState.leadStatus, value]
                }
            })
        } else {
            setFilter(previousState => {
                return {
                    leadStatus: previousState.leadStatus.filter((name: string) => name !== value)
                }
            })
        }
    };

    return (
        <>
            <label>
                <input
                    type="checkbox"
                    value={"CONFIRMED"}
                    checked={filters.leadStatus.includes("CONFIRMED")}
                    onChange={handleCheckboxChange}
                />
                CONFIRMED
            </label>
            <label>
                <input
                    type="checkbox"
                    value={"QUALIFIED"}
                    checked={filters.leadStatus.includes("QUALIFIED")}
                    onChange={handleCheckboxChange}
                />
                QUALIFIED
            </label>
            <label>
                <input
                    type="checkbox"
                    value={"PENDING"}
                    checked={filters.leadStatus.includes("PENDING")}
                    onChange={handleCheckboxChange}
                />
                PENDING
            </label>
            <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Enter filter text"
            />
        </>
    );
}

export default Test
