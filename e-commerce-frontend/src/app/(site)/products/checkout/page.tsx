import React from 'react'
import CartCheckOutPage from '@/components/elements/products/CartCheckOutPage'
import { getUser } from '@/lib/actions/user/get-user'
import { redirect } from 'next/navigation'

async function page() {
  const user = await getUser()
  if(!user.success){
    redirect('/login')
  }
  return (
    <div>
      <CartCheckOutPage />
    </div>
  )
}

export default page
