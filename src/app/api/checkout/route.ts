import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const { items } = await request.json()
    if (!items || items.length === 0) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: items.map((item: { id: string; name: string; price: number; quantity: number }) => ({
        price_data: { currency: 'usd', product_data: { name: item.name }, unit_amount: item.price },
        quantity: item.quantity,
      })),
      shipping_address_collection: { allowed_countries: ['US', 'CA'] },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
