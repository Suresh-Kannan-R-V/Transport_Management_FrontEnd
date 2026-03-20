/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Chip, DatePicker, Select, SelectItem } from "@heroui/react";
import axios from "axios";
import {
  Building2,
  Calendar,
  Coins,
  CreditCard,
  Droplet,
  FileSpreadsheet,
  Hash,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Star,
  Upload,
  UserCircle,
  User as UserIcon,
  UserPlus,
  UserRound
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { FILE_BASE_URL } from "../../../../api/base";
import { BackButton, FormInput } from "../../../../components";
import { pickerStyles, selectorStyles } from "../../../../utils/style";

const AddUser = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("create");
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role_id: "",
    password: "",
    user_name: "",
    age: "",
    // Faculty fields
    faculty_id: "",
    destination: "",
    department: "",
    // Driver fields
    license_number: "",
    license_expiry: "",
    experience_years: "",
    blood_group: "",
    salary: "",
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${FILE_BASE_URL}/auth/roles`, {
          headers: { Authorization: `TMS ${localStorage.getItem("token")}` },
        });
        if (response.data.success) setRoles(response.data.data);
      } catch (error) {
        console.error("Failed to fetch roles", error);
      }
    };
    fetchRoles();
  }, []);

  const selectedRole = roles.find((r) => r.id.toString() === formData.role_id);
  const selectedRoleName = selectedRole?.name.toLowerCase() || "";

  const downloadSampleExcel = () => {
    const template = [
      {
        name: "JOHN DOE",
        email: "john@example.com",
        password: "password123",
        role_id: 3,
        phone: "9876543210",
        user_name: "johndoe",
        age: 30,
        license_number: "TN38AB1234",
        license_expiry: "2030-01-01",
        experience_years: 5,
        blood_group: "O+",
        salary: 25000,
        faculty_id: "",
        department: "",
        destination: "",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "Bulk_User_Import_Sample.xlsx");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");
    if (activeTab === "create" && !formData.role_id) {
      toast.error("Please assign a role to the new user");
      setLoading(false);
      return;
    }

    if (activeTab === "bulk" && !file) {
      toast.error("Please select an Excel file");
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `TMS ${token}`,
          "Content-Type":
            activeTab === "bulk" ? "multipart/form-data" : "application/json",
        },
      };

      if (activeTab === "bulk") {
        if (!file) throw new Error("Please select an Excel file");
        const bulkData = new FormData();
        bulkData.append("file", file);
        await axios.post(`${FILE_BASE_URL}/auth/register`, bulkData, config);
        toast.success("Bulk users processed successfully!");
      } else if (activeTab === "reset" || activeTab === "unblock") {
        const payload = {
          ...(formData.email
            ? { email: formData.email }
            : { user_name: formData.user_name }),
          ...(activeTab === "reset"
            ? { password: formData.password }
            : { isLogin: true }),
        };
        await axios.put(`${FILE_BASE_URL}/auth/user`, payload, config);
        toast.success("Operation successful!");
      } else {
        // Construct clean payload with Number conversions
        const payload: any = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role_id: Number(formData.role_id),
          phone: formData.phone.trim(),
          user_name: formData.user_name.trim(),
          age: formData.age ? Number(formData.age) : null,
        };

        if (selectedRoleName === "faculty") {
          payload.faculty_id = formData.faculty_id;
          payload.department = formData.department;
          payload.destination = formData.destination;
        } else if (selectedRoleName === "driver") {
          payload.license_number = formData.license_number;
          payload.license_expiry = formData.license_expiry;
          payload.experience_years = Number(formData.experience_years);
          payload.blood_group = formData.blood_group;
          payload.salary = Number(formData.salary);
        }

        const response = await axios.post(
          `${FILE_BASE_URL}/auth/register`,
          payload,
          config,
        );
        toast.success(`Registered: ${response.data.data[0].user.user_name}`);
      }

      // Clear Form
      setFormData({
        name: "",
        email: "",
        phone: "",
        role_id: "",
        password: "",
        user_name: "",
        age: "",
        faculty_id: "",
        destination: "",
        department: "",
        license_number: "",
        license_expiry: "",
        experience_years: "",
        blood_group: "",
        salary: "",
      });
      setFile(null);
    } catch (error: any) {
      // Logic to extract specific backend error message
      const msg =
        error.response?.data?.message || error.message || "Request failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto font-sans space-y-4">
      <header className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <BackButton />
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
        </div>
        <Button
          className="bg-indigo-600 text-white font-bold rounded-xl"
          onPress={() => navigate("/settings/session-management")}
          startContent={<UserRound size={18} />}
        >
          Login Control
        </Button>
      </header>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
        {[
          { id: "create", label: "Register", icon: UserPlus },
          { id: "bulk", label: "Bulk", icon: FileSpreadsheet },
          { id: "unblock", label: "Unblock", icon: RefreshCw },
          { id: "reset", label: "Reset", icon: KeyRound },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500"
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {activeTab === "create" && (
            <>
              <FormInput
                label="Full Name"
                startContent={<UserIcon size={18} />}
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Email"
                  startContent={<Mail size={18} />}
                  type="email"
                  placeholder="example@bitsathy.ac.in"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
                <FormInput
                  label="Phone"
                  startContent={<Phone size={18} />}
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Username"
                  startContent={<UserCircle size={18} />}
                  placeholder="Login ID"
                  value={formData.user_name}
                  onChange={(e) =>
                    setFormData({ ...formData, user_name: e.target.value })
                  }
                />
                <FormInput
                  label="Password"
                  startContent={<Lock size={18} />}
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
                    Assign Role
                  </label>
                  <Select
                    placeholder="Choose Role"
                    selectedKeys={formData.role_id ? [formData.role_id] : []}
                    onChange={(e) =>
                      setFormData({ ...formData, role_id: e.target.value })
                    }
                    classNames={selectorStyles}
                    variant="flat"
                  >
                    {roles.map((r) => (
                      <SelectItem key={r.id.toString()} textValue={r.name}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <FormInput
                  label="Age"
                  startContent={<Calendar size={18} />}
                  type="number"
                  placeholder="Min 20"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  onKeyDown={(e: any) =>
                    ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                  }
                />
              </div>

              {/* Conditional Sections */}
              {selectedRoleName === "faculty" && (
                <div className="p-4 bg-indigo-50/50 rounded-2xl border-2 border-indigo-100 space-y-4">
                  <FormInput
                    label="Faculty ID"
                    startContent={<Hash size={18} />}
                    placeholder="FAC..."
                    value={formData.faculty_id}
                    onChange={(e) =>
                      setFormData({ ...formData, faculty_id: e.target.value })
                    }
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      label="Department"
                      startContent={<Building2 size={18} />}
                      placeholder="Dept"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      required
                    />
                    <FormInput
                      label="Destination"
                      startContent={<MapPin size={18} />}
                      placeholder="Campus"
                      value={formData.destination}
                      onChange={(e) =>
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
                <div className="p-4 bg-emerald-50/50 rounded-2xl border-2 border-emerald-100 space-y-4">
                  <FormInput
                    label="License No"
                    startContent={<CreditCard size={18} />}
                    placeholder="TN..."
                    value={formData.license_number}
                    onChange={(e) =>
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
                      selectorIcon={
                        <Calendar size={16} className="text-slate-400" />
                      }
                      classNames={pickerStyles}
                      onChange={(d) =>
                        setFormData({
                          ...formData,
                          license_expiry: d
                            ? `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`
                            : "",
                        })
                      }
                      isRequired
                    />
                    <FormInput
                      label="Exp (Years)"
                      startContent={<Star size={18} />}
                      type="number"
                      placeholder="0"
                      value={formData.experience_years}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          experience_years: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      label="Blood Group"
                      startContent={<Droplet size={18} />}
                      placeholder="B+"
                      value={formData.blood_group}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          blood_group: e.target.value,
                        })
                      }
                      required
                    />
                    <FormInput
                      label="Salary"
                      startContent={<Coins size={18} />}
                      type="number"
                      placeholder="Amount"
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData({ ...formData, salary: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "bulk" && (
            <div className="text-center py-10 space-y-4 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <Upload className="mx-auto text-indigo-400" size={40} />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-700">
                  Upload Bulk Data
                </p>
                <p className="text-xs text-slate-400">Supported: .xlsx, .xls</p>
              </div>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-input"
              />
              <div className="flex gap-2 justify-center">
                <Button
                  as="label"
                  htmlFor="file-input"
                  variant="flat"
                  color="primary"
                  className="cursor-pointer font-bold"
                >
                  Select File
                </Button>
                <Button
                  variant="light"
                  color="secondary"
                  className="font-bold underline"
                  onPress={downloadSampleExcel}
                >
                  Sample Template
                </Button>
              </div>
              {file && (
                <Chip
                  color="success"
                  variant="flat"
                  onClose={() => setFile(null)}
                >
                  {file.name}
                </Chip>
              )}
            </div>
          )}

          {/* Unblock/Reset */}
          {(activeTab === "unblock" || activeTab === "reset") && (
            <FormInput
              label="Identifier"
              startContent={<UserCircle size={18} />}
              placeholder="Email or Username"
              value={formData.email || formData.user_name}
              onChange={(e) => {
                const v = e.target.value;
                if (v.includes("@"))
                  setFormData({ ...formData, email: v, user_name: "" });
                else setFormData({ ...formData, user_name: v, email: "" });
              }}
              required
            />
          )}

          {activeTab === "reset" && (
            <FormInput
              label="New Password"
              startContent={<Lock size={18} />}
              type="password"
              placeholder="Min 6 chars"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          )}

          <Button
            type="submit"
            isLoading={loading}
            className="w-full h-12 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg"
          >
            {activeTab === "create"
              ? "Confirm Registration"
              : activeTab === "bulk"
                ? "Process Bulk File"
                : "Update User"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
