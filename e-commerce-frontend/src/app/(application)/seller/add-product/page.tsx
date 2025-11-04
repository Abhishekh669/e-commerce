
import React from 'react'
import { getUser } from '@/lib/actions/user/get-user'
import { redirect } from 'next/navigation';
import AddProductPage from '@/components/elements/seller/add-product/AddProductPage';
async function page() {
    const user = await getUser();
    if (!user.success) {
        redirect("/login")
    }
    if (user?.user?.role !== "seller") {
        redirect("/")
    }
    return (
        <AddProductPage />
    )
}

export default page
