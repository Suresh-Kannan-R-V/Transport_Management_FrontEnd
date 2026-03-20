import {
  Button,
  DatePicker,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  Textarea,
} from "@heroui/react";
import { Calendar, Coins, Gauge, Store, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FormInput } from "../../../../components";
import { useUserStore, useVehicleDashboardStore } from "../../../../store";
import { pickerStyles, selectorStyles } from "../../../../utils/style";

interface AddMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: number | string;
}

export const AddMaintenanceModal = ({
  isOpen,
  onClose,
  vehicleId,
}: AddMaintenanceModalProps) => {
  const {
    shops,
    fetchingShops,
    addMaintenance,
    fetchVehicleDashboard,
    fetchMatchingShops,
  } = useVehicleDashboardStore();
  const { serviceTypes } = useUserStore();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    shop_id: "",
    maintance_type: new Set<string>(),
    description: "",
    current_km: "",
    cost: "",
    next_service_km: "",
    next_service_date: null as any,
  });

  useEffect(() => {
    if (isOpen) {
      const selectedIds = Array.from(formData.maintance_type).join(",");
      if (selectedIds) {
        fetchMatchingShops(selectedIds);
      }
    }
  }, [formData.maintance_type, isOpen]);

  const handleSubmit = async () => {
    if (
      !formData.title ||
      !formData.cost ||
      formData.maintance_type.size === 0 ||
      !formData.shop_id
    ) {
      return toast.error("Please fill all required fields");
    }

    setLoading(true);
    const payload = {
      vehicle_id: Number(vehicleId),
      title: formData.title,
      shop_id: Number(formData.shop_id),
      maintance_type: Array.from(formData.maintance_type).map((id) =>
        Number(id),
      ),
      description: formData.description,
      current_km: Number(formData.current_km),
      cost: Number(formData.cost),
      next_service_km: Number(formData.next_service_km),
      next_service_date: formData.next_service_date
        ? formData.next_service_date.toString()
        : "",
    };

    const success = await addMaintenance(payload);
    if (success) {
      toast.success("Maintenance logged successfully!");
      fetchVehicleDashboard(vehicleId);
      onClose();
    } else {
      toast.error("Failed to log maintenance");
    }
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      classNames={{
        backdrop: "bg-indigo-950/40",
        base: "border-none rounded-[24px] bg-white shadow-2xl",
        header: "px-8 pt-8 pb-2",
        footer: "px-8 pb-8 pt-4",
        body: "px-8 py-4",
        closeButton:
          "hover:bg-rose-50 text-rose-500 top-6 right-6 p-2 rounded-full",
      }}
      isDismissable={false}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex gap-2 pt-6 items-center text-indigo-600">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Wrench size={24} />
              </div>
              <span className="font-black uppercase tracking-tight text-slate-800">
                Log New Maintenance
              </span>
            </ModalHeader>
            <ModalBody className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormInput
                  label="Service Title"
                  placeholder="e.g. Periodic Maintenance"
                  startContent={<Wrench size={18} />}
                  value={formData.title}
                  onValueChange={(v) => setFormData({ ...formData, title: v })}
                />
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">
                    Select Services
                  </label>
                  <Select
                    selectionMode="multiple"
                    placeholder="Select one or more"
                    labelPlacement="outside"
                    classNames={selectorStyles}
                    selectedKeys={formData.maintance_type}
                    onSelectionChange={(keys) =>
                      setFormData({
                        ...formData,
                        maintance_type: keys as Set<string>,
                        shop_id: "",
                      })
                    }
                  >
                    {serviceTypes.map((type) => (
                      <SelectItem
                        key={type.id}
                        textValue={type.name}
                        className={selectorStyles.listboxItem[0]}
                      >
                        {type.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">
                    Select Shop
                  </label>
                  <Select
                    placeholder={
                      formData.maintance_type.size === 0
                        ? "Select services first"
                        : "Select Shop"
                    }
                    isDisabled={
                      formData.maintance_type.size === 0 || fetchingShops
                    }
                    labelPlacement="outside"
                    classNames={selectorStyles}
                    selectedKeys={formData.shop_id ? [formData.shop_id] : []}
                    onChange={(e) =>
                      setFormData({ ...formData, shop_id: e.target.value })
                    }
                    startContent={
                      fetchingShops ? (
                        <Spinner
                          size="sm"
                          className="animate-spin text-indigo-600"
                        />
                      ) : (
                        <Store size={18} className="text-indigo-600" />
                      )
                    }
                  >
                    {shops.map((shop) => (
                      <SelectItem
                        key={shop.id}
                        textValue={shop.name}
                        className={selectorStyles.listboxItem[0]}
                      >
                        <div className="flex gap-3 w-full items-center">
                          <Store
                            strokeWidth={2}
                            size={20}
                            className="text-indigo-600"
                          />
                          <div className="flex flex-col -gap-1">
                            <span className="font-bold">{shop.name}</span>
                            <span className="text-[10px] text-slate-500">
                              {shop.owner_name} &#8226; {shop.address}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <FormInput
                  label="Total Cost"
                  placeholder="0.00"
                  type="number"
                  min={100}
                  startContent={<Coins size={18} className="text-indigo-500" />}
                  value={formData.cost}
                  onValueChange={(v) => setFormData({ ...formData, cost: v })}
                />
              </div>

              <div className="relative ">
                <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-[0.2em] ml-1">
                  Odometer Readings
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <FormInput
                  label="Current KM"
                  type="number"
                  min={100}
                  startContent={<Gauge size={18} />}
                  value={formData.current_km}
                  onValueChange={(v) =>
                    setFormData({ ...formData, current_km: v })
                  }
                />
                <FormInput
                  label="Next Due (KM)"
                  type="number"
                  min={100}
                  startContent={<Gauge size={18} className="text-rose-400" />}
                  value={formData.next_service_km}
                  onValueChange={(v) =>
                    setFormData({ ...formData, next_service_km: v })
                  }
                />
                <DatePicker
                  label="Next Service Date"
                  labelPlacement="outside"
                  variant="flat"
                  classNames={pickerStyles}
                  onChange={(d) =>
                    setFormData({ ...formData, next_service_date: d })
                  }
                  selectorIcon={<Calendar size={18} />}
                />
              </div>

              <div className="grid grid-cols-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">
                  Describe
                </label>
                <Textarea
                  placeholder="Describe parts replaced..."
                  variant="flat"
                  className="shadow bg-slate-50 border border-slate-100/60 rounded-lg transition-all duration-200 group focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10"
                  value={formData.description}
                  onValueChange={(v) =>
                    setFormData({ ...formData, description: v })
                  }
                />
              </div>
            </ModalBody>
            <ModalFooter className="gap-3">
              <Button
                variant="light"
                onPress={onClose}
                className="rounded-xl font-bold bg-indigo-50 text-indigo-600 min-w-40"
              >
                Cancel
              </Button>
              <Button
                isLoading={loading}
                className="bg-indigo-600 text-white font-bold rounded-xl px-16 shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
                onPress={handleSubmit}
              >
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
