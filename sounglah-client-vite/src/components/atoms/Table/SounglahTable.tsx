import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import classes from './SounglahTable.module.scss';
import { AnimatePresence, motion } from 'framer-motion';

export interface SounglahTableColumn<T> {
  label: string;
  accessor: keyof T | string;
  render?: (row: T, rowIndex: number) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
  sortable?: boolean; // For future sorting functionality
  headerRender?: () => React.ReactNode; // <-- add this
}

interface SounglahTableProps<T> {
  columns: SounglahTableColumn<T>[];
  data: T[];
  getRowKey: (row: T, rowIndex: number) => string | number;
  tableClassName?: string;
  containerClassName?: string;
  pagination?: boolean;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  dense?: boolean;
  page?: number;
  rowsPerPage?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  ariaLabel?: string; // For better screen reader support
  emptyMessage?: string; // Customizable empty state message
  /**
   * Optional content to render left-aligned in the sticky pagination/footer bar.
   */
  footerLeftContent?: React.ReactNode;
}

export function SounglahTable<T extends object>({
  columns,
  data,
  getRowKey,
  pagination = false,
  rowsPerPageOptions = [5, 10, 25, 50, 100],
  defaultRowsPerPage = 25,
  dense = false,
  tableClassName,
  containerClassName,
  page: externalPage,
  rowsPerPage: externalRowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  ariaLabel = 'Data table',
  emptyMessage = 'No data found.',
  footerLeftContent,
}: SounglahTableProps<T>) {
  const [internalPage, setInternalPage] = useState(0);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(defaultRowsPerPage);

  const page = externalPage !== undefined ? externalPage : internalPage;
  const rowsPerPage = externalRowsPerPage !== undefined ? externalRowsPerPage : internalRowsPerPage;

  const handleChangePage = (_: unknown, newPage: number) => {
    if (onPageChange) onPageChange(newPage);
    else setInternalPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (onRowsPerPageChange) onRowsPerPageChange(value);
    else {
      setInternalRowsPerPage(value);
      setInternalPage(0);
    }
  };

  const paginatedData = pagination && externalPage === undefined
    ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : data;

  const currentPageStart = page * rowsPerPage + 1;
  // const currentPageEnd = Math.min(page * rowsPerPage + rowsPerPage, totalCount || data.length);
  const totalItems = totalCount !== undefined ? totalCount : data.length;

  return (
    <div role="region" aria-label={ariaLabel}>
      <TableContainer component={Paper} className={containerClassName || classes.tableContainer} elevation={0} style={{ height: '60vh', overflowY: 'auto' }}>
        <Table 
          size={dense ? 'small' : 'medium'} 
          className={tableClassName || classes.table}
          aria-label={ariaLabel}
          role="table"
        >
          <TableHead>
            <TableRow role="row">
              {columns.map((col, idx) => (
                <TableCell 
                  key={idx} 
                  align={col.align || 'left'} 
                  className={col.className || classes.th}
                  role="columnheader"
                  scope="col"
                  aria-sort={col.sortable ? 'none' : undefined}
                >
                  {col.headerRender ? col.headerRender() : col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody className={classes.tableBody}>
            {paginatedData.length === 0 ? (
              <TableRow role="row">
                <TableCell 
                  colSpan={columns.length} 
                  align="center" 
                  style={{ padding: '2rem' }}
                  role="cell"
                  aria-live="polite"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              <AnimatePresence initial={false}>
                {paginatedData.map((row, rowIndex) => {
                  return (
                    <motion.tr
                      key={getRowKey(row, rowIndex)}
                      role="row"
                      aria-label={`Row ${currentPageStart + rowIndex} of ${totalItems}`}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 18 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 32, duration: 0.32 }}
                      style={{ background: 'inherit' }}
                    >
                      {columns.map((col, colIdx) => (
                        <TableCell 
                          key={colIdx} 
                          align={col.align || 'left'} 
                          className={col.className}
                          role="cell"
                          scope={colIdx === 0 ? 'row' : undefined}
                        >
                          {col.render
                            ? col.render(row, rowIndex)
                            : (col.accessor in row ? (row as Record<string, unknown>)[String(col.accessor)] as React.ReactNode : '')}
                        </TableCell>
                      ))}
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </TableBody>
        </Table>
        {pagination && (
          <div className={classes.stickyPagination} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center' }}>
              {footerLeftContent}
            </div>
            <div style={{ flex: '1 1 auto', display: 'flex', justifyContent: 'flex-end' }}>
              <TablePagination
                rowsPerPageOptions={rowsPerPageOptions}
                component="div"
                count={totalCount !== undefined ? totalCount : data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                aria-label="Table pagination"
                labelDisplayedRows={({ from, to, count }) => 
                  `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
                }
                labelRowsPerPage="Rows per page:"
                sx={{
                  backgroundColor: 'var(--mantine-color-brown-4)',
                  border: '4px solid var(--mantine-color-brown-3)',
                  fontFamily: 'Georgia, serif',
                  color: 'var(--mantine-color-brown-1)',
                  '.MuiTablePagination-toolbar': {
                    backgroundColor: 'inherit',
                    fontFamily: 'Georgia, serif',
                    color: 'var(--mantine-color-brown-1)',
                    minHeight: '56px',
                  },
                  '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows, .MuiSelect-select, .MuiTablePagination-actions': {
                    color: 'var(--mantine-color-brown-1)',
                    
                    fontFamily: 'Georgia, serif',
                  },
                  '.MuiInputBase-root': {
                    color: 'var(--mantine-color-brown-1)',
                    fontFamily: 'Georgia, serif',
                  },
                  '.MuiTablePagination-selectIcon': {
                    color: 'var(--mantine-color-brown-1)',
                  },
                  '.MuiIconButton-root': {
                    color: 'var(--mantine-color-brown-1)',
                    // backgroundColor: 'var(--mantine-color-brown-3)',
                  },
                }}
              />
            </div>
          </div>
        )}
      </TableContainer>
    </div>
  );
} 