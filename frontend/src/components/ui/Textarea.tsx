'use client';

import { forwardRef, useEffect, useRef } from 'react';

export interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  helperText?: string;
  maxRows?: number;
  minRows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  ({ className = '', error, label, helperText, maxRows = 10, minRows = 3, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const setRefs = (element: HTMLTextAreaElement) => {
      if (typeof ref === 'function') ref(element);
      else if (ref) ref.current = element;
      textareaRef.current = element;
    };

    // Automatic altitude change
    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Altitude loss
      textarea.style.height = 'auto';

      // Calculate the required height
      const computed = getComputedStyle(textarea);
      const lineHeight = parseInt(computed.lineHeight) || 20;
      const paddingTop = parseInt(computed.paddingTop) || 8;
      const paddingBottom = parseInt(computed.paddingBottom) || 8;

      const minHeight = lineHeight * minRows + paddingTop + paddingBottom;
      const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom;

      // Current height by content
      const scrollHeight = textarea.scrollHeight;

      // Setting the final height
      if (scrollHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.height = `${Math.max(scrollHeight, minHeight)}px`;
        textarea.style.overflowY = 'hidden';
      }
    };

    useEffect(() => { adjustHeight() }, [props.value]);

    const baseStyles = `
      w-full px-3 py-2 border rounded-lg 
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
      placeholder:text-gray-400
      resize-none
      overflow-hidden
    `;

    const errorStyles = error
      ? 'border-red-500 bg-red-50'
      : 'border-gray-300 hover:border-gray-400';

    const disabledStyles = props.disabled
      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
      : 'bg-white text-gray-900';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}

        <textarea
          ref={setRefs}
          onInput={adjustHeight}
          className={`
            ${baseStyles}
            ${errorStyles}
            ${disabledStyles}
            ${className}
          `}
          rows={minRows}
          {...props}
        />

        {(error || helperText) && (
          <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {error || helperText}
          </p>
        )}

        <div className="mt-1 text-xs text-gray-500 flex justify-between">
          <span>
            {typeof props.value === 'string' && props.maxLength
              ? `${props.value.length}/${props.maxLength} symbols`
              : ''}
          </span>
          <span>Automatic height</span>
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';