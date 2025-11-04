import Header from '@/components/elements/landing-page/Header'
import React from 'react'

function LayoutPage({ children }: { children: React.ReactNode }) {
  return (
    <div>
         <Header />
      {children}
    </div>
  )
}

export default LayoutPage