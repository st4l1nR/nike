import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CartItem } from "../components";
import { useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import Button from '../components/Button'


const cart = () => {
  const cart = useSelector((state: RootState) => state.cart.value);
  if (cart?.attributes.cartItems[0]) {
    return (
      <div className="flex flex-col space-y-10 md:space-y-0 md:flex-row">
        <div className="flex flex-col space-y-8 md:basis-2/4">
          <span className="text-lg ">Bag</span>
          {cart.attributes?.cartItems.map((cartItem, idx) => (
            <CartItem cartId={cart.id} {...cartItem} key={idx} />
          ))}
        </div>
        <div className="hidden shrink basis-1/4 md:block"></div>
        <div className="flex flex-col md:px-5 space-y-3 md:basis-2/4">
          <span className="text-lg">Summary</span>
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between font-thin">
              <span>Subtotal</span>
              <span>${cart.attributes.total}</span>
            </div>
            <div className="flex justify-between font-thin">
              <span>Estimated shipping</span>
              <span>$0</span>
            </div>
          </div>
          <div className="flex items-center justify-between h-12 mt-5 border-t border-b border-gray-200">
            <span>Total</span>
            <span>${cart.attributes.total}</span>
          </div>
          <Link href="/checkout" passHref>
            <Button width="w-full">
              Checkout
            </Button>
          </Link>
        </div>
      </div>
    );
  } else
    return (
      <div className="flex flex-col items-center justify-center space-y-3">
        <img
          className="max-w-md"
          src="/images/GroovySittingDoodle.svg"
          alt=""
        />
        <Link href='/' passHref>
         <Button>Add products</Button>
        </Link>
      </div>
    );
};

export default cart;
