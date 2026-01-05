import React, { useState, useEffect } from 'react';
import CurrentDuty from './components/CurrentDuty';
import EmployeeList from './components/EmployeeList';
import History from './components/History';
import Login from './components/Login';
import { employeeAPI, authAPI, historyAPI } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [activeTab, setActiveTab] = useState('breakfast');
  const [rotationType, setRotationType] = useState('breakfast');
  const [employees, setEmployees] = useState([]);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [rotationQueue, setRotationQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [rotationType, isAuthenticated]);

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    const savedUsername = localStorage.getItem('username');

    if (token && savedUsername) {
      try {
        const result = await authAPI.verify();
        if (result.valid) {
          setIsAuthenticated(true);
          setUsername(savedUsername);
        } else {
          authAPI.logout();
        }
      } catch (error) {
        authAPI.logout();
      }
    }
    setLoading(false);
  };

  const handleLogin = (token) => {
    const savedUsername = localStorage.getItem('username');
    setIsAuthenticated(true);
    setUsername(savedUsername);
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setUsername('');
    setEmployees([]);
    setCurrentEmployee(null);
    setRotationQueue([]);
  };

  const loadData = async () => {
    try {
      const allEmployees = await employeeAPI.getAll();

      // Transform database format to frontend format
      const formattedEmployees = allEmployees.map(emp => ({
        id: emp.id,
        name: emp.name,
        isActive: emp.is_active === 1,
        breakfast: {
          lastTurnDate: emp.breakfast_last_turn_date ? new Date(emp.breakfast_last_turn_date) : null,
          turnCount: emp.breakfast_turn_count || 0
        },
        orders: {
          lastTurnDate: emp.orders_last_turn_date ? new Date(emp.orders_last_turn_date) : null,
          turnCount: emp.orders_turn_count || 0
        }
      }));

      setEmployees(formattedEmployees);

      // Calculate current employee and queue
      const activeEmployees = formattedEmployees.filter(emp => emp.isActive);

      if (activeEmployees.length > 0) {
        const sorted = sortEmployeesByRotation([...activeEmployees], rotationType);
        setCurrentEmployee(sorted[0]);
        setRotationQueue(sorted.slice(1));
      } else {
        setCurrentEmployee(null);
        setRotationQueue([]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const sortEmployeesByRotation = (employees, type) => {
    return employees.sort((a, b) => {
      const aData = a[type];
      const bData = b[type];

      if (aData.turnCount !== bData.turnCount) {
        return aData.turnCount - bData.turnCount;
      }

      if (!aData.lastTurnDate && !bData.lastTurnDate) return 0;
      if (!aData.lastTurnDate) return -1;
      if (!bData.lastTurnDate) return 1;
      return aData.lastTurnDate.getTime() - bData.lastTurnDate.getTime();
    });
  };

  const handleAddEmployee = async (name) => {
    await employeeAPI.create(name);
    loadData();
  };

  const handleEditEmployee = async (id, name) => {
    await employeeAPI.update(id, name);
    loadData();
  };

  const handleDeleteEmployee = async (id) => {
    await employeeAPI.delete(id);
    loadData();
  };

  const handleToggleStatus = async (id, isActive) => {
    await employeeAPI.updateStatus(id, isActive);
    loadData();
  };

  const handleMarkComplete = async (employeeId) => {
    await employeeAPI.markComplete(employeeId, rotationType);
    loadData();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'breakfast' || tab === 'orders') {
      setRotationType(tab);
    }
  };

  const handleExportCSV = () => {
    historyAPI.exportCSV(rotationType);
  };

  if (loading) {
    return (
      <div className="app">
        <div className="header">
          <h1>🏢 Office Duty Tracker</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <div className="header">
        <div className="header-actions">
          <div>
            <h1>🏢 Office Duty Tracker</h1>
            <p>Never forget whose turn it is!</p>
          </div>
          <div className="user-info">
            <span>👤 {username}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'breakfast' ? 'active' : ''}`}
          onClick={() => handleTabChange('breakfast')}
        >
          🍳 Breakfast
        </button>
        <button
          className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => handleTabChange('orders')}
        >
          📦 Orders
        </button>
        <button
          className={`nav-tab ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => handleTabChange('employees')}
        >
          👥 Employees
        </button>
        <button
          className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => handleTabChange('history')}
        >
          📅 History
        </button>
      </div>

      <div className="content">
        {(activeTab === 'breakfast' || activeTab === 'orders') && (
          <CurrentDuty
            currentEmployee={currentEmployee}
            rotationQueue={rotationQueue}
            onMarkComplete={handleMarkComplete}
            rotationType={rotationType}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeeList
            employees={employees}
            onAdd={handleAddEmployee}
            onEdit={handleEditEmployee}
            onDelete={handleDeleteEmployee}
            onToggleStatus={handleToggleStatus}
          />
        )}

        {activeTab === 'history' && (
          <History rotationType={rotationType} />
        )}
      </div>
    </div>
  );
}

export default App;
