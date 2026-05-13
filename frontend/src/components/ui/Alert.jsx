import { HiExclamationCircle, HiCheckCircle, HiInformationCircle } from 'react-icons/hi';

const variants = {
  error: {
    wrapper: 'bg-red-50 border border-red-200 text-red-700',
    icon: <HiExclamationCircle size={18} className="text-red-500 shrink-0" />,
  },
  success: {
    wrapper: 'bg-green-50 border border-green-200 text-green-700',
    icon: <HiCheckCircle size={18} className="text-green-500 shrink-0" />,
  },
  info: {
    wrapper: 'bg-indigo-50 border border-indigo-200 text-indigo-700',
    icon: <HiInformationCircle size={18} className="text-indigo-500 shrink-0" />,
  },
};

/**
 * Alert — inline alert banner (not a toast).
 * Use for general form errors above the submit button.
 */
export default function Alert({ message, variant = 'error', className = '' }) {
  if (!message) return null;

  const { wrapper, icon } = variants[variant] || variants.error;

  return (
    <div
      role="alert"
      className={`flex items-start gap-2.5 px-4 py-3 rounded-lg text-sm font-medium ${wrapper} ${className}`}
    >
      {icon}
      <span>{message}</span>
    </div>
  );
}
