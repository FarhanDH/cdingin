import { ArrowLeft, Menu } from 'lucide-react';
import { Link } from 'react-router';

export default function Header({
  isSticky = false,
  showBack = false,
  title,
  showSidebar = true,
  showBorder = true,
  children,
}: Readonly<{
  isSticky?: boolean;
  showBorder?: boolean;
  showBack?: boolean;
  title: string;
  showSidebar?: boolean;
  children?: React.ReactNode;
}>) {
  return (
    <div
      className={`${
        isSticky ? 'sticky' : ''
      } top-0 bg-white z-100 px-4 pt-4 pb-2 border-b-gray-300 ${
        showBorder && 'border-b'
      }`}
    >
      <div className={`flex items-center justify-between mb-2`}>
        <div
          className={`flex items-center ${
            showSidebar ? 'justify-between' : 'justify-start gap-3'
          }`}
        >
          {showBack && (
            <Link to="/orders">
              <ArrowLeft size={24} className="text-gray-500" />
            </Link>
          )}
          <h1 className={`text-[20px] font-semibold ${showBack && 'mb-4'}`}>
            {title}
          </h1>
        </div>
        {/* {showSidebar && <Menu size={26} className="text-gray-500" />} */}
      </div>
      {children}
    </div>
  );
}
