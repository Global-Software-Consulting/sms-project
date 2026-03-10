import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define notification type
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
}

// Define modal state
interface ModalState {
  isOpen: boolean;
  modalType: string | null;
  modalProps: Record<string, unknown>;
}

// Define the UI state type
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  notifications: Notification[];
  modal: ModalState;
  isPageLoading: boolean;
}

// Initial state
const initialState: UIState = {
  sidebarOpen: true,
  theme: 'dark',
  notifications: [],
  modal: {
    isOpen: false,
    modalType: null,
    modalProps: {},
  },
  isPageLoading: false,
};

// Create the UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, 'id'>>,
    ) => {
      const id = Date.now().toString();
      state.notifications.push({ ...action.payload, id });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload,
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    openModal: (
      state,
      action: PayloadAction<{
        modalType: string;
        modalProps?: Record<string, unknown>;
      }>,
    ) => {
      state.modal.isOpen = true;
      state.modal.modalType = action.payload.modalType;
      state.modal.modalProps = action.payload.modalProps || {};
    },
    closeModal: (state) => {
      state.modal.isOpen = false;
      state.modal.modalType = null;
      state.modal.modalProps = {};
    },
    setPageLoading: (state, action: PayloadAction<boolean>) => {
      state.isPageLoading = action.payload;
    },
  },
});

// Export actions
export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  addNotification,
  removeNotification,
  clearAllNotifications,
  openModal,
  closeModal,
  setPageLoading,
} = uiSlice.actions;

// Export selectors
export const selectSidebarOpen = (state: { ui: UIState }) =>
  state.ui.sidebarOpen;
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectNotifications = (state: { ui: UIState }) =>
  state.ui.notifications;
export const selectModal = (state: { ui: UIState }) => state.ui.modal;
export const selectIsPageLoading = (state: { ui: UIState }) =>
  state.ui.isPageLoading;

// Export reducer
export default uiSlice.reducer;
