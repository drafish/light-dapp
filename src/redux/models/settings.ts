import { type ModelType } from '../store';

const Model: ModelType = {
  namespace: 'settings',
  state: {
    sendValue: '0',
    sendUnit: 'wei',
    gasLimit: 3000000,
    networkName: 'Goerli',
    loadedAccounts: {},
    isRequesting: false,
    isSuccessful: false,
    error: null,
    selectedAccount: '',
  },
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
  },
  effects: {},
};

export default Model;
