import * as React from 'react';
import MuiButton from '@mui/material/Button';

export default function Button({ children,
    variant = 'contained',
    onClick = () => { },
    className = '',
    size = '',
    component = 'button',
    sx,
    disabled = false
}) {
    const variantStyles = {
        contained: {
            bgcolor: "background.primary",
            color: "text.light",
            "&:hover": { bgcolor: "background.secondary" },
        },
        outlined: {
            // bgcolor: "background.primary",
            color: "text.primary",
            "&:hover": { bgcolor: "background.light" },
            border: "2px solid background.secondary"
        },
        text: {
            // bgcolor: "background.primary",
            color: "text.primary",
            "&:hover": { bgcolor: "background.light" },
        },
    };
    return <MuiButton
        variant={variant}
        onClick={onClick}
        sx={{ ...variantStyles[variant], ...sx }}
        className={`!py-2 !my-4 transition ${className}`}
        size={size}
        component={component}
        disabled={disabled}>{children}
    </MuiButton>
}
