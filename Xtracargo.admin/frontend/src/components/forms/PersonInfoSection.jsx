
import React from 'react';

const PersonInfoSection = ({ 
  title, 
  icon: Icon, 
  formData, 
  handleInputChange, 
  fieldPrefix 
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-1">
      <div className="flex items-center mb-4">
        <Icon className="w-6 h-6 text-emerald-400 mr-2" />
        <h3 className="text-xl font-semibold text-emerald-400">
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <input
          type="text"
          name={`${fieldPrefix}Name`}
          value={formData[`${fieldPrefix}Name`]}
          onChange={handleInputChange}
          placeholder="Full Name"
          className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="email"
          name={`${fieldPrefix}Email`}
          value={formData[`${fieldPrefix}Email`]}
          onChange={handleInputChange}
          placeholder="Email Address"
          className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="tel"
          name={`${fieldPrefix}Phone`}
          value={formData[`${fieldPrefix}Phone`]}
          onChange={handleInputChange}
          placeholder="Phone Number"
          className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="text"
          name={`${fieldPrefix}Address`}
          value={formData[`${fieldPrefix}Address`]}
          onChange={handleInputChange}
          placeholder="Street Address"
          className="md:col-span-2 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="text"
          name={`${fieldPrefix}City`}
          value={formData[`${fieldPrefix}City`]}
          onChange={handleInputChange}
          placeholder="City"
          className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="text"
          name={`${fieldPrefix}State`}
          value={formData[`${fieldPrefix}State`]}
          onChange={handleInputChange}
          placeholder="State/Province"
          className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="text"
          name={`${fieldPrefix}Zip`}
          value={formData[`${fieldPrefix}Zip`]}
          onChange={handleInputChange}
          placeholder="ZIP/Postal Code"
          className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="text"
          name={`${fieldPrefix}Country`}
          value={formData[`${fieldPrefix}Country`]}
          onChange={handleInputChange}
          placeholder="Country"
          className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>
  );
};

export default PersonInfoSection;
