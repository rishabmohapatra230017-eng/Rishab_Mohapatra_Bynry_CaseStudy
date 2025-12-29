const express = require('express');
const app = express();
// Mock Database Interface
const db = require('./db_config'); 

/**
 * Part 3: API Implementation
 * Endpoint: GET /api/companies/:company_id/alerts/low-stock
 */
app.get('/api/companies/:company_id/alerts/low-stock', async (req, res) => {
    const { company_id } = req.params;

    try {
        // Step 1: Fetch all products that are physically low on stock
        // We join Products, Inventory, and Warehouses
        const lowStockQuery = `
            SELECT 
                p.id as product_id, p.name, p.sku, p.low_stock_threshold,
                i.quantity as current_stock, w.name as warehouse_name,
                s.email as supplier_email
            FROM products p
            JOIN inventory i ON p.id = i.product_id
            JOIN warehouses w ON i.warehouse_id = w.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE p.company_id = ? 
            AND i.quantity < p.low_stock_threshold
        `;
        
        const lowStockItems = await db.query(lowStockQuery, [company_id]);
        const finalAlerts = [];

        // Step 2: Filter logic based on Sales Velocity
        for (const item of lowStockItems) {
            
            // Check sales in the last 30 days
            const salesQuery = `
                SELECT SUM(quantity_sold) as total_sold 
                FROM sales_transactions 
                WHERE product_id = ? 
                AND transaction_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            `;
            const salesResult = await db.query(salesQuery, [item.product_id]);
            const totalSold = salesResult[0].total_sold || 0;
            
            // Calculate Average Daily Sales
            const dailyVelocity = totalSold / 30;

            // Business Rule: Only alert if the product is actually selling
            if (dailyVelocity > 0) {
                finalAlerts.push({
                    product_id: item.product_id,
                    product_name: item.name,
                    sku: item.sku,
                    warehouse: item.warehouse_name,
                    current_stock: item.current_stock,
                    // Avoid division by zero, round down
                    days_until_stockout: Math.floor(item.current_stock / dailyVelocity),
                    supplier_contact: item.supplier_email
                });
            }
        }

        res.status(200).json({
            alerts: finalAlerts,
            total_alerts: finalAlerts.length
        });

    } catch (error) {
        console.error("Error fetching alerts:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = app;