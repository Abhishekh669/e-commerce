import { getUser } from '@/lib/actions/user/get-user'
import { redirect } from 'next/navigation';
import React from 'react'
import { AppLayout } from '@/components/elements/layout/AppLayout'
import UserStoreWrapper from '@/components/elements/UserStoreWrapper'

async function LayoutPage({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  console.log("user in seelcted layout", user)
  if(!user.success){
    redirect("/login")
  }
  return (
    <UserStoreWrapper>
      <AppLayout>
        {children}
      </AppLayout>
    </UserStoreWrapper>
  )
}

export default LayoutPage
