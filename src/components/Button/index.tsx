import React from "react";
import {CircularProgress} from '@mui/material'

type props = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  href?: string;
  loading?:boolean;
  width?: string;
  height?: string;
  rounded?: string;
  textSize?: string;
  children;
};
import Link from "next/link";

const index = React.forwardRef(
  (
    {
      href,
      loading,
      width = "w-32",
      height = "h-12",
      rounded = "rounded-sm",
      textSize,
      children,
      type="button",
      ...props
    }: props,
    ref: any
  ) => {
    const dynamicStyle = `${width} ${rounded} ${height} ${textSize}`;
    if (href) {
      return (
        <Link href={href}>
          <button
            className={`${dynamicStyle} mt-5 font-light text-white transition-colors ease-in-out bg-black hover:bg-white hover:text-black hover:border-black hover:border`}
            type={type}
            {...props}
          >
            {children}
          </button>
        </Link>
      );
    } else
      return (
        <button
          className={`${dynamicStyle} mt-5 font-light text-white transition-colors ease-in-out bg-black hover:bg-white hover:text-black hover:border-black hover:border`}
          type={type}
          {...props}
        >
          {loading ? <CircularProgress size={30} color='inherit'/> : children}
        </button>
      );
  }
);

export default index;
