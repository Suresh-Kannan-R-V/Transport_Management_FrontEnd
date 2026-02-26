/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, DatePicker, Select, SelectItem } from "@heroui/react";
import axios from "axios";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  Hash,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  Star,
  UserCircle,
  UserPlus,
  UserRound
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FILE_BASE_URL } from "../../../../api/base";
import { FormInput } from "../../../../components";
import { pickerStyles, selectorStyles } from "../../../../utils/style";

interface UserPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  role_id: number;
  isLogin: boolean;
  user_name?: string;
  faculty_id?: string;
  destination?: string;
  department?: string;
  license_number?: string;
  license_expiry?: string;
  experience_years?: number;
}

const AddUser = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("create");
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role_id: "",
    password: "",
    user_name: "",
    // Faculty fields
    faculty_id: "",
    destination: "",
    department: "",
    // Driver fields
    license_number: "",
    license_expiry: "",
    experience_years: "",
  });

  // Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${FILE_BASE_URL}/auth/roles`, {
          headers: {
            Authorization: `TMS ${localStorage.getItem("token")}`,
          },
        });
        if (response.data.success) {
          setRoles(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch roles", error);
      }
    };
    fetchRoles();
  }, []);

  // Helper to get selected role name
  const selectedRoleName =
    roles
      .find((r) => r.id.toString() === formData.role_id)
      ?.name.toLowerCase() || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `TMS ${token}`,
        "Content-Type": "application/json",
      },
    };

    try {
      if (activeTab === "reset") {
        const resetPayload = formData.email
          ? { email: formData.email, password: formData.password }
          : { user_name: formData.user_name, password: formData.password };

        await axios.put(`${FILE_BASE_URL}/auth/user`, resetPayload, config);
        toast.success("Password reset successfully!");
      } else if (activeTab === "unblock") {
        const updatePayload = {
          isLogin: true,
          ...(formData.email
            ? { email: formData.email }
            : { user_name: formData.user_name }),
        };
        await axios.put(`${FILE_BASE_URL}/auth/user`, updatePayload, config);
        toast.success(`User unblocked successfully!`);
      } else {
        // Prepare base payload
        let payload: UserPayload = {
          name: formData.name,
          email: formData.email,
          password: formData.password || `${formData.name}@123`,
          phone: formData.phone,
          role_id: Number(formData.role_id),
          isLogin: true,
          ...(formData.user_name && { user_name: formData.user_name }),
        };

        // Add Role specific data
        if (selectedRoleName === "faculty") {
          payload = {
            ...payload,
            faculty_id: formData.faculty_id,
            destination: formData.destination,
            department: formData.department,
          };
        } else if (selectedRoleName === "driver") {
          payload = {
            ...payload,
            license_number: formData.license_number,
            license_expiry: formData.license_expiry,
            experience_years: Number(formData.experience_years),
          };
        }

        const response = await axios.post(
          `${FILE_BASE_URL}/auth/register`,
          payload,
          config,
        );
        const finalUserName =
          response.data.user_name || payload.user_name || "Generated";
        toast.success(`User ${finalUserName} registered successfully!`);
      }

      // Reset Form
      setFormData({
        name: "",
        email: "",
        phone: "",
        role_id: "",
        password: "",
        user_name: "",
        faculty_id: "",
        destination: "",
        department: "",
        license_number: "",
        license_expiry: "",
        experience_years: "",
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Operation failed.");
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
          size="md"
          className="bg-indigo-600 text-white font-semibold text-sm px-5 shadow-md rounded-lg"
          startContent={<UserRound size={18} strokeWidth={3} />}
          onPress={() => navigate("/settings/session-management")}
        >
          Login Control
        </Button>
      </div>

      <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-4 border border-slate-200 shadow-inner">
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

      <div className="bg-white rounded-2xl shadow border border-slate-100 p-5">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {activeTab === "create" && (
              <>
                <FormInput
                  label="Full Name"
                  icon={UserCircle}
                  placeholder="e.g. username"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                  <FormInput
                    label="Phone"
                    icon={Phone}
                    placeholder="0123456789"
                    value={formData.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, user_name: e.target.value })
                    }
                  />
                  <FormInput
                    label="Password"
                    icon={Lock}
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                    Assign Role
                  </label>
                  <Select
                    placeholder="Select a role"
                    selectedKeys={formData.role_id ? [formData.role_id] : []}
                    onChange={(e) =>
                      setFormData({ ...formData, role_id: e.target.value })
                    }
                    variant="flat"
                    className="w-full"
                    classNames={selectorStyles}
                  >
                    {roles.map((role) => (
                      <SelectItem
                        key={role.id.toString()}
                        textValue={role.name}
                      >
                        {role.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {selectedRoleName === "faculty" && (
                  <div className="p-4 bg-indigo-50/50 rounded-2xl space-y-4 border-2 border-indigo-500">
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                      Faculty Details
                    </p>
                    <FormInput
                      label="Faculty ID"
                      icon={Hash}
                      placeholder="FAC123"
                      value={formData.faculty_id}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, faculty_id: e.target.value })
                      }
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput
                        label="Department"
                        icon={Building2}
                        placeholder="e.g. CSE"
                        value={formData.department}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({
                            ...formData,
                            department: e.target.value,
                          })
                        }
                        required
                      />
                      <FormInput
                        label="Destination"
                        icon={MapPin}
                        placeholder="e.g. Sathy"
                        value={formData.destination}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({
                            ...formData,
                            destination: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                )}

                {selectedRoleName === "driver" && (
                  <div className="p-4 bg-emerald-50/50 rounded-2xl space-y-4 border-2 border-emerald-500">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                      Driver License Info
                    </p>
                    <FormInput
                      label="License Number"
                      icon={CreditCard}
                      placeholder="TN38..."
                      value={formData.license_number}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({
                          ...formData,
                          license_number: e.target.value,
                        })
                      }
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <DatePicker
                        label="License Expiry"
                        labelPlacement="outside"
                        showMonthAndYearPickers
                        classNames={pickerStyles}
                        selectorIcon={
                          <Calendar size={16} className="text-slate-400" />
                        }
                        onChange={(dateValue) =>
                          setFormData({
                            ...formData,
                            license_expiry: dateValue
                              ? dateValue.toString()
                              : "",
                          })
                        }
                        isRequired
                      />

                      <FormInput
                        label="Experience (Years)"
                        icon={Star}
                        type="number"
                        placeholder="5"
                        value={formData.experience_years}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({
                            ...formData,
                            experience_years: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab !== "create" && (
              <FormInput
                label="Identifier"
                icon={UserCircle}
                placeholder="Username or Email"
                value={formData.email || formData.user_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = e.target.value;
                  if (val.includes("@")) {
                    setFormData({ ...formData, email: val, user_name: "" });
                  } else {
                    setFormData({ ...formData, user_name: val, email: "" });
                  }
                }}
                required
              />
            )}

            {activeTab === "reset" && (
              <FormInput
                label="New Password"
                icon={Lock}
                type="password"
                placeholder="Enter new password"
                value={formData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            size="md"
            className="w-full bg-indigo-600 rounded-2xl font-bold text-white hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-70"
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
          </Button>
        </form>
      </div>
    </div>
  );
};
export default AddUser;
