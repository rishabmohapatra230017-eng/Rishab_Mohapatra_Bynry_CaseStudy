# Backend Engineering Intern Case Study - Rishab Mohapatra

## Overview
This repository contains the complete solution for the Bynry Backend Engineering Intern Case Study.

## File Structure
* **Part 1 (`part1_debug.py`):** - Fixed the Atomicity Violation by implementing proper transaction commits.
  - Added input validation and error handling using try/except blocks.
  
* **Part 2 (`part2_schema.md`):** - Designed a normalized database schema.
  - Separated `Inventory` from `Products` to support multi-warehouse functionality.

* **Part 3 (`part3_api.js`):** - Implemented the Low Stock Alert API using Node.js.
  - Added logic to calculate sales velocity (last 30 days) to prevent false alerts on stagnant products.