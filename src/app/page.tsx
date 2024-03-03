"use client";

import Test, {FilterType} from "@/components/Test";
import {useQueryStates} from "nuqs";
import useRenderingTrace from "@/hooks/useRenderingTrace";


export default function Home() {

    const [filters, setFilter] = useQueryStates(FilterType, {
        clearOnDefault: true,
    })

    useRenderingTrace('Home', { filters, setFilter })

    return (
        <Test filters={filters} setFilter={setFilter}/>
    );
}
