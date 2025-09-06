
import React from 'react';
import { Package } from 'lucide-react';

const StatusSection = ({ formData, handleInputChange }) => {
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'picked_up', label: 'Picked Up' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'exception', label: 'Exception' }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-1">
      <div className="flex items-center mb-4">
        <Package className="w-6 h-6 text-emerald-400 mr-2" />
        <h3 className="text-xl font-semibold text-emerald-400">
          Shipment Status
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Current Location</label>
          <input
            type="text"
            name="currentLocation"
            value={formData.currentLocation}
            onChange={handleInputChange}
            placeholder="Current location"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};

export default StatusSection;
