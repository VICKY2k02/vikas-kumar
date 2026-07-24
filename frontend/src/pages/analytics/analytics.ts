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
        total_products_sold: number;
        average_order_value: number;
        total_inventory_value: number;
        low_stock_products: number;
        out_of_stock_products: number;
        total_categories: number;
    };

    revenue_trend: any[];
    sales_trend: any[];
    top_products: any[];
    category_distribution: any[];
    inventory_status_distribution: any[];
}