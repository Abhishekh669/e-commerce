import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query"

import axios from "axios"

export type Product = {
    id:          string,
    name:         string,
    description:  string,
    price:       number,
    quantity:    number,
    discount:    number,
    sellerId:     string,
    category:     string | { key: string; value: string; [key: string]: any } | { key: string; value: string; [key: string]: any }[] | null,
    images:       string[],
    stock:        number,
    createdAt:    string,
    updatedAt:    string,
    brand?:       string | { key: string; value: string; [key: string]: any } | { key: string; value: string; [key: string]: any }[] | null,
    rating?:      number,
    isLiked?:     boolean,
};

export type AllProductsResponse = {
    data: {
        products: Product[];
        hasMore: boolean;
        nextOffset: number;
        total: number;
    };
};

// Fetch products from backend
export const fetchAllProducts = async (params: { limit?: number; offset?: number; search?: string } = {}): Promise<AllProductsResponse> => {
    const { limit = 12, offset = 0, search = '' } = params;
    
    const queryParams = new URLSearchParams();
    if (search) {
        // Search by product name, description, and category values
        queryParams.append('search', search);
    }
    queryParams.append('limit', limit.toString());
    queryParams.append('offset', offset.toString());
    
    const res = await axios.get(`/api/get/products?${queryParams.toString()}`);
    return res.data;
}

export const useGetAllProducts = (limit: number = 12, search?: string) => {
    return useInfiniteQuery<AllProductsResponse, Error>({
        queryKey: ["get-all-products", search],
        queryFn: ({ pageParam = 0 }) => fetchAllProducts({ 
            limit, 
            offset: pageParam as number,
            search
        }),
        getNextPageParam: (lastPage) => lastPage.data.hasMore ? lastPage.data.nextOffset : undefined,
        initialPageParam: 0,
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false,
    });
};



