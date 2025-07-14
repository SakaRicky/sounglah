import type { SounglahTableColumn } from '@/components/atoms/Table';
import { Checkbox, Tooltip, IconButton } from '@mui/material';
import { ActionIcons } from '@/components/atoms/ActionIcons';
import type { Translation } from '../../api/types';
import type { User } from '@/types';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';

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
  getStatusBadge: (status: string, isMobile?: boolean) => React.ReactNode;
  reviewers: User[];
  handleEditClick: (row: Translation) => void;
  handleApprove: (row: Translation) => void;
  handleDeny: (row: Translation) => void;
  actionsHeader?: React.ReactNode;
}): SounglahTableColumn<Translation>[] {
  // Responsive: hide columns on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

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
    // Hide Source Language on mobile
    ...(!isMobile ? [{
      label: 'Source Language',
      accessor: 'source_language',
      render: (row) => row.source_language.name,
    }] : []),
    {
      label: 'Target Text',
      accessor: 'target_text',
    },
    {
      label: 'Status',
      accessor: 'status',
      render: (row) => getStatusBadge(row.status, isMobile),
    },
    // Hide Reviewer on mobile
    ...(!isMobile ? [{
      label: 'Reviewer',
      accessor: 'reviewer',
      render: (_row, idx) => reviewers.length > 0 ? reviewers[idx % reviewers.length].username : '',
    }] : []),
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

// Status badge helper
export function getStatusBadge(status: string, isMobile = false) {
  let icon = null;
  let color = '';
  let text = '';
  switch (status) {
    case 'approved':
      icon = <CheckCircleIcon style={{ fontSize: isMobile ? 22 : 18 }} />;
      color = '#078930';
      text = 'Approved';
      break;
    case 'pending':
      icon = <HourglassEmptyIcon style={{ fontSize: isMobile ? 22 : 18 }} />;
      color = '#fde642';
      text = 'Pending';
      break;
    case 'rejected':
      icon = <CancelIcon style={{ fontSize: isMobile ? 22 : 18 }} />;
      color = '#d32f2f';
      text = 'Rejected';
      break;
    default:
      icon = null;
      color = '#ccc';
      text = status;
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        background: color,
        color: status === 'pending' ? '#4e3b2a' : '#fff',
        width: isMobile ? 32 : 'auto',
        height: isMobile ? 32 : 'auto',
        minWidth: isMobile ? 32 : 0,
        minHeight: isMobile ? 32 : 0,
        fontWeight: 600,
        fontSize: isMobile ? 18 : 15,
        padding: isMobile ? 0 : '2px 12px',
        boxShadow: isMobile ? '0 2px 8px rgba(0,0,0,0.10)' : undefined,
        margin: '0 auto',
      }}
    >
      {icon}
      {!isMobile && <span style={{ marginLeft: 8 }}>{text}</span>}
    </span>
  );
} 