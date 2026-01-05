import React from 'react';

const CurrentDuty = ({ currentEmployee, rotationQueue, onMarkComplete, rotationType = 'breakfast' }) => {
  const config = {
    breakfast: {
      title: "Today's Breakfast Duty",
      icon: '🍳',
      buttonText: '✓ Breakfast Bought'
    },
    orders: {
      title: "Today's Orders Collection",
      icon: '📦',
      buttonText: '✓ Orders Collected'
    }
  };

  const { title, icon, buttonText } = config[rotationType];

  if (!currentEmployee) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">{icon}</div>
        <h3>No Employees Available</h3>
        <p>Add employees to start the rotation!</p>
      </div>
    );
  }

  const dutyData = currentEmployee[rotationType];

  return (
    <div className="current-duty">
      <h2>{title}</h2>
      <div className="duty-card">
        <h2>It's the turn of...</h2>
        <div className="employee-name">{currentEmployee.name}</div>
        {dutyData.lastTurnDate && (
          <div className="last-turn">
            Last turn: {dutyData.lastTurnDate.toLocaleDateString()}
          </div>
        )}
        {!dutyData.lastTurnDate && (
          <div className="last-turn">First turn!</div>
        )}
        <div style={{ marginTop: '30px' }}>
          <p>Total turns: {dutyData.turnCount}</p>
        </div>
      </div>
      <button
        className="btn btn-success"
        onClick={() => onMarkComplete(currentEmployee.id)}
      >
        {buttonText}
      </button>

      {rotationQueue && rotationQueue.length > 0 && (
        <div className="rotation-queue">
          <h3>Next in Queue</h3>
          <ul className="queue-list">
            {rotationQueue.map((employee, index) => {
              const empDutyData = employee[rotationType];
              return (
                <li key={employee.id} className="queue-item">
                  <span className="queue-position">{index + 1}</span>
                  <div className="queue-info">
                    <div className="queue-name">{employee.name}</div>
                    <div className="queue-meta">
                      Turns: {empDutyData.turnCount}
                      {empDutyData.lastTurnDate &&
                        ` • Last: ${empDutyData.lastTurnDate.toLocaleDateString()}`
                      }
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CurrentDuty;
