import React, { useState, useEffect } from 'react';
import { getDrivers, createDriver, updateDriver, triggerExpiryChecks } from '../api/drivers.api';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import dayjs from 'dayjs';

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', licenseNumber: '', licenseExpiry: '', phone: '', email: '', status: 'Available', region: '' });
  const [editingId, setEditingId] = useState(null);
  const [checkingExpirations, setCheckingExpirations] = useState(false);

  const fetchDrivers = async () => {
    try {
      const data = await getDrivers();
      setDrivers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, email: formData.email || null };
      if (editingId) {
        await updateDriver(editingId, payload);
      } else {
        await createDriver(payload);
      }
      setModalOpen(false);
      fetchDrivers();
    } catch (err) {
      alert('Failed to save driver');
    }
  };

  const openEdit = (driver) => {
    setFormData({
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      licenseExpiry: dayjs(driver.licenseExpiry).format('YYYY-MM-DD'),
      phone: driver.phone,
      email: driver.email || '',
      status: driver.status,
      region: driver.region || ''
    });
    setEditingId(driver.id);
    setModalOpen(true);
  };

  const openCreate = () => {
    setFormData({ name: '', licenseNumber: '', licenseExpiry: '', phone: '', email: '', status: 'Available', region: '' });
    setEditingId(null);
    setModalOpen(true);
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Available' ? 'Off_Duty' : 'Available';
      await updateDriver(id, { status: newStatus });
      fetchDrivers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerExpirations = async () => {
    setCheckingExpirations(true);
    try {
      const res = await triggerExpiryChecks();
      alert(`License expiry check completed successfully!\nFound ${res.count} expiring licenses.\nDetails sent to Safety Officer.`);
    } catch (err) {
      console.error(err);
      alert('Failed to trigger expiration checks. Verify Brevo configuration.');
    } finally {
      setCheckingExpirations(false);
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Driver Management</h1>
        <div className="flex gap-3">
          <button 
            onClick={handleTriggerExpirations} 
            disabled={checkingExpirations}
            className="px-4 py-2 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            🔔 {checkingExpirations ? 'Checking...' : 'Check Expirations & Email Alerts'}
          </button>
          <button onClick={openCreate} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            + Add Driver
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-4 text-sm font-semibold text-gray-300">Name & Contact</th>
              <th className="p-4 text-sm font-semibold text-gray-300">License</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Expiry</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Safety Score</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Status</th>
              <th className="p-4 text-sm font-semibold text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(d => {
              const isExpired = dayjs(d.licenseExpiry).isBefore(dayjs());
              const isSuspended = d.status === 'Suspended';
              return (
                <tr key={d.id} className={`border-b border-white/5 hover:bg-white/5 ${isExpired || isSuspended ? 'bg-red-500/10' : ''}`}>
                  <td className="p-4 text-white">
                    <div className="font-semibold">{d.name}</div>
                    <div className="text-xs text-gray-400">{d.phone}</div>
                    {d.email && <div className="text-xs text-blue-400 font-mono">{d.email}</div>}
                  </td>
                  <td className="p-4 text-gray-300 font-mono text-sm">{d.licenseNumber}</td>
                  <td className="p-4">
                    <span className={isExpired ? 'text-red-400 font-bold' : 'text-gray-300'}>
                      {dayjs(d.licenseExpiry).format('MMM D, YYYY')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${d.safetyScore >= 80 ? 'bg-green-500' : d.safetyScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                          style={{ width: `${d.safetyScore}%` }} 
                        />
                      </div>
                      <span className="text-sm text-gray-300">{d.safetyScore}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge status={
                      d.status === 'Available' ? 'Available' : 
                      d.status === 'On_Trip' ? 'On_Trip' : 
                      d.status === 'Suspended' ? 'Retired' : 'Inactive'
                    } />
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(d)} className="text-sm text-blue-400 hover:text-blue-300">Edit</button>
                      <button onClick={() => toggleStatus(d.id, d.status)} className="text-sm text-gray-400 hover:text-gray-300">Toggle Status</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {drivers.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-400">No drivers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Driver' : 'Add Driver'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input required type="text" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email (Optional - for notifications)</label>
            <input type="email" placeholder="driver@transitops.in" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">License Number</label>
              <input required type="text" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Expiry Date</label>
              <input required type="date" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" value={formData.licenseExpiry} onChange={e => setFormData({...formData, licenseExpiry: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Phone</label>
              <input required type="text" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status</label>
              <select className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Available">Available</option>
                <option value="On_Trip">On Trip</option>
                <option value="Off_Duty">Off Duty</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">Save Driver</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
