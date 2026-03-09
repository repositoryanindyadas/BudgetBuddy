import React, { useState, useMemo } from 'react';
import { LayoutDashboard, Receipt, CalendarCheck, Settings, Plus, Trash2, Wallet, Home, Utensils, Wifi, Coffee, MapPin, MapPinOff, Edit2, X } from 'lucide-react';

// --- Types ---
type ExpenseCategory = 'Other Services' | 'Travel' | 'Outside Food' | 'Misc';

interface Expense {
  id: string;
  date: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
}

type AttendanceStatus = 'Present' | 'Absent';
type MealStatus = 'Taken' | 'Not Taken' | 'Pending';

interface DailyRecord {
  id: string;
  date: string;
  day: string;
  campusAttendance: AttendanceStatus;
  morningMeal: MealStatus;
  morningMealName: string;
  nightMeal: MealStatus;
  nightMealName: string;
}

export interface CustomCost {
  id: string;
  name: string;
  amount: number;
}

export interface CustomService {
  id: string;
  name: string;
  amount: number;
  startDate: string;
  endDate: string;
}

interface BudgetConfig {
  rent: number;
  foodAllocated: number;
  sim1: number;
  sim1Number: string;
  sim1Start: string;
  sim1End: string;
  sim2: number;
  sim2Number: string;
  sim2Start: string;
  sim2End: string;
  internet: number;
  internetStart: string;
  internetEnd: string;
  customServices: CustomService[];
  externalAllocated: number;
  customFixedCosts: CustomCost[];
  customProvisionalCosts: CustomCost[];
}

// --- Initial Data ---
const INITIAL_BUDGET: BudgetConfig = {
  rent: 3500,
  foodAllocated: 3500,
  sim1: 0,
  sim1Number: '7872054627',
  sim1Start: '2026-03-01',
  sim1End: '2026-03-31',
  sim2: 228,
  sim2Number: '7047933601',
  sim2Start: '2026-03-01',
  sim2End: '2026-03-31',
  internet: 100,
  internetStart: '2026-03-01',
  internetEnd: '2026-03-31',
  customServices: [
    {
      id: '1',
      name: '',
      amount: 0,
      startDate: '2026-03-01',
      endDate: '2026-03-31',
    }
  ],
  externalAllocated: 2000,
  customFixedCosts: [],
  customProvisionalCosts: [
    {
      id: '1',
      name: '',
      amount: 0
    }
  ],
};

const INITIAL_EXPENSES: Expense[] = [
  { id: '1', date: '2026-03-04', description: 'Train from Kng, Rapido', category: 'Travel', amount: 83 },
  { id: '2', date: '2026-03-05', description: 'Groceries (Eggs, Bananas)', category: 'Misc', amount: 132 },
  { id: '3', date: '2026-03-06', description: 'Dinner outside', category: 'Outside Food', amount: 430 },
];

const generateInitialMonth = (): DailyRecord[] => {
  return Array.from({ length: 31 }, (_, i) => {
    // Force UTC to avoid timezone shifts when calling toISOString()
    const date = new Date(Date.UTC(2026, 2, i + 1));
    const dateString = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
    const isPast = i < 10; // First 10 days are past
    return {
      id: dateString,
      date: dateString,
      day: dayName,
      campusAttendance: isPast ? 'Present' : 'Present',
      morningMeal: isPast ? 'Not Taken' : 'Pending',
      morningMealName: '',
      nightMeal: isPast ? 'Not Taken' : 'Pending',
      nightMealName: '',
    };
  });
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'attendance' | 'expenses' | 'settings'>('dashboard');
  const [budget, setBudget] = useState<BudgetConfig>(INITIAL_BUDGET);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [records, setRecords] = useState<DailyRecord[]>(generateInitialMonth());

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20 md:pb-0">
      {/* Top Navigation (Desktop) */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-20 hidden md:block">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="bg-indigo-600 p-2 rounded-xl mr-3">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">BudgetBuddy</span>
            </div>
            <div className="flex space-x-2 items-center">
              <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" />
              <TabButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} icon={<CalendarCheck className="w-4 h-4" />} label="PG Meal Attendance" />
              <TabButton active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<Receipt className="w-4 h-4" />} label="Expenses" />
              <TabButton active={activeTab === 'allotments'} onClick={() => setActiveTab('allotments')} icon={<Settings className="w-4 h-4" />} label="Money Allotments" />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 md:hidden px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-indigo-600 p-1.5 rounded-lg mr-2">
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-800">BudgetBuddy</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 w-full">
        {activeTab === 'dashboard' && <Dashboard budget={budget} expenses={expenses} records={records} />}
        {activeTab === 'attendance' && <AttendanceTab records={records} setRecords={setRecords} />}
        {activeTab === 'expenses' && <ExpensesTab expenses={expenses} setExpenses={setExpenses} />}
        {activeTab === 'allotments' && <MoneyAllotmentsTab budget={budget} setBudget={setBudget} daysInMonth={records.length} />}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-20 pb-safe">
        <div className="flex justify-around items-center h-16">
          <MobileTabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard />} label="Home" />
          <MobileTabButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} icon={<CalendarCheck />} label="PG Meals" />
          <MobileTabButton active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<Receipt />} label="Expenses" />
          <MobileTabButton active={activeTab === 'allotments'} onClick={() => setActiveTab('allotments')} icon={<Settings />} label="Allotments" />
        </div>
      </nav>
    </div>
  );
}

// --- Components ---

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
        active ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );
}

function MobileTabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${active ? 'text-indigo-600' : 'text-slate-500'}`}>
      <div className={`p-1 rounded-full ${active ? 'bg-indigo-50' : ''}`}>
        {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

// --- Dashboard Tab ---
function Dashboard({ budget, expenses, records }: { budget: BudgetConfig, expenses: Expense[], records: DailyRecord[] }) {
  const totalCustomServices = budget.customServices?.reduce((sum, s) => sum + s.amount, 0) || 0;
  const totalCustomFixed = budget.customFixedCosts?.reduce((sum, c) => sum + c.amount, 0) || 0;
  const totalCustomProvisional = budget.customProvisionalCosts?.reduce((sum, c) => sum + c.amount, 0) || 0;
  const totalAllotted = budget.rent + budget.foodAllocated + budget.sim1 + budget.sim2 + budget.internet + totalCustomServices + budget.externalAllocated + totalCustomFixed + totalCustomProvisional;
  
  // Calculate expenses by category
  const servicesSpent = expenses.filter(e => e.category === 'Other Services').reduce((sum, e) => sum + e.amount, 0);
  const totalExpensesSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Calculate meals
  let mealsTaken = 0;
  let daysPresent = 0;
  
  records.forEach(r => {
    if (r.campusAttendance === 'Present') daysPresent++;
    if (r.morningMeal === 'Taken') mealsTaken++;
    if (r.nightMeal === 'Taken') mealsTaken++;
  });

  const costPerMeal = budget.foodAllocated / (records.length * 2);
  const calculatedMealCost = mealsTaken * costPerMeal;
  const totalPgPayment = budget.rent + calculatedMealCost + totalCustomFixed;
  
  const servicesAllocated = budget.sim1 + budget.sim2 + budget.internet + totalCustomServices;
  const totalSpent = totalPgPayment + totalExpensesSpent;
  const remaining = totalAllotted - totalSpent;

  const currentMonthDate = records.length > 0 ? new Date(records[0].date + 'T00:00:00Z') : new Date();
  const nextMonthDate = new Date(currentMonthDate);
  nextMonthDate.setUTCMonth(nextMonthDate.getUTCMonth() + 1);
  const nextMonthName = nextMonthDate.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Allotted" amount={totalAllotted} icon={<Wallet className="w-5 h-5 text-indigo-500" />} />
        <StatCard title="Total Spent" amount={totalSpent} icon={<Receipt className="w-5 h-5 text-rose-500" />} />
        <StatCard title="Remaining" amount={remaining} highlight={remaining < 0 ? 'red' : 'green'} icon={<Wallet className="w-5 h-5 text-emerald-500" />} />
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-center">
          <div className="text-sm font-medium text-slate-500 mb-1 flex items-center">
            <MapPin className="w-4 h-4 mr-1.5 text-blue-500" /> Days in PG
          </div>
          <div className="text-2xl font-semibold text-slate-800">{daysPresent} <span className="text-sm font-normal text-slate-400">/ {records.length}</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PG Payment Box */}
        <div className="lg:col-span-1 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Home className="w-24 h-24" />
          </div>
          <h3 className="text-indigo-100 font-medium mb-1 relative z-10">Pay to PG</h3>
          <div className="text-4xl font-bold mb-6 relative z-10">₹{totalPgPayment.toFixed(0)}</div>
          
          <div className="space-y-3 relative z-10">
            <div className="flex justify-between items-center text-sm bg-white/10 p-3 rounded-xl backdrop-blur-sm">
              <span className="flex items-center"><Home className="w-4 h-4 mr-2 opacity-80" /> Base Rent</span>
              <span className="font-medium">₹{budget.rent}</span>
            </div>
            <div className="flex justify-between items-center text-sm bg-white/10 p-3 rounded-xl backdrop-blur-sm">
              <span className="flex items-center"><Utensils className="w-4 h-4 mr-2 opacity-80" /> Meals ({mealsTaken} taken)</span>
              <span className="font-medium">₹{calculatedMealCost.toFixed(0)}</span>
            </div>
            {budget.customFixedCosts?.map(cost => (
              (cost.name || cost.amount > 0) ? (
                <div key={cost.id} className="flex justify-between items-center text-sm bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                  <span className="flex items-center"><Receipt className="w-4 h-4 mr-2 opacity-80" /> {cost.name || 'Fixed Cost'}</span>
                  <span className="font-medium">₹{cost.amount}</span>
                </div>
              ) : null
            ))}
          </div>
          <p className="text-xs text-indigo-200 mt-4 text-center relative z-10">
            Payable in the first week of the next month ({nextMonthName})
          </p>
        </div>

        {/* Budget Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 text-slate-800">Budget Breakdown</h3>
          <div className="space-y-6">
            <BudgetProgress 
              name="PG Meals" 
              spent={calculatedMealCost} 
              allocated={budget.foodAllocated} 
              icon={<Utensils className="w-4 h-4" />}
              color="bg-orange-500" 
            />
            <BudgetProgress 
              name="Other Services" 
              spent={servicesSpent} 
              allocated={servicesAllocated} 
              icon={<Wifi className="w-4 h-4" />}
              color="bg-blue-500" 
            />
            <BudgetProgress 
              name="External & Provisional" 
              spent={totalExpensesSpent} 
              allocated={budget.externalAllocated} 
              icon={<Coffee className="w-4 h-4" />}
              color="bg-emerald-500" 
            />
            {totalCustomProvisional > 0 && (
              <BudgetProgress 
                name="Provisional Allocations" 
                spent={0} 
                allocated={totalCustomProvisional} 
                icon={<Wallet className="w-4 h-4" />}
                color="bg-purple-500" 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, amount, highlight, icon }: { title: string, amount: number, highlight?: 'red' | 'green', icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-center">
      <div className="text-sm font-medium text-slate-500 mb-2 flex items-center">
        <span className="mr-1.5">{icon}</span> {title}
      </div>
      <div className={`text-2xl font-bold tracking-tight ${highlight === 'red' ? 'text-rose-600' : highlight === 'green' ? 'text-emerald-600' : 'text-slate-800'}`}>
        ₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
      </div>
    </div>
  );
}

function BudgetProgress({ name, spent, allocated, color, icon }: { name: string, spent: number, allocated: number, color: string, icon: React.ReactNode }) {
  const percentage = Math.min(100, Math.max(0, (spent / allocated) * 100)) || 0;
  const isOver = spent > allocated;
  
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center text-sm font-semibold text-slate-700">
          <div className={`p-1.5 rounded-lg mr-2 bg-slate-100 text-slate-600`}>{icon}</div>
          {name}
        </div>
        <div className="text-right">
          <span className={`text-sm font-bold ${isOver ? 'text-rose-600' : 'text-slate-800'}`}>₹{spent.toFixed(0)}</span>
          <span className="text-xs text-slate-500 ml-1">/ ₹{allocated}</span>
        </div>
      </div>
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
        <div className={`h-full ${isOver ? 'bg-rose-500' : color} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

// --- Attendance & Meals Tab ---
function AttendanceTab({ records, setRecords }: { records: DailyRecord[], setRecords: React.Dispatch<React.SetStateAction<DailyRecord[]>> }) {
  
  const updateRecord = (id: string, field: keyof DailyRecord, value: any) => {
    setRecords(records.map(r => {
      if (r.id === id) {
        const updated = { ...r, [field]: value };
        // If marked absent, automatically mark meals as Not Taken
        if (field === 'campusAttendance' && value === 'Absent') {
          updated.morningMeal = 'Not Taken';
          updated.nightMeal = 'Not Taken';
        }
        return updated;
      }
      return r;
    }));
  };

  const cycleMealStatus = (current: MealStatus): MealStatus => {
    if (current === 'Pending') return 'Taken';
    if (current === 'Taken') return 'Not Taken';
    return 'Pending';
  };

  const toggleAttendance = (current: AttendanceStatus): AttendanceStatus => {
    return current === 'Present' ? 'Absent' : 'Present';
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500">
      <div className="p-5 md:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">PG Meal Attendance</h3>
          <p className="text-sm text-slate-500">Track your PG presence and meals. (Rent is fixed at ₹3500/month)</p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-medium">
          <div className="flex items-center px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></div> Taken/Present</div>
          <div className="flex items-center px-2 py-1 bg-rose-50 text-rose-700 rounded-md border border-rose-100"><div className="w-2 h-2 rounded-full bg-rose-500 mr-1.5"></div> Not Taken/Absent</div>
          <div className="flex items-center px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200"><div className="w-2 h-2 rounded-full bg-slate-400 mr-1.5"></div> Pending</div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <th className="p-4 font-semibold w-24">Date</th>
              <th className="p-4 font-semibold text-center w-32">PG</th>
              <th className="p-4 font-semibold text-center w-32">Morning</th>
              <th className="p-4 font-semibold w-48">Morning Meal</th>
              <th className="p-4 font-semibold text-center w-32">Night</th>
              <th className="p-4 font-semibold w-48">Night Meal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map(record => (
              <tr key={record.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="p-4">
                  <div className="font-medium text-slate-800">{new Date(record.date + 'T00:00:00Z').getUTCDate()}</div>
                  <div className="text-xs text-slate-500">{record.day}</div>
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => updateRecord(record.id, 'campusAttendance', toggleAttendance(record.campusAttendance))}
                    className={`flex items-center justify-center w-full py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      record.campusAttendance === 'Present' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    {record.campusAttendance === 'Present' ? <MapPin className="w-3.5 h-3.5 mr-1" /> : <MapPinOff className="w-3.5 h-3.5 mr-1" />}
                    {record.campusAttendance}
                  </button>
                </td>
                <td className="p-4 text-center">
                  <MealBadge 
                    status={record.morningMeal} 
                    onClick={() => updateRecord(record.id, 'morningMeal', cycleMealStatus(record.morningMeal))} 
                    disabled={record.campusAttendance === 'Absent'}
                  />
                </td>
                <td className="p-4">
                  <input 
                    type="text" 
                    value={record.morningMealName} 
                    onChange={e => updateRecord(record.id, 'morningMealName', e.target.value)}
                    placeholder="e.g., Poha, Toast..."
                    disabled={record.campusAttendance === 'Absent' || record.morningMeal === 'Not Taken'}
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all disabled:opacity-50 disabled:bg-slate-100"
                  />
                </td>
                <td className="p-4 text-center">
                  <MealBadge 
                    status={record.nightMeal} 
                    onClick={() => updateRecord(record.id, 'nightMeal', cycleMealStatus(record.nightMeal))} 
                    disabled={record.campusAttendance === 'Absent'}
                  />
                </td>
                <td className="p-4">
                  <input 
                    type="text" 
                    value={record.nightMealName} 
                    onChange={e => updateRecord(record.id, 'nightMealName', e.target.value)}
                    placeholder="e.g., Roti Sabzi..."
                    disabled={record.campusAttendance === 'Absent' || record.nightMeal === 'Not Taken'}
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all disabled:opacity-50 disabled:bg-slate-100"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MealBadge({ status, onClick, disabled }: { status: MealStatus, onClick: () => void, disabled?: boolean }) {
  let styles = 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200';
  if (status === 'Taken') styles = 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
  if (status === 'Not Taken') styles = 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100';
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-1.5 rounded-lg text-xs font-semibold border transition-all ${styles} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {status}
    </button>
  );
}

// --- Expenses Tab ---
function ExpensesTab({ expenses, setExpenses }: { expenses: Expense[], setExpenses: React.Dispatch<React.SetStateAction<Expense[]>> }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Misc');
  const [amount, setAmount] = useState('');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    const newExp: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      date,
      description: desc,
      category,
      amount: parseFloat(amount)
    };
    setExpenses([newExp, ...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setDesc('');
    setAmount('');
  };

  const handleDelete = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const handleEditClick = (exp: Expense) => {
    setEditingExpense({ ...exp });
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    setExpenses(expenses.map(exp => exp.id === editingExpense.id ? editingExpense : exp).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setEditingExpense(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold mb-4 text-slate-800">Log External Expense</h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-sm" required />
          </div>
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Description</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="What did you buy?" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-sm" required />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-sm">
              <option value="Travel">Travel</option>
              <option value="Outside Food">Outside Food</option>
              <option value="Other Services">Other Services</option>
              <option value="Misc">Miscellaneous</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Amount (₹)</label>
            <div className="flex space-x-2">
              <input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-sm" required />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl transition-colors flex-shrink-0 shadow-sm">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">Expense History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold text-right">Amount</th>
                <th className="p-4 font-semibold text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {expenses.map(exp => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-4 text-sm text-slate-500 whitespace-nowrap">{new Date(exp.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                  <td className="p-4 text-sm font-medium text-slate-800">{exp.description}</td>
                  <td className="p-4 text-sm">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-bold text-slate-800 text-right">₹{exp.amount.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <button onClick={() => handleEditClick(exp)} className="text-slate-400 hover:text-indigo-600 transition-colors p-1.5 rounded-lg hover:bg-indigo-50">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(exp.id)} className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 text-sm">No expenses recorded yet. Time to save!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Edit Expense</h3>
              <button onClick={() => setEditingExpense(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Date</label>
                <input type="date" value={editingExpense.date} onChange={e => setEditingExpense({...editingExpense, date: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Description</label>
                <input type="text" value={editingExpense.description} onChange={e => setEditingExpense({...editingExpense, description: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Category</label>
                <select value={editingExpense.category} onChange={e => setEditingExpense({...editingExpense, category: e.target.value as ExpenseCategory})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-sm">
                  <option value="Travel">Travel</option>
                  <option value="Outside Food">Outside Food</option>
                  <option value="Other Services">Other Services</option>
                  <option value="Misc">Miscellaneous</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Amount (₹)</label>
                <input type="number" min="0" step="0.01" value={editingExpense.amount} onChange={e => setEditingExpense({...editingExpense, amount: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-sm" required />
              </div>
              <div className="pt-2 flex space-x-3">
                <button type="button" onClick={() => setEditingExpense(null)} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Helper Component ---
function DatePickerButton({ label, value, onChange, disabled }: { label: string, value: string, onChange: (val: string) => void, disabled?: boolean }) {
  return (
    <div className={`relative flex-1 min-w-0 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
      <input 
        type="date" 
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        onClick={e => {
          if (disabled) return;
          try {
            if ('showPicker' in HTMLInputElement.prototype) {
              e.currentTarget.showPicker();
            }
          } catch (err) {}
        }}
        className={`absolute inset-0 w-full h-full opacity-0 z-10 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      />
      <div className={`w-full px-1.5 py-2 bg-white border border-slate-200 rounded-lg text-[11px] sm:text-xs text-center text-slate-600 flex items-center justify-center gap-1 shadow-sm ${disabled ? '' : 'hover:bg-slate-50 transition-colors'}`}>
        <CalendarCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-500 shrink-0" />
        <span className="truncate font-medium">{value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : label}</span>
      </div>
    </div>
  );
}

// --- Money Allotments Tab ---
function MoneyAllotmentsTab({ budget, setBudget, daysInMonth }: { budget: BudgetConfig, setBudget: React.Dispatch<React.SetStateAction<BudgetConfig>>, daysInMonth: number }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftBudget, setDraftBudget] = useState<BudgetConfig>(budget);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleChange = (field: keyof BudgetConfig, value: string) => {
    const num = parseFloat(value) || 0;
    setDraftBudget(prev => ({ ...prev, [field]: num }));
  };

  const handleTextChange = (field: keyof BudgetConfig, value: string) => {
    setDraftBudget(prev => ({ ...prev, [field]: value }));
  };

  const handleEditClick = () => {
    setDraftBudget(budget);
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setShowConfirmModal(true);
  };

  const confirmSave = () => {
    setBudget(draftBudget);
    setIsEditing(false);
    setShowConfirmModal(false);
  };

  const cancelSave = () => {
    setShowConfirmModal(false);
  };

  const cancelEdit = () => {
    setDraftBudget(budget);
    setIsEditing(false);
  };

  const displayBudget = isEditing ? draftBudget : budget;
  const totalCustomServices = displayBudget.customServices?.reduce((sum, s) => sum + s.amount, 0) || 0;
  const totalCustomFixed = displayBudget.customFixedCosts?.reduce((sum, c) => sum + c.amount, 0) || 0;
  const totalCustomProvisional = displayBudget.customProvisionalCosts?.reduce((sum, c) => sum + c.amount, 0) || 0;
  const totalAllotted = displayBudget.rent + displayBudget.foodAllocated + displayBudget.sim1 + displayBudget.sim2 + displayBudget.internet + totalCustomServices + displayBudget.externalAllocated + totalCustomFixed + totalCustomProvisional;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm Changes</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to save these new budget allocations? This will update your financial tracking for the month.</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={cancelSave}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSave}
                className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center">
            <div className="bg-indigo-100 p-2.5 rounded-xl mr-3">
              <Settings className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Money Allotments</h2>
              <p className="text-sm text-slate-500">Set your provisional sections and view total allotted money.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button 
                onClick={handleEditClick}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Allocations
              </button>
            ) : (
              <>
                <button 
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveClick}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        <div className={`space-y-6 transition-opacity duration-300 ${!isEditing ? 'opacity-80' : ''}`}>
          {/* Total Allotted Section */}
          <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <label className="block text-sm font-bold text-indigo-900 mb-1">Total Monthly Allotment</label>
              <p className="text-xs text-indigo-600">Sum of all fixed costs, services, and provisional budgets.</p>
            </div>
            <div className="text-3xl font-bold text-indigo-700 mt-3 sm:mt-0">
              ₹{totalAllotted.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Fixed Costs</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">PG Base Rent (₹)</label>
                <input 
                  type="number" 
                  value={displayBudget.rent || ''} 
                  onChange={e => handleChange('rent', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Max PG Meal Charge (100% attendance) (₹)</label>
                <input 
                  type="number" 
                  value={displayBudget.foodAllocated || ''} 
                  onChange={e => handleChange('foodAllocated', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Cost per Meal in PG (₹)</label>
                <div className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-medium">
                  ₹{(displayBudget.foodAllocated / (daysInMonth * 2)).toFixed(2)} 
                  <span className="text-xs text-slate-400 font-normal ml-2">
                    (₹{displayBudget.foodAllocated} / {daysInMonth * 2} meals [{daysInMonth} days × 2 meals/day])
                  </span>
                </div>
              </div>

              {displayBudget.customFixedCosts?.map((cost, index) => (
                <div key={cost.id} className="pt-2 relative">
                  {isEditing && (
                    <button 
                      onClick={() => {
                        const newCosts = [...(draftBudget.customFixedCosts || [])];
                        newCosts.splice(index, 1);
                        setDraftBudget(prev => ({ ...prev, customFixedCosts: newCosts }));
                      }}
                      className="absolute top-2 right-0 text-rose-500 hover:text-rose-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <div className="flex items-center mb-1.5 pr-6">
                    <input 
                      type="text" 
                      value={cost.name} 
                      onChange={e => {
                        const newCosts = [...(draftBudget.customFixedCosts || [])];
                        newCosts[index] = { ...cost, name: e.target.value };
                        setDraftBudget(prev => ({ ...prev, customFixedCosts: newCosts }));
                      }}
                      disabled={!isEditing}
                      placeholder="Custom Fixed Cost Name"
                      className="text-sm font-medium text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 focus:outline-none w-full pb-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                  <input 
                    type="number" 
                    value={cost.amount || ''} 
                    onChange={e => {
                      const newCosts = [...(draftBudget.customFixedCosts || [])];
                      newCosts[index] = { ...cost, amount: parseFloat(e.target.value) || 0 };
                      setDraftBudget(prev => ({ ...prev, customFixedCosts: newCosts }));
                    }}
                    disabled={!isEditing}
                    placeholder="Amount (₹)"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
              ))}
              
              {isEditing && (
                <button
                  onClick={() => {
                    const newCosts = [...(draftBudget.customFixedCosts || [])];
                    newCosts.push({
                      id: Date.now().toString(),
                      name: '',
                      amount: 0
                    });
                    setDraftBudget(prev => ({ ...prev, customFixedCosts: newCosts }));
                  }}
                  className="flex items-center justify-center w-full bg-slate-50/50 hover:bg-slate-50 border border-dashed border-slate-300 rounded-xl py-3 text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Add Fixed Cost</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Provisional Allocations</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">External Expenses Budget (₹)</label>
                <input 
                  type="number" 
                  value={displayBudget.externalAllocated || ''} 
                  onChange={e => handleChange('externalAllocated', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>

              {displayBudget.customProvisionalCosts?.map((cost, index) => (
                <div key={cost.id} className="pt-2 relative">
                  {isEditing && (
                    <button 
                      onClick={() => {
                        const newCosts = [...(draftBudget.customProvisionalCosts || [])];
                        newCosts.splice(index, 1);
                        setDraftBudget(prev => ({ ...prev, customProvisionalCosts: newCosts }));
                      }}
                      className="absolute top-2 right-0 text-rose-500 hover:text-rose-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <div className="flex items-center mb-1.5 pr-6">
                    <input 
                      type="text" 
                      value={cost.name} 
                      onChange={e => {
                        const newCosts = [...(draftBudget.customProvisionalCosts || [])];
                        newCosts[index] = { ...cost, name: e.target.value };
                        setDraftBudget(prev => ({ ...prev, customProvisionalCosts: newCosts }));
                      }}
                      disabled={!isEditing}
                      placeholder="Custom Budget Name"
                      className="text-sm font-medium text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 focus:outline-none w-full pb-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                  <input 
                    type="number" 
                    value={cost.amount || ''} 
                    onChange={e => {
                      const newCosts = [...(draftBudget.customProvisionalCosts || [])];
                      newCosts[index] = { ...cost, amount: parseFloat(e.target.value) || 0 };
                      setDraftBudget(prev => ({ ...prev, customProvisionalCosts: newCosts }));
                    }}
                    disabled={!isEditing}
                    placeholder="Amount (₹)"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
              ))}
              
              {isEditing && (
                <button
                  onClick={() => {
                    const newCosts = [...(draftBudget.customProvisionalCosts || [])];
                    newCosts.push({
                      id: Date.now().toString(),
                      name: '',
                      amount: 0
                    });
                    setDraftBudget(prev => ({ ...prev, customProvisionalCosts: newCosts }));
                  }}
                  className="flex items-center justify-center w-full bg-slate-50/50 hover:bg-slate-50 border border-dashed border-slate-300 rounded-xl py-3 text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Add Provisional Budget</span>
                </button>
              )}
            </div>

            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Other Services</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center mb-2">
                    <label className="text-sm font-medium text-slate-700 mr-2">SIM:</label>
                    <input 
                      type="text" 
                      value={displayBudget.sim1Number} 
                      onChange={e => handleTextChange('sim1Number', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Phone Number"
                      className="text-xs font-medium text-slate-600 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 focus:outline-none w-full pb-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                  <input 
                    type="number" 
                    value={displayBudget.sim1 || ''} 
                    onChange={e => handleChange('sim1', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Amount (₹)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors mb-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                  <div className="flex items-center space-x-1.5">
                    <DatePickerButton disabled={!isEditing} label="Start" value={(displayBudget.sim1Number || displayBudget.sim1) ? displayBudget.sim1Start : ''} onChange={val => handleTextChange('sim1Start', val)} />
                    <span className="text-[10px] sm:text-xs text-slate-400 font-medium shrink-0">to</span>
                    <DatePickerButton disabled={!isEditing} label="End" value={(displayBudget.sim1Number || displayBudget.sim1) ? displayBudget.sim1End : ''} onChange={val => handleTextChange('sim1End', val)} />
                  </div>
                </div>
                
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center mb-2">
                    <label className="text-sm font-medium text-slate-700 mr-2">SIM:</label>
                    <input 
                      type="text" 
                      value={displayBudget.sim2Number} 
                      onChange={e => handleTextChange('sim2Number', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Phone Number"
                      className="text-xs font-medium text-slate-600 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 focus:outline-none w-full pb-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                  <input 
                    type="number" 
                    value={displayBudget.sim2 || ''} 
                    onChange={e => handleChange('sim2', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Amount (₹)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors mb-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                  <div className="flex items-center space-x-1.5">
                    <DatePickerButton disabled={!isEditing} label="Start" value={(displayBudget.sim2Number || displayBudget.sim2) ? displayBudget.sim2Start : ''} onChange={val => handleTextChange('sim2Start', val)} />
                    <span className="text-[10px] sm:text-xs text-slate-400 font-medium shrink-0">to</span>
                    <DatePickerButton disabled={!isEditing} label="End" value={(displayBudget.sim2Number || displayBudget.sim2) ? displayBudget.sim2End : ''} onChange={val => handleTextChange('sim2End', val)} />
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Internet</label>
                  <input 
                    type="number" 
                    value={displayBudget.internet || ''} 
                    onChange={e => handleChange('internet', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Amount (₹)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors mb-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                  <div className="flex items-center space-x-1.5">
                    <DatePickerButton disabled={!isEditing} label="Start" value={displayBudget.internet ? displayBudget.internetStart : ''} onChange={val => handleTextChange('internetStart', val)} />
                    <span className="text-[10px] sm:text-xs text-slate-400 font-medium shrink-0">to</span>
                    <DatePickerButton disabled={!isEditing} label="End" value={displayBudget.internet ? displayBudget.internetEnd : ''} onChange={val => handleTextChange('internetEnd', val)} />
                  </div>
                </div>

                {displayBudget.customServices?.map((service, index) => (
                  <div key={service.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 relative">
                    {isEditing && (
                      <button 
                        onClick={() => {
                          const newServices = [...(draftBudget.customServices || [])];
                          newServices.splice(index, 1);
                          setDraftBudget(prev => ({ ...prev, customServices: newServices }));
                        }}
                        className="absolute -top-2 -right-2 bg-white border border-slate-200 text-rose-500 rounded-full p-1 shadow-sm hover:bg-rose-50 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                    <input 
                      type="text" 
                      value={service.name} 
                      onChange={e => {
                        const newServices = [...(draftBudget.customServices || [])];
                        newServices[index] = { ...service, name: e.target.value };
                        setDraftBudget(prev => ({ ...prev, customServices: newServices }));
                      }}
                      disabled={!isEditing}
                      placeholder="Custom Service Name"
                      className="block text-sm font-medium text-slate-700 mb-2 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 focus:outline-none w-full pb-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                    <input 
                      type="number" 
                      value={service.amount || ''} 
                      onChange={e => {
                        const newServices = [...(draftBudget.customServices || [])];
                        newServices[index] = { ...service, amount: parseFloat(e.target.value) || 0 };
                        setDraftBudget(prev => ({ ...prev, customServices: newServices }));
                      }}
                      disabled={!isEditing}
                      placeholder="Amount (₹)"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors mb-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                    <div className="flex items-center space-x-1.5">
                      <DatePickerButton 
                        disabled={!isEditing} 
                        label="Start" 
                        value={(service.name || service.amount) ? service.startDate : ''} 
                        onChange={val => {
                          const newServices = [...(draftBudget.customServices || [])];
                          newServices[index] = { ...service, startDate: val };
                          setDraftBudget(prev => ({ ...prev, customServices: newServices }));
                        }} 
                      />
                      <span className="text-[10px] sm:text-xs text-slate-400 font-medium shrink-0">to</span>
                      <DatePickerButton 
                        disabled={!isEditing} 
                        label="End" 
                        value={(service.name || service.amount) ? service.endDate : ''} 
                        onChange={val => {
                          const newServices = [...(draftBudget.customServices || [])];
                          newServices[index] = { ...service, endDate: val };
                          setDraftBudget(prev => ({ ...prev, customServices: newServices }));
                        }} 
                      />
                    </div>
                  </div>
                ))}
                
                {isEditing && (
                  <button
                    onClick={() => {
                      const newServices = [...(draftBudget.customServices || [])];
                      newServices.push({
                        id: Date.now().toString(),
                        name: '',
                        amount: 0,
                        startDate: '2026-03-01',
                        endDate: '2026-03-31',
                      });
                      setDraftBudget(prev => ({ ...prev, customServices: newServices }));
                    }}
                    className="flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 border border-dashed border-slate-300 rounded-xl p-4 text-slate-500 hover:text-indigo-600 transition-colors h-full min-h-[140px]"
                  >
                    <Plus className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Add Service</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
