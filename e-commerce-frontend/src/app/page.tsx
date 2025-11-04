import Categories from '@/components/elements/landing-page/categories';
import FeaturedProducts from '@/components/elements/landing-page/feature';
import Footer from '@/components/elements/landing-page/footer';
import Header from '@/components/elements/landing-page/Header';
import Hero from '@/components/elements/landing-page/hero-section';
import Newsletter from '@/components/elements/landing-page/news-letter';
import { getUser } from '@/lib/actions/user/get-user';
import React from 'react'

async function page() {
  const user = await getUser();
  console.log("this isher user : ",user)
  return (
    <div>
      <Header />
      <Hero />
       <Categories />
      <FeaturedProducts />
      <Newsletter />
      <Footer />
      
    </div>
  )
}

export default page
  