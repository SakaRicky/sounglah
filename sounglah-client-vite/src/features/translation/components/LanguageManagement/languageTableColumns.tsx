import React from 'react';
import { IconButton, Tooltip, Checkbox } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Language } from '../../api/languages';
import type { SounglahTableColumn } from '@/components/atoms/Table/SounglahTable';

interface LanguageTableColumnsProps {
  selectedIds: Set<number>;
  handleSelectRow: (id: number, checked: boolean) => void;
  selectAllChecked: boolean;
  selectAllIndeterminate: boolean;
  handleSelectAll: (checked: boolean) => void;
  handleEditClick: (language: Language) => void;
  handleDeleteClick: (language: Language) => void;
  actionsHeader?: React.ReactNode;
}

export const getLanguageTableColumns = ({
  selectedIds,
  handleSelectRow,
  selectAllChecked,
  selectAllIndeterminate,
  handleSelectAll,
  handleEditClick,
  handleDeleteClick,
  actionsHeader,
}: LanguageTableColumnsProps): SounglahTableColumn<Language>[] => [
  {
    label: '',
    accessor: 'id',
    headerRender: () => (
      <Checkbox
        checked={selectAllChecked}
        indeterminate={selectAllIndeterminate}
        onChange={(e) => handleSelectAll(e.target.checked)}
        size="small"
      />
    ),
    render: (language: Language) => (
      <Checkbox
        checked={selectedIds.has(language.id)}
        onChange={(e) => handleSelectRow(language.id, e.target.checked)}
        size="small"
      />
    ),
    align: 'center',
  },
  {
    label: 'Language Name',
    accessor: 'name',
    render: (language: Language) => (
      <div style={{ fontWeight: 600, color: '#6d4c1b' }}>
        {language.name}
      </div>
    ),
  },
  {
    label: 'ISO Code',
    accessor: 'iso_code',
    render: (language: Language) => (
      <div style={{ fontFamily: 'monospace', color: '#8b6f3d' }}>
        {language.iso_code || '-'}
      </div>
    ),
  },
  {
    label: 'Region',
    accessor: 'region',
    render: (language: Language) => (
      <div style={{ color: '#a06a1a' }}>
        {language.region || '-'}
      </div>
    ),
  },
  {
    label: 'Description',
    accessor: 'description',
    render: (language: Language) => (
      <div style={{ color: '#b48a4a', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {language.description || '-'}
      </div>
    ),
  },
  {
    label: 'Actions',
    accessor: 'id',
    headerRender: () => actionsHeader || 'Actions',
    render: (language: Language) => (
      <div style={{ display: 'flex', gap: 4 }}>
        <Tooltip title="Edit Language">
          <IconButton
            size="small"
            onClick={() => handleEditClick(language)}
            sx={{ 
              color: '#1976d2',
              backgroundColor: 'rgba(25, 118, 210, 0.1)',
              width: 32,
              height: 32,
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.2)',
                transform: 'scale(1.05)',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)'
              }
            }}
          >
            <EditIcon style={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Language">
          <IconButton
            size="small"
            onClick={() => handleDeleteClick(language)}
            sx={{ 
              color: '#d32f2f',
              backgroundColor: 'rgba(211, 47, 47, 0.1)',
              width: 32,
              height: 32,
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(211, 47, 47, 0.2)',
                transform: 'scale(1.05)',
                boxShadow: '0 2px 8px rgba(211, 47, 47, 0.3)'
              }
            }}
          >
            <DeleteIcon style={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </div>
    ),
    align: 'center',
  },
]; 