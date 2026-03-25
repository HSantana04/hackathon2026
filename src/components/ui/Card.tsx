import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`px-6 py-5 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '' }: CardProps) => {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  );
};

export const CardContent = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`px-6 py-5 ${className}`}>
      {children}
    </div>
  );
};
