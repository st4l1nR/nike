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
import { setCart } from "../features/cartSlice";

const GET_CART = gql`
  query getCart($id: ID) {
    cart(id: $id) {
      data {
        id
        attributes {
          cartItems {
            id
            name
            quantity
            image {
              data {
                id
                attributes {
                  url
                }
              }
            }
            variant {
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
                }
              }
            }
            product {
              data {
                id
                attributes {
                  description
                }
              }
            }
            price
          }
          total
        }
      }
    }
  }
`;

const CREATE_CART = gql`
  mutation CreateCart($data: CartInput!) {
    createCart(data: $data) {
      data {
        id
        attributes {
          cartItems {
            id
            name
            quantity
            image {
              data {
                id
                attributes {
                  url
                }
              }
            }
            variant {
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
                }
              }
            }
            product {
              data {
                id
                attributes {
                  description
                }
              }
            }
            price
          }
        }
        total
      }
    }
  }
`;

function MyApp({ Component, pageProps }: AppProps) {
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_KEY as string
  );
  useEffect(() => {
    const retrieveCart = async () => {
      const cartId = Cookies.get("cart");
      if (!cartId) {
        const {
          data: { createCart },
        } = await client.mutate<
          {
            createCart: CartEntityResponse;
          },
          MutationCreateCartArgs
        >({
          mutation: CREATE_CART,
          variables: {
            data: {},
          },
        });
        Cookies.set("cart", createCart.data.id);
        store.dispatch(setCart(createCart.data));
      } else {
        const {
          data: { cart },
        } = await client.query<
          {
            cart: CartEntityResponse;
          },
          QueryCartArgs
        >({
          query: GET_CART,
          variables: {
            id: cartId,
          },
        });
        store.dispatch(setCart(cart.data));
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
