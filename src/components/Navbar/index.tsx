import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X as Close, ArrowRight } from "react-feather";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { Transition } from "@headlessui/react";

const index = () => {
  const router = useRouter();
  const cart = useSelector((state: RootState) => state.cart.value);

  const [isMenu, setIsMenu] = useState(false);
  return (
    <div className="mb-12">
      {/*Navbar Desktop*/}
      <div className="hidden h-24 max-w-7xl mx-auto md:flex">
        <div className="flex items-center basis-1/4">
          <Link href="/">
            <img
              className="w-16 cursor-pointer"
              src="/icons/nike-logo.svg"
              alt=""
            />
          </Link>
        </div>
        <div className="flex items-center justify-center text-xl font-bold space-x-7 grow 2/4">
          <Link href="/categories/new">
            <span className="cursor-pointer">NEW RELEASES</span>
          </Link>
          <Link href="/categories/men">
            <span className="cursor-pointer">MEN</span>
          </Link>
          <Link href="/categories/women">
            <span className="cursor-pointer">WOMEN</span>
          </Link>
          <Link href="/categories/kids">
            <span className="cursor-pointer">KIDS</span>
          </Link>
        </div>
        <div className="flex items-center justify-end basis-1/4">
          <Link href="/cart">
            <div className="relative">
              <img
                className="cursor-pointer"
                src="/icons/shopping-bag.svg"
                alt=""
              />
              {cart && (
                <div className="w-5 text-sm h-5 rounded-full bg-black text-white flex justify-center items-center absolute -top-2 -right-2">
                  {cart.attributes.cartItems.length}
                </div>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/*Navbra mobile*/}
      <div className="md:hidden sticky flex items-center justify-between h-16">
        <Link href="/">
          <img
            className="w-16 cursor-pointer"
            src="/icons/nike-logo.svg"
            alt=""
          />
        </Link>
        <div className="flex space-x-4 items-center">
          <Link href="/cart">
            <div className="relative">
              <img
                className="cursor-pointer"
                src="/icons/shopping-bag.svg"
                alt=""
              />
              {cart && (
                <div className="w-5 text-sm h-5 rounded-full bg-black text-white flex justify-center items-center absolute -top-2 -right-2">
                  {cart.attributes.cartItems.length}
                </div>
              )}
            </div>
          </Link>

          <Menu className="cursor-pointer" onClick={() => setIsMenu(true)} />
        </div>
      </div>
      <Transition
        className="fixed inset-0 z-50  backdrop-blur-sm  pl-10"
        show={isMenu}
        enter="transition duration-100"
        enterFrom="transform translate-x-5"
        enterTo="transform translate-x-0"
        leave="transtition duration-100"
        leaveFrom="transform translate-x-0"
        leaveTo="transform translate-x-5"
      >
        <div className="relative w-full h-full bg-white flex flex-col pt-10 px-10 space-y-6 text-2xl ">
          <Close
            className="absolute top-5 right-5 cursor-pointer"
            onClick={() => setIsMenu(false)}
          />
          <div
            className="cursor-pointer flex space-x-4 items-center"
            onClick={() => {
              setIsMenu(false);
              router.push("/categories/new");
            }}
          >
            <span>New Releases</span>
            <img
              className="w-5 h-5"
              src="/icons/chevron-right-solid.svg"
              alt=""
            />
          </div>
          <div
            className="cursor-pointer flex space-x-4 items-center"
            onClick={() => {
              setIsMenu(false);
              router.push("/categories/men");
            }}
          >
            <span>Men</span>
            <img
              className="w-5 h-5"
              src="/icons/chevron-right-solid.svg"
              alt=""
            />
          </div>
          <div
            className="cursor-pointer flex space-x-4 items-center"
            onClick={() => {
              setIsMenu(false);
              router.push("/categories/women");
            }}
          >
            <span>Women</span>
            <img
              className="w-5 h-5"
              src="/icons/chevron-right-solid.svg"
              alt=""
            />
          </div>
          <span
            className="cursor-pointer flex space-x-4 items-center"
            onClick={() => {
              setIsMenu(false);
              router.push("/categories/kids");
            }}
          >
            <span>Kids</span>
            <img
              className="w-5 h-5"
              src="/icons/chevron-right-solid.svg"
              alt=""
            />
          </span>
        </div>
      </Transition>
    </div>
  );
};

export default index;
