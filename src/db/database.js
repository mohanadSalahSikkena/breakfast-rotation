const STORAGE_KEY = 'breakfastDutyDB';

const getStorageData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {
    employees: [],
    breakfastHistory: [],
    ordersHistory: [],
    nextId: 1
  };
};

const saveStorageData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const initDatabase = async () => {
  const data = getStorageData();
  if (!data.employees) {
    saveStorageData({
      employees: [],
      breakfastHistory: [],
      ordersHistory: [],
      nextId: 1
    });
  }
  return Promise.resolve();
};

export const addEmployee = (name) => {
  const data = getStorageData();
  const newEmployee = {
    id: data.nextId++,
    name,
    breakfast: {
      lastTurnDate: null,
      turnCount: 0
    },
    orders: {
      lastTurnDate: null,
      turnCount: 0
    },
    isActive: true
  };
  data.employees.push(newEmployee);
  saveStorageData(data);
};

export const updateEmployee = (id, name) => {
  const data = getStorageData();
  const employee = data.employees.find(emp => emp.id === id);
  if (employee) {
    employee.name = name;
    saveStorageData(data);
  }
};

export const deleteEmployee = (id) => {
  const data = getStorageData();
  data.employees = data.employees.filter(emp => emp.id !== id);
  saveStorageData(data);
};

export const toggleEmployeeStatus = (id, isActive) => {
  const data = getStorageData();
  const employee = data.employees.find(emp => emp.id === id);
  if (employee) {
    employee.isActive = isActive;
    saveStorageData(data);
  }
};

export const getEmployees = () => {
  const data = getStorageData();
  return data.employees.map(emp => {
    // Migrate old format to new format
    if (!emp.breakfast) {
      emp.breakfast = {
        lastTurnDate: emp.lastTurnDate || null,
        turnCount: emp.turnCount || 0
      };
      emp.orders = {
        lastTurnDate: null,
        turnCount: 0
      };
      delete emp.lastTurnDate;
      delete emp.turnCount;
      saveStorageData(data);
    }

    return {
      ...emp,
      breakfast: {
        ...emp.breakfast,
        lastTurnDate: emp.breakfast.lastTurnDate ? new Date(emp.breakfast.lastTurnDate) : null
      },
      orders: {
        ...emp.orders,
        lastTurnDate: emp.orders.lastTurnDate ? new Date(emp.orders.lastTurnDate) : null
      }
    };
  });
};

export const getActiveEmployees = () => {
  return getEmployees().filter(emp => emp.isActive);
};

const sortEmployeesByRotation = (employees, rotationType) => {
  return employees.sort((a, b) => {
    const aData = a[rotationType];
    const bData = b[rotationType];

    // Primary sort: by turn count (ascending - fewer turns = higher priority)
    if (aData.turnCount !== bData.turnCount) {
      return aData.turnCount - bData.turnCount;
    }

    // Secondary sort: by last turn date (oldest first)
    if (!aData.lastTurnDate && !bData.lastTurnDate) return 0;
    if (!aData.lastTurnDate) return -1;
    if (!bData.lastTurnDate) return 1;
    return aData.lastTurnDate.getTime() - bData.lastTurnDate.getTime();
  });
};

export const getCurrentEmployee = (rotationType = 'breakfast') => {
  const activeEmployees = getActiveEmployees();
  if (activeEmployees.length === 0) return null;

  const sorted = sortEmployeesByRotation([...activeEmployees], rotationType);
  return sorted[0];
};

export const getRotationQueue = (rotationType = 'breakfast') => {
  const activeEmployees = getActiveEmployees();
  if (activeEmployees.length === 0) return [];

  const sorted = sortEmployeesByRotation([...activeEmployees], rotationType);
  return sorted.slice(1);
};

export const markDutyComplete = (employeeId, rotationType = 'breakfast') => {
  const data = getStorageData();
  const employee = data.employees.find(emp => emp.id === employeeId);

  if (employee) {
    const now = Date.now();

    // Ensure employee has the new structure
    if (!employee[rotationType]) {
      employee[rotationType] = { lastTurnDate: null, turnCount: 0 };
    }

    employee[rotationType].lastTurnDate = now;
    employee[rotationType].turnCount++;

    const historyKey = rotationType === 'breakfast' ? 'breakfastHistory' : 'ordersHistory';

    if (!data[historyKey]) {
      data[historyKey] = [];
    }

    data[historyKey].push({
      id: data[historyKey].length + 1,
      employeeId: employee.id,
      employeeName: employee.name,
      date: now,
      type: rotationType
    });

    saveStorageData(data);
  }
};

export const getHistory = (rotationType = 'breakfast', limit = null) => {
  const data = getStorageData();
  const historyKey = rotationType === 'breakfast' ? 'breakfastHistory' : 'ordersHistory';
  const history = data[historyKey] || [];

  const sorted = history
    .map(item => ({
      ...item,
      date: new Date(item.date)
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return limit ? sorted.slice(0, limit) : sorted;
};
