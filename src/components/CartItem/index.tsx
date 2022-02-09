import React, { useState } from "react";
import Image from "next/image";
import { Trash2, Minus, Plus } from "react-feather";
import type { ComponentProductCartItem } from "../../generated/graphql";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { deleteCartItem, updateCartItem } from "../../features/cartSlice";

type props = ComponentProductCartItem & {
  cartId: string;
};

const index = ({
  cartId,
  id,
  name,
  image,
  variant,
  product,
  quantity,
  price,
}: props) => {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div className="relative flex flex-col space-y-3 md:flex-row md:space-x-4">
      <div className="relative h-36 md:basis-2/4">
        <Image
          unoptimized={true}
          src={image.data?.attributes.url}
          layout="fill"
          objectFit="contain"
        />
      </div>
      <div className="flex flex-col space-y-3 md:basis-3/4">
        <span className="font-bold">{name}</span>
        <span className="font-thin">{product.data.attributes.description}</span>
        <div className="flex space-x-2 text-gray-400">
          <span>{variant.data?.attributes.name.toUpperCase()}</span>
          <span>${price}</span>
        </div>
        <div className="flex space-x-4">
          <div className={`flex items-center justify-between w-24`}>
            <Minus
              className="cursor-pointer"
              onClick={() =>
                dispatch(
                  updateCartItem({
                    id: cartId,
                    cartItemId: id,
                    quantity: quantity === 1 ? 1 : quantity - 1,
                  })
                )
              }
            />
            <div className="cursor-pointer">{quantity}</div>
            <Plus
              className="cursor-pointer"
              onClick={() =>
                dispatch(
                  updateCartItem({
                    id: cartId,
                    cartItemId: id,
                    quantity: quantity + 1,
                  })
                )
              }
            />
          </div>
          <Trash2
            className="cursor-pointer"
            onClick={() =>
              dispatch(
                deleteCartItem({
                  id: cartId,
                  cartItemId: id,
                })
              )
            }
          />
        </div>
      </div>
    </div>
  );
};

export default index;
