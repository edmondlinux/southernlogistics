
import React from 'react';
import { Package } from 'lucide-react';

const PackageDetailsSection = ({ formData, handleInputChange }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-1">
      <div className="flex items-center mb-4">
        <Package className="w-6 h-6 text-emerald-400 mr-2" />
        <h3 className="text-xl font-semibold text-emerald-400">
          Package Details
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <select
          name="packageType"
          value={formData.packageType}
          onChange={handleInputChange}
          className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="box">Box</option>
          <option value="envelope">Crate</option>
          <option value="tube">Container</option>
          <option value="pallet">Pallet</option>
          <option value="other">Other</option>
        </select>
        <input
          type="number"
          name="weight"
          value={formData.weight}
          onChange={handleInputChange}
          placeholder="Weight (lbs)"
          step="0.1"
          className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="number"
          name="dimensions.length"
          value={formData.dimensions.length}
          onChange={handleInputChange}
          placeholder="Length (in)"
          step="0.1"
          className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="number"
          name="dimensions.width"
          value={formData.dimensions.width}
          onChange={handleInputChange}
          placeholder="Width (in)"
          step="0.1"
          className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="number"
          name="dimensions.height"
          value={formData.dimensions.height}
          onChange={handleInputChange}
          placeholder="Height (in)"
          step="0.1"
          className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="number"
          name="value"
          value={formData.value}
          onChange={handleInputChange}
          placeholder="Declared Value ($)"
          step="0.01"
          className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Package Description"
          rows="3"
          className="md:col-span-2 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>
  );
};

export default PackageDetailsSection;
