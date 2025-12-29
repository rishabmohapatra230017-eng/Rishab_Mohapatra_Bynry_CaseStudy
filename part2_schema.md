# Part 2: Database Schema Design

## 1. Assumptions & Strategy
* **Multi-Warehouse Support:** A single product can be stored in multiple warehouses. Therefore, `quantity` is moved to a separate `Inventory` table.
* **Bundles:** Bundles are logical groupings. We track them in a `ProductBundles` table.
* **Sales Velocity:** To calculate "days until stockout," we rely on a `SalesTransactions` table.

## 2. Schema Structure

### **Companies**
* `id` (PK): Integer, Auto-increment
* `name`: Varchar(255)
* `contact_email`: Varchar(255)

### **Warehouses**
* `id` (PK): Integer
* `company_id` (FK -> Companies.id)
* `name`: Varchar(100)
* `location`: Text

### **Products**
* `id` (PK): Integer
* `company_id` (FK -> Companies.id)
* `sku`: Varchar(50) (Unique Index)
* `name`: Varchar(255)
* `price`: Decimal(10, 2)
* `low_stock_threshold`: Integer (Defines when to alert)
* *Note: No quantity column here.*

### **Inventory** (The Link Table)
* `id` (PK): Integer
* `product_id` (FK -> Products.id)
* `warehouse_id` (FK -> Warehouses.id)
* `quantity`: Integer (Current stock level)
* *Constraint:* Unique constraint on (product_id, warehouse_id)

### **SalesTransactions**
* `id` (PK): Integer
* `product_id` (FK -> Products.id)
* `quantity_sold`: Integer
* `transaction_date`: DateTime