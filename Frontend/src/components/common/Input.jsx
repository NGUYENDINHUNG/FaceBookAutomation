import PropTypes from 'prop-types';

const Input = ({
    label,
    error,
    className = '',
    type = 'text',
    required = false,
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                type={type}
                className={`
                    w-full rounded-md border-gray-300
                    focus:border-blue-500 focus:ring-blue-500
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    ${className}
                `}
                required={required}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

Input.propTypes = {
    label: PropTypes.string,
    error: PropTypes.string,
    className: PropTypes.string,
    type: PropTypes.string,
    required: PropTypes.bool
};

export default Input;