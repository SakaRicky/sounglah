import React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { PiUserSoundDuotone } from 'react-icons/pi';
import { TbLanguageKatakana } from "react-icons/tb";
import { FaLanguage } from "react-icons/fa";
import classes from './TableNavigation.module.scss';

interface TableNavigationProps {
  selectedTable: 'translations' | 'users' | 'languages';
  onTableChange: (table: 'translations' | 'users' | 'languages') => void;
}

export const TableNavigation: React.FC<TableNavigationProps> = ({
  selectedTable,
  onTableChange,
}) => {
  const handleTableChange = (_e: React.MouseEvent<HTMLElement>, value: 'translations' | 'users' | 'languages' | null) => {
    if (value) {
      onTableChange(value);
    }
  };

  return (
    <div className={classes.segmentedControl}>
      <ToggleButtonGroup
        value={selectedTable}
        exclusive
        onChange={handleTableChange}
        aria-label="Table selector"
        size="small"
      >
        <ToggleButton value="translations" aria-label="Translations" className={classes.segmentedButton}>
          <TbLanguageKatakana style={{ marginRight: 8, fontSize: 20, verticalAlign: 'middle' }} />
          Translations
        </ToggleButton>
        <ToggleButton value="users" aria-label="Users" className={classes.segmentedButton}>
          <PiUserSoundDuotone style={{ marginRight: 8, fontSize: 20, verticalAlign: 'middle' }} />
          Users
        </ToggleButton>
        <ToggleButton value="languages" aria-label="Languages" className={classes.segmentedButton}>
          <FaLanguage style={{ marginRight: 8, fontSize: 20, verticalAlign: 'middle' }} />
          Languages
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  );
}; 