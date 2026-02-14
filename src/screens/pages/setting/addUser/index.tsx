/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "@heroui/react";
import axios from "axios";
import {
  ArrowLeft,
  Info,
  KeyRound,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserCircle,
  UserPlus,
  UserRound
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FormInput } from "../../../../components";

const AddUser = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("create");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role_id: "",
    userId: "",
    password: "",
    user_name: "",
  });

  const roles = [
    { label: "Transport Admin", value: "2" },
    { label: "Driver", value: "3" },
    { label: "Faculty", value: "4" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Retrieve and Validate Token
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authorization token found. Please log in.");
      setLoading(false);
      return;
    }

    // 2. Setup Headers with TMS prefix
    const config = {
      headers: {
        Authorization: `TMS ${token}`,
        "Content-Type": "application/json",
      },
    };

    try {
      if (activeTab === "reset") {
        // --- PASSWORD RESET LOGIC ---
        // Ensure userId exists for the URL param
        if (!formData.userId) {
          toast.error("User ID is required for reset.");
          setLoading(false);
          return;
        }

        const resetPayload = formData.email
          ? { email: formData.email, password: formData.password }
          : { user_name: formData.user_name, password: formData.password };

        // Switched to PUT for an update operation
        await axios.put(
          `http://localhost:5000/api/auth/user`,
          resetPayload,
          config,
        );
        toast.success("Password reset successfully!");
      } else if (activeTab === "unblock") {
        // --- UNBLOCK LOGIC ---
        const updatePayload = {
          isLogin: true, // Only sending what needs to change
          ...(formData.email
            ? { email: formData.email }
            : { user_name: formData.user_name }),
        };

        // Standardizing to PUT for updating the user status
        await axios.put(
          "http://localhost:8055/auth/user",
          updatePayload,
          config,
        );

        toast.success(`User unblocked successfully!`);
      } else {
        // --- REGISTRATION LOGIC ---
        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password || `${formData.name}@123`,
          phone: formData.phone,
          role_id: Number(formData.role_id),
          isLogin: true,
          ...(formData.user_name && { user_name: formData.user_name }),
        };

        const response = await axios.post(
          "http://localhost:8055/auth/register",
          payload,
          config,
        );

        const finalUserName =
          response.data.user_name || payload.user_name || "Generated";
        toast.success(`User ${finalUserName} registered successfully!`);
      }

      // Clear form on success
      setFormData({
        name: "",
        email: "",
        phone: "",
        role_id: "",
        userId: "",
        password: "",
        user_name: "",
      });
    } catch (error: any) {
      // Improved error reporting
      console.error("API Error Detail:", error.response?.data);
      const msg =
        error.response?.data?.message ||
        "Operation failed. Check console for details.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto font-sans">
      <div className="flex justify-between">
        <Button
          onPress={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors mb-4 font-medium text-sm"
        >
          <ArrowLeft size={16} /> Back to Settings
        </Button>
        <Button
          className="bg-indigo-600 text-white font-semibold text-sm px-5 shadow-md rounded-lg"
          startContent={<UserRound size={18} strokeWidth={3} />}
          onPress={() => navigate("/settings/logout-users")}
        >
          Login Control
        </Button>
      </div>

      <div className="flex bg-slate-100 p-1.5 rounded-[20px] mb-4 border border-slate-200 shadow-inner">
        {[
          { id: "create", label: "Register", icon: UserPlus },
          { id: "unblock", label: "Unblock", icon: RefreshCw },
          { id: "reset", label: "Reset Password", icon: KeyRound },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center cursor-pointer justify-center gap-2 py-3 rounded-[14px] text-xs font-bold transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-white text-indigo-600 shadow-md transform scale-[1.02]"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[32px] shadow-[0_25px_60px_rgba(0,0,0,0.06)] border border-slate-100 p-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            {activeTab === "create" && (
              <>
                <FormInput
                  label="Full Name"
                  icon={UserCircle}
                  placeholder="e.g. username"
                  value={formData.name}
                  onChange={(e: any) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Email"
                    icon={Mail}
                    type="email"
                    placeholder="example@bitsathy.ac.in"
                    value={formData.email}
                    onChange={(e: any) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                  <FormInput
                    label="Phone"
                    icon={Phone}
                    placeholder="0123456789"
                    value={formData.phone}
                    onChange={(e: any) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Username (Optional)"
                    icon={UserCircle}
                    placeholder="Auto-generated"
                    value={formData.user_name}
                    onChange={(e: any) =>
                      setFormData({ ...formData, user_name: e.target.value })
                    }
                  />
                  <FormInput
                    label="Password"
                    icon={Lock}
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e: any) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">
                    Assign Role
                  </label>
                  <select
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white"
                    value={formData.role_id}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setFormData({ ...formData, role_id: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Role</option>
                    {roles.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {activeTab === "unblock" && (
              <div className="space-y-4">
                <FormInput
                  label="User Identifier (Email or Username)"
                  icon={UserCircle}
                  placeholder="Enter email or user_name"
                  value={formData.email || formData.user_name}
                  onChange={(e: any) => {
                    const val = e.target.value;
                    if (val.includes("@")) {
                      setFormData({ ...formData, email: val, user_name: "" });
                    } else {
                      setFormData({ ...formData, user_name: val, email: "" });
                    }
                  }}
                  required
                />
              </div>
            )}

            {activeTab === "reset" && (
              <>
                <FormInput
                  label="User ID"
                  icon={Info}
                  placeholder="Numeric User ID"
                  value={formData.userId}
                  onChange={(e: any) =>
                    setFormData({ ...formData, userId: e.target.value })
                  }
                  required
                />
                <FormInput
                  label="Identifier"
                  icon={UserCircle}
                  placeholder="Username or Email"
                  value={formData.email || formData.user_name}
                  onChange={(e: any) => {
                    const val = e.target.value;
                    if (val.includes("@")) {
                      setFormData({ ...formData, email: val, user_name: "" });
                    } else {
                      setFormData({ ...formData, user_name: val, email: "" });
                    }
                  }}
                  required
                />
                <FormInput
                  label="New Password"
                  icon={Lock}
                  type="password"
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={(e: any) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-indigo-600 rounded-2xl font-bold text-white hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 active:scale-95"
          >
            {loading ? (
              <RefreshCw className="animate-spin" />
            ) : (
              <ShieldCheck size={20} />
            )}
            {activeTab === "create"
              ? "Confirm Registration"
              : activeTab === "unblock"
                ? "Unblock & Update"
                : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default AddUser;