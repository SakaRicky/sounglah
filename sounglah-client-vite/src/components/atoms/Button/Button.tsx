import React from 'react'
import { Button } from '@mantine/core';
import classNames from 'classnames';
import './Button.scss';

export interface AppButtonProps {
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
    h?: string;
    onClick: () => void;
    children: React.ReactNode;
}

const AppButton: React.FC<AppButtonProps> = ({ variant, disabled, h="3rem", onClick, children }: AppButtonProps) => {
    const className = classNames('btn', `btn-${variant}`, {'btn-disabled': disabled})

    return (
        <Button
            onClick={onClick}
            className={className}
            radius="md"
            fz="1.2rem"
            fullWidth
            h={h}
        >
            {children}
        </Button>
    )
}

export default AppButton
