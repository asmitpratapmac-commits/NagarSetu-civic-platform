import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isMobileNavOpen: false,
    isNotificationPanelOpen: false,
  },
  reducers: {
    toggleMobileNav: (state) => {
      state.isMobileNavOpen = !state.isMobileNavOpen;
    },
    closeMobileNav: (state) => {
      state.isMobileNavOpen = false;
    },
    toggleNotificationPanel: (state) => {
      state.isNotificationPanelOpen = !state.isNotificationPanelOpen;
    },
    closeNotificationPanel: (state) => {
      state.isNotificationPanelOpen = false;
    },
  },
});

export const { toggleMobileNav, closeMobileNav, toggleNotificationPanel, closeNotificationPanel } = uiSlice.actions;
export default uiSlice.reducer;
