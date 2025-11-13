/**
 * RoleBadge Component
 * Hiển thị badge cho role của user
 */

const RoleBadge = ({ roleId, size = "md" }) => {
  const roles = {
    0: { name: "Khách", color: "bg-gray-100 text-gray-800" },
    1: { name: "Admin", color: "bg-red-100 text-red-800" },
    2: { name: "Khách hàng", color: "bg-blue-100 text-blue-800" },
    3: { name: "Kho", color: "bg-green-100 text-green-800" },
    4: { name: "Bán hàng", color: "bg-purple-100 text-purple-800" },
    5: { name: "HRM", color: "bg-yellow-100 text-yellow-800" },
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm",
  };

  const role = roles[roleId] || roles[0];
  const sizeClass = sizeClasses[size] || sizeClasses["md"];

  return (
    <span
      className={`inline-block font-semibold rounded-full ${role.color} ${sizeClass}`}
    >
      {role.name}
    </span>
  );
};

export default RoleBadge;
