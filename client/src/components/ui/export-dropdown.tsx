import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { exportToCSV, exportToExcel } from '@/lib/export-utils';
import { createDataPDF, PDFExportButton } from '@/components/ui/pdf-document';

interface ExportDropdownProps {
  data: any[];
  filename: string;
  title: string;
  subtitle?: string;
}

export function ExportDropdown({ data, filename, title, subtitle }: ExportDropdownProps) {
  const handleCSVExport = () => {
    exportToCSV(data, filename);
  };

  const handleExcelExport = () => {
    exportToExcel(data, filename);
  };

  const pdfDocument = createDataPDF(data, title, subtitle);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCSVExport} className="cursor-pointer">
          <span className="text-green-600 font-medium">CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExcelExport} className="cursor-pointer">
          <span className="text-blue-600 font-medium">Excel</span>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <div className="w-full cursor-pointer">
            <PDFExportButton document={pdfDocument} filename={filename} />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}