import React, { useState, useEffect } from 'react';

export default function UserSite({ cart, addToCart, removeFromCart, updateQuantity, clearCart }) {
  const [categories, setCategories] = useState([]);
  const [parents, setParents] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  // Selected filters (2-Level)
  const [selectedParent, setSelectedParent] = useState('');
  const [selectedSub, setSelectedSub] = useState('');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Checkout state
  const [showCheckout, setShowCheckout] = useState(false);
  const [customer, setCustomer] = useState({ name: '', email: '', address: '', city: '' });
  const [orderMessage, setOrderMessage] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Fetch all categories and extract parents
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
        const parentList = data.categories.filter((c) => !c.parent);
        setParents(parentList);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch products with optional 2-level category filters
  const fetchProducts = async (parentId = '', subId = '') => {
    setLoading(true);
    try {
      let url = '/api/products';
      const params = new URLSearchParams();
      if (parentId) params.append('parentCategory', parentId);
      if (subId) params.append('subCategory', subId);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // When parent category selection changes
  const handleParentChange = (e) => {
    const parentId = e.target.value;
    setSelectedParent(parentId);
    setSelectedSub('');

    if (parentId) {
      // Find subcategories belonging to this parent
      const subs = categories.filter((c) => c.parent && (c.parent._id === parentId || c.parent === parentId));
      setSubcategories(subs);
      fetchProducts(parentId, '');
    } else {
      setSubcategories([]);
      fetchProducts('', '');
    }
  };

  // When subcategory selection changes
  const handleSubChange = (e) => {
    const subId = e.target.value;
    setSelectedSub(subId);
    fetchProducts(selectedParent, subId);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSelectedParent('');
    setSelectedSub('');
    setSubcategories([]);
    fetchProducts('', '');
  };

  // Calculate cart totals
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const totalAmount = Math.round((subtotal + tax) * 100) / 100;

  // Handle Checkout submission
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    setPlacingOrder(true);
    setOrderMessage('');

    try {
      const orderPayload = {
        customer,
        items: cart.map((i) => ({
          productId: i.product._id,
          title: i.product.title,
          price: i.product.price,
          quantity: i.quantity,
          image: i.product.image
        })),
        subtotal,
        tax,
        totalAmount,
        paymentMethod: 'Cash on Delivery'
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (data.success) {
        setOrderMessage(`Order #${data.order._id} placed successfully! Thank you for shopping with us.`);
        clearCart();
        setCustomer({ name: '', email: '', address: '', city: '' });
        setShowCheckout(false);
      } else {
        alert(data.message || 'Failed to place order.');
      }
    } catch (err) {
      alert('Checkout error: ' + err.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div>
      <h2>User Site: Product Catalog & Shopping</h2>

      {orderMessage && (
        <div>
          <p><strong>{orderMessage}</strong></p>
          <hr />
        </div>
      )}

      {/* 2-LEVEL CATEGORY FILTER CONTROLS */}
      <div>
        <h3>Filter by 2-Level Category</h3>
        
        <label htmlFor="parentSelect">Level 1 (Parent Category): </label>
        <select id="parentSelect" value={selectedParent} onChange={handleParentChange}>
          <option value="">-- All Categories --</option>
          {parents.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        &nbsp;&nbsp;

        <label htmlFor="subSelect">Level 2 (Subcategory): </label>
        <select
          id="subSelect"
          value={selectedSub}
          onChange={handleSubChange}
          disabled={!selectedParent || subcategories.length === 0}
        >
          <option value="">-- All Subcategories --</option>
          {subcategories.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        &nbsp;&nbsp;

        {(selectedParent || selectedSub) && (
          <button type="button" onClick={handleResetFilters}>
            Clear Filters
          </button>
        )}
      </div>

      <hr />

      {/* PRODUCT LIST */}
      <div>
        <h3>Products ({products.length})</h3>

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found for the selected category filter.</p>
        ) : (
          <table border="1" cellPadding="6" cellSpacing="0">
            <thead>
              <tr>
                <th>#</th>
                <th>Product Title</th>
                <th>Description</th>
                <th>Level 1 (Parent)</th>
                <th>Level 2 (Subcategory)</th>
                <th>Price ($)</th>
                <th>Stock</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={p._id}>
                  <td>{idx + 1}</td>
                  <td><strong>{p.title}</strong></td>
                  <td>{p.description}</td>
                  <td>{p.parentCategory ? p.parentCategory.name : 'N/A'}</td>
                  <td>{p.subCategory ? p.subCategory.name : 'N/A'}</td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>{p.stock}</td>
                  <td>
                    <button type="button" onClick={() => addToCart(p)}>
                      Add to Cart
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <hr />

      {/* SHOPPING CART SECTION */}
      <div>
        <h3>Shopping Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)} items)</h3>

        {cart.length === 0 ? (
          <p>Your cart is empty. Click "Add to Cart" on any product above.</p>
        ) : (
          <div>
            <table border="1" cellPadding="6" cellSpacing="0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price ($)</th>
                  <th>Quantity</th>
                  <th>Total ($)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.product._id}>
                    <td>{item.product.title}</td>
                    <td>${item.product.price.toFixed(2)}</td>
                    <td>
                      <button type="button" onClick={() => updateQuantity(item.product._id, item.quantity - 1)}>
                        -
                      </button>
                      &nbsp;{item.quantity}&nbsp;
                      <button type="button" onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>
                        +
                      </button>
                    </td>
                    <td>${(item.product.price * item.quantity).toFixed(2)}</td>
                    <td>
                      <button type="button" onClick={() => removeFromCart(item.product._id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p>
              Subtotal: <strong>${subtotal.toFixed(2)}</strong> | Tax (5%): <strong>${tax.toFixed(2)}</strong> | Total: <strong>${totalAmount.toFixed(2)}</strong>
            </p>

            <button type="button" onClick={() => setShowCheckout(!showCheckout)}>
              {showCheckout ? 'Cancel Checkout' : 'Proceed to Checkout'}
            </button>
            &nbsp;
            <button type="button" onClick={clearCart}>
              Clear Cart
            </button>

            {/* CHECKOUT FORM */}
            {showCheckout && (
              <div>
                <hr />
                <h4>Checkout Details</h4>
                <form onSubmit={handleCheckoutSubmit}>
                  <div>
                    <label>Full Name: </label>
                    <input
                      type="text"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      required
                    />
                  </div>
                  <br />
                  <div>
                    <label>Email: </label>
                    <input
                      type="email"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      required
                    />
                  </div>
                  <br />
                  <div>
                    <label>Delivery Address: </label>
                    <input
                      type="text"
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      required
                    />
                  </div>
                  <br />
                  <div>
                    <label>City: </label>
                    <input
                      type="text"
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                      required
                    />
                  </div>
                  <br />
                  <div>
                    <p>Payment: <strong>Cash on Delivery (COD)</strong></p>
                    <p>Total Payable: <strong>${totalAmount.toFixed(2)}</strong></p>
                  </div>
                  <button type="submit" disabled={placingOrder}>
                    {placingOrder ? 'Placing Order...' : 'Place Order Now'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
