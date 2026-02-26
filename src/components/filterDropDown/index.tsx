/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger
} from "@heroui/react";
import { Filter, RotateCcw } from "lucide-react";

// Define the shape of a single filter item
export interface FilterItem {
  key: string;
  label: string;
  value: any;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
}

// Define the shape of a section (e.g., "Roles", "Status")
export interface FilterSection {
  title: string;
  items: FilterItem[];
}

interface GenericFilterDropdownProps {
  sections: FilterSection[];
  onFilterSelect: (sectionTitle: string, item: FilterItem) => void;
  onReset: () => void;
  buttonLabel?: string;
  className?: string;
}

export const GenericFilterDropdown = ({
  sections,
  onFilterSelect,
  onReset,
  buttonLabel = "Filter & Sort",
  className,
}: GenericFilterDropdownProps) => {
  return (
    <Dropdown className={className}>
      <DropdownTrigger>
        <Button
          variant="flat"
          className="bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl h-9 text-xs"
          startContent={<Filter size={16} />}
        >
          {buttonLabel}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Dynamic Filter Menu"
        variant="flat"
        className="min-w-40 max-h-80 overflow-y-scroll custom-scrollbar bg-white shadow-md rounded-2xl border border-slate-300 -translate-x-18"
        classNames={{
          base: "p-2 pt-3   ",
          list: "gap-1",
        }}
        itemClasses={{
          base: [
            "rounded-xl text-slate-600 transition-opacity data-[hover=true]:text-indigo-600 data-[hover=true]:bg-indigo-50 data-[selectable=true]:focus:bg-indigo-500 data-[selected=true]:bg-indigo-500 data-[selected=true]:text-white",
          ],
        }}
      >
        <>
          {sections.map((section) => (
            <DropdownSection
              key={section.title}
              title={section.title}
              showDivider
              className="m-0 text-indigo-600 text-sm"
            >
              {section.items.map((item) => (
                <DropdownItem
                  key={item.key}
                  color={item.color || "secondary"}
                  onPress={() => onFilterSelect(section.title, item)}
                  className="text-sm"
                >
                  {item.label}
                </DropdownItem>
              ))}
            </DropdownSection>
          ))}
          <DropdownSection>
            <DropdownItem
              key="reset"
              className="text-danger text-sm"
              color="danger"
              onPress={onReset}
            >
              <span className="flex items-center ">
                <RotateCcw size={14} className="mr-2" /> Reset Filters
              </span>
            </DropdownItem>
          </DropdownSection>
        </>
      </DropdownMenu>
    </Dropdown>
  );
};
