import * as React from 'react';
import TextField from '@mui/material/TextField';

export default function Input({
    variant = "outlined",
    type = "text",
    placeholder,
    value = '',
    onChange = () => { },
    className = '',
    label = 'Input',
    disabled = false,
    margin,
    name,
    error,
    inputProps,
    size
}) {
    
    return <TextField
        label={label}
        variant={variant}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={className}
        disabled={disabled}
        margin={margin}
        name={name}
        error={error}
        inputProps={inputProps}
        size={size} />
}
