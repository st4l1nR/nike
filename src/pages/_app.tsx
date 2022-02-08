import Head from "next/head";
import { AppProps } from "next/app";
import "../styles/index.css";
import { Navbar } from "../components";
import { ApolloProvider, gql } from "@apollo/client";
import client from "../lib/apolloClient";
import { useEffect } from "react";
import Cookies from "js-cookie";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import {
  CartEntityResponse,
  MutationCreateCartArgs,
  QueryCartArgs,
} from "../generated/graphql";
import store from "../store";
import { Provider } from "react-redux";
import { useDispatch } from "react-redux";
import { setCart, getCart, createCart } from "../features/cartSlice";


function MyApp({ Component, pageProps }: AppProps) {
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_KEY as string
  );
  useEffect(() => {
    const retrieveCart = async () => {
      const cartId = Cookies.get("cart");
      if (!cartId) {
        await store.dispatch(createCart({data:{}}))
        Cookies.set("cart", store.getState().cart.value.id);

      } else {
        await store.dispatch(getCart(cartId))
        if (!store.getState().cart.value) await store.dispatch(createCart({data:{}}))
        Cookies.remove("cart")
        Cookies.set("cart", store.getState().cart.value.id)
      
      }
    };
    retrieveCart();
  }, []);
  return (
    <Provider store={store}>
      <ApolloProvider client={client}>
        <Elements stripe={stripePromise}>
          <Head>
            <title>Nike Shoes</title>
            <meta
              name="viewport"
              content="initial-scale=1.0, width=device-width"
            />
            <link rel="shortcut icon" href="nikeicon.ico" type="image/x-icon" />
          </Head>
          <div className="px-5">
            <Navbar />
            <div className="mx-auto mb-5 max-w-7xl">
              <Component {...pageProps} />
            </div>
          </div>
        </Elements>
      </ApolloProvider>
    </Provider>
  );
}

export default MyApp;
