import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface LogsState {
  logs: { logLine: string }[];
}

let initialState: LogsState = {
  logs: [],
};

const logsSlice = createSlice({
  name: "logs",
  initialState,
  reducers: {
    setLogs: (state, action: PayloadAction<{ logLine: string }[]>) => {
      state.logs = action.payload;
    },
    appendLogs: (state, action: PayloadAction<{ logLine: string }>) => {
      state.logs = [...state.logs, action.payload];
    },
  },
});

export const { setLogs, appendLogs } = logsSlice.actions;

export default logsSlice.reducer;
