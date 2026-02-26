import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@heroui/react";
import axios, { AxiosError } from "axios";
import {
  Lock,
  LogOut,
  Mail,
  Phone,
  RefreshCcw,
  Search,
  ShieldCheck,
  UserCircle,
  UserCog,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FILE_BASE_URL } from "../../../../api/base";
import {
  BackButton,
  CustomPagination,
  GenericFilterDropdown,
  TransportLoader,
  type FilterItem,
} from "../../../../components";
import { useRoleManagementStore } from "../../../../store";
import { cn } from "../../../../utils/helper";
import { selectorStyles } from "../../../../utils/style";

let searchTimeout: ReturnType<typeof setTimeout>;
// --- Types ---
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role_name?: string;
  user_name?: string;
  Role?: { name: string };
  isLogin?: boolean;
}

interface Role {
  id: number;
  name: string;
}

const RoleManagement = () => {
  const { users, loading, fetchUsers, totalPages, totalItems, logout } =
    useRoleManagementStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [isLoginFilter, setIsLoginFilter] = useState<boolean | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const handleLogout = async (id: string | number, Name: string) => {
    setShowLogout(false);
    logout(id, Name).then((success) => {
      if (success) {
        loadData();
      }
    });
  };

  const LIMIT = 8;

  const loadData = useCallback(() => {
    let query = `?page=${page}&limit=${LIMIT}&search=${searchTerm}`;
    if (roleFilter) query += `&role_name=${roleFilter}`;
    if (isLoginFilter !== null) query += `&isLogin=${isLoginFilter}`;
    fetchUsers(query);
  }, [page, searchTerm, roleFilter, isLoginFilter, fetchUsers]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setPage(1);
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {}, 500);
  };

  const filterConfig = [
    {
      title: "Status",
      items: [
        { key: "on", label: "Only Online", value: true },
        { key: "off", label: "Only Offline", value: false },
      ],
    },
    {
      title: "Roles",
      items: [
        { key: "dr", label: "Drivers", value: "Driver" },
        { key: "fa", label: "Faculty", value: "Faculty" },
      ],
    },
  ];

  const handleFilterSelection = (sectionTitle: string, item: FilterItem) => {
    setPage(1);
    switch (sectionTitle) {
      case "Status":
        setIsLoginFilter(item.value);
        break;
      case "Roles":
        setRoleFilter(item.value);
        break;
    }
  };

  return (
    <div className="p-4 pb-0 space-y-3 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <BackButton />

          <div>
            <p className="text-indigo-500 text-[10px] uppercase tracking-widest font-extrabold">
              System Roles & Permissions
            </p>
            <h1 className="text-3xl md:text-4xl text-slate-900 tracking-tight font-bold">
              Session Management
            </h1>
          </div>
        </div>
      </header>
      <div className="flex gap-2 items-center w-full justify-between mb-2">
        <div className="w-full md:w-80">
          <Input
            isClearable
            placeholder="Search by name or email..."
            startContent={<Search size={18} className="text-slate-400" />}
            value={searchTerm}
            onValueChange={handleSearch}
            className="rounded-2xl shadow"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Button
            isIconOnly
            onPress={() => {
              fetchUsers(`?page=${page}&limit=${LIMIT}&search=${searchTerm}`);
              setSearchTerm("");
              setRoleFilter("");
              setIsLoginFilter(null);
            }}
            variant="flat"
            className="bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl h-9 text-xs"
            startContent={<RefreshCcw size={16} strokeWidth={2} />}
          />
          <GenericFilterDropdown
            sections={filterConfig}
            onFilterSelect={handleFilterSelection}
            onReset={() => {
              setSearchTerm("");
              setRoleFilter("");
              setIsLoginFilter(null);
            }}
          />
        </div>
      </div>

      <div className=" overflow-y-auto h-[calc(100vh-320px)] p-1 custom-scrollbar pr-2">
        {loading ? (
          <div className="col-span-full flex justify-center items-center h-full">
            <TransportLoader size={60} />
          </div>
        ) : users.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {users.map((user) => (
              <Card
                key={user.id}
                isHoverable
                className={cn(
                  "border-2 bg-white shadow-sm hover:border-indigo-500 transition-all duration-300 rounded-2xl group h-fit",
                  user.isLogin ? "border-emerald-500" : "border-slate-100",
                )}
              >
                <CardBody className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="relative">
                      <div
                        className={cn(
                          "size-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors duration-300",
                          user.isLogin
                            ? "bg-emerald-100 text-emerald-500"
                            : "bg-slate-100 text-slate-400",
                        )}
                      >
                        <UserCircle size={32} />
                      </div>
                      <div
                        className={cn(
                          "absolute bottom- right-0 size-4 rounded-full border-4 border-white",
                          user.isLogin ? "bg-green-600" : "bg-rose-600",
                        )}
                      />
                    </div>
                    <span className="font-bold uppercase text-[10px] bg-indigo-50 text-indigo-600 px-2 pt-0.5 rounded-full">
                      {user.role_name || "No Role"}
                    </span>
                  </div>

                  <div className="space-y-1 mb-4">
                    <h3 className="font-bold text-slate-800 text-lg line-clamp-1">
                      {user.name}
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-400 tracking-widest">
                      User Name: # {user.user_name}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Mail size={14} className="text-indigo-600" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Phone size={14} className="text-indigo-600" />
                      <span>{user.phone}</span>
                    </div>
                  </div>
                </CardBody>

                <CardFooter className="px-4 pb-4 pt-0 gap-2">
                  <Button
                    fullWidth
                    size="sm"
                    variant="flat"
                    className="bg-indigo-50 text-xs text-indigo-600 font-medium rounded-md group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-none"
                    startContent={<UserCog size={15} />}
                    onPress={() => {
                      setSelectedUser(user);
                      setIsModalOpen(true);
                    }}
                  >
                    Manage Role
                  </Button>
                  <Button
                    fullWidth
                    size="sm"
                    variant="flat"
                    className="bg-rose-50 text-sm text-rose-600 font-medium rounded-md group-hover:bg-rose-600 group-hover:text-white transition-all shadow-none"
                    startContent={<LogOut size={15} />}
                    onPress={() => {
                      setSelectedUser(user);
                      setShowLogout(true);
                    }}
                  >
                    Logout
                  </Button>
                </CardFooter>
                <Modal
                  isOpen={showLogout}
                  onOpenChange={() => setShowLogout(false)}
                  isDismissable={false}
                  size="sm"
                  classNames={{
                    backdrop: "bg-indigo-950/10",
                    base: "border-1 border-slate-200 rounded-xl bg-white",
                    header: "border-b-[1px] border-slate-100 p-6",
                    footer: "border-t-[1px] border-slate-100 p-6",
                    body: "py-8 px-6",
                    closeButton:
                      "hover:bg-rose-100 active:bg-rose-200 text-rose-500 transition-colors cursor-pointer rounded-md top-4 right-4 p-2 text-lg",
                  }}
                >
                  <ModalContent>
                    <ModalBody className="text-center px-8 text-slate-500 py-6">
                      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full">
                        <h2 className="text-slate-900 dark:text-white text-xl font-bold">
                          Confirm Logout
                        </h2>

                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                          Are you sure you want to end your session?
                        </p>
                      </div>
                      <span className="font-bold text-slate-800">
                        {selectedUser?.name}
                      </span>
                    </ModalBody>
                    <ModalFooter className="flex flex-col sm:flex-row gap-2 pt-2 pb-4">
                      <Button
                        fullWidth
                        variant="light"
                        onPress={() => setShowLogout(false)}
                        className="bg-indigo-50 text-sm text-indigo-600 font-medium rounded-md group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-none"
                      >
                        Cancel
                      </Button>
                      <Button
                        fullWidth
                        className="bg-rose-600 text-sm text-white font-medium rounded-md transition-all shadow-none"
                        onPress={() => {
                          if (selectedUser) {
                            handleLogout(selectedUser.id, selectedUser.name);
                          }
                          setShowLogout(false);
                        }}
                      >
                        Confirm
                      </Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
              </Card>
            ))}
          </div>
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-slate-400 font-medium italic">
              No users found matching your search.
            </p>
          </div>
        )}
      </div>

      <CustomPagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        limit={LIMIT}
        onPageChange={setPage}
      />

      <ChangeRoleModal
        isOpen={isModalOpen}
        onOpenChange={() => setIsModalOpen(false)}
        user={selectedUser}
        onSuccess={loadData}
      />
    </div>
  );
};

interface ChangeRoleModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  user: {
    id: number;
    name: string;
    role_name?: string;
  } | null;
  onSuccess: () => void;
}
const ChangeRoleModal = ({
  isOpen,
  onOpenChange,
  user,
  onSuccess,
}: ChangeRoleModalProps) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      axios
        .get(`${FILE_BASE_URL}/auth/roles`, {
          headers: { Authorization: `TMS ${localStorage.getItem("token")}` },
        })
        .then((res) => setRoles(res.data.data || []))
        .catch(() => toast.error("Failed to load roles"));
    }
  }, [isOpen]);

  const handleUpdate = async () => {
    if (!selectedRole || !adminPassword) return toast.error("Fill all fields");
    if (!user) return toast.error("User not found");
    setLoading(true);
    try {
      const res = await axios.patch(
        `${FILE_BASE_URL}/users/change-role`,
        {
          user_id: user.id,
          password: adminPassword,
          new_role_id: Number(selectedRole),
        },
        { headers: { Authorization: `TMS ${localStorage.getItem("token")}` } },
      );

      if (res.data.success) {
        toast.success("Role updated!");
        onSuccess();
        onOpenChange();
        setAdminPassword("");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={false}
      classNames={{
        backdrop: "bg-indigo-950/30",
        base: "border-1 border-slate-200 rounded-xl bg-white",
        header: "border-b-[1px] border-slate-100 p-6",
        footer: "border-t-[1px] border-slate-100 p-6",
        body: "py-8 px-6",
        closeButton:
          "hover:bg-rose-100 active:bg-rose-200 text-rose-500 transition-colors cursor-pointer rounded-md top-4 right-4 p-2 text-lg",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 pt-4 pb-2 px-5">
          <div className="flex items-center gap-3 text-indigo-600">
            <ShieldCheck size={28} strokeWidth={2.5} />
            <h2 className="text-xl font-black tracking-tight text-slate-800">
              Security Authorization
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium uppercase mt-1">
            Elevate or Modify User Permissions
          </p>
        </ModalHeader>
        <ModalBody className="px-6 py-4 pb-6">
          <div className="bg-slate-50 p-3 rounded-2xl mb-0 border border-slate-100 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center border border-slate-200 text-indigo-500 shadow-sm">
              <UserCircle size={32} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">{user?.name}</p>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                Current: {user?.role_name}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">
              Select New Role
            </label>
            <Select
              labelPlacement="outside"
              placeholder="Select Role"
              variant="bordered"
              classNames={selectorStyles}
              onSelectionChange={(keys) =>
                setSelectedRole(Array.from(keys)[0] as string)
              }
            >
              {roles.map((role) => (
                <SelectItem key={role.id}>{role.name}</SelectItem>
              ))}
            </Select>
            <div>
              <label className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">
                Admin Confirmation
              </label>
              <Input
                labelPlacement="outside"
                placeholder="Confirm your identity"
                type="password"
                classNames={{
                  inputWrapper: "rounded-xl bg-slate-50 shadow-sm",
                }}
                startContent={<Lock size={18} className="text-slate-400" />}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="px-5 py-4 w-full gap-3">
          <Button
            fullWidth
            variant="light"
            className="w-full font-bold bg-indigo-50 text-indigo-500 tracking-widest rounded-xl"
            onPress={onOpenChange}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            isLoading={loading}
            className="bg-indigo-600 text-sm text-white rounded-xl font-bold tracking-widest px-8 w-full"
            onPress={handleUpdate}
          >
            Update User Role
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RoleManagement;
