from flask import Flask, request, jsonify
from models import db, Product, Inventory # Assuming models exist

app = Flask(__name__)

@app.route('/api/products', methods=['POST'])
def create_product():
    data = request.get_json()
    
    # FIX 1: Input Validation
    # Check if critical fields are present
    if not data or 'name' not in data or 'sku' not in data or 'warehouse_id' not in data:
        return jsonify({"error": "Missing required fields: name, sku, or warehouse_id"}), 400
            
    # Check for non-negative values
    if data.get('price', 0) < 0 or data.get('initial_quantity', 0) < 0:
        return jsonify({"error": "Price and quantity must be non-negative"}), 400

    try:
        # FIX 2: Single Atomic Transaction
        # We start the transaction block here.
        
        # Create new product object
        product = Product(
            name=data['name'],
            sku=data['sku'],
            price=data['price']
            # Note: warehouse_id is removed from Product table to normalize data
            # Products can exist in multiple warehouses, so we don't bind it here.
        )
        db.session.add(product)
        
        # Flush sends the SQL to DB to generate product.id but does NOT commit yet.
        db.session.flush() 

        # Create Inventory record using the new product.id
        inventory = Inventory(
            product_id=product.id,
            warehouse_id=data['warehouse_id'],
            quantity=data['initial_quantity']
        )
        db.session.add(inventory)

        # FIX 3: Commit ONLY once after both operations succeed
        db.session.commit()
        
        return jsonify({"message": "Product created successfully", "product_id": product.id}), 201

    except Exception as e:
        # FIX 4: Rollback ensures no "ghost" data if anything fails
        db.session.rollback()
        return jsonify({"error": "Transaction failed", "details": str(e)}), 500