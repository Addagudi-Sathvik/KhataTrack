import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api.js';

const API_LOG = true;


export const fetchTransactions = createAsyncThunk('transactions/list', async (params = {}) => {
  const { data } = await api.get('/expenses', { params });
  return data;
});

export const fetchDashboard = createAsyncThunk('transactions/dashboard', async () => {
  const { data } = await api.get('/dashboard');
  return data;
});

export const createTransaction = createAsyncThunk('transactions/create', async (payload, { rejectWithValue }) => {
  try {
    if (API_LOG) console.log('[createTransaction] sending payload:', payload);
    const { data } = await api.post('/expenses', payload);
    if (API_LOG) console.log('[createTransaction] api response:', data);
    return data.expense;
  } catch (err) {
    console.error('[createTransaction] failed:', err?.response?.data || err.message);
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});


export const updateTransaction = createAsyncThunk('transactions/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/expenses/${id}`, payload);
    return data.expense;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const deleteTransaction = createAsyncThunk('transactions/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/expenses/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    items: [],
    page: 1,
    pages: 1,
    total: 0,
    dashboard: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createTransaction.pending, (state) => {
        state.error = null;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        if (API_LOG) console.log('[transactions/create] fulfilled payload:', action.payload);
        state.items = [action.payload, ...state.items];
      })

      .addCase(updateTransaction.pending, (state) => {
        state.error = null;
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item._id === action.payload._id ? action.payload : item));
      })
      .addCase(deleteTransaction.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      });
  }
});

export default transactionSlice.reducer;
