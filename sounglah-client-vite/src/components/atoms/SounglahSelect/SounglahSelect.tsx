import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { theme } from '@/theme';

export interface SounglahSelectOption {
  value: string;
  label: string;
}

interface SounglahSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  data: SounglahSelectOption[];
  id?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
  error?: boolean;
  backgroundColor?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  disabled?: boolean;
}

export function SounglahSelect({
  label,
  value,
  onChange,
  data,
  id,
  required,
  className,
  placeholder,
  error = false,
  backgroundColor,
  ariaLabel,
  ariaDescribedBy,
  disabled = false,
}: SounglahSelectProps) {
  const beige = theme.colors?.beige?.[0] || '#FFF4E5';
  const bg = backgroundColor || beige;
  const borderColor = error ? '#d32f2f' : '#b48a4a';
  const borderColorFocus = error ? '#d32f2f' : '#a06a1a';
  
  const selectId = id || `sounglah-select-${Math.random().toString(36).substr(2, 9)}`;
  const labelId = `${selectId}-label`;
  
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(event.key)) {
      return;
    }
  };

  return (
    <FormControl 
      fullWidth 
      required={required} 
      className={className} 
      size="small" 
      variant="outlined"
      error={error}
      disabled={disabled}
    >
      {label && (
        <InputLabel 
          id={labelId}
          htmlFor={selectId}
        >
          {label}
        </InputLabel>
      )}
      <Select
        labelId={labelId}
        id={selectId}
        value={value}
        label={label}
        onChange={e => onChange(e.target.value)}
        displayEmpty
        disabled={disabled}
        aria-label={ariaLabel || label || placeholder}
        aria-describedby={ariaDescribedBy}
        aria-invalid={error}
        aria-required={required}
        onKeyDown={handleKeyDown}
        MenuProps={{
          PaperProps: {
            sx: {
              background: bg,
              borderRadius: '6px',
              mt: 1,
            },
          },
          disableScrollLock: true,
          keepMounted: false,
        }}
        sx={{
          background: bg,
          borderRadius: '6px',
          minHeight: '40px',
          minWidth: '180px',
          fontFamily: 'inherit',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: borderColor,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: borderColorFocus,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: borderColorFocus,
            boxShadow: `0 0 0 2px ${bg}`,
          },
          '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e0e0e0',
          },
        }}
        renderValue={selected => {
          if (!selected) {
            return <span style={{ color: '#aaa' }}>{placeholder || 'Pick value'}</span>;
          }
          return data.find(opt => opt.value === selected)?.label || '';
        }}
      >
        {data.map(opt => (
          <MenuItem 
            key={opt.value} 
            value={opt.value}
            aria-selected={value === opt.value}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
} 