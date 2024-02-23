import React, { useState } from 'react';
import * as remixLib from '@remix-project/remix-lib';
import { ContractGUI } from '../ContractGUI';
import { TreeView, TreeViewItem } from '../TreeView';
import { BN } from 'bn.js';
import './index.css';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';

const txHelper = remixLib.execution.txHelper;

const getFuncABIInputs = (funABI: any) => {
  if (!funABI.inputs) {
    return '';
  }
  return txHelper.inputParametersDeclarationToString(funABI.inputs);
};

export interface FuncABI {
  name: string;
  type: string;
  inputs: { name: string; type: string }[];
  stateMutability: string;
  payable?: boolean;
  constant?: any;
}

export function UniversalDappUI(props: any) {
  const instance = useAppSelector((state) => state.instance);
  const dispatch = useAppDispatch();

  const address = instance.address;
  const contractABI = instance.abi;
  const [expandPath, setExpandPath] = useState<string[]>([]);

  const runTransaction = (
    lookupOnly: boolean,
    funcABI: FuncABI,
    valArr: { name: string; type: string }[] | null,
    inputsValues: string,
    funcIndex?: number
  ) => {
    const functionName =
      funcABI.type === 'function' ? funcABI.name : `(${funcABI.type})`;
    const logMsg = `${lookupOnly ? 'call' : 'transact'} to ${
      instance.name
    }.${functionName}`;

    dispatch({
      type: 'instance/runTransactions',
      payload: {
        lookupOnly,
        funcABI,
        inputsValues,
        name: instance.name,
        contractABI,
        address,
        logMsg,
        funcIndex,
      },
    });
  };

  const extractDataDefault = (item: any[] | any, parent?: any) => {
    const ret: any = {};

    if (BN.isBN(item)) {
      ret.self = item.toString(10);
      ret.children = [];
    } else {
      if (item instanceof Array) {
        ret.children = item.map((item, index) => {
          return { key: index, value: item };
        });
        ret.self = 'Array';
        ret.isNode = true;
        ret.isLeaf = false;
      } else if (item instanceof Object) {
        ret.children = Object.keys(item).map((key) => {
          return { key, value: item[key] };
        });
        ret.self = 'Object';
        ret.isNode = true;
        ret.isLeaf = false;
      } else {
        ret.self = item;
        ret.children = null;
        ret.isNode = false;
        ret.isLeaf = true;
      }
    }
    return ret;
  };

  const handleExpand = (path: string) => {
    if (expandPath.includes(path)) {
      const filteredPath = expandPath.filter((value) => value !== path);

      setExpandPath(filteredPath);
    } else {
      setExpandPath([...expandPath, path]);
    }
  };

  const label = (key: string | number, value: string) => {
    return (
      <div className="d-flex mt-2 flex-row label_item">
        <label className="small font-weight-bold mb-0 pr-1 label_key">
          {key}:
        </label>
        <label className="m-0 label_value">{value}</label>
      </div>
    );
  };

  const renderData = (
    item: any[],
    parent: any,
    key: string | number,
    keyPath: string
  ) => {
    const data = extractDataDefault(item, parent);
    const children = (data.children || []).map(
      (child: { value: any[]; key: string }, index: any) => {
        return renderData(
          child.value,
          data,
          child.key,
          keyPath + '/' + child.key
        );
      }
    );

    if (children && children.length > 0) {
      return (
        <TreeViewItem
          id={`treeViewItem${key}`}
          key={keyPath}
          label={label(key, data.self)}
          onClick={() => {
            handleExpand(keyPath);
          }}
          expand={expandPath.includes(keyPath)}
        >
          <TreeView id={`treeView${key}`} key={keyPath}>
            {children}
          </TreeView>
        </TreeViewItem>
      );
    } else {
      return (
        <TreeViewItem
          id={key.toString()}
          key={keyPath}
          label={label(key, data.self)}
          onClick={() => {
            handleExpand(keyPath);
          }}
          expand={expandPath.includes(keyPath)}
        />
      );
    }
  };

  return (
    <div className="row m-0">
      {contractABI?.map((funcABI: any, index: any) => {
        if (funcABI.type !== 'function') return null;
        const isConstant =
          funcABI.constant !== undefined ? funcABI.constant : false;
        const lookupOnly =
          funcABI.stateMutability === 'view' ||
          funcABI.stateMutability === 'pure' ||
          isConstant;
        const inputs = getFuncABIInputs(funcABI);

        return (
          <div
            key={index}
            className={`instance udapp_instance udapp_run-instance border-dark col-6`}
            data-shared="universalDappUiInstance"
          >
            <div
              className="udapp_cActionsWrapper bg-light mb-2"
              data-id="universalDappUiContractActionWrapper"
            >
              <div className="udapp_contractActionsContainer">
                <div>
                  <ContractGUI
                    funcABI={funcABI}
                    clickCallBack={(
                      valArray: { name: string; type: string }[],
                      inputsValues: string
                    ) => {
                      runTransaction(
                        lookupOnly,
                        funcABI,
                        valArray,
                        inputsValues,
                        index
                      );
                    }}
                    inputs={inputs}
                    lookupOnly={lookupOnly}
                    key={index}
                  />
                  {lookupOnly && (
                    <div className="udapp_value" data-id="udapp_value">
                      <TreeView id="treeView">
                        {Object.keys(instance.decodedResponse || {}).map(
                          (key) => {
                            const funcIndex = index.toString();
                            const response = instance.decodedResponse[key];

                            return key === funcIndex
                              ? Object.keys(response || {}).map(
                                  (innerkey, _index) => {
                                    return renderData(
                                      instance.decodedResponse[key][innerkey],
                                      response,
                                      innerkey,
                                      innerkey
                                    );
                                  }
                                )
                              : null;
                          }
                        )}
                      </TreeView>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
