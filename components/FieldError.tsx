import React from 'react';

interface FieldErrorProps {
  error?: string | string[];
  className?: string;
}

/**
 * Field Error Component
 * Displays validation error message(s) below form fields
 */
export const FieldError: React.FC<FieldErrorProps> = ({ error, className = '' }) => {
  if (!error) return null;

  const errors = Array.isArray(error) ? error : [error];

  return (
    <div className={`text-red-600 text-sm mt-1 ${className}`}>
      {errors.map((err, index) => (
        <div key={index}>{err}</div>
      ))}
    </div>
  );
};

/**
 * Extract field error from API error response
 */
export const getFieldError = (
  errors: Record<string, string[]> | undefined,
  fieldName: string
): string | undefined => {
  if (!errors || !errors[fieldName]) return undefined;
  return errors[fieldName][0]; // Return first error
};

/**
 * Hook to manage form errors
 */
export const useFormErrors = () => {
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});

  const setFieldErrors = (apiErrors: Record<string, string[]>) => {
    setErrors(apiErrors);
  };

  const clearErrors = () => {
    setErrors({});
  };

  const clearFieldError = (fieldName: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const getError = (fieldName: string): string | undefined => {
    return errors[fieldName]?.[0];
  };

  const hasError = (fieldName: string): boolean => {
    return !!errors[fieldName];
  };

  return {
    errors,
    setFieldErrors,
    clearErrors,
    clearFieldError,
    getError,
    hasError,
  };
};
