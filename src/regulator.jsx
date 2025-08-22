import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebaseconfig";
import { useNavigate } from "react-router-dom";
import "./regulator.css";

const RegulatorDashboard = () => {
  const navigate = useNavigate();
  
  // Sample supply chain data
  const initialSupplyChainData = [
    { 
      id: 1, 
      product: "Vaccine A", 
      batch: "BATCH-001", 
      manufacturer: "PharmaCorp", 
      manufacturerDate: "2023-05-01",
      distributor: "MedSupply Co.", 
      distributorDate: "2023-05-10",
      retailer: "HealthPlus Pharmacy", 
      retailerDate: "2023-05-15",
      status: "Complete",
      temperature: "2-8°C",
      discrepancies: 0
    },
    { 
      id: 2, 
      product: "Medicine X", 
      batch: "BATCH-002", 
      manufacturer: "MediProd", 
      manufacturerDate: "2023-05-05",
      distributor: "PharmaDist Inc.", 
      distributorDate: "2023-05-12",
      retailer: "QuickMeds", 
      retailerDate: "2023-05-18",
      status: "In Transit",
      temperature: "15-25°C",
      discrepancies: 1
    },
    { 
      id: 3, 
      product: "Vaccine B", 
      batch: "BATCH-003", 
      manufacturer: "HealthSolutions", 
      manufacturerDate: "2023-05-03",
      distributor: "HealthCare Distributors", 
      distributorDate: "2023-05-11",
      retailer: "Community Pharmacy", 
      retailerDate: "2023-05-16",
      status: "Complete",
      temperature: "2-8°C",
      discrepancies: 0
    },
  ];

  const initialDiscrepancies = [
    { id: 1, product: "Medicine X", batch: "BATCH-002", issue: "Temperature excursion", severity: "Medium", status: "Under Investigation", date: "2023-05-13" },
    { id: 2, product: "Drug Y", batch: "BATCH-005", issue: "Labeling error", severity: "Low", status: "Resolved", date: "2023-05-08" },
    { id: 3, product: "Vaccine A", batch: "BATCH-001", issue: "Delivery delay", severity: "Low", status: "Resolved", date: "2023-05-06" },
  ];

  // State with localStorage persistence
  const [supplyChainData, setSupplyChainData] = useState(() => {
    const saved = localStorage.getItem('regulatorSupplyChain');
    return saved ? JSON.parse(saved) : initialSupplyChainData;
  });

  const [discrepancies, setDiscrepancies] = useState(() => {
    const saved = localStorage.getItem('regulatorDiscrepancies');
    return saved ? JSON.parse(saved) : initialDiscrepancies;
  });

  const [reportRange, setReportRange] = useState({
    startDate: "2023-05-01",
    endDate: new Date().toISOString().split('T')[0]
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('regulatorSupplyChain', JSON.stringify(supplyChainData));
  }, [supplyChainData]);

  useEffect(() => {
    localStorage.setItem('regulatorDiscrepancies', JSON.stringify(discrepancies));
  }, [discrepancies]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Handle report range change
  const handleReportRangeChange = (e) => {
    const { name, value } = e.target;
    setReportRange({
      ...reportRange,
      [name]: value
    });
  };

  // Generate report
  const generateReport = () => {
    const filteredData = supplyChainData.filter(item => 
      item.manufacturerDate >= reportRange.startDate && 
      item.manufacturerDate <= reportRange.endDate
    );

    const reportData = {
      period: `${reportRange.startDate} to ${reportRange.endDate}`,
      totalProducts: filteredData.length,
      completeShipments: filteredData.filter(item => item.status === "Complete").length,
      inTransitShipments: filteredData.filter(item => item.status === "In Transit").length,
      totalDiscrepancies: discrepancies.filter(d => 
        d.date >= reportRange.startDate && d.date <= reportRange.endDate
      ).length,
      temperatureIssues: discrepancies.filter(d => 
        d.issue.includes("Temperature") && 
        d.date >= reportRange.startDate && d.date <= reportRange.endDate
      ).length
    };

    const blob = new Blob([
      `Regulatory Compliance Report\nPeriod: ${reportData.period}\nTotal Products: ${reportData.totalProducts}\nComplete Shipments: ${reportData.completeShipments}\nIn Transit Shipments: ${reportData.inTransitShipments}\nTotal Discrepancies: ${reportData.totalDiscrepancies}\nTemperature Issues: ${reportData.temperatureIssues}`
    ], { type: 'text/plain' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Compliance-Report-${reportRange.startDate}-to-${reportRange.endDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Update discrepancy status
  const updateDiscrepancyStatus = (id, newStatus) => {
    setDiscrepancies(discrepancies.map(d => 
      d.id === id ? { ...d, status: newStatus } : d
    ));
  };

  return (
    <div className="regulator-dashboard">
      <header className="dashboard-header">
        <h1>Regulator Dashboard</h1>
        <div className="user-info">
          <span>Welcome, Regulator</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Products Tracked</h3>
            <p className="stat">{supplyChainData.length}</p>
            <p className="trend">{supplyChainData.filter(item => item.status === "Complete").length} delivered</p>
          </div>
          <div className="summary-card">
            <h3>Active Discrepancies</h3>
            <p className="stat">{discrepancies.filter(d => d.status !== "Resolved").length}</p>
            <p className="trend">{discrepancies.filter(d => d.severity === "High").length} high severity</p>
          </div>
          <div className="summary-card">
            <h3>Compliance Rate</h3>
            <p className="stat">98.7%</p>
            <p className="trend">↑ 1.2% from last quarter</p>
          </div>
          <div className="summary-card">
            <h3>Temperature Excursions</h3>
            <p className="stat">{discrepancies.filter(d => d.issue.includes("Temperature")).length}</p>
            <p className="trend">All investigated</p>
          </div>
        </div>

        <div className="dashboard-main">
          {/* Supply Chain Data Section */}
          <div className="dashboard-section full-width">
            <h2>Full Supply Chain Data</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Batch</th>
                    <th>Manufacturer</th>
                    <th>Manufactured</th>
                    <th>Distributor</th>
                    <th>Distributed</th>
                    <th>Retailer</th>
                    <th>Retailed</th>
                    <th>Temperature</th>
                    <th>Discrepancies</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {supplyChainData.map((item) => (
                    <tr key={item.id} className={item.discrepancies > 0 ? "has-discrepancy" : ""}>
                      <td>{item.product}</td>
                      <td>{item.batch}</td>
                      <td>{item.manufacturer}</td>
                      <td>{item.manufacturerDate}</td>
                      <td>{item.distributor}</td>
                      <td>{item.distributorDate}</td>
                      <td>{item.retailer}</td>
                      <td>{item.retailerDate}</td>
                      <td>{item.temperature}</td>
                      <td>{item.discrepancies}</td>
                      <td>
                        <span className={`status-badge ${item.status.toLowerCase().replace(" ", "-")}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Discrepancy Monitoring Section */}
          <div className="dashboard-section">
            <h2>Discrepancy Monitoring</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Batch</th>
                    <th>Issue</th>
                    <th>Severity</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {discrepancies.map((d) => (
                    <tr key={d.id} className={`discrepancy-${d.severity.toLowerCase()}`}>
                      <td>{d.product}</td>
                      <td>{d.batch}</td>
                      <td>{d.issue}</td>
                      <td>
                        <span className={`severity-badge ${d.severity.toLowerCase()}`}>
                          {d.severity}
                        </span>
                      </td>
                      <td>{d.date}</td>
                      <td>
                        <span className={`status-badge ${d.status.toLowerCase().replace(" ", "-")}`}>
                          {d.status}
                        </span>
                      </td>
                      <td>
                        <select 
                          value={d.status}
                          onChange={(e) => updateDiscrepancyStatus(d.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="Under Investigation">Under Investigation</option>
                          <option value="Action Required">Action Required</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Report Generation Section */}
          <div className="dashboard-section">
            <h2>Generate Reports</h2>
            <div className="report-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={reportRange.startDate}
                    onChange={handleReportRangeChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endDate">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={reportRange.endDate}
                    onChange={handleReportRangeChange}
                  />
                </div>
              </div>
              <div className="report-actions">
                <button className="generate-btn" onClick={generateReport}>
                  Generate Compliance Report
                </button>
                <button className="generate-btn">
                  Export Full Data (CSV)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegulatorDashboard;