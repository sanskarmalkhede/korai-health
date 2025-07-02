'use client';

import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export interface HealthParameter {
  parameter: string;
  value: string;
  unit: string;
  normalRange: string;
  status: 'normal' | 'high' | 'low';
}

interface DataTableProps {
  data: HealthParameter[];
}

const columnHelper = createColumnHelper<HealthParameter>();

export function DataTable({ data }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo(
    () => [
      columnHelper.accessor('parameter', {
        header: 'Parameter',
        cell: (info) => (
          <div className="font-semibold text-text-dark">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('value', {
        header: 'Value',
        cell: (info) => (
          <div className="font-bold text-sage-dark">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('unit', {
        header: 'Unit',
        cell: (info) => (
          <div className="text-text-dark/70 font-medium">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('normalRange', {
        header: 'Normal Range',
        cell: (info) => (
          <div className="text-text-dark/60 text-sm">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
              status === 'normal' ? 'status-normal' :
              status === 'high' ? 'status-high' : 'status-low'
            }`}>
              {status}
            </span>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-sage-green" />
          </div>
          <input
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search parameters..."
            className="block w-full pl-10 pr-3 py-3 border border-sage-green/20 rounded-xl bg-cream/50 text-text-dark placeholder-text-dark/50 focus:outline-none focus:ring-2 focus:ring-sage-green focus:border-transparent transition-all"
          />
        </div>
        <div className="text-sm font-medium text-text-dark/70 bg-sage-green/10 px-3 py-2 rounded-lg">
          {data.length} parameters found
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-sage-green/20 shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-sage-green/10">
            <thead className="bg-gradient-to-r from-sage-light/20 to-sage-green/20">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-sm font-bold text-text-dark uppercase tracking-wider cursor-pointer hover:bg-sage-green/10 transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center space-x-2">
                        <span>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {header.column.getIsSorted() && (
                          <span className="text-sage-green font-bold text-lg">
                            {header.column.getIsSorted() === 'desc' ? '↓' : '↑'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-cream/30 divide-y divide-sage-green/10">
              {table.getRowModel().rows.map((row, index) => (
                <tr 
                  key={row.id} 
                  className={`hover:bg-sage-green/5 transition-colors ${
                    index % 2 === 0 ? 'bg-cream/20' : 'bg-white/50'
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {table.getRowModel().rows.length === 0 && (
        <div className="text-center py-12">
          <div className="text-sage-green/60 mb-2">
            <MagnifyingGlassIcon className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-text-dark/70 font-medium">
            No parameters found matching your search.
          </p>
          <p className="text-text-dark/50 text-sm mt-1">
            Try adjusting your search terms.
          </p>
        </div>
      )}
    </div>
  );
} 