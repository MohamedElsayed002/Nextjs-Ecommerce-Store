import { ProductCardSkeleton, ProductCart } from "@/components/ProductCart"
import db from "@/db/db"
import { Suspense } from "react"
import {cache} from '@/lib/cache'


const  getProducts = cache(() => {
    // await wait (2000)
    return db.product.findMany({where : {isAvailableForPurchase : true}, orderBy : {name : 'asc'}})
},["/products","getProducts"])

function wait(duration : number) {
    return new Promise(resolve => setTimeout(resolve,duration))
}

export default function ProductsPage() {
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
            <Suspense
                fallback={
                    <>
                        <ProductCardSkeleton/>
                        <ProductCardSkeleton/>
                        <ProductCardSkeleton/>
                    </>
                }
            >
                <ProductsSuspense/>
            </Suspense>
        </div>
    )
}

async  function ProductsSuspense()  {
    const products = await getProducts()
    return products.map(product => (
        <ProductCart key={product.id} {...product} />
    ))
}