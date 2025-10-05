const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // XAMPP default password
    database: 'store_sales'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL');
});

// PRODUCTS endpoints
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});
app.post('/api/products', (req, res) => {
    const { name, description, price } = req.body;
    db.query(
        'INSERT INTO products (name, description, price) VALUES (?, ?, ?)',
        [name, description, price],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ id: result.insertId, ...req.body });
        }
    );
});

// CUSTOMERS endpoints (prevent duplicate email)
app.get('/api/customers', (req, res) => {
    db.query('SELECT * FROM customers', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});
app.post('/api/customers', (req, res) => {
    const { name, email, phone } = req.body;
    db.query(
        'SELECT * FROM customers WHERE email = ?', [email],
        (err, results) => {
            if (err) return res.status(500).json({ error: err });
            if (results.length > 0) {
                return res.status(409).json({ error: 'Duplicate customer email.' });
            } else {
                db.query(
                    'INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)',
                    [name, email, phone],
                    (err2, result) => {
                        if (err2) return res.status(500).json({ error: err2 });
                        res.json({ id: result.insertId, ...req.body });
                    }
                );
            }
        }
    );
});

// SALES endpoints (link product & customer)
app.get('/api/sales', (req, res) => {
    const query = `
        SELECT sales.*, customers.name AS customer_name, products.name AS product_name, products.price AS product_price
        FROM sales
        LEFT JOIN customers ON sales.customer_id = customers.id
        LEFT JOIN products ON sales.product_id = products.id
        ORDER BY sales.sale_date DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});
app.post('/api/sales', (req, res) => {
    const { product_id, quantity, sale_date, customer_id } = req.body;
    db.query(
        'INSERT INTO sales (product_id, quantity, sale_date, customer_id) VALUES (?, ?, ?, ?)',
        [product_id, quantity, sale_date, customer_id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ id: result.insertId, ...req.body });
        }
    );
});
app.put('/api/sales/:id', (req, res) => {
    const { product_id, quantity, sale_date, customer_id } = req.body;
    db.query(
        'UPDATE sales SET product_id=?, quantity=?, sale_date=?, customer_id=? WHERE id=?',
        [product_id, quantity, sale_date, customer_id, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ success: true });
        }
    );
});
app.delete('/api/sales/:id', (req, res) => {
    db.query('DELETE FROM sales WHERE id=?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ success: true });
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
