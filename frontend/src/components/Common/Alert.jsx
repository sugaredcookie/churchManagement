import { FiInfo, FiAlertCircle, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi'

const Alert = ({ type = 'info', message, className = '' }) => {
  const types = {
    info: {
      icon: FiInfo,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      iconColor: 'text-blue-600',
    },
    success: {
      icon: FiCheckCircle,
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      iconColor: 'text-green-600',
    },
    warning: {
      icon: FiAlertTriangle,
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      iconColor: 'text-yellow-600',
    },
    error: {
      icon: FiAlertCircle,
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      iconColor: 'text-red-600',
    },
  }

  const { icon: Icon, bg, border, text, iconColor } = types[type]

  return (
    <div className={`${bg} border ${border} rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 ${iconColor} mt-0.5`} />
        <p className={`text-sm ${text}`}>{message}</p>
      </div>
    </div>
  )
}

export default Alert