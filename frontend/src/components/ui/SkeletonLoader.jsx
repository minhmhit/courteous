const SkeletonLoader = ({ type = "card", count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case "card":
        return (
          <div className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
            <div className="w-full h-48 bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-6 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        );

      case "list":
        return (
          <div className="bg-white rounded-lg p-4 shadow-md animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        );

      case "table":
        return (
          <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-12 bg-gray-200" />
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 border-t border-gray-200 bg-gray-50"
              />
            ))}
          </div>
        );

      default:
        return <div className="h-4 bg-gray-200 rounded animate-pulse" />;
    }
  };

  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
