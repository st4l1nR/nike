import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import client from "../../lib/apolloClient";
import { gql } from "@apollo/client";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { addCartItem } from "../../features/cartSlice";
import Cookies from "js-cookie";
import type { GetServerSideProps } from "next";
import type {
  ProductEntity,
  ProductEntityResponseCollection,
  VariantEntity,
  QueryProductsArgs,
} from "../../generated/graphql";
import type { RootState, AppDispatch } from "../../store";
import { useSelector } from "react-redux";
import { CircularProgress } from "@mui/material";
import { useRouter } from "next/router";

type props = {
  products: [ProductEntity];
};

type formData = {
  selectedOptions?: {
    [k: string]: string;
  };
};

const category = ({ products }: props) => {
  if (!products[0]) return <></>;

  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { category } = router.query as any;
  const [slide, setSlide] = useState(0);
  const product = products[slide];
  const [variant, setVaraint] = useState<VariantEntity | null>(null);
  const colors = product?.attributes.options
    .find((option) => option.name === "color")
    ?.values.map((value) => {
      if (value.name == "black" || value.name == "white")
        return `bg-${value.name}`;
      return `bg-${value.name}-400`;
    });

  const {
    register,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<formData>({
    defaultValues: {
      selectedOptions: products[0].attributes.variants.data[0]
        ? {
            color: products[0].attributes.options.find(
              (option) => option.name === "color"
            )?.values[0].name,
            size: products[0].attributes.options.find(
              (option) => option.name === "size"
            )?.values[0].name,
          }
        : null,
    },
  });
  const selectedOptions = watch("selectedOptions");

  useEffect(() => {
    const variant = product?.attributes.variants.data?.find(
      (variant) =>
        (variant.attributes.selectedOptions.color == selectedOptions.color &&
          variant.attributes.selectedOptions.size == selectedOptions.size) ||
        (!variant.attributes.selectedOptions.color &&
          variant.attributes.selectedOptions.size == selectedOptions.size)
    );
    setVaraint(variant);
  }, [JSON.stringify(selectedOptions)]);

  useEffect(() => {
    reset({
      selectedOptions: products[0].attributes.variants.data[0]
        ? {
            color: products[0].attributes.options.find(
              (option) => option.name === "color"
            )?.values[0].name,
            size: products[0].attributes.options.find(
              (option) => option.name === "size"
            )?.values[0].name,
          }
        : null,
    });
  }, [category]);

  const handleSlide = (action: "prev" | "next") => {
    let number;
    if (action === "next") {
      number = (slide + 1) % products.length;
    } else {
      number = slide === 0 ? products.length - 1 : slide - 1;
    }
    setSlide(number);
    setValue(
      "selectedOptions",
      products[number].attributes.variants.data[0]
        ? {
            color: products[number].attributes.options.find(
              (option) => option.name === "color"
            )?.values[0].name,
            size: products[number].attributes.options.find(
              (option) => option.name === "size"
            )?.values[0].name,
          }
        : null
    );
  };

  return (
    <>
      <div className="max-w-7xl mx-auto flex flex-col md:h-[80vh]">
        {products.map(({ id, attributes }, idx) => (
          <>
            {slide === idx && (
              <div
                className={`relative h-4/5 flex flex-col md:flex-row md:space-x-5 space-y-5 md:space-y-0 `}
                key={idx}
              >
                {/*Description*/}
                <div className="flex flex-col space-y-4 md:basis-2/5">
                  <span className="text-lg font-bold">
                    {category.toUpperCase()}
                  </span>
                  <span className="text-4xl font-bold md:text-5xl">
                    {attributes.name}
                  </span>
                  <span className="font-thin text:lg md:text-xl">
                    {attributes.description}
                  </span>
                </div>

                {/*Image*/}
                <div className="flex flex-col md:basis-3/5">
                  <div className="relative w-full h-64  md:h-[400px]">
                    <Image
                      key={product?.id}
                      unoptimized={true}
                      src={
                        variant?.attributes.image.data?.attributes
                          ? variant.attributes.image.data.attributes.url
                          : attributes.image.data.attributes.url
                      }
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                </div>

                {/*Mobile handleSlide*/}
                <div className="flex justify-center space-x-12 md:hidden ">
                  <div
                    className="flex flex-col items-center space-x-1"
                    onClick={() => handleSlide("prev")}
                  >
                    <span className="text-sm cursor-pointer">PREV</span>
                    <img
                      className="h-auto w-7"
                      src="/icons/left-arrow.svg"
                      alt=""
                    />
                  </div>
                  <div
                    className="flex flex-col items-center space-x-1"
                    onClick={() => handleSlide("prev")}
                  >
                    <span className="text-sm cursor-pointer">NEXT</span>
                    <img
                      className="h-auto w-7"
                      src="/icons/right-arrow.svg"
                      alt=""
                    />
                  </div>
                </div>

                {/*Select options*/}
                <div className="flex flex-col space-y-10 font-bold md:basis-1/4">
                  {attributes.options.map((option, idx) => (
                    <div className="flex flex-col space-y-5" key={idx}>
                      <span className="text-lg ">{`SELECT ${option.name.toUpperCase()}`}</span>
                      <div className="grid grid-cols-4 gap-5">
                        {option.values.map((value, idx) => (
                          <>
                            {option.name === "color" ? (
                              <input
                                className={`w-10 h-10 rounded-full cursor-pointer ${colors[idx]}`}
                                type="radio"
                                value={value.name}
                                {...register(`selectedOptions.${option.name}`, {
                                  required: "Required",
                                })}
                                key={idx}
                              ></input>
                            ) : (
                              <div
                                className={`w-12 h-12 flex justify-center items-center text-sm border cursor-pointer hover:bg-black hover:text-white transition-colors ease-in-out ${
                                  selectedOptions &&
                                  selectedOptions[option.name] === value.name &&
                                  "text-white bg-black"
                                }`}
                                onClick={() => {
                                  setValue(
                                    `selectedOptions.${option.name}`,
                                    value.name
                                  );
                                }}
                                key={idx}
                              >
                                <span>{value.name}</span>
                              </div>
                            )}
                          </>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ))}

        {/*Desktop handleSlide*/}
        <div className="items-center hidden w-full p-16 bg-white grow h-1/5 md:flex">
          <div className="flex justify-between font-bold basis-full">
            <div className="flex space-x-2 ">
              <div
                className="flex flex-col items-center space-x-1 cursor-pointer"
                onClick={() => handleSlide("prev")}
              >
                <span className="text-lg ">PREV</span>
                <img src="/icons/left-arrow.svg" alt="" />
              </div>
              <div
                className="flex flex-col items-center space-x-1 cursor-pointer"
                onClick={() => handleSlide("prev")}
              >
                <span className="text-lg ">NEXT</span>
                <img src="/icons/right-arrow.svg" alt="" />
              </div>
            </div>
            <div
              className={`px-3 py-2 w-64 text-xl transition-colors ease-in-out cursor-pointer hover:bg-black hover:text-white flex items-center justify-center ${
                cart.status === "loading" && "bg-black text-white"
              }`}
              onClick={() =>
                dispatch(
                  addCartItem({
                    id: Cookies.get("cart"),
                    product,
                    variant,
                  })
                )
              }
            >
              {cart.status === "loading" ? (
                <CircularProgress size={30} color="inherit" />
              ) : (
                `ADD TO CART - $${product?.attributes.price}`
              )}
            </div>
          </div>
        </div>

        {/*Mobile cart button*/}
        <div
          className="h-12 w-44 max-w-md px-3 py-2 mx-auto mt-10 text-md text-white bg-black rounded-sm shadow-lg cursor-pointer md:hidden flex items-center justify-center"
          onClick={() =>
            dispatch(
              addCartItem({
                id: Cookies.get("cart"),
                product,
                variant,
              })
            )
          }
        >
          {cart.status === "loading" ? (
            <CircularProgress size={30} color="inherit" />
          ) : (
            `ADD TO CART - $${product?.attributes.price}`
          )}
        </div>
      </div>
    </>
  );
};
export const getServerSideProps: GetServerSideProps = async (context) => {
  const LIST_PRODUCT = gql`
    query Products($filters: ProductFiltersInput) {
      products(filters: $filters) {
        data {
          id
          attributes {
            name
            description
            image {
              data {
                id
                attributes {
                  url
                }
              }
            }
            price
            options {
              id
              name
              values(pagination: { limit: -1 }) {
                id
                name
              }
            }
            variants(pagination: { limit: -1 }) {
              data {
                id
                attributes {
                  name
                  price
                  description
                  image {
                    data {
                      id
                      attributes {
                        url
                      }
                    }
                  }
                  selectedOptions
                  product {
                    data {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const { category } = context.params;
  const variables: QueryProductsArgs =
    category === "new"
      ? {
          sort: ["createdAt"],
          pagination: {
            limit: 10,
          },
        }
      : {
          filters: {
            categories: {
              name: {
                eq: category as string,
              },
            },
          },
        };

  const {
    data: { products },
  } = await client.query<
    {
      products: ProductEntityResponseCollection;
    },
    QueryProductsArgs
  >({
    query: LIST_PRODUCT,
    variables,
  });

  return {
    props: {
      products: products.data,
    },
  };
};

export default category;
