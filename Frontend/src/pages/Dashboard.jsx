import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Coffee,
  User,
  LayoutDashboard,
  Timer,
  Palmtree,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  History,
  RefreshCw,
  Wifi,
  WifiOff,
  Bell
} from 'lucide-react';

import { getMyAttendance, setStatus } from '../services/attendanceService';
import useAuth from '../store/useAuth';
import { decimalHoursToHrsMins } from '../utils/time';
import {
  initSocket,
  onAttendanceRefresh,
  onDashboardUpdate,
  isSocketConnected
} from '../services/socket';


/* ---------- STATUS BADGE (Lighter Text) ---------- */
const StatusBadge = ({ status }) => {
  const styles = {
    Present: 'bg-emerald-100/50 text-emerald-700 border-emerald-200/60',
    Leave: 'bg-amber-100/50 text-amber-700 border-amber-200/60',
    Holiday: 'bg-indigo-100/50 text-indigo-700 border-indigo-200/60',
    Absent: 'bg-rose-100/50 text-rose-700 border-rose-200/60'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border backdrop-blur-sm ${styles[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Present' ? 'bg-emerald-500 animate-pulse' : 'bg-current'}`} />
      {status}
    </span>
  );
};

/* ---------- OVERVIEW CARD (Lighter Text) ---------- */
const OverviewCard = ({ label, value, icon: Icon, color, trend }) => (
  <div className="relative overflow-hidden bg-white group p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-2xl ${color} shadow-lg shadow-current/10 transition-transform`}>
        <Icon size={20} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
          {trend}
        </div>
      )}
    </div>
    <div className="mt-5">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className="text-2xl font-semibold text-slate-800 mt-1 tracking-tight">{value}</h3>
    </div>
    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const socketInitRef = useRef(false);
  const notificationTimerRef = useRef(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const loadData = useCallback(async () => {
    try {
      const data = await getMyAttendance();
      setRecords(data || []);
    } catch (error) {
      console.error("Failed to load attendance", error);
      addNotification('Failed to load data', 'error');
    }
  }, []);

  // Initialize Socket.IO on mount
  useEffect(() => {
    if (!socketInitRef.current && user?.id) {
      socketInitRef.current = true;
      const socket = initSocket(user.id);
      setSocketConnected(socket?.connected || false);

      // Check connection status periodically
      const checkConnection = setInterval(() => {
        setSocketConnected(isSocketConnected());
      }, 1000);

      return () => clearInterval(checkConnection);
    }
  }, [user?.id]);

  // Listen for real-time attendance updates
  useEffect(() => {
    const unsubAttendance = onAttendanceRefresh((data) => {
      console.log('📡 Real-time attendance update:', data);
      addNotification(`Status updated to ${data.status}`, 'success');
      loadData();
    });

    const unsubDashboard = onDashboardUpdate((data) => {
      console.log('📡 Dashboard sync:', data);
      loadData();
    });

    return () => {
      unsubAttendance?.();
      unsubDashboard?.();
    };
  }, [loadData]);



  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };
    init();
  }, [loadData]);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    clearTimeout(notificationTimerRef.current);
    notificationTimerRef.current = setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const todayRecord = useMemo(
    () => records.find(r => r.date.startsWith(todayStr)),
    [records, todayStr]
  );

  const monthlyStats = useMemo(() => {
    const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthly = records.filter(r => new Date(r.date) >= start);
    return {
      present: monthly.filter(r => r.status === 'Present').length,
      hours: monthly.reduce((t, r) => t + (r.totalHours || 0), 0)
    };
  }, [records]);

  const updateStatus = async status => {
    setUpdating(true);
    await setStatus({ status, date: todayStr });
    await loadData();
    setUpdating(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Syncing your workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFE] pb-20">
      {/* NOTIFICATIONS CONTAINER */}
      <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`pointer-events-auto animate-slide-in px-5 py-3 rounded-xl flex items-center gap-3 text-sm font-medium shadow-lg backdrop-blur border
              ${notif.type === 'success' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : notif.type === 'error' 
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
          >
            {notif.type === 'success' && <CheckCircle2 size={16} />}
            {notif.type === 'error' && <AlertCircle size={16} />}
            {notif.type === 'info' && <Bell size={16} />}
            {notif.message}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-10 space-y-10">

        {/* HEADER WITH SOCKET STATUS */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-[10px] uppercase tracking-[0.2em]">
              <LayoutDashboard size={14} />
              <span>Management Portal</span>
            </div>
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
              {getGreeting()}, <span className="text-slate-700">{user?.name?.split(' ')[0]}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            {/* Socket Status Indicator */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              socketConnected 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {socketConnected ? (
                <>
                  <Wifi size={12} />
                  <span>Live</span>
                </>
              ) : (
                <>
                  <WifiOff size={12} />
                  <span>Offline</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100/50">
              <Calendar size={16} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-600">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
              <User size={18} />
            </div>
          </div>
        </header>

        {/* OVERVIEW GRID WITH ENHANCED STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <OverviewCard
            label="Current Status"
            value={todayRecord?.status || 'Unmarked'}
            icon={CheckCircle2}
            color="bg-emerald-50 text-emerald-600"
            trend="Today"
          />
          <OverviewCard
            label="Today Work Hours"
            value={decimalHoursToHrsMins(todayRecord?.totalHours || 0)}
            icon={Clock}
            color="bg-blue-50 text-blue-600"
            trend="Today"
          />
          <OverviewCard
            label="This Month Attendance"
            value={`${monthlyStats.present} Days`}
            icon={TrendingUp}
            color="bg-violet-50 text-violet-600"
            trend="This Month"
          />
          <OverviewCard
            label="Monthly Work Hours"
            value={decimalHoursToHrsMins(monthlyStats.hours)}
            icon={Clock}
            color="bg-orange-50 text-orange-600"
            trend="This Month"
          />
        </section>



        {/* MAIN INTERFACE */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* QUICK ACTIONS WITH ENHANCED FEEDBACK */}
          <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-3">
                <Timer size={20} className="text-blue-600" />
                Punch Center
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Set your availability for the team.</p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Present', icon: CheckCircle2, sub: 'Mark as on-duty', activeClass: 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-emerald-100' },
                { label: 'Leave', icon: Palmtree, sub: 'Request time off', activeClass: 'border-amber-500 bg-amber-50 text-amber-700 shadow-amber-100' },
                { label: 'Holiday', icon: Coffee, sub: 'Public rest day', activeClass: 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-indigo-100' }
              ].map(btn => {
                const isActive = todayRecord?.status === btn.label;
                return (
                  <button
                    key={btn.label}
                    disabled={updating || isActive}
                    onClick={() => updateStatus(btn.label)}
                    className={`w-full group flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 disabled:opacity-50 
                      ${isActive ? `${btn.activeClass} shadow-md` : 'border-slate-50 bg-slate-50/50 text-slate-600 hover:border-slate-200 hover:bg-white'}`}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className={`p-2.5 rounded-xl ${isActive ? 'bg-white shadow-sm text-current' : 'bg-white'}`}>
                        <btn.icon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-none">{btn.label}</p>
                        <p className="text-[10px] font-medium opacity-60 mt-1">{btn.sub}</p>
                      </div>
                    </div>
                    {isActive ? (
                       <div className="flex items-center gap-1">
                        <div className="bg-current w-1.5 h-1.5 rounded-full" />
                        <div className="bg-current w-1.5 h-1.5 rounded-full opacity-60 animate-pulse" />
                       </div>
                    ) : (
                      <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Connection status in punch center */}
            <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              socketConnected
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {socketConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Real-time sync active
                </>
              ) : (
                <>
                  <AlertCircle size={14} />
                  Running in offline mode
                </>
              )}
            </div>
          </div>

          {/* HISTORY LOG (ENHANCED) */}
          <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-3">
                <History size={20} className="text-blue-600" />
                Attendance Log
                {socketConnected && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
              </h3>
              <button
                onClick={() => loadData()}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Reload logs"
              >
                <RefreshCw size={16} className="text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-x-auto">
              {records.length ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold border-b border-slate-50">
                      <th className="px-8 py-4">Timeline</th>
                      <th className="px-8 py-4">Status Label</th>
                      <th className="px-8 py-4 text-right">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {records.slice(0, 7).map((r, idx) => (
                      <tr key={r._id} className="group hover:bg-slate-50/50 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-700 text-sm">
                                {new Date(r.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                                {new Date(r.date).toLocaleDateString('en-US', { weekday: 'long' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-8 py-5 text-right font-mono text-xs font-medium text-slate-500">
                          {decimalHoursToHrsMins(r.totalHours)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 text-slate-300">
                  <AlertCircle size={48} className="opacity-20 mb-4" />
                  <p className="font-medium text-slate-400">No logs found.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
