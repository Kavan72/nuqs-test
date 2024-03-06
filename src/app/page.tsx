"use client";

import Test, {FilterType} from "@/components/Test";
import {useQueryStates} from "nuqs";
import {useEffect} from "react";


export default function Home() {

    const [filters, setFilter] = useQueryStates(FilterType, {
        clearOnDefault: true,
    })

    useEffect(() => {
        console.log(filters)
    }, [filters.query, filters.leadStatus]);

    return (
        <Test filters={filters} setFilter={setFilter}/>
    );
}
