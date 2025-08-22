import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebaseconfig";
import { useNavigate } from "react-router-dom";
import "./manufacturer.css";

const ManufacturerDashboard = () => {
  const navigate = useNavigate();
  
  // Initial data
  const initialProductionLogs = [
    { id: 1, product: "Vaccine A", quantity: 1000, date: "2023-05-15", status: "Completed", batchNumber: "BATCH-001" },
    { id: 2, product: "Vaccine B", quantity: 500, date: "2023-05-14", status: "In Progress", batchNumber: "BATCH-002" },
    { id: 3, product: "Medicine X", quantity: 2000, date: "2023-05-13", status: "Completed", batchNumber: "BATCH-003" },
  ];

  const initialTransactions = [
    { id: 1, product: "Vaccine A", quantity: 200, distributor: "MedSupply Co.", date: "2023-05-10", amount: "$5,000" },
    { id: 2, product: "Medicine X", quantity: 500, distributor: "PharmaDist Inc.", date: "2023-05-05", amount: "$12,500" },
    { id: 3, product: "Vaccine B", quantity: 150, distributor: "HealthCare Distributors", date: "2023-05-01", amount: "$3,750" },
  ];

  // State for production logs with localStorage persistence
  const [productionLogs, setProductionLogs] = useState(() => {
    const savedLogs = localStorage.getItem('manufacturerProductionLogs');
    return savedLogs ? JSON.parse(savedLogs) : initialProductionLogs;
  });

  // State for transaction history with localStorage persistence
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem('manufacturerTransactions');
    return savedTransactions ? JSON.parse(savedTransactions) : initialTransactions;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('manufacturerProductionLogs', JSON.stringify(productionLogs));
  }, [productionLogs]);

  useEffect(() => {
    localStorage.setItem('manufacturerTransactions', JSON.stringify(transactions));
  }, [transactions]);

  // State for new production form
  const [newProduction, setNewProduction] = useState({
    product: "",
    quantity: "",
    batchNumber: "",
    productionDate: "",
  });

  // State for compliance status
  const [complianceStatus, setComplianceStatus] = useState({
    fda: "Compliant",
    who: "Compliant",
    iso: "Compliant - Certificate expires 2024-06-30",
    gmp: "Compliant - Last audit: 2023-04-15",
  });

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduction({
      ...newProduction,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const newLog = {
      id: Date.now(), // Use timestamp for unique ID
      product: newProduction.product,
      quantity: parseInt(newProduction.quantity),
      date: newProduction.productionDate,
      batchNumber: newProduction.batchNumber,
      status: "Pending",
    };
    
    setProductionLogs([newLog, ...productionLogs]);
    
    // Also create a transaction for the new production
    const newTransaction = {
      id: Date.now() + 1, // Different ID
      product: newProduction.product,
      quantity: parseInt(newProduction.quantity),
      distributor: "Internal Production",
      date: new Date().toISOString().split('T')[0],
      amount: `$${parseInt(newProduction.quantity) * 25}` // Example calculation
    };
    
    setTransactions([newTransaction, ...transactions]);
    
    setNewProduction({
      product: "",
      quantity: "",
      batchNumber: "",
      productionDate: "",
    });
  };

  return (
    <div className="manufacturer-dashboard">
      <header className="dashboard-header">
        <h1>Manufacturer Dashboard</h1>
        <div className="user-info">
          <span>Welcome, Manufacturer</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Production</h3>
            <p className="stat">{productionLogs.reduce((sum, log) => sum + log.quantity, 0)} units</p>
            <p className="trend">↑ 12% from last month</p>
          </div>
          <div className="summary-card">
            <h3>Pending Orders</h3>
            <p className="stat">{productionLogs.filter(log => log.status === "Pending").length} orders</p>
            <p className="trend">↓ 2 from last week</p>
          </div>
          <div className="summary-card">
            <h3>Compliance Status</h3>
            <p className="stat">100% Compliant</p>
            <p className="trend">All certifications valid</p>
          </div>
          <div className="summary-card">
            <h3>Revenue</h3>
            <p className="stat">${transactions.reduce((sum, transaction) => {
              const amount = parseInt(transaction.amount.replace('$', '').replace(',', ''));
              return sum + (isNaN(amount) ? 0 : amount);
            }, 0).toLocaleString()}</p>
            <p className="trend">↑ 8% from last month</p>
          </div>
        </div>

        <div className="dashboard-main">
          {/* Production Logs Section */}
          <div className="dashboard-section">
            <h2>Production Logs</h2>
            {productionLogs.length === 0 ? (
              <p className="no-data">No production data available. Add your first production record.</p>
            ) : (
              <div className="table-container">
                <table className="production-table">
                  <thead>
                    <tr>
                      <th>Batch ID</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Production Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productionLogs.map((log) => (
                      <tr key={log.id}>
                        <td>#{log.batchNumber || log.id}</td>
                        <td>{log.product}</td>
                        <td>{log.quantity} units</td>
                        <td>{log.date}</td>
                        <td>
                          <span className={`status-badge ${log.status.toLowerCase().replace(" ", "-")}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add New Production Section */}
          <div className="dashboard-section">
            <h2>Add New Production Data</h2>
            <form onSubmit={handleSubmit} className="production-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="product">Product Name</label>
                  <input
                    type="text"
                    id="product"
                    name="product"
                    value={newProduction.product}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="quantity">Quantity</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={newProduction.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="batchNumber">Batch Number</label>
                  <input
                    type="text"
                    id="batchNumber"
                    name="batchNumber"
                    value={newProduction.batchNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="productionDate">Production Date</label>
                  <input
                    type="date"
                    id="productionDate"
                    name="productionDate"
                    value={newProduction.productionDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="submit-btn">
                Add Production Record
              </button>
            </form>
          </div>

          {/* Transaction History Section */}
          <div className="dashboard-section">
            <h2>Transaction History</h2>
            {transactions.length === 0 ? (
              <p className="no-data">No transaction history available.</p>
            ) : (
              <div className="table-container">
                <table className="transaction-table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Distributor</th>
                      <th>Date</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>#TXN-{transaction.id}</td>
                        <td>{transaction.product}</td>
                        <td>{transaction.quantity} units</td>
                        <td>{transaction.distributor}</td>
                        <td>{transaction.date}</td>
                        <td>{transaction.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Compliance Status Section */}
          <div className="dashboard-section">
            <h2>Compliance Status</h2>
            <div className="compliance-cards">
              <div className="compliance-card compliant">
                <h3>FDA Compliance</h3>
                <p>{complianceStatus.fda}</p>
                <div className="compliance-icon">✓</div>
              </div>
              <div className="compliance-card compliant">
                <h3>WHO Compliance</h3>
                <p>{complianceStatus.who}</p>
                <div className="compliance-icon">✓</div>
              </div>
              <div className="compliance-card compliant">
                <h3>ISO Certification</h3>
                <p>{complianceStatus.iso}</p>
                <div className="compliance-icon">✓</div>
              </div>
              <div className="compliance-card compliant">
                <h3>GMP Standards</h3>
                <p>{complianceStatus.gmp}</p>
                <div className="compliance-icon">✓</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerDashboard;