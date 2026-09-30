import React, { useState, useEffect } from 'react';

export default function AdminSite() {
  const [categories, setCategories] = useState([]);
  const [parents, setParents] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  // Category Forms
  const [newParentName, setNewParentName] = useState('');
  const [newParentDesc, setNewParentDesc] = useState('');

  const [selectedParentForSub, setSelectedParentForSub] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubDesc, setNewSubDesc] = useState('');

  // Product Form
  const [prodTitle, setProdTitle] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('10');
  const [prodParent, setProdParent] = useState('');
  const [prodSub, setProdSub] = useState('');
  const [availableSubs, setAvailableSubs] = useState([]);

  // Active admin tab: 'categories' | 'products' | 'orders'
  const [adminTab, setAdminTab] = useState('categories');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    fetchCategories();
    fetchProducts();
    fetchOrders();
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
        const parentList = data.categories.filter((c) => !c.parent);
        setParents(parentList);
        if (parentList.length > 0 && !selectedParentForSub) {
          setSelectedParentForSub(parentList[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  // Add Level 1 (Parent) Category
  const handleAddParentCategory = async (e) => {
    e.preventDefault();
    if (!newParentName.trim()) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newParentName.trim(), description: newParentDesc.trim(), parent: null })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Level 1 Category "${data.category.name}" created.`);
        setNewParentName('');
        setNewParentDesc('');
        fetchCategories();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error creating parent category: ' + err.message);
    }
  };

  // Add Level 2 (Sub) Category
  const handleAddSubCategory = async (e) => {
    e.preventDefault();
    if (!newSubName.trim() || !selectedParentForSub) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSubName.trim(), description: newSubDesc.trim(), parent: selectedParentForSub })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Level 2 Subcategory "${data.category.name}" created under selected parent.`);
        setNewSubName('');
        setNewSubDesc('');
        fetchCategories();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error creating subcategory: ' + err.message);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage(`Category "${name}" deleted.`);
        fetchCategories();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Delete error: ' + err.message);
    }
  };

  // When Parent Category for Product form changes
  const handleProdParentChange = (e) => {
    const parentId = e.target.value;
    setProdParent(parentId);
    setProdSub('');
    if (parentId) {
      const subs = categories.filter((c) => c.parent && (c.parent._id === parentId || c.parent === parentId));
      setAvailableSubs(subs);
    } else {
      setAvailableSubs([]);
    }
  };

  // Add New Product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!prodTitle || !prodPrice || !prodParent || !prodSub) {
      alert('Please fill in title, price, parent category, and subcategory.');
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: prodTitle.trim(),
          description: prodDesc.trim(),
          price: parseFloat(prodPrice),
          stock: parseInt(prodStock) || 0,
          parentCategory: prodParent,
          subCategory: prodSub
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage(`Product "${data.product.title}" added successfully.`);
        setProdTitle('');
        setProdDesc('');
        setProdPrice('');
        setProdStock('10');
        setProdParent('');
        setProdSub('');
        setAvailableSubs([]);
        fetchProducts();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error creating product: ' + err.message);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete product "${title}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage(`Product "${title}" deleted.`);
        fetchProducts();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Delete product error: ' + err.message);
    }
  };

  // Update Order Status
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Order #${orderId} status changed to ${newStatus}.`);
        fetchOrders();
      }
    } catch (err) {
      alert('Order update error: ' + err.message);
    }
  };

  return (
    <div>
      <h2>Admin Site: Store & Catalog Management</h2>

      {message && (
        <div>
          <p><strong>{message}</strong></p>
          <hr />
        </div>
      )}

      {/* ADMIN TABS */}
      <div>
        <button type="button" onClick={() => setAdminTab('categories')} disabled={adminTab === 'categories'}>
          Manage 2-Level Categories
        </button>
        &nbsp;
        <button type="button" onClick={() => setAdminTab('products')} disabled={adminTab === 'products'}>
          Manage Products
        </button>
        &nbsp;
        <button type="button" onClick={() => setAdminTab('orders')} disabled={adminTab === 'orders'}>
          Manage Orders
        </button>
      </div>

      <hr />

      {/* TAB 1: 2-LEVEL CATEGORY MANAGEMENT */}
      {adminTab === 'categories' && (
        <div>
          <h3>1. 2-Level Category Management</h3>

          {/* ADD LEVEL 1 (PARENT) */}
          <div>
            <h4>Add Level 1 (Parent) Category</h4>
            <form onSubmit={handleAddParentCategory}>
              <label>Parent Category Name: </label>
              <input
                type="text"
                value={newParentName}
                onChange={(e) => setNewParentName(e.target.value)}
                placeholder="e.g. Electronics, Fashion"
                required
              />
              &nbsp;
              <label>Description: </label>
              <input
                type="text"
                value={newParentDesc}
                onChange={(e) => setNewParentDesc(e.target.value)}
                placeholder="Optional description"
              />
              &nbsp;
              <button type="submit">Add Parent Category</button>
            </form>
          </div>

          <br />

          {/* ADD LEVEL 2 (SUBCATEGORY) */}
          <div>
            <h4>Add Level 2 (Subcategory)</h4>
            <form onSubmit={handleAddSubCategory}>
              <label>Select Parent Category: </label>
              <select
                value={selectedParentForSub}
                onChange={(e) => setSelectedParentForSub(e.target.value)}
                required
              >
                <option value="">-- Choose Parent --</option>
                {parents.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
              &nbsp;
              <label>Subcategory Name: </label>
              <input
                type="text"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                placeholder="e.g. Laptops, Smartphones"
                required
              />
              &nbsp;
              <label>Description: </label>
              <input
                type="text"
                value={newSubDesc}
                onChange={(e) => setNewSubDesc(e.target.value)}
                placeholder="Optional description"
              />
              &nbsp;
              <button type="submit">Add Subcategory</button>
            </form>
          </div>

          <br />

          {/* LIST OF ALL CATEGORIES */}
          <h4>Existing Categories List (2-Level Hierarchy)</h4>
          <table border="1" cellPadding="6" cellSpacing="0">
            <thead>
              <tr>
                <th>#</th>
                <th>Category Name</th>
                <th>Hierarchy Level</th>
                <th>Parent Category</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c, idx) => (
                <tr key={c._id}>
                  <td>{idx + 1}</td>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.parent ? 'Level 2 (Subcategory)' : 'Level 1 (Parent Category)'}</td>
                  <td>{c.parent ? c.parent.name : '— (Root Category)'}</td>
                  <td>{c.description || '—'}</td>
                  <td>
                    <button type="button" onClick={() => handleDeleteCategory(c._id, c.name)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: PRODUCT MANAGEMENT */}
      {adminTab === 'products' && (
        <div>
          <h3>2. Product Management</h3>

          {/* ADD PRODUCT FORM */}
          <div>
            <h4>Add New Product</h4>
            <form onSubmit={handleAddProduct}>
              <div>
                <label>Product Title: </label>
                <input
                  type="text"
                  value={prodTitle}
                  onChange={(e) => setProdTitle(e.target.value)}
                  placeholder="e.g. MacBook Pro"
                  required
                />
              </div>
              <br />
              <div>
                <label>Description: </label>
                <input
                  type="text"
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Product specs / details"
                  required
                />
              </div>
              <br />
              <div>
                <label>Price ($): </label>
                <input
                  type="number"
                  step="0.01"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  placeholder="e.g. 999.99"
                  required
                />
                &nbsp;&nbsp;
                <label>Stock Units: </label>
                <input
                  type="number"
                  value={prodStock}
                  onChange={(e) => setProdStock(e.target.value)}
                  style={{ width: '70px' }}
                  required
                />
              </div>
              <br />
              <div>
                <label>Level 1 (Parent Category): </label>
                <select value={prodParent} onChange={handleProdParentChange} required>
                  <option value="">-- Select Parent Category --</option>
                  {parents.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                &nbsp;&nbsp;
                <label>Level 2 (Subcategory): </label>
                <select
                  value={prodSub}
                  onChange={(e) => setProdSub(e.target.value)}
                  disabled={!prodParent || availableSubs.length === 0}
                  required
                >
                  <option value="">-- Select Subcategory --</option>
                  {availableSubs.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <br />
              <button type="submit">Add Product to Store</button>
            </form>
          </div>

          <br />

          {/* PRODUCTS LIST */}
          <h4>Existing Products ({products.length})</h4>
          <table border="1" cellPadding="6" cellSpacing="0">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Price ($)</th>
                <th>Level 1 Parent</th>
                <th>Level 2 Subcategory</th>
                <th>Stock</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={p._id}>
                  <td>{idx + 1}</td>
                  <td><strong>{p.title}</strong></td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>{p.parentCategory ? p.parentCategory.name : 'N/A'}</td>
                  <td>{p.subCategory ? p.subCategory.name : 'N/A'}</td>
                  <td>{p.stock}</td>
                  <td>
                    <button type="button" onClick={() => handleDeleteProduct(p._id, p.title)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: ORDERS MANAGEMENT */}
      {adminTab === 'orders' && (
        <div>
          <h3>3. Customer Orders Management ({orders.length})</h3>
          {orders.length === 0 ? (
            <p>No orders placed yet. Place an order from the User Site to see it here.</p>
          ) : (
            <table border="1" cellPadding="6" cellSpacing="0">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Address & City</th>
                  <th>Items Purchased</th>
                  <th>Total Amount ($)</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td><code>{o._id}</code></td>
                    <td>
                      {o.customer.name} ({o.customer.email})
                    </td>
                    <td>
                      {o.customer.address}, {o.customer.city}
                    </td>
                    <td>
                      <ul>
                        {o.items.map((it, i) => (
                          <li key={i}>
                            {it.title} &times; {it.quantity} (${it.price})
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td><strong>${o.totalAmount.toFixed(2)}</strong></td>
                    <td><strong>{o.status}</strong></td>
                    <td>
                      <select value={o.status} onChange={(e) => handleOrderStatusChange(o._id, e.target.value)}>
                        <option value="Placed">Placed</option>
                        <option value="Processing">Processing</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
