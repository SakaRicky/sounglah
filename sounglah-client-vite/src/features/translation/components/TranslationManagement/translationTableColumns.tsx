import type { SounglahTableColumn } from '@/components/atoms/Table';
import { Checkbox, Tooltip, IconButton } from '@mui/material';
import { ActionIcons } from '@/components/atoms/ActionIcons';
import type { Translation } from '../../api/types';
import type { User } from '@/types';

export function getTranslationTableColumns({
  selectedIds,
  handleSelectRow,
  selectAllChecked,
  selectAllIndeterminate,
  handleSelectAll,
  getStatusBadge,
  reviewers,
  handleEditClick,
  handleApprove,
  handleDeny,
  actionsHeader,
}: {
  selectedIds: Set<number>;
  handleSelectRow: (id: number, checked: boolean) => void;
  selectAllChecked: boolean;
  selectAllIndeterminate: boolean;
  handleSelectAll: (checked: boolean) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  reviewers: User[];
  handleEditClick: (row: Translation) => void;
  handleApprove: (row: Translation) => void;
  handleDeny: (row: Translation) => void;
  actionsHeader?: React.ReactNode;
}): SounglahTableColumn<Translation>[] {
  return [
    {
      label: '',
      accessor: 'select',
      headerRender: () => (
        <Checkbox
          checked={selectAllChecked}
          indeterminate={selectAllIndeterminate}
          onChange={(e) => handleSelectAll(e.target.checked)}
          aria-label="Select all translations on this page"
          size="small"
          sx={{
            color: 'var(--mantine-color-brown-9)',
            '&.Mui-checked': {
              color: 'var(--mantine-color-brown-9)',
            },
            '&.MuiCheckbox-indeterminate': {
              color: 'var(--mantine-color-brown-9)',
            },
          }}
        />
      ),
      render: (row) => (
        <Checkbox
          checked={selectedIds.has(row.id)}
          onChange={(e) => handleSelectRow(row.id, e.target.checked)}
          aria-label={`Select translation ${row.id}`}
          size="small"
          sx={{
            color: 'var(--mantine-color-brown-9)',
            '&.Mui-checked': {
              color: 'var(--mantine-color-brown-9)',
            },
          }}
        />
      ),
    },
    {
      label: 'Source Text',
      accessor: 'source_text',
    },
    {
      label: 'Source Language',
      accessor: 'source_language',
      render: (row) => row.source_language.name,
    },
    {
      label: 'Target Text',
      accessor: 'target_text',
    },
    {
      label: 'Status',
      accessor: 'status',
      render: (row) => getStatusBadge(row.status),
    },
    {
      label: 'Reviewer',
      accessor: 'reviewer',
      render: (_row, idx) => reviewers.length > 0 ? reviewers[idx % reviewers.length].username : '',
    },
    {
      label: '',
      accessor: 'actions',
      headerRender: actionsHeader ? () => actionsHeader : () => null,
      render: (row) => (
        <span style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
          <Tooltip title={`Edit translation ${row.id}`}>
            <span>
              <IconButton
                onClick={() => handleEditClick(row)}
                size="small"
                style={{ color: 'var(--mantine-color-brown-1)' }}
                aria-label={`Edit translation ${row.id}`}
                aria-describedby={`edit-translation-${row.id}-description`}
              >
                <span role="img" aria-hidden="true">✏️</span>
              </IconButton>
            </span>
          </Tooltip>
          <ActionIcons
            onApprove={() => handleApprove(row)}
            onDeny={() => handleDeny(row)}
            disabledApprove={row.status === 'approved'}
            disabledDeny={row.status === 'rejected'}
            rowId={row.id}
          />
        </span>
      ),
    },
  ];
} 