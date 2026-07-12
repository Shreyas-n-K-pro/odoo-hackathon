import React, { useState, useEffect } from 'react';
import { getTrips, createTrip, dispatchTrip, completeTrip, cancelTrip } from '../api/trips.api';
import { getDrivers } from '../api/drivers.api';
import { vehicleApi } from '../api/vehicle.api';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import dayjs from 'dayjs';

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    vehicleId: '', driverId: '', origin: '', destination: '', scheduledAt: '', cargoWeight: '', notes: ''
  });
  
  const [completeData, setCompleteData] = useState({
    tripId: null, distanceKm: '', fuelLitres: '', fuelPricePerLtr: '', expenseCategory: '', expenseAmount: '', expenseDescription: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        getTrips(),
        vehicleApi.getAll({ status: 'Available' }),
        getDrivers({ status: 'Available' })
      ]);
      setTrips(tripsRes);
      // Wait, vehicleApi.getAll returns full axios response, so we need .data.data
      setVehicles(vehiclesRes.data?.data || []);
      setDrivers(driversRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Validation logic
  const selectedVehicle = vehicles.find(v => v.id === parseInt(formData.vehicleId));
  const isCargoValid = !selectedVehicle || !formData.cargoWeight || parseFloat(formData.cargoWeight) <= parseFloat(selectedVehicle.capacityKg);
  const isFormValid = formData.vehicleId && formData.driverId && formData.origin && formData.destination && formData.scheduledAt && isCargoValid;

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    try {
      await createTrip({
        ...formData,
        vehicleId: parseInt(formData.vehicleId),
        driverId: parseInt(formData.driverId),
        cargoWeight: formData.cargoWeight ? parseFloat(formData.cargoWeight) : undefined
      });
      setCreateModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create trip');
    }
  };

  const handleDispatch = async (id) => {
    if (!window.confirm('Dispatch this trip?')) return;
    try {
      await dispatchTrip(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to dispatch trip');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this trip?')) return;
    try {
      await cancelTrip(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel trip');
    }
  };

  const openCompleteModal = (id) => {
    setCompleteData({ tripId: id, distanceKm: '', fuelLitres: '', fuelPricePerLtr: '', expenseCategory: '', expenseAmount: '', expenseDescription: '' });
    setCompleteModalOpen(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        distanceKm: parseFloat(completeData.distanceKm),
        fuelLitres: completeData.fuelLitres ? parseFloat(completeData.fuelLitres) : undefined,
        fuelPricePerLtr: completeData.fuelPricePerLtr ? parseFloat(completeData.fuelPricePerLtr) : undefined,
        expenseCategory: completeData.expenseCategory || undefined,
        expenseAmount: completeData.expenseAmount ? parseFloat(completeData.expenseAmount) : undefined,
        expenseDescription: completeData.expenseDescription || undefined
      };
      await completeTrip(completeData.tripId, payload);
      setCompleteModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete trip');
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Trip Dispatcher</h1>
        <button onClick={() => {
          setFormData({ vehicleId: '', driverId: '', origin: '', destination: '', scheduledAt: '', cargoWeight: '', notes: '' });
          setCreateModalOpen(true);
        }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          + Create Trip
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 glass-card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 text-sm font-semibold text-gray-300">Trip Code</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Route</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Schedule</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Vehicle & Driver</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map(trip => (
                <tr key={trip.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 text-white font-mono">{trip.tripCode}</td>
                  <td className="p-4">
                    <div className="text-white">{trip.origin}</div>
                    <div className="text-xs text-gray-400">to {trip.destination}</div>
                  </td>
                  <td className="p-4 text-gray-300 text-sm">
                    {dayjs(trip.scheduledAt).format('MMM D, h:mm A')}
                  </td>
                  <td className="p-4 text-sm">
                    <div className="text-white">{trip.vehicle?.name || '-'}</div>
                    <div className="text-gray-400">{trip.driver?.name || '-'}</div>
                  </td>
                  <td className="p-4">
                    <Badge status={trip.status} />
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {trip.status === 'Scheduled' && (
                        <>
                          <button onClick={() => handleDispatch(trip.id)} className="text-sm text-green-400 hover:text-green-300">Dispatch</button>
                          <button onClick={() => handleCancel(trip.id)} className="text-sm text-red-400 hover:text-red-300">Cancel</button>
                        </>
                      )}
                      {trip.status === 'In_Progress' && (
                        <button onClick={() => openCompleteModal(trip.id)} className="text-sm text-blue-400 hover:text-blue-300">Complete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {trips.length === 0 && (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400">No trips found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Trip">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Vehicle</label>
              <select required className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white" value={formData.vehicleId} onChange={e => setFormData({...formData, vehicleId: e.target.value})}>
                <option value="">Select Available Vehicle</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} (Cap: {v.capacityKg}kg)</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Driver</label>
              <select required className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white" value={formData.driverId} onChange={e => setFormData({...formData, driverId: e.target.value})}>
                <option value="">Select Available Driver</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Origin</label>
              <input required type="text" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white" value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Destination</label>
              <input required type="text" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Scheduled At</label>
              <input required type="datetime-local" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white" value={formData.scheduledAt} onChange={e => setFormData({...formData, scheduledAt: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Cargo Weight (kg)</label>
              <input type="number" step="0.1" className={`w-full bg-black/50 border ${!isCargoValid ? 'border-red-500' : 'border-white/10'} rounded-lg p-2 text-white`} value={formData.cargoWeight} onChange={e => setFormData({...formData, cargoWeight: e.target.value})} />
              {!isCargoValid && <p className="text-red-500 text-xs mt-1">Exceeds vehicle capacity ({selectedVehicle?.capacityKg}kg)</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setCreateModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={!isFormValid} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors">Create Trip</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={completeModalOpen} onClose={() => setCompleteModalOpen(false)} title="Complete Trip">
        <form onSubmit={handleCompleteSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Distance Driven (km)</label>
            <input required type="number" step="0.1" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white" value={completeData.distanceKm} onChange={e => setCompleteData({...completeData, distanceKm: e.target.value})} />
          </div>
          
          <div className="border-t border-white/10 pt-4 mt-4">
            <h3 className="text-sm font-semibold text-white mb-3">Optional Fuel Log</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Litres</label>
                <input type="number" step="0.1" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white" value={completeData.fuelLitres} onChange={e => setCompleteData({...completeData, fuelLitres: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Price per Ltr</label>
                <input type="number" step="0.1" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white" value={completeData.fuelPricePerLtr} onChange={e => setCompleteData({...completeData, fuelPricePerLtr: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 mt-4">
            <h3 className="text-sm font-semibold text-white mb-3">Optional Expense</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <select className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white" value={completeData.expenseCategory} onChange={e => setCompleteData({...completeData, expenseCategory: e.target.value})}>
                  <option value="">None</option>
                  <option value="Toll">Toll</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Amount</label>
                <input type="number" step="0.1" className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-white" value={completeData.expenseAmount} onChange={e => setCompleteData({...completeData, expenseAmount: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setCompleteModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">Complete Trip</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
