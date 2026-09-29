import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { complaintApi } from '../../api/complaintApi';

export const fetchComplaintById = createAsyncThunk('complaints/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await complaintApi.getById(id);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load complaint.');
  }
});

const complaintSlice = createSlice({
  name: 'complaints',
  initialState: {
    current: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    clearCurrentComplaint: (state) => {
      state.current = null;
    },
    /** Applied when a real-time status/comment event arrives for the open complaint */
    complaintPatched: (state, action) => {
      if (state.current && state.current._id === action.payload.complaintId) {
        state.current = { ...state.current, ...action.payload.patch };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaintById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchComplaintById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchComplaintById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearCurrentComplaint, complaintPatched } = complaintSlice.actions;
export default complaintSlice.reducer;
