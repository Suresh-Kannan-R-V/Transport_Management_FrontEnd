import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { 
  UserPlus, Mail, Phone, UserCircle, 
  ShieldCheck, RefreshCw, Info, ChevronDown 
} from "lucide-react";

export const AddUser = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role_id: "",
    userId: "",
  });
  const [loading, setLoading] = useState(false);
  const [isReactivationMode, setIsReactivationMode] = useState(false);

  const roles = [
    { label: "Transport Admin", value: "2" },
    { label: "Driver", value: "3" },
    { label: "Faculty", value: "4" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `TMS ${token}` } };

    try {
      if (isReactivationMode) {
        const checkRes = await axios.get(`http://localhost:8055/auth/user/${formData.userId}`, config);
        
        if (checkRes.data.isLogin === false) {
          await axios.post("http://localhost:8055/auth/register", { 
            ...formData, 
            id: formData.userId, 
            isLogin: true 
          }, config);
          toast.success("User reactivated successfully!");
        } else {
          toast.info("User is already active.");
        }
      } else {
        const payload = { ...formData, role_id: Number(formData.role_id), isLogin: true };
        await axios.post("http://localhost:8055/auth/register", payload, config);
        toast.success("New user registered!");
      }
      setFormData({ name: "", email: "", phone: "", role_id: "", userId: "" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // Reusable Input Component to keep code clean
  const FormInput = ({ label, icon: Icon, ...props }: any) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-slate-700 ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
          <Icon size={18} />
        </div>
        <input
          {...props}
          className="w-full h-12 pl-10 pr-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-700 placeholder:text-slate-400"
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {isReactivationMode ? "Account Recovery" : "User Onboarding"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isReactivationMode ? "Restore access for blocked users" : "Add new members to the TMS fleet"}
          </p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${isReactivationMode ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
           {isReactivationMode ? <RefreshCw size={14}/> : <UserPlus size={14}/>}
           {isReactivationMode ? "Update Mode" : "Create Mode"}
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-md border border-slate-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Custom Toggle Switch */}
          <div 
            className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer"
            onClick={() => setIsReactivationMode(!isReactivationMode)}
          >
            <div className="flex gap-3 items-center">
              <div className={`p-2 rounded-lg ${isReactivationMode ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'}`}>
                <RefreshCw size={20} className={isReactivationMode ? "animate-spin" : ""} style={{ animationDuration: '3s' }} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Reactivate Blocked User?</p>
                <p className="text-xs text-slate-500">Switch on to update an existing user's login status</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors relative ${isReactivationMode ? 'bg-purple-600' : 'bg-slate-300'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isReactivationMode ? 'left-7' : 'left-1'}`} />
            </div>
          </div>

          <div className="space-y-5">
            {isReactivationMode && (
              <FormInput
                label="Target User ID"
                icon={Info}
                type="text"
                placeholder="Enter User ID (e.g., 2)"
                value={formData.userId}
                onChange={(e: any) => setFormData({...formData, userId: e.target.value})}
                required
              />
            )}

            <FormInput
              label="Full Name"
              icon={UserCircle}
              type="text"
              placeholder="e.g. Merosan"
              value={formData.name}
              onChange={(e: any) => setFormData({...formData, name: e.target.value})}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput
                label="Email Address"
                icon={Mail}
                type="email"
                placeholder="merosan.se23@bitsathy.ac.in"
                value={formData.email}
                onChange={(e: any) => setFormData({...formData, email: e.target.value})}
                required
              />
              <FormInput
                label="Phone Number"
                icon={Phone}
                type="tel"
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e: any) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>

            {/* Custom Select */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Assign System Role</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <ShieldCheck size={18} />
                </div>
                <select
                  className="w-full h-12 pl-10 pr-10 bg-white border border-slate-200 rounded-xl outline-none appearance-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all text-slate-700"
                  value={formData.role_id}
                  onChange={(e) => setFormData({...formData, role_id: e.target.value})}
                  required
                >
                  <option value="" disabled>Choose a role</option>
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-14 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            } ${isReactivationMode ? 'bg-purple-600 shadow-purple-200 hover:bg-purple-700' : 'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700'}`}
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              <>
                {isReactivationMode ? <RefreshCw size={20}/> : <UserPlus size={20}/>}
                {isReactivationMode ? "Update & Reactivate User" : "Create New Account"}
              </>
            )}
          </button>
          
          <p className="flex items-center justify-center gap-2 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
            <Info size={14} /> System will verify credentials before processing
          </p>
        </form>
      </div>
    </div>
  );
};