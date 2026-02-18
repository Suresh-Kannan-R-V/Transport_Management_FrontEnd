import { Pagination } from "@heroui/react";

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit?: number;
  onPageChange: (page: number) => void;
}

export const CustomPagination = ({
  currentPage,
  totalPages,
  totalItems,
  limit = 10,
  onPageChange,
}: CustomPaginationProps) => {
  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center px-2 w-full gap-4">
      <div className="flex items-center gap-2 text-xs font-semibold order-2 sm:order-1">
        <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
        <span className="text-slate-500">Total Records:</span>
        <span className="bg-indigo-100 px-2 py-0.5 rounded text-indigo-600">
          {totalItems}
        </span>
        <span className="text-slate-400 font-normal">
          (Page {currentPage} of {totalPages})
        </span>
      </div>

      <div className="order-1 sm:order-2">
        <div className="custom-pagination-container">
          <Pagination
            isCompact
            showControls
            total={totalPages}
            page={currentPage}
            onChange={onPageChange}
            disableAnimation={false}
            radius="lg"
            className="cursor-pointer shadow-none"
          />

          <style>{`
    .custom-pagination-container [data-slot="wrapper"] {
      gap: 8px !important;
      box-shadow: none !important;
      background: transparent !important;
    }

    /* Common styling for items and navigation buttons */
    .custom-pagination-container [data-slot="item"],
    .custom-pagination-container [data-slot="prev"],
    .custom-pagination-container [data-slot="next"] {
      background-color: white !important;
      color: #4f46e5 !important; 
      border-radius: 20px !important;
      min-width: 36px !important;
      height: 36px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-shadow: none !important;
      transition: all 0.2s ease !important;
    }

    /* Target the SVG arrows inside the buttons specifically */
    .custom-pagination-container [data-slot="prev"] svg,
    .custom-pagination-container [data-slot="next"] svg {
      width: 18px !important;
      height: 18px !important;
      stroke-width: 2.5px !important; /* Makes arrows bolder/clearer */
      color: #4f46e5 !important; /* Makes the arrows Indigo */
    }

    /* Hover effect for navigation buttons */
    .custom-pagination-container [data-slot="prev"]:hover,
    .custom-pagination-container [data-slot="next"]:hover {
      background-color: #f8fafc !important;
      border-color: #4f46e5 !important;
      transform: translateY(-1px);
    }

    /* Active page cursor styling */
    .custom-pagination-container [data-slot="cursor"] {
      background-color: #4f46e5 !important; 
      color: white !important;
      font-weight: 700 !important;
      border-radius: 12px !important;
      min-width: 36px !important;
      height: 36px !important;
    }

    /* Hover effect for numbers */
    .custom-pagination-container [data-slot="item"]:hover {
      background-color: #eef2ff !important;
      border-color: #4f46e5 !important;
    }
  `}</style>
        </div>
      </div>
    </div>
  );
};
