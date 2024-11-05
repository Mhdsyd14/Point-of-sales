import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const addToCart = createAsyncThunk(
  "counter/addToCart",
  async (product, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:3000/api/cart",
        product,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw Error("Error adding product to cart: " + error.message);
    }
  }
);

export const fetchCartData = createAsyncThunk(
  "counter/fetchCartData",
  async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:3000/api/cart", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
);

export const updateCartQty = createAsyncThunk(
  "counter/updateCartQty",
  async (product, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:3000/api/cart",
        product,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw Error("Error updating product qty: " + error.message);
    }
  }
);

const initialState = {
  value: 0,
  cart: [],
  status: "idle",
  error: null,
};

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
    updateCartLocally: (state, action) => {
      const updatedProduct = action.payload.items[0];
      const existingItem = state.cart.find(
        (item) => item._id === updatedProduct._id
      );
      if (existingItem) {
        existingItem.qty = updatedProduct.qty;
        state.value = state.cart.reduce((total, item) => total + item.qty, 0);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cart.push(action.payload);
        state.value += 1;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchCartData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCartData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cart = action.payload;
        state.value = action.payload.reduce(
          (total, item) => total + item.qty,
          0
        );
      })
      .addCase(fetchCartData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(updateCartQty.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateCartQty.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedProduct = action.payload;
        const existingItem = state.cart.find(
          (item) => item._id === updatedProduct._id
        );
        if (existingItem) {
          existingItem.qty = updatedProduct.qty;
          state.value = state.cart.reduce((total, item) => total + item.qty, 0);
        }
      })
      .addCase(updateCartQty.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { increment, decrement, incrementByAmount, updateCartLocally } =
  counterSlice.actions;

export default counterSlice.reducer;

export const getInitialState = () => {
  const storedToken = localStorage.getItem("token");
  if (storedToken) {
    return async (dispatch) => {
      try {
        await dispatch(fetchCartData());
      } catch (error) {
        console.error("Error fetching initial cart data:", error);
      }
    };
  } else {
    return () => {};
  }
};
