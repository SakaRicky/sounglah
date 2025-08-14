import React, { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { theme } from '@/theme';
import classes from './DateRangePicker.module.scss';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, parseISO } from 'date-fns';
import type { TextFieldProps } from '@mui/material/TextField';

const beige2 = theme.colors?.beige?.[2] || '#FFEFD6';
const deepBrown = theme.colors?.deepBrown || '#4e3b2a';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const [startDateError, setStartDateError] = useState('');
  const [endDateError, setEndDateError] = useState('');

  const validateDate = (date: Date | null): boolean => {
    if (!date) return true;
    return !isNaN(date.getTime());
  };

  const validateDateRange = (start: Date | null, end: Date | null): boolean => {
    if (!start || !end) return true;
    return start <= end;
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartDateError('');
    if (date && !validateDate(date)) {
      setStartDateError('Invalid date format');
      return;
    }
    if (date && endDate && !validateDateRange(date, endDate ? parseISO(endDate) : null)) {
      setEndDateError('End date must be after start date');
      return;
    } else {
      setEndDateError('');
    }
    onStartDateChange(date ? format(date, 'yyyy-MM-dd') : '');
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDateError('');
    if (date && !validateDate(date)) {
      setEndDateError('Invalid date format');
      return;
    }
    if (startDate && date && !validateDateRange(parseISO(startDate), date)) {
      setEndDateError('End date must be after start date');
      return;
    }
    onEndDateChange(date ? format(date, 'yyyy-MM-dd') : '');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className={classes.dateRangeContainer}>
        <div className={classes.dateField}>
          <DatePicker
            label="Start"
            value={startDate ? parseISO(startDate) : null}
            onChange={handleStartDateChange}
            format="yyyy-MM-dd"
            slotProps={{
              textField: {
                error: !!startDateError,
                helperText: startDateError,
                size: 'small',
                fullWidth: true,
                sx: {
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: beige2,
                    width: '100%',
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: deepBrown,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.colors?.brown?.[4] || '#A6795D',
                    },
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.colors?.brown?.[4] || '#A6795D',
                    boxShadow: `0 0 0 2px ${beige2}`,
                  },
                  '& .MuiInputLabel-root': {
                    color: deepBrown,
                    fontFamily: 'Georgia, serif',
                    fontWeight: 600,
                  },
                  '& .MuiInputBase-input': {
                    fontFamily: 'Georgia, serif',
                    color: deepBrown,
                  },
                },
                InputLabelProps: {
                  shrink: true,
                },
              } as Partial<TextFieldProps>,
            }}
            disableFuture={false}
          />
        </div>
        <div className={classes.dateField}>
          <DatePicker
            label="End"
            value={endDate ? parseISO(endDate) : null}
            onChange={handleEndDateChange}
            format="yyyy-MM-dd"
            slotProps={{
              textField: {
                error: !!endDateError,
                helperText: endDateError,
                size: 'small',
                fullWidth: true,
                sx: {
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: beige2,
                    width: '100%',
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: deepBrown,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.colors?.brown?.[4] || '#A6795D',
                    },
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.colors?.brown?.[4] || '#A6795D',
                    boxShadow: `0 0 0 2px ${beige2}`,
                  },
                  '& .MuiInputLabel-root': {
                    color: deepBrown,
                    fontFamily: 'Georgia, serif',
                    fontWeight: 600,
                  },
                  '& .MuiInputBase-input': {
                    fontFamily: 'Georgia, serif',
                    color: deepBrown,
                  },
                },
                InputLabelProps: {
                  shrink: true,
                },
              } as Partial<TextFieldProps>,
            }}
            disableFuture={false}
          />
        </div>
      </div>
    </LocalizationProvider>
  );
}; 