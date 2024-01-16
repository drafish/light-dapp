import { type ModelType } from '../store';

const Model: ModelType = {
  namespace: 'terminal',
  state: {},
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
  },
  effects: {},
};

export default Model;