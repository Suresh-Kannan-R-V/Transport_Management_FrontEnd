import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
} from "@heroui/react";
import { Copy, Filter, RefreshCcw, Users } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FILE_BASE_URL } from "../../../../api/base";
import { BackButton, GenericTable } from "../../../../components";
import { cn } from "../../../../utils/helper";

const COLUMNS = [
  { key: "id", label: "USER ID" },
  { key: "user_name", label: "User Name" },
  { key: "name", label: "FULL NAME" },
  { key: "email", label: "EMAIL ADDRESS" },
  { key: "role", label: "ROLE" },
  { key: "status", label: "Status" },
  { key: "actions", label: "SESSION ACTIONS" },
];

export const LogoutUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, inactive
  const [sortOrder, setSortOrder] = useState("none");

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
        toast.success(`${id} is Logout Success`);
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      alert("Action failed.");
    }
  };

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (filterStatus === "active") {
      result = result.filter((u) => u.isLogin === true);
    } else if (filterStatus === "inactive") {
      result = result.filter((u) => u.isLogin === false);
    }

    if (sortOrder === "asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === "desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }, [users, filterStatus, sortOrder]);

  const renderCell = (user: any, columnKey: React.Key) => {
    switch (columnKey) {
      case "user_name":
        return (
          <p
            className=" flex gap-2 text-xs text-slate-500 hover:font-semibold hover:text-indigo-600 hover:underline cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(user.user_name);
              toast.success("user_name Copied to clipboard!");
            }}
          >
            <Copy size={12} />
            <span>{user.user_name}</span>
          </p>
        );
      case "email":
        return (
          <p
            className=" flex gap-2 text-xs text-slate-500 hover:font-semibold hover:text-indigo-600 hover:underline cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(user.email);
              toast.success("Email Copied to clipboard!");
            }}
          >
            <Copy size={12} />
            <span>{user.email}</span>
          </p>
        );
      case "actions":
        return (
          <Button
            size="sm"
            className="text-white font-semibold bg-rose-600 rounded-full px-3 py-0.5 "
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
              user.isLogin
                ? "bg-green-100 text-green-600"
                : "bg-rose-200 text-rose-500",
            )}
          >
            {user.isLogin ? "Active" : "Inactive"}
          </span>
        );
      case "role":
        return `${user.Role.name}`;
      default:
        return user[columnKey as keyof any];
    }
  };

  return (
    <div className="p-3">
      <div className="flex justify-between items-center px-0 py-6">
        <div className="flex gap-4 items-center">
          <BackButton />
          <h2 className="text-xl font-bold text-indigo-600">
            User Login Control
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            isIconOnly
            variant="light"
            onPress={() => fetchUsers()}
            className="text-[#64748b] font-medium text-sm border border-gray-200 shadow-md rounded-lg"
            startContent={<RefreshCcw size={18} strokeWidth={2.5} />}
          />
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="light"
                className="text-[#64748b] font-medium text-sm border border-gray-200 px-4 shadow-md rounded-lg"
                startContent={<Filter size={18} strokeWidth={2.5} />}
              >
                Filter & Sort
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              className="bg-white shadow-md rounded-2xl"
              aria-label="Filter Actions"
              disallowEmptySelection
              selectionMode="single"
            >
              <DropdownItem key="all" onClick={() => setFilterStatus("all")}>
                All Users
              </DropdownItem>
              <DropdownItem
                key="active"
                className="text-green-600"
                onClick={() => setFilterStatus("active")}
              >
                Active
              </DropdownItem>
              <DropdownItem
                key="inactive"
                className="text-rose-600"
                onClick={() => setFilterStatus("inactive")}
              >
                Inactive
              </DropdownItem>
              <DropdownItem
                key="asc"
                showDivider
                onClick={() => setSortOrder("asc")}
              >
                Ascending (A-Z)
              </DropdownItem>
              <DropdownItem key="desc" onClick={() => setSortOrder("desc")}>
                Descending (Z-A)
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Button
            className="bg-indigo-600 text-white font-semibold text-sm px-5 shadow-md rounded-lg"
            startContent={<Users size={18} strokeWidth={3} />}
            onPress={() => navigate("/settings/add-users")}
          >
            Add User
          </Button>
        </div>
      </div>
      <div className="h-[calc(100vh-240px)]">
        <GenericTable
          columns={COLUMNS}
          items={filteredUsers}
          loading={loading}
          renderCell={renderCell}
        />
      </div>
    </div>
  );
};
