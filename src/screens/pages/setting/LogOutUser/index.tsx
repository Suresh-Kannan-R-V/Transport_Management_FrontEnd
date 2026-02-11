import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@heroui/react";
import { FILE_BASE_URL } from "../../../../api/base";
import { GenericTable } from "../../../../components";
import { cn } from "../../../../utils/helper";
import { Filter, Plus, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const COLUMNS = [
  { key: "id", label: "USER ID" },
  { key: "full_name", label: "FULL NAME" },
  { key: "email", label: "EMAIL ADDRESS" },
  { key: "status", label: "Status" },
  { key: "actions", label: "SESSION ACTIONS" },
];

export const LogoutUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use useCallback to prevent unnecessary re-renders
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${FILE_BASE_URL}/auth/users`, {
        // IMPORTANT: Since you are getting 401, you might need headers
        headers: {
          Authorization: `TMS ${localStorage.getItem("token")}`, // Adjust based on your auth logic
        },
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const json = await res.json();
      // Ensure we are setting an array
      setUsers(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      console.error("Fetch Error:", e);
      setUsers([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleLogout = async (id: any) => {
    try {
      const res = await fetch(`${FILE_BASE_URL}/auth/admin/logout-user/${id}`, {
        method: "POST",
        headers: {
          Authorization: `TMS ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        alert(`Session terminated.`);
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      alert("Action failed.");
    }
  };

  const renderCell = (user: any, columnKey: React.Key) => {
    switch (columnKey) {
      case "full_name":
        return `${user.name || ""}`;
      case "actions":
        return (
          <Button
            size="sm"
            className="text-white bg-indigo-600 rounded-full px-3 py-1 "
            onPress={() => handleLogout(user.id)}
          >
            Logout
          </Button>
        );
      case "status":
        return (
          <span
            className={cn(
              "px-2 rounded-2xl uppercase text-xs font-semibold bg-amber-100 text-amber-600",
              user.status === "active" && "bg-green-100 text-green-600",
            )}
          >
            {user.status}
          </span>
        );
      default:
        return user[columnKey as keyof any];
    }
  };

  return (
    <div className="p-3">
      <h2 className="text-xl font-bold text-indigo-600 mb-4">
        User Login Control
      </h2>
      <div>
        <div className="flex justify-between items-center px-8 py-6">
          <div className="flex items-center gap-3">
            <h2 className="text-[20px] font-bold text-[#1e293b]">
              Your Customers
            </h2>
            <span className="flex items-center gap-1.5 bg-[#f5f3ff] text-[#6366f1] text-[11px] font-bold px-2.5 py-1 rounded-full border border-[#e0e7ff]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" /> New
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="light"
              className="text-[#64748b] font-medium text-sm border border-gray-200 px-4 shadow-md rounded-lg"
              startContent={<Filter size={18} strokeWidth={2.5} />}
            >
              Filter
            </Button>
            <Button
              variant="light"
              className="text-[#64748b] font-medium text-sm border border-gray-200 px-4 shadow-md rounded-lg"
              startContent={<Settings size={18} strokeWidth={2.5} />}
            >
              Settings
            </Button>
            <Button
              className="bg-indigo-600 text-white font-semibold text-sm px-5 shadow-md rounded-lg"
              startContent={<Plus size={18} strokeWidth={3} />}
              onPress={() => navigate("/settings/add-users")}
            >
              Add User
            </Button>
          </div>
        </div>
        <div className="h-[calc(100vh-310px)]">
          <GenericTable
            columns={COLUMNS}
            items={users}
            loading={loading}
            renderCell={renderCell}
          />
        </div>
      </div>
    </div>
  );
};
