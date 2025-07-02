export function LoadingSpinner() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-12 text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Processing Your Report
          </h3>
          <p className="text-gray-500">
            Extracting health parameters using OCR...
          </p>
        </div>
      </div>
    </div>
  );
} 