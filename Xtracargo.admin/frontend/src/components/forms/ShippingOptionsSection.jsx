
import React from 'react';
import { DollarSign } from 'lucide-react';

const ShippingOptionsSection = ({ formData, handleInputChange }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-1">
      <div className="flex items-center mb-4">
        <DollarSign className="w-6 h-6 text-emerald-400 mr-2" />
        <h3 className="text-xl font-semibold text-emerald-400">
          Shipping Options
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <select
          name="serviceType"
          value={formData.serviceType}
          onChange={handleInputChange}
          className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="standard">Standard</option>
          <option value="express">Express</option>
          <option value="overnight">Overnight</option>
          <option value="ground">Ground</option>
          <option value="international">International</option>
        </select>
        <select
          name="priority"
          value={formData.priority}
          onChange={handleInputChange}
          className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <input
          type="number"
          name="shippingCost"
          value={formData.shippingCost}
          onChange={handleInputChange}
          placeholder="Shipping Cost ($)"
          step="0.01"
          className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="space-y-2">
          <label className="block text-sm text-gray-400">Shipping Date</label>
          <input
            type="date"
            name="shippingDate"
            value={formData.shippingDate}
            onChange={handleInputChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm text-gray-400">Delivery Date</label>
          <input
            type="date"
            name="estimatedDeliveryDate"
            value={formData.estimatedDeliveryDate}
            onChange={handleInputChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <label className="flex items-center text-gray-300">
          <input
            type="checkbox"
            name="insurance"
            checked={formData.insurance}
            onChange={handleInputChange}
            className="mr-2 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
          />
          Insurance Coverage
        </label>
        <label className="flex items-center text-gray-300">
          <input
            type="checkbox"
            name="signatureRequired"
            checked={formData.signatureRequired}
            onChange={handleInputChange}
            className="mr-2 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
          />
          Signature Required
        </label>
      </div>
      <div className="mt-4">
        <textarea
          name="specialInstructions"
          value={formData.specialInstructions}
          onChange={handleInputChange}
          placeholder="Special Instructions / Notes"
          rows="3"
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>
  );
};

export default ShippingOptionsSection;
