import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebaseconfig";
import { useNavigate } from "react-router-dom";
import "./retailer.css";

const RetailerDashboard = () => {
  const navigate = useNavigate();
  
  // Sample initial data
  const initialSales = [
    { id: 1, product: "Vaccine A", quantity: 5, amount: "$250", date: "2023-05-15", customer: "Customer A" },
    { id: 2, product: "Medicine X", quantity: 10, amount: "$500", date: "2023-05-14", customer: "Customer B" },
    { id: 3, product: "Vaccine B", quantity: 3, amount: "$150", date: "2023-05-13", customer: "Customer C" },
  ];

  const initialStock = [
    { id: 1, product: "Vaccine A", quantity: 45, minimum: 20, lastDelivery: "2023-05-10" },
    { id: 2, product: "Medicine X", quantity: 80, minimum: 30, lastDelivery: "2023-05-08" },
    { id: 3, product: "Vaccine B", quantity: 15, minimum: 25, lastDelivery: "2023-05-05" },
    { id: 4, product: "Drug Y", quantity: 35, minimum: 15, lastDelivery: "2023-05-12" },
  ];

  const initialCertificates = [
    { id: 1, product: "Vaccine A", issueDate: "2023-01-15", expiryDate: "2024-01-15", verified: true },
    { id: 2, product: "Medicine X", issueDate: "2023-02-20", expiryDate: "2024-02-20", verified: true },
    { id: 3, product: "Vaccine B", issueDate: "2023-03-10", expiryDate: "2024-03-10", verified: true },
  ];

  // State with localStorage persistence
  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem('retailerSales');
    return saved ? JSON.parse(saved) : initialSales;
  });

  const [stock, setStock] = useState(() => {
    const saved = localStorage.getItem('retailerStock');
    return saved ? JSON.parse(saved) : initialStock;
  });

  const [certificates, setCertificates] = useState(() => {
    const saved = localStorage.getItem('retailerCertificates');
    return saved ? JSON.parse(saved) : initialCertificates;
  });

  const [newSale, setNewSale] = useState({
    product: "",
    quantity: "",
    customer: "",
    date: new Date().toISOString().split('T')[0]
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('retailerSales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('retailerStock', JSON.stringify(stock));
  }, [stock]);

  useEffect(() => {
    localStorage.setItem('retailerCertificates', JSON.stringify(certificates));
  }, [certificates]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Handle sale input changes
  const handleSaleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSale({
      ...newSale,
      [name]: value,
    });
  };

  // Log new sale
  const logSale = (e) => {
    e.preventDefault();
    const productStock = stock.find(item => item.product === newSale.product);
    
    if (!productStock || productStock.quantity < parseInt(newSale.quantity)) {
      alert("Not enough stock available!");
      return;
    }

    const sale = {
      id: Date.now(),
      product: newSale.product,
      quantity: parseInt(newSale.quantity),
      amount: `$${parseInt(newSale.quantity) * 50}`,
      date: newSale.date,
      customer: newSale.customer
    };

    setSales([sale, ...sales]);
    
    // Update stock
    setStock(stock.map(item => 
      item.product === newSale.product 
        ? { ...item, quantity: item.quantity - parseInt(newSale.quantity) }
        : item
    ));

    setNewSale({
      product: "",
      quantity: "",
      customer: "",
      date: new Date().toISOString().split('T')[0]
    });
  };

  // Verify stock
  const verifyStock = () => {
    const lowStock = stock.filter(item => item.quantity < item.minimum);
    if (lowStock.length > 0) {
      alert(`Low stock alert for: ${lowStock.map(item => item.product).join(', ')}`);
    } else {
      alert("All stock levels are adequate.");
    }
  };

  // Download certificate
  const downloadCertificate = (certificate) => {
    const blob = new Blob([
      `Compliance Certificate\nProduct: ${certificate.product}\nIssue Date: ${certificate.issueDate}\nExpiry Date: ${certificate.expiryDate}\nStatus: Verified`
    ], { type: 'text/plain' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificate-${certificate.product}-${certificate.issueDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="retailer-dashboard">
      <header className="dashboard-header">
        <h1>Retailer Dashboard</h1>
        <div className="user-info">
          <span>Welcome, Retailer</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Today's Sales</h3>
            <p className="stat">${sales.filter(s => s.date === new Date().toISOString().split('T')[0])
              .reduce((sum, sale) => sum + parseInt(sale.amount.replace('$', '')), 0)}</p>
            <p className="trend">{sales.filter(s => s.date === new Date().toISOString().split('T')[0]).length} transactions</p>
          </div>
          <div className="summary-card">
            <h3>Total Products</h3>
            <p className="stat">{stock.length}</p>
            <p className="trend">{stock.filter(item => item.quantity < item.minimum).length} need restocking</p>
          </div>
          <div className="summary-card">
            <h3>Available Certificates</h3>
            <p className="stat">{certificates.length}</p>
            <p className="trend">All verified</p>
          </div>
          <div className="summary-card">
            <h3>Customer Satisfaction</h3>
            <p className="stat">96%</p>
            <p className="trend">↑ 3% from last month</p>
          </div>
        </div>

        <div className="dashboard-main">
          {/* Sales Transaction Section */}
          <div className="dashboard-section">
            <h2>Log Sales Transactions</h2>
            <form onSubmit={logSale} className="sales-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="product">Product</label>
                  <select
                    id="product"
                    name="product"
                    value={newSale.product}
                    onChange={handleSaleInputChange}
                    required
                  >
                    <option value="">Select Product</option>
                    {stock.map(item => (
                      <option key={item.id} value={item.product}>
                        {item.product} ({item.quantity} available)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="quantity">Quantity</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={newSale.quantity}
                    onChange={handleSaleInputChange}
                    required
                    min="1"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="customer">Customer Name</label>
                  <input
                    type="text"
                    id="customer"
                    name="customer"
                    value={newSale.customer}
                    onChange={handleSaleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={newSale.date}
                    onChange={handleSaleInputChange}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="submit-btn">
                Record Sale
              </button>
            </form>
          </div>

          {/* Sales History Section */}
          <div className="dashboard-section">
            <h2>Sales History</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id}>
                      <td>#SALE-{sale.id}</td>
                      <td>{sale.product}</td>
                      <td>{sale.quantity} units</td>
                      <td>{sale.customer}</td>
                      <td>{sale.date}</td>
                      <td>{sale.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stock Verification Section */}
          <div className="dashboard-section">
            <h2>Stock Verification</h2>
            <div className="verification-header">
              <button className="verify-btn" onClick={verifyStock}>
                Verify All Stock Levels
              </button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Current Stock</th>
                    <th>Minimum Required</th>
                    <th>Status</th>
                    <th>Last Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map((item) => (
                    <tr key={item.id} className={item.quantity < item.minimum ? "low-stock" : ""}>
                      <td>{item.product}</td>
                      <td>{item.quantity} units</td>
                      <td>{item.minimum} units</td>
                      <td>
                        <span className={`status-badge ${item.quantity < item.minimum ? "low-stock" : "in-stock"}`}>
                          {item.quantity < item.minimum ? "Low Stock" : "Adequate"}
                        </span>
                      </td>
                      <td>{item.lastDelivery}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance Certificates Section */}
          <div className="dashboard-section">
            <h2>Compliance Certificates</h2>
            <div className="certificates-grid">
              {certificates.map((certificate) => (
                <div key={certificate.id} className="certificate-card">
                  <h3>{certificate.product}</h3>
                  <p><strong>Issue Date:</strong> {certificate.issueDate}</p>
                  <p><strong>Expiry Date:</strong> {certificate.expiryDate}</p>
                  <p><strong>Status:</strong> 
                    <span className="status-badge verified">Verified</span>
                  </p>
                  <button 
                    className="download-btn"
                    onClick={() => downloadCertificate(certificate)}
                  >
                    Download Certificate
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetailerDashboard;