'use client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/formatters"
import { Elements, LinkAuthenticationElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import Image from "next/image"
import { FormEvent, useState } from "react"


type CheckOutFormProps = {
    product: {
        imagePath: string
        name: string
        priceInCents: number
        description: string
    }
    clientSecret: string
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string)

export function CheckoutForm({ product, clientSecret }: CheckOutFormProps) {
    return (
        <>
            <div className='max-w-5xl w-full mx-auto space-y-8'>
                <div className='flex gap-4 items-center'>
                    <div className='aspect-video flex-shrink-0 w-1/3 relative'>
                        <Image className='object-cover' src={product.imagePath} fill alt={product.name} />
                    </div>
                    <div className='flex flex-col'>
                        <div className='text-lg'>
                            {formatCurrency(product.priceInCents / 100)}
                        </div>
                        <h1 className='text-2xl font-bold'>{product.name}</h1>
                        <div className='line-clamp-3 text-muted-foreground'>
                            {product.description}
                        </div>
                    </div>

                </div>

                <Elements options={{ clientSecret }} stripe={stripePromise}>
                    <Form priceInCents={product.priceInCents} />
                </Elements>
            </div>
        </>
    )
}

function Form({ priceInCents }: { priceInCents: number }) {
    const stripe = useStripe()
    const elements = useElements()
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string>()
    function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (stripe == null || elements == null) return

        setLoading(true)

        // check for exisiting order
        stripe.confirmPayment({
            elements, confirmParams: {
                return_url: `${process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY}/stripe/purchase-success`
            }
        }).then(({ error }) => {
            if (error.type === 'card_error' || error.type === 'validation_error') {
                setErrorMessage(error.message)
            } else {
                setErrorMessage('An unknown error occurred')
            }
        }).finally(() => setLoading(false))
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Checkout</CardTitle>
                    {errorMessage && (
                        <CardDescription className='text-destructive'>
                            {errorMessage}
                        </CardDescription>

                    )}
                </CardHeader>
                <CardContent>
                    <PaymentElement />
                    <div className='mt-4'>
                        <LinkAuthenticationElement />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button size='lg' disabled={stripe == null || elements == null || loading} className='w-full'>
                        {loading ? 'Purchasing' : ` Purchase - ${formatCurrency(priceInCents / 100)}`}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}