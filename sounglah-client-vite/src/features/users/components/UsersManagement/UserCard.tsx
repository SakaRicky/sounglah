import React from 'react';
import { Card, CardContent, Typography, IconButton, Tooltip, Checkbox } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import type { User } from '../../api/users';
import classes from './UserCard.module.scss';

interface UserCardProps {
  user: User;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <SecurityIcon style={{ fontSize: 20, color: '#d32f2f' }} />;
      case 'editor':
        return <EditOutlinedIcon style={{ fontSize: 20, color: 'var(--mantine-color-orange-6)' }} />;
      case 'viewer':
        return <VisibilityIcon style={{ fontSize: 20, color: 'var(--mantine-color-brown-6)' }} />;
      case 'reviewer':
        return <PersonIcon style={{ fontSize: 20, color: 'var(--mantine-color-green-7)' }} />;
      default:
        return <PersonIcon style={{ fontSize: 20, color: 'var(--mantine-color-brown-6)' }} />;
    }
  };

  return (
    <Card className={classes.userCard}>
      <CardContent className={classes.cardContent}>
        <div className={classes.cardHeader}>
          <div className={classes.userInfo}>
            <Checkbox
              checked={isSelected}
              onChange={(e) => onSelect(e.target.checked)}
              aria-label={`Select user ${user.username}`}
              size="small"
              sx={{
                color: 'var(--mantine-color-brown-9)',
                '&.Mui-checked': {
                  color: 'var(--mantine-color-brown-9)',
                },
              }}
            />
            <div className={classes.userDetails}>
              <div className={classes.username}>
                <PersonIcon className={classes.userIcon} />
                <Typography variant="h6" component="span">
                  {user.username}
                </Typography>
              </div>
              <div className={classes.role}>
                {getRoleIcon(user.role)}
                <Typography variant="body2" component="span">
                  {user.role}
                </Typography>
              </div>
            </div>
          </div>
          <div className={classes.actions}>
            <Tooltip title={`Edit user ${user.username}`}>
              <IconButton
                onClick={() => onEdit(user)}
                size="medium"
                className={classes.editButton}
                aria-label={`Edit user ${user.username}`}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={`Delete user ${user.username}`}>
              <IconButton
                onClick={() => onDelete(user)}
                size="medium"
                className={classes.deleteButton}
                aria-label={`Delete user ${user.username}`}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 