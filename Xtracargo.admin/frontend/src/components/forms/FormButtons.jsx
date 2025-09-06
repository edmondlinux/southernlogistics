
import React from 'react';
import { X } from 'lucide-react';

const FormButtons = ({ 
  loading, 
  isInline, 
  onClose, 
  submitText = "Update Shipment" 
}) => {
  return (
    <div className="flex justify-between">
      {isInline && (
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 px-6 py-3 rounded-lg font-medium transition duration-300 flex items-center gap-2"
        >
          ← Back to Search
        </button>
      )}
      <div className="flex gap-4 ml-auto">
        {!isInline && (
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-medium transition duration-300"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 px-8 py-3 rounded-lg font-semibold transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? `${submitText}...` : submitText}
        </button>
      </div>
    </div>
  );
};

export default FormButtons;
