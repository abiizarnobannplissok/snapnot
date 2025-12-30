import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "transition-all duration-200 font-semibold active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-black text-white h-[40px] px-6 rounded-[20px] hover:bg-gray-800",
    secondary: "bg-white text-black border border-black/10 h-[40px] px-6 rounded-[20px] hover:bg-gray-50",
    icon: "w-[40px] h-[40px] rounded-full bg-white flex items-center justify-center hover:shadow-md",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
