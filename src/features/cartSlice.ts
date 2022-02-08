import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  CartEntity,
  CartEntityResponse,
  MutationAddCartItemArgs,
  ProductEntity,
  VariantEntity,
  MutationDeleteCartItemArgs,
  MutationUpdateCartItemArgs,
  MutationEmptyCartArgs,
  QueryCartArgs,
  MutationCreateCartArgs
} from "../generated/graphql";
import client from "../lib/apolloClient";
import { gql } from "@apollo/client";

export interface CounterState {
  value: CartEntity | null;
  status: "loading" | "fullfill" | "error" | null;
}

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
          total
        }
      }
    }
  }
`;


const ADD_CART_ITEM = gql`
  mutation AddCartItem($id: ID!, $cartItem: ComponentProductCartItemInput!) {
    addCartItem(id: $id, cartItem: $cartItem) {
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

const DELETE_CART_ITEM = gql`
  mutation DeleteCartItem($id: ID!, $cartItemId: ID!) {
    deleteCartItem(id: $id, cartItemId: $cartItemId) {
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


const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($id: ID!, $cartItemId: ID!, $quantity: Int!) {
    updateCartItem(id: $id, cartItemId: $cartItemId, quantity: $quantity) {
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

const EMPTY_CART = gql`
  mutation EmptyCart($id: ID!) {
    emptyCart(id: $id) {
      data {
        id
        attributes {
          cartItems {
            id
          }
          total
        }
      }
    }
  }
`;

export const getCart = createAsyncThunk('cart/get', async (id:string) => {
  const {data:{cart}} = await  client.query<{cart:CartEntityResponse}, QueryCartArgs>({
    query:GET_CART,
    variables:{
      id
    }
  })
  return cart.data
})

export const createCart = createAsyncThunk('cart/create', async(variables:MutationCreateCartArgs) => {
  const {data:{createCart}} = await client.mutate<{createCart:CartEntityResponse}, MutationCreateCartArgs>({
    mutation:CREATE_CART,
    variables
  })
  return createCart.data
})

type addCartItemsArgs = {
  id: string;
  product: ProductEntity;
  variant?: VariantEntity;
};
export const addCartItem = createAsyncThunk(
  "cart/addCartItem",
  async (args: addCartItemsArgs, thunkApi) => {
    const { id, product, variant } = args;
    if (!id || !product) return;


    const cartItem = {
      name: product.attributes.name,
      price: product.attributes.price,
      image: variant?.attributes.image.data
        ? variant.attributes.image.data?.id
        : product.attributes.image.data?.id,
      quantity: 1,
      product: product.id,
      variant: variant?.id,
    };

    const {
      data: { addCartItem },
    } = await client.mutate<
      {
        addCartItem: CartEntityResponse;
      },
      MutationAddCartItemArgs
    >({
      mutation: ADD_CART_ITEM,
      variables: {
        id,
        cartItem,
      },
    });
    return addCartItem.data;
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async (variables: MutationDeleteCartItemArgs) => {
    const { data } = await client.mutate<
      {
        deleteCartItem: CartEntityResponse;
      },
      MutationDeleteCartItemArgs
    >({
      mutation: DELETE_CART_ITEM,
      variables,
    });
    return data.deleteCartItem.data;
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCart",
  async (variables: MutationUpdateCartItemArgs): Promise<CartEntity> => {
    if (variables.quantity === 0) throw new Error("Invalid quantity");
    const {
      data: { updateCartItem },
    } = await client.mutate<
      {
        updateCartItem: CartEntityResponse;
      },
      MutationUpdateCartItemArgs
    >({
      mutation: UPDATE_CART_ITEM,
      variables: variables,
    });
    return updateCartItem.data;
  }
);

export const emptyCart = createAsyncThunk("cart/empty", async (id:string) => {
  const {data:{emptyCart}} = await client.mutate<{
    emptyCart:CartEntityResponse
  }, MutationEmptyCartArgs>({
    mutation:EMPTY_CART,
    variables:{
      id
    }
  })

  return emptyCart.data
});

const initialState: CounterState = {
  value: null,
  status: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, { payload }: PayloadAction<CartEntity>) => {
      state.value = payload;
      state.status = "fullfill";
    },
  },
  extraReducers: {
    //getCart
    [getCart.pending.type]: (state) => {
      state.status = "loading";
    },
    [getCart.fulfilled.type]: (
      state,
      { payload }: PayloadAction<CartEntity>
    ) => {
      state.value = payload;
      state.status = "fullfill";
    },
    [getCart.rejected.type]: (state) => {
      state.status = "error";
    },

    //createCart
    [createCart.pending.type]: (state) => {
      state.status = "loading";
    },
    [createCart.fulfilled.type]: (
      state,
      { payload }: PayloadAction<CartEntity>
    ) => {
      state.value = payload;
      state.status = "fullfill";
    },
    [createCart.rejected.type]: (state) => {
      state.status = "error";
    },

    //addCartItem
    [addCartItem.pending.type]: (state) => {
      state.status = "loading";
    },
    [addCartItem.fulfilled.type]: (
      state,
      { payload }: PayloadAction<CartEntity>
    ) => {
      state.value = payload;
      state.status = "fullfill";
    },
    [addCartItem.rejected.type]: (state) => {
      state.status = "error";
    },

    //deleteCartItem
    [deleteCartItem.pending.type]: (state) => {
      state.status = "loading";
    },
    [deleteCartItem.fulfilled.type]: (
      state,
      { payload }: PayloadAction<CartEntity>
    ) => {
      state.value = payload;
      state.status = "fullfill";
    },
    [deleteCartItem.rejected.type]: (state) => {
      state.status = "error";
    },

    //updateCartItem
    [updateCartItem.pending.type]: (state) => {
      state.status = "loading";
    },
    [updateCartItem.fulfilled.type]: (
      state,
      { payload }: PayloadAction<CartEntity>
    ) => {
      state.value = payload;
      state.status = "fullfill";
    },
    [updateCartItem.rejected.type]: (state, { payload }) => {
      console.log(payload);
      state.status = "error";
    },


    //updateCartItem
    [emptyCart.pending.type]: (state) => {
      state.status = "loading";
    },
    [emptyCart.fulfilled.type]: (
      state,
      { payload }: PayloadAction<CartEntity>
    ) => {
      state.value = payload;
      state.status = "fullfill";
    },
    [emptyCart.rejected.type]: (state, { payload }) => {
      console.log(payload);
      state.status = "error";
    },
  },
});

export const { setCart } = cartSlice.actions;
export default cartSlice.reducer;
