import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import client from "../lib/apolloClient";
import { gql } from "@apollo/client";
import type {
  OrderEntity,
  OrderEntityResponse,
  MutationCreateCartArgs,
  MutationCreateOrderArgs,
} from "../generated/graphql";

const CREATE_ORDER = gql`
  mutation CreateOrder($data: OrderInput!) {
    createOrder(data: $data) {
      data {
        id
        attributes {
          firstName
          lastName
          email
          phoneNumber
        }
      }
    }
  }
`;

export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (variables: MutationCreateOrderArgs) => {
    const {
      data: { createOrder },
    } = await client.mutate<
      {
        createOrder: OrderEntityResponse;
      },
      MutationCreateOrderArgs
    >({
      mutation: CREATE_ORDER,
      variables,
    });
    return createOrder.data
  }
);

type inititalState = {
  value: OrderEntity | null
  status: "fullfill" | "loading" | "error" | null;
} ;

const initialState: inititalState = {
  value:null,
  status:null
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: {
    [createOrder.fulfilled.type]: (
      state,
      { payload }: PayloadAction<OrderEntity>
    ) => {
      state.value = payload;
      state.status = "fullfill";
    },
  },
});

export default orderSlice.reducer;
