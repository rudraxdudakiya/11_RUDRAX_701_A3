import React, { useState } from 'react';
import UserSite from './components/UserSite';
import AdminSite from './components/AdminSite';

export default function App() {
  const [activeSite, setActiveSite] = useState('user'); // 'user' | 'admin'
  const [cart, setCart] = useState([]);

  // Cart operations
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product._id !== productId));
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product._id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div>
      {/* Header */}
      <h1>Question 7: MERN Shopping Cart</h1>
      <p>
        Full stack shopping cart with <strong>Admin Site</strong> and <strong>User Site</strong>, featuring <strong>2-level Category</strong> and Products hierarchy.
      </p>

      {/* Navigation Switch between User Site and Admin Site */}
      <div>
        <button
          type="button"
          onClick={() => setActiveSite('user')}
          disabled={activeSite === 'user'}
        >
          User Site (Shopping)
        </button>
        &nbsp;&nbsp;
        <button
          type="button"
          onClick={() => setActiveSite('admin')}
          disabled={activeSite === 'admin'}
        >
          Admin Site (Management)
        </button>
        &nbsp;&nbsp;
        <span>
          Cart Items: <strong>{totalCartCount}</strong>
        </span>
      </div>

      <hr />

      {/* Main Content Area */}
      {activeSite === 'user' && (
        <UserSite
          cart={cart}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          clearCart={clearCart}
        />
      )}

      {activeSite === 'admin' && <AdminSite />}

      <hr />
    </div>
  );
}
