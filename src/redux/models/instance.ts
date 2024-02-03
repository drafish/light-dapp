import SurgeClient from 'surge-client';
import { type ModelType } from '../store';

const Model: ModelType = {
  namespace: 'instance',
  state: {
    name: 'Storage',
    address: '0x82068d60D95cdfe50446E757c994c0a2116049AA',
    balance: 0,
    network: 'goerli',
    decodedResponse: '',
    abi: [
      {
        inputs: [],
        name: 'retrieve',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'uint256',
            name: 'num',
            type: 'uint256',
          },
        ],
        name: 'store',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
  },
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
  },
  effects: {
    *deploy() {
      const client = new SurgeClient({
        proxy: 'http://127.0.0.1:3003',
        onError: (err: Error) => {
          console.log(err);
        },
      });
      client
        .login({
          user: 'xwlyy1991@gmail.com',
          password: 'djq41017',
        })
        .then(() => {
          const files: Record<string, string> = {
            'dir/index.html': `<h1>Hello World!!! remixcc</h1>`,
            'dir/css/style.css': `html,body{margin:0}`,
            'dir/js/js.js': `console.log("js.js");`,
            'dir/level1/level2/text.txt': 'text',
          };

          client
            .publish({
              files,
              domain: 'remixcc-dapp.surge.sh',
              onProgress: ({
                id,
                progress,
                file,
              }: {
                id: string;
                progress: number;
                file: string;
              }) => {
                console.log({ id, progress, file });
              },
              onTick: (tick: string) => {},
            })
            .catch((err: Error) => {
              console.log(err);
            });
        })
        .catch((err: Error) => {
          console.log(err);
        });
    },
  },
};

export default Model;
