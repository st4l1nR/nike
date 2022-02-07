import React, { useState, useRef } from "react";
import Link from "next/link";
import { TextField } from "../../components";
import { useForm } from "react-hook-form";
import { Disclosure, Transition } from "@headlessui/react";
import { useSelector, useDispatch } from "react-redux";
import Button from "../../components/Button";
import client from "../../lib/apolloClient";
import countriesQuery from "countries-code";
import { CheckCircle } from "react-feather";
import Image from "next/image";
import { useMutation, gql } from "@apollo/client";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { emptyCart } from "../../features/cartSlice";
import {createOrder} from '../../features/orderSlice'
import { useRouter } from "next/router";

import {
  OrderInput,
  ShippingEntityResponseCollection,
  ShippingEntity,
  MutationCreateOrderArgs,
  OrderEntityResponse,
} from "../../generated/graphql";
import type { RootState, AppDispatch } from "../../store";
import type { GetServerSideProps } from "next";
import type {
  PaymentIntent,
  MutationCreatePaymentIntentArgs,
} from "../../generated/graphql";

type props = {
  shippings: ShippingEntity[];
};

type formData = OrderInput & {
  payment?: any;
};

const CREATE_PAYMENT_INTENT = gql`
  mutation CreatePaymentIntent($amount: Float!) {
    createPaymentIntent(amount: $amount) {
      clientSecret
    }
  }
`;

const checkout = ({ shippings }: props) => {
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.cart.value);
  const router = useRouter()
  const stripe = useStripe();
  const elements = useElements();

  const [createPaymentIntent] = useMutation<
    { createPaymentIntent: PaymentIntent },
    MutationCreatePaymentIntentArgs
  >(CREATE_PAYMENT_INTENT);

  const [status, setStatus] = useState({
    dilevery: false,
    payment: false,
    overview: false,
  });
  const [loading, setLoading] = useState(false);
  const paymentContainer = useRef<HTMLDivElement>(null);
  const orderReviewContainer = useRef<HTMLDivElement>(null);
  const cardElementContainer = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    setError,
    clearErrors,
  } = useForm<formData>();
  const shipping = watch("shipping");

  const onSubmit = async (data: formData) => {
    data.cart = cart.id;
    data.country = countriesQuery.getCountry(
      shippings.find((shipping) => shipping.id == data.shipping).attributes.city
    );
    console.log("country", data.country);

    if (!stripe || !elements) return;

    setLoading(true);
    const {
      data: {
        createPaymentIntent: { clientSecret },
      },
    } = await createPaymentIntent({
      variables: {
        amount: cart.attributes.total,
      },
    });

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      }
    );
    if (error) return;

    await dispatch(createOrder({
      data
    }))

    await dispatch(emptyCart(cart.id))
    router.push('/checkout/success')


    setLoading(false);
  };
  if (cart?.attributes.cartItems[0]) {
    return (
      <form
        className="flex flex-col space-y-10 md:flex-row md:space-y-0"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col space-y-10 md:basis-2/4">
          {/*Dilevery*/}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between h-12 px-5 text-lg font-bold text-white bg-black/80">
              <span>1. DILEVERY</span>
              {status.dilevery && <CheckCircle />}
            </div>
            <Transition
              show={true}
              enter="transition duration-100 ease-out"
              enterFrom="transform -translate-y-8 opacity-0"
              enterTo="transform translate-y-0 opacity-100"
              leave="transition duration-100 ease-out"
              leaveFrom="transform translate-y-0 opacity-100"
              leaveTo="transform -translate-y-2 opacity-0"
            >
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                  <div className="basis-1/2">
                    <TextField
                      placeholder="First Name"
                      error={errors.firstName?.message}
                      {...register("firstName", { required: "Required" })}
                    />
                  </div>
                  <div className="basis-1/2">
                    <TextField
                      placeholder="Last Name"
                      error={errors.lastName?.message}
                      {...register("lastName", { required: "Required" })}
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                  <div className="basis-1/2">
                    <TextField
                      placeholder="Email"
                      error={errors.email?.message}
                      {...register("email", { required: "Required", pattern:{
                        value:/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                        message:"Invalid email"
                      }})}
                    />
                  </div>
                  <div className="basis-1/2">
                    <TextField
                      placeholder="Phone Number"
                      error={errors.phoneNumber?.message}
                      {...register("phoneNumber", {
                        required: "Required",
                        pattern:{
                          value:/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
                          message:"Invalid phone number"
                        }
                      })}
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <select
                    className={`w-full ${
                      errors.shipping
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-400  focus:border-gray-400 focus:ring-gray-400"
                    } ${!shipping && "text-gray-400"}`}
                    {...register("shipping", { required: "Required" })}
                  >
                    <option
                      className="text-gray-400"
                      value=""
                      selected
                      disabled
                    >
                      Select Country
                    </option>
                    {shippings.map((shipping, idx) => (
                      <option value={shipping.id} key={idx}>
                        {countriesQuery.getCountry(shipping.attributes.city)}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-red-500 ">
                    {errors.shipping?.message}
                  </span>
                </div>
                <TextField
                  placeholder="Street Adress"
                  error={errors.streetAdress?.message}
                  {...register("streetAdress", { required: "Required" })}
                />

                <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                  <div className="basis-1/2">
                    <TextField
                      placeholder="State"
                      error={errors.state?.message}
                      {...register("state", { required: "Required" })}
                    />
                  </div>
                  <div className="basis-1/2">
                    <TextField
                      placeholder="Zip code"
                      error={errors.zipCode?.message}
                      {...register("zipCode", {
                        required: "Required",
                      })}
                    />
                  </div>
                </div>
                <div className="flex justify-center md:justify-end">
                  <Button
                    width="w-44"
                    height="h-10"
                    onClick={async () => {
                      const state = await trigger([
                        "firstName",
                        "lastName",
                        "email",
                        "phoneNumber",
                        "shipping",
                        "state",
                        "zipCode",
                        "streetAdress",
                      ]);

                      if (state) {
                        setStatus((prv) => ({ ...prv, dilevery: true }));
                        paymentContainer.current.scrollIntoView();
                      } else {
                        setStatus((prv) => ({ ...prv, dilevery: false }));
                      }
                    }}
                  >
                    CONTINUE TO PAYMENT
                  </Button>
                </div>
              </div>
            </Transition>
          </div>

          {/*Payment*/}
          <div className="flex flex-col space-y-4" ref={paymentContainer}>
            <>
              <div
                className={`flex items-center justify-between h-12 px-5 text-lg font-bold text-white bg-black/80 ${
                  !status.dilevery && "pointer-events-none"
                }`}
              >
                <span>2. PAYMENT</span>
                {status.payment && <CheckCircle />}
              </div>

              <Transition
                show={status.dilevery}
                enter="transition duration-100 ease-out"
                enterFrom="transform -translate-y-8 opacity-0"
                enterTo="transform translate-y-0 opacity-100"
                leave="transition duration-100 ease-out"
                leaveFrom="transform translate-y-0 opacity-100"
                leaveTo="transform -translate-y-2 opacity-0"
              >
                <div className="flex flex-col space-y-4">
                  <div ref={cardElementContainer}>
                    <CardElement
                      onChange={(e) => {
                        if (!e.complete) {
                          setError("payment", {
                            type: "manual",
                            message: "error",
                          });
                        } else {
                          clearErrors("payment");
                        }
                      }}
                    />
                  </div>

                  <div className="flex justify-center md:justify-end">
                    <Button
                      width="w-48"
                      height="h-10"
                      onClick={() => {
                        const isEmpty =
                          cardElementContainer.current.firstElementChild.classList.contains(
                            "StripeElement--empty"
                          );
                        if (!errors.payment && !isEmpty) {
                          setStatus((prv) => ({ ...prv, payment: true }));
                          orderReviewContainer.current.scrollIntoView();
                        }
                      }}
                    >
                      CONTINUE TO ORDER REVIEW
                    </Button>
                  </div>
                </div>
              </Transition>
            </>
          </div>

          {/*Order Review*/}
          <div className="flex flex-col space-y-4" ref={orderReviewContainer}>
            <>
              <div
                className={`flex items-center justify-between h-12 px-5 text-lg font-bold text-white bg-black/80 ${
                  !status.dilevery && "pointer-events-none"
                }`}
              >
                <span>3. ORDER REVIEW</span>
                {status.overview && <CheckCircle />}
              </div>

              <Transition
                show={status.payment}
                enter="transition duration-100 ease-out"
                enterFrom="transform -translate-y-8 opacity-0"
                enterTo="transform translate-y-0 opacity-100"
                leave="transition duration-100 ease-out"
                leaveFrom="transform translate-y-0 opacity-100"
                leaveTo="transform -translate-y-2 opacity-0"
              >
                <div className="flex flex-col space-y-5">
                  <div className="flex flex-col space-y-4">
                    {cart.attributes.cartItems.map(
                      ({ name, image, product, variant, quantity }, idx) => (
                        <div
                          className="relative flex flex-col space-y-3 md:flex-row md:space-x-4 w-fuill "
                          key={idx}
                        >
                          <div className="relative h-36 md:basis-2/4">
                            <Image
                              unoptimized={true}
                              src={
                                process.env.NEXT_PUBLIC_API +
                                image.data.attributes.url
                              }
                              layout="fill"
                              objectFit="contain"
                            />
                          </div>
                          <div className="flex flex-col space-y-3 md:basis-3/4">
                            <span className="font-bold">{name}</span>
                            <span className="font-thin">
                              {product.data.attributes.description}
                            </span>
                            <div className="flex space-x-2 text-gray-400">
                              {variant.data?.attributes.name.toUpperCase()}
                            </div>
                          </div>
                          <div className="bg-black text-white h-6 w-6 text-sm rounded-full absolute -top-5 left-0 flex justify-center items-center">
                            {quantity}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  <div className="flex justify-center">
                    <Button type="submit" loading={loading}>
                      Pay
                    </Button>
                  </div>
                </div>
              </Transition>
            </>
          </div>
        </div>

        <div className="hidden shrink md:block basis-1/4"></div>

        {/*In your bag*/}
        <Disclosure
          as="div"
          className="flex flex-col space-y-4 md:basis-2/4 order-first md:order-none pb-5 md:mb-0"
          defaultOpen={true}
        >
          {({ open }) => (
            <>
              <Disclosure.Button className="flex items-center justify-between h-12 px-5 text-lg font-bold text-black bg-gray-200">
                <span>IN YOUR BAG</span>
                <Link href="/cart">
                  <span className="text-sm font-light border-b border-black cursor-pointer ">
                    Edit
                  </span>
                </Link>
              </Disclosure.Button>
              <Transition
                show={open}
                enter="transition duration-100 ease-out"
                enterFrom="transform -translate-y-8 opacity-0"
                enterTo="transform translate-y-0 opacity-100"
                leave="transition duration-100 ease-out"
                leaveFrom="transform translate-y-0 opacity-100"
                leaveTo="transform -translate-y-2 opacity-0"
              >
                <Disclosure.Panel static>
                  <div className="flex flex-col px-5 space-y-2">
                    <div className="flex justify-between font-thin">
                      <span>Subtotal</span>
                      <span>${cart.attributes.total}</span>
                    </div>
                    <div className="flex justify-between font-thin">
                      <span>Estimated shipping</span>
                      <span>$0</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between h-12 px-5 mt-5 border-t border-b border-gray-200">
                    <span>Total</span>
                    <span>${cart.attributes.total}</span>
                  </div>
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>
      </form>
    );
  } else
    return (
      <div className="flex flex-col items-center justify-center space-y-3">
        <img
          className="max-w-md"
          src="/images/GroovySittingDoodle.svg"
          alt=""
        />
        <Link href="/" passHref>
          <Button>Add products</Button>
        </Link>
      </div>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const LIST_SHIPPING = gql`
    query ListShipping {
      shippings {
        data {
          id
          attributes {
            city
            price
          }
        }
      }
    }
  `;
  const {
    data: { shippings },
  } = await client.query<{
    shippings: ShippingEntityResponseCollection;
  }>({
    query: LIST_SHIPPING,
  });
  return {
    props: {
      shippings: shippings.data,
    },
  };
};
export default checkout;
