import React, { useState, useEffect } from 'react';
import Calendar from './Calendar';
import { historyAPI } from '../services/api';

const History = ({ rotationType: initialRotationType = 'breakfast' }) => {
  const [viewMode, setViewMode] = useState('list');
  const [selectedRotation, setSelectedRotation] = useState(initialRotationType);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const config = {
    breakfast: {
      title: 'Breakfast History',
      emptyMessage: 'History will appear here once someone buys breakfast!',
      actionText: 'bought breakfast'
    },
    orders: {
      title: 'Orders Collection History',
      emptyMessage: 'History will appear here once someone collects orders!',
      actionText: 'collected orders'
    }
  };

  useEffect(() => {
    loadHistory();
  }, [selectedRotation]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await historyAPI.get(selectedRotation);
      const formattedHistory = data.map(item => ({
        id: item.id,
        employeeId: item.employee_id,
        employeeName: item.employee_name,
        date: new Date(item.date)
      }));
      setHistory(formattedHistory);
    } catch (error) {
      console.error('Failed to load history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    historyAPI.exportCSV(selectedRotation);
  };

  const { title, emptyMessage, actionText } = config[selectedRotation];

  if (loading) {
    return (
      <div className="history-section">
        <div className="history-type-toggle">
          <button
            className={`history-type-btn ${selectedRotation === 'breakfast' ? 'active' : ''}`}
            onClick={() => setSelectedRotation('breakfast')}
          >
            🍳 Breakfast
          </button>
          <button
            className={`history-type-btn ${selectedRotation === 'orders' ? 'active' : ''}`}
            onClick={() => setSelectedRotation('orders')}
          >
            📦 Orders
          </button>
        </div>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="history-section">
        <div className="history-type-toggle">
          <button
            className={`history-type-btn ${selectedRotation === 'breakfast' ? 'active' : ''}`}
            onClick={() => setSelectedRotation('breakfast')}
          >
            🍳 Breakfast
          </button>
          <button
            className={`history-type-btn ${selectedRotation === 'orders' ? 'active' : ''}`}
            onClick={() => setSelectedRotation('orders')}
          >
            📦 Orders
          </button>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h3>No History Yet</h3>
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-section">
      <div className="history-type-toggle">
        <button
          className={`history-type-btn ${selectedRotation === 'breakfast' ? 'active' : ''}`}
          onClick={() => setSelectedRotation('breakfast')}
        >
          🍳 Breakfast
        </button>
        <button
          className={`history-type-btn ${selectedRotation === 'orders' ? 'active' : ''}`}
          onClick={() => setSelectedRotation('orders')}
        >
          📦 Orders
        </button>
      </div>

      <div className="view-toggle">
        <button
          className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          📋 List View
        </button>
        <button
          className={`view-toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
          onClick={() => setViewMode('calendar')}
        >
          📅 Calendar View
        </button>
        <button className="export-btn" onClick={handleExportCSV}>
          📥 Export CSV
        </button>
      </div>

      {viewMode === 'list' ? (
        <>
          <h2>{title}</h2>
          <ul className="history-list">
            {history.map((item) => (
              <li key={item.id} className="history-item">
                <div className="history-date">
                  {item.date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                  {' at '}
                  {item.date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="history-employee">{item.employeeName} {actionText}</div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <Calendar history={history} rotationType={selectedRotation} />
      )}
    </div>
  );
};

export default History;
