export interface DashboardSummary {
    total_revenue: number;
    total_orders: number;
    total_products_sold: number;
    average_order_value: number;
    total_inventory_value: number;
    low_stock_products: number;
    out_of_stock_products: number;
    total_categories: number;
}

export interface RevenueTrend {
    date: string;
    revenue: number;
}

export interface SalesTrend {
    date: string;
    orders: number;
}

export interface TopProduct {
    product_name: string;
    quantity: number;
}

export interface CategoryDistribution {
    category: string;
    count: number;
}

export interface InventoryStatus {
    status: string;
    count: number;
}

export interface DashboardResponse {

    summary: {
        total_revenue: number;
        total_orders: number;
        total_items_sold: number;
        average_order_value: number;
        total_discount: number;
        total_tax: number;
        total_inventory_value: number;
        low_stock_products: number;
        out_of_stock_products: number;
        total_categories: number;
    };

    revenue_trend: any[];

    weekly_revenue: {
        period: string;
        revenue: number;
    }[];

    monthly_revenue: {
        period: string;
        revenue: number;
    }[];



    sales_trend: any[];

    sales_vs_orders: {
        date: string;
        revenue: number;
        orders: number;
    }[];

    top_products: {
        product: string;
        quantity: number;
        revenue: number;
    }[];

    top_customers: {
        customer: string;
        orders: number;
        total_spend: number;
        average_order_value: number;
    }[];

    payment_method_analysis: {
        payment_method: string;
        transactions: number;
        revenue: number;
    }[];



    category_distribution: {
        category: string;
        value: number;
    }[];

    inventory_status_distribution: any[];
}