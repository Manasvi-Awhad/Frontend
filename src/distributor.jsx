import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebaseconfig";
import { useNavigate } from "react-router-dom";
import "./distributor.css";

const DistributorDashboard = () => {
  const navigate = useNavigate();
  
  // Sample initial data
  const initialShipments = [
    { id: 1, product: "Vaccine A", quantity: 200, manufacturer: "PharmaCorp", status: "Pending", shipmentDate: "2023-05-15" },
    { id: 2, product: "Medicine X", quantity: 500, manufacturer: "MediProd", status: "In Transit", shipmentDate: "2023-05-14" },
    { id: 3, product: "Vaccine B", quantity: 150, manufacturer: "HealthSolutions", status: "Delivered", shipmentDate: "2023-05-10" },
  ];

  const initialInventory = [
    { id: 1, product: "Vaccine A", quantity: 500, lowStock: false, lastUpdated: "2023-05-15" },
    { id: 2, product: "Medicine X", quantity: 1200, lowStock: false, lastUpdated: "2023-05-14" },
    { id: 3, product: "Vaccine B", quantity: 200, lowStock: true, lastUpdated: "2023-05-13" },
    { id: 4, product: "Drug Y", quantity: 50, lowStock: true, lastUpdated: "2023-05-12" },
  ];

  // State with localStorage persistence
  const [shipments, setShipments] = useState(() => {
    const saved = localStorage.getItem('distributorShipments');
    return saved ? JSON.parse(saved) : initialShipments;
  });

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('distributorInventory');
    return saved ? JSON.parse(saved) : initialInventory;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('distributorShipments', JSON.stringify(shipments));
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem('distributorInventory', JSON.stringify(inventory));
  }, [inventory]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Validate shipment
  const validateShipment = (shipmentId) => {
    setShipments(shipments.map(shipment => 
      shipment.id === shipmentId 
        ? { ...shipment, status: "Validated", validatedDate: new Date().toISOString().split('T')[0] }
        : shipment
    ));
  };

  // Update inventory
  const updateInventory = (productId, newQuantity) => {
    setInventory(inventory.map(item => 
      item.id === productId 
        ? { ...item, quantity: newQuantity, lowStock: newQuantity < 100, lastUpdated: new Date().toISOString().split('T')[0] }
        : item
    ));
  };

  // Update shipment status
  const updateShipmentStatus = (shipmentId, newStatus) => {
    setShipments(shipments.map(shipment => 
      shipment.id === shipmentId 
        ? { ...shipment, status: newStatus }
        : shipment
    ));
  };

  return (
    <div className="distributor-dashboard">
      <header className="dashboard-header">
        <h1>Distributor Dashboard</h1>
        <div className="user-info">
          <span>Welcome, Distributor</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Shipments</h3>
            <p className="stat">{shipments.length}</p>
            <p className="trend">{shipments.filter(s => s.status === "In Transit").length} in transit</p>
          </div>
          <div className="summary-card">
            <h3>Inventory Items</h3>
            <p className="stat">{inventory.length}</p>
            <p className="trend">{inventory.filter(i => i.lowStock).length} low stock</p>
          </div>
          <div className="summary-card">
            <h3>Pending Validation</h3>
            <p className="stat">{shipments.filter(s => s.status === "Pending").length}</p>
            <p className="trend">Needs attention</p>
          </div>
          <div className="summary-card">
            <h3>Delivery Rate</h3>
            <p className="stat">98%</p>
            <p className="trend">↑ 2% from last month</p>
          </div>
        </div>

        <div className="dashboard-main">
          {/* Shipment Validation Section */}
          <div className="dashboard-section">
            <h2>Validate Shipments</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Shipment ID</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Manufacturer</th>
                    <th>Shipment Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((shipment) => (
                    <tr key={shipment.id}>
                      <td>#SH-{shipment.id}</td>
                      <td>{shipment.product}</td>
                      <td>{shipment.quantity} units</td>
                      <td>{shipment.manufacturer}</td>
                      <td>{shipment.shipmentDate}</td>
                      <td>
                        <span className={`status-badge ${shipment.status.toLowerCase().replace(" ", "-")}`}>
                          {shipment.status}
                        </span>
                      </td>
                      <td>
                        {shipment.status === "Pending" && (
                          <button 
                            className="action-btn validate-btn"
                            onClick={() => validateShipment(shipment.id)}
                          >
                            Validate
                          </button>
                        )}
                        <select 
                          className="status-select"
                          value={shipment.status}
                          onChange={(e) => updateShipmentStatus(shipment.id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Validated">Validated</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inventory Monitoring Section */}
          <div className="dashboard-section">
            <h2>Inventory Levels</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Current Stock</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id} className={item.lowStock ? "low-stock" : ""}>
                      <td>{item.product}</td>
                      <td>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateInventory(item.id, parseInt(e.target.value))}
                          className="inventory-input"
                        /> units
                      </td>
                      <td>
                        <span className={`status-badge ${item.lowStock ? "low-stock" : "in-stock"}`}>
                          {item.lowStock ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td>{item.lastUpdated}</td>
                      <td>
                        <button className="action-btn order-btn">
                          Order More
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shipment Tracking Section */}
          <div className="dashboard-section">
            <h2>Shipment Status Tracking</h2>
            <div className="tracking-cards">
              {shipments.map((shipment) => (
                <div key={shipment.id} className="tracking-card">
                  <h3>Shipment #SH-{shipment.id}</h3>
                  <p><strong>Product:</strong> {shipment.product}</p>
                  <p><strong>Quantity:</strong> {shipment.quantity} units</p>
                  <p><strong>Status:</strong> 
                    <span className={`status-badge ${shipment.status.toLowerCase().replace(" ", "-")}`}>
                      {shipment.status}
                    </span>
                  </p>
                  <div className="tracking-timeline">
                    <div className={`timeline-step ${shipment.status !== "Pending" ? "completed" : ""}`}>
                      <div className="step-icon">1</div>
                      <span>Order Received</span>
                    </div>
                    <div className={`timeline-step ${["Validated", "In Transit", "Delivered"].includes(shipment.status) ? "completed" : ""}`}>
                      <div className="step-icon">2</div>
                      <span>Validated</span>
                    </div>
                    <div className={`timeline-step ${["In Transit", "Delivered"].includes(shipment.status) ? "completed" : ""}`}>
                      <div className="step-icon">3</div>
                      <span>In Transit</span>
                    </div>
                    <div className={`timeline-step ${shipment.status === "Delivered" ? "completed" : ""}`}>
                      <div className="step-icon">4</div>
                      <span>Delivered</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributorDashboard;