import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
interface BaseFieldProps {
    label: string;
    hint?: string;
    error?: string;
    rightAddon?: ReactNode;
}
type TextFieldProps = BaseFieldProps & InputHTMLAttributes<HTMLInputElement> & {
    kind?: 'input';
};
type SelectFieldProps = BaseFieldProps & SelectHTMLAttributes<HTMLSelectElement> & {
    kind: 'select';
    options: Array<{
        label: string;
        value: string;
    }>;
};
export type FormFieldProps = TextFieldProps | SelectFieldProps;
export declare const FormField: (props: FormFieldProps) => JSX.Element;
export {};
