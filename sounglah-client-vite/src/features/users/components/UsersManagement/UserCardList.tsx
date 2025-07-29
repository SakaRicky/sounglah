import React from 'react';
import { Typography, Box } from '@mui/material';
import { UserCard } from './UserCard';
import type { User } from '../../api/users';
import classes from './UserCardList.module.scss';

interface UserCardListProps {
  users: User[];
  selectedIds: Set<number>;
  onSelectUser: (id: number, checked: boolean) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
}

export const UserCardList: React.FC<UserCardListProps> = ({
  users,
  selectedIds,
  onSelectUser,
  onEditUser,
  onDeleteUser,
}) => {
  if (users.length === 0) {
    return (
      <Box className={classes.emptyState}>
        <Typography variant="body1" color="text.secondary">
          No users found.
        </Typography>
      </Box>
    );
  }

  return (
    <div className={classes.cardList}>
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          isSelected={selectedIds.has(user.id)}
          onSelect={(checked) => onSelectUser(user.id, checked)}
          onEdit={onEditUser}
          onDelete={onDeleteUser}
        />
      ))}
    </div>
  );
}; 