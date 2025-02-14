interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Container({ children, className, ...props }: ContainerProps) {
  return (
    <div 
      className={`max-w-[1800px] w-[98%] mx-auto px-8 ${className ?? ''}`}
      {...props}
    >
      {children}
    </div>
  );
} 