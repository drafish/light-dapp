import { type ModelType } from '../store';

const Model: ModelType = {
  namespace: 'instance',
  state: {},
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
  },
  effects: {},
};

export default Model;
