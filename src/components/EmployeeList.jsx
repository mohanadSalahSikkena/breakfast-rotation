import React, { useState } from 'react';

const EmployeeList = ({ employees, onAdd, onEdit, onDelete, onToggleStatus }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formName, setFormName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formName.trim()) {
      if (editingId) {
        onEdit(editingId, formName);
        setEditingId(null);
      } else {
        onAdd(formName);
        setShowAddForm(false);
      }
      setFormName('');
    }
  };

  const handleEdit = (employee) => {
    setEditingId(employee.id);
    setFormName(employee.name);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormName('');
  };

  return (
    <div className="employee-management">
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Manage Employees</h2>
        {!showAddForm && !editingId && (
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            + Add Employee
          </button>
        )}
      </div>

      {(showAddForm || editingId) && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px', background: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
          <div className="form-group">
            <label>{editingId ? 'Edit Employee' : 'New Employee'}</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Enter employee name"
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary btn-small">
            {editingId ? 'Save' : 'Add'}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </form>
      )}

      {employees.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>No Employees Yet</h3>
          <p>Click "Add Employee" to get started!</p>
        </div>
      ) : (
        <ul className="employee-list">
          {employees.map((employee) => (
            <li
              key={employee.id}
              className={`employee-item ${!employee.isActive ? 'inactive' : ''}`}
            >
              <div className="employee-info">
                <div className="employee-name-text">
                  {employee.name}
                  <span className={`status-badge ${employee.isActive ? 'active' : 'paused'}`}>
                    {employee.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>
                <div className="employee-meta">
                  🍳 Breakfast: {employee.breakfast?.turnCount || 0} turns
                  {' • '}
                  📦 Orders: {employee.orders?.turnCount || 0} turns
                </div>
              </div>
              <div className="employee-actions">
                <button
                  className="btn btn-primary btn-small"
                  onClick={() => handleEdit(employee)}
                >
                  Edit
                </button>
                <button
                  className={`btn ${employee.isActive ? 'btn-secondary' : 'btn-success'} btn-small`}
                  onClick={() => onToggleStatus(employee.id, !employee.isActive)}
                >
                  {employee.isActive ? 'Pause' : 'Activate'}
                </button>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => {
                    if (window.confirm(`Delete ${employee.name}?`)) {
                      onDelete(employee.id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EmployeeList;
