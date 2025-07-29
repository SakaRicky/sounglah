import type { SounglahTableColumn } from '@/components/atoms/Table';
import { Checkbox, Tooltip, IconButton } from '@mui/material';
import type { User } from '../../api/users';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import SecurityIcon from '@mui/icons-material/Security';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export function getUserTableColumns({
  selectedIds,
  handleSelectRow,
  selectAllChecked,
  selectAllIndeterminate,
  handleSelectAll,
  handleEditClick,
  handleDeleteClick,
  actionsHeader,
  isMobile = false,
  isMediumScreen = false,
}: {
  selectedIds: Set<number>;
  handleSelectRow: (id: number, checked: boolean) => void;
  selectAllChecked: boolean;
  selectAllIndeterminate: boolean;
  handleSelectAll: (checked: boolean) => void;
  handleEditClick: (row: User) => void;
  handleDeleteClick: (row: User) => void;
  actionsHeader?: React.ReactNode;
  isMobile?: boolean;
  isMediumScreen?: boolean;
}): SounglahTableColumn<User>[] {
  // Hide Email and Created At on mobile and medium screens
  const shouldHideEmail = isMobile;
  const shouldHideCreatedAt = isMobile || isMediumScreen;

  return [
    {
      label: '',
      accessor: 'select',
      headerRender: () => (
        <Checkbox
          checked={selectAllChecked}
          indeterminate={selectAllIndeterminate}
          onChange={(e) => handleSelectAll(e.target.checked)}
          aria-label="Select all users on this page"
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
          aria-label={`Select user ${row.id}`}
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
      label: 'Username',
      accessor: 'username',
      headerRender: () => (
        <><PersonIcon style={{ fontSize: 18, verticalAlign: 'middle', marginRight: 4, color: 'var(--mantine-color-brown-6)' }} /> Username</>
      ),
      render: (row: User) => (
        <span style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 6,
          fontSize: '1rem',
          fontWeight: 500
        }}>
          <PersonIcon style={{ fontSize: 18, color: 'var(--mantine-color-brown-6)' }} />
          {row.username}
        </span>
      ),
    },
    // Hide Email column on mobile and medium screens
    ...(!shouldHideEmail ? [{
      label: 'Email',
      accessor: 'email',
      headerRender: () => (
        <><EmailIcon style={{ fontSize: 18, verticalAlign: 'middle', marginRight: 4, color: 'var(--mantine-color-brown-6)' }} /> Email</>
      ),
      render: (row: User) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <EmailIcon style={{ fontSize: 18, color: 'var(--mantine-color-brown-6)' }} />
          {row.email}
        </span>
      ),
    }] : []),
    {
      label: 'Role',
      accessor: 'role',
      headerRender: () => (
        <><SecurityIcon style={{ fontSize: 18, verticalAlign: 'middle', marginRight: 4, color: 'var(--mantine-color-brown-6)' }} /> Role</>
      ),
      render: (row: User) => {
        let icon = <PersonIcon style={{ fontSize: 18, color: 'var(--mantine-color-brown-6)' }} />;
        if (row.role.toLowerCase() === 'admin') icon = <SecurityIcon style={{ fontSize: 18, color: '#d32f2f' }} />;
        else if (row.role.toLowerCase() === 'editor') icon = <EditOutlinedIcon style={{ fontSize: 18, color: 'var(--mantine-color-orange-6)' }} />;
        else if (row.role.toLowerCase() === 'viewer') icon = <VisibilityIcon style={{ fontSize: 18, color: 'var(--mantine-color-brown-6)' }} />;
        else if (row.role.toLowerCase() === 'reviewer') icon = <PersonIcon style={{ fontSize: 18, color: 'var(--mantine-color-green-7)' }} />;
        return (
          <span style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 6, 
            fontWeight: 600, 
            textTransform: 'capitalize', 
            color: row.role === 'admin' ? '#d32f2f' : 'var(--mantine-color-brown-7)',
            fontSize: '1rem'
          }}>
            {icon}
            {row.role}
          </span>
        );
      },
    },
    // Hide Created At on mobile and medium screens
    ...(!shouldHideCreatedAt ? [{
      label: 'Created At',
      accessor: 'created_at',
      headerRender: () => (
        <><CalendarTodayIcon style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4, color: 'var(--mantine-color-brown-6)' }} /> Created At</>
      ),
      render: (row: User) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CalendarTodayIcon style={{ fontSize: 16, color: 'var(--mantine-color-brown-6)' }} />
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    }] : []),
    {
      label: '',
      accessor: 'actions',
      headerRender: actionsHeader ? () => actionsHeader : () => null,
      render: (row) => (
        <span style={{ 
          display: 'flex', 
          gap: '0.2rem', 
          alignItems: 'center' 
        }}>
          <Tooltip title={`Edit user ${row.username}`}>
            <span>
              <IconButton
                onClick={() => handleEditClick(row)}
                size="small"
                style={{ 
                  color: 'var(--mantine-color-brown-1)',
                  width: 32,
                  height: 32
                }}
                aria-label={`Edit user ${row.username}`}
              >
                <EditIcon style={{ fontSize: 18 }} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={`Delete user ${row.username}`}>
            <span>
              <IconButton
                onClick={() => handleDeleteClick(row)}
                size="small"
                style={{ 
                  color: 'var(--mantine-color-red-5)',
                  width: 32,
                  height: 32
                }}
                aria-label={`Delete user ${row.username}`}
              >
                <DeleteIcon style={{ fontSize: 18 }} />
              </IconButton>
            </span>
          </Tooltip>
        </span>
      ),
    },
  ];
} 