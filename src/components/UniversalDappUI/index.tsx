// eslint-disable-next-line no-use-before-define
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { CopyToClipboard } from '../CopyToClipboard';
import * as remixLib from '@remix-project/remix-lib';
import * as ethJSUtil from '@ethereumjs/util';
import { ContractGUI } from '../ContractGUI';
import { TreeView, TreeViewItem } from '../TreeView';
import { BN } from 'bn.js';
import { CustomTooltip } from '../CustomTooltip';
import {
  is0XPrefixed,
  isHexadecimal,
  isNumeric,
  shortenAddress,
} from '../UiHelper';
import './index.css';

const txHelper = remixLib.execution.txHelper;

export interface FuncABI {
  name: string;
  type: string;
  inputs: { name: string; type: string }[];
  stateMutability: string;
  payable?: boolean;
  constant?: any;
}

export function UniversalDappUI(props: any) {
  const intl = useIntl();
  const [contractABI, setContractABI] = useState<FuncABI[]>([]);
  const [address, setAddress] = useState<string>('');
  const [expandPath, setExpandPath] = useState<string[]>([]);
  const [llIError, setLlIError] = useState<string>('');
  const [calldataValue, setCalldataValue] = useState<string>('');
  const [evmBC, setEvmBC] = useState(null);
  const [instanceBalance, setInstanceBalance] = useState(0);

  useEffect(() => {
    if (!props.instance.abi) {
      const abi = txHelper.sortAbiFunction(props.instance.contractData.abi);

      setContractABI(abi);
    } else {
      setContractABI(props.instance.abi);
    }
    if (props.instance.address) {
      let address =
        (props.instance.address.slice(0, 2) === '0x' ? '' : '0x') +
        props.instance.address.toString('hex');

      address = ethJSUtil.toChecksumAddress(address);
      setAddress(address);
    }
  }, [props.instance.address]);

  useEffect(() => {
    if (props.instance.contractData) {
      setEvmBC(props.instance.contractData.bytecodeObject);
    }
  }, [props.instance.contractData]);

  useEffect(() => {
    if (props.instance.balance) {
      setInstanceBalance(props.instance.balance);
    }
  }, [props.instance.balance]);

  const sendData = () => {
    setLlIError('');
    const fallback = txHelper.getFallbackInterface(contractABI);
    const receive = txHelper.getReceiveInterface(contractABI);
    const args = {
      funcABI: fallback || receive,
      address,
      contractName: props.instance.name,
      contractABI,
    };
    const amount = props.sendValue;

    if (amount !== '0') {
      // check for numeric and receive/fallback
      if (!isNumeric(amount)) {
        setLlIError(intl.formatMessage({ id: 'udapp.llIError1' }));
        return;
      } else if (
        !receive &&
        !(fallback && fallback.stateMutability === 'payable')
      ) {
        setLlIError(intl.formatMessage({ id: 'udapp.llIError2' }));
        return;
      }
    }
    let calldata = calldataValue;

    if (calldata) {
      if (calldata.length < 4 && is0XPrefixed(calldata)) {
        setLlIError(intl.formatMessage({ id: 'udapp.llIError3' }));
        return;
      } else {
        if (is0XPrefixed(calldata)) {
          calldata = calldata.substr(2, calldata.length);
        }
        if (!isHexadecimal(calldata)) {
          setLlIError(intl.formatMessage({ id: 'udapp.llIError4' }));
          return;
        }
      }
      if (!fallback) {
        setLlIError(intl.formatMessage({ id: 'udapp.llIError5' }));
        return;
      }
    }

    if (!receive && !fallback) {
      setLlIError(intl.formatMessage({ id: 'udapp.llIError6' }));
      return;
    }

    // we have to put the right function ABI:
    // if receive is defined and that there is no calldata => receive function is called
    // if fallback is defined => fallback function is called
    if (receive && !calldata) args.funcABI = receive;
    else if (fallback) args.funcABI = fallback;

    if (!args.funcABI) {
      setLlIError(intl.formatMessage({ id: 'udapp.llIError7' }));
      return;
    }
    runTransaction(false, args.funcABI, null, calldataValue);
  };

  const runTransaction = (
    lookupOnly: boolean,
    funcABI: FuncABI,
    valArr: { name: string; type: string }[] | null,
    inputsValues: string,
    funcIndex?: number,
  ) => {
    const functionName =
      funcABI.type === 'function' ? funcABI.name : `(${funcABI.type})`;
    const logMsg = `${lookupOnly ? 'call' : 'transact'} to ${props.instance.name}.${functionName}`;

    props.runTransactions(
      props.index,
      lookupOnly,
      funcABI,
      inputsValues,
      props.instance.name,
      contractABI,
      props.instance.contractData,
      address,
      logMsg,
      props.mainnetPrompt,
      props.gasEstimationPrompt,
      props.passphrasePrompt,
      funcIndex,
    );
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

  const handleCalldataChange = (e: { target: { value: any } }) => {
    const value = e.target.value;

    setCalldataValue(value);
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
    keyPath: string,
  ) => {
    const data = extractDataDefault(item, parent);
    const children = (data.children || []).map(
      (child: { value: any[]; key: string }, index: any) => {
        return renderData(
          child.value,
          data,
          child.key,
          keyPath + '/' + child.key,
        );
      },
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
    <div
      className={`instance udapp_instance udapp_run-instance border-dark bg-light`}
      id={`instance${address}`}
      data-shared="universalDappUiInstance"
    >
      <div className="udapp_title pb-0 alert alert-secondary">
        <div className="input-group udapp_nameNbuts">
          <div className="udapp_titleText input-group-prepend">
            <span className="input-group-text udapp_spanTitleText">
              {props.instance.name} at {shortenAddress(address)} (
              {props.context})
            </span>
          </div>
          <div className="btn">
            <CopyToClipboard
              tip={intl.formatMessage({ id: 'udapp.copy' })}
              content={address}
              direction={'top'}
            />
          </div>
        </div>
      </div>
      <div
        className="udapp_cActionsWrapper"
        data-id="universalDappUiContractActionWrapper"
      >
        <div className="udapp_contractActionsContainer">
          <div className="d-flex" data-id="instanceContractBal">
            <label>
              <FormattedMessage id="udapp.balance" />: {instanceBalance} ETH
            </label>
          </div>
          {contractABI?.map((funcABI, index) => {
            if (funcABI.type !== 'function') return null;
            const isConstant =
              funcABI.constant !== undefined ? funcABI.constant : false;
            const lookupOnly =
              funcABI.stateMutability === 'view' ||
              funcABI.stateMutability === 'pure' ||
              isConstant;
            const inputs = props.getFuncABIInputs(funcABI);

            return (
              <div key={index}>
                <ContractGUI
                  funcABI={funcABI}
                  clickCallBack={(
                    valArray: { name: string; type: string }[],
                    inputsValues: string,
                  ) => {
                    runTransaction(
                      lookupOnly,
                      funcABI,
                      valArray,
                      inputsValues,
                      index,
                    );
                  }}
                  inputs={inputs}
                  evmBC={evmBC}
                  lookupOnly={lookupOnly}
                  key={index}
                />
                {lookupOnly && (
                  <div className="udapp_value" data-id="udapp_value">
                    <TreeView id="treeView">
                      {Object.keys(props.instance.decodedResponse || {}).map(
                        (key) => {
                          const funcIndex = index.toString();
                          const response = props.instance.decodedResponse[key];

                          return key === funcIndex
                            ? Object.keys(response || {}).map(
                                (innerkey, _index) => {
                                  return renderData(
                                    props.instance.decodedResponse[key][
                                      innerkey
                                    ],
                                    response,
                                    innerkey,
                                    innerkey,
                                  );
                                },
                              )
                            : null;
                        },
                      )}
                    </TreeView>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="d-flex flex-column">
          <div className="d-flex flex-row justify-content-between mt-2">
            <div className="py-2 border-top d-flex justify-content-start flex-grow-1">
              <FormattedMessage id="udapp.lowLevelInteractions" />
            </div>
          </div>
          <div className="d-flex flex-column align-items-start">
            <label className="">CALLDATA</label>
            <div className="d-flex justify-content-end w-100 align-items-center">
              <CustomTooltip
                placement="bottom"
                tooltipClasses="text-nowrap"
                tooltipId="deployAndRunLLTxCalldataInputTooltip"
                tooltipText={<FormattedMessage id="udapp.tooltipText9" />}
              >
                <input
                  id="deployAndRunLLTxCalldata"
                  onChange={handleCalldataChange}
                  className="udapp_calldataInput form-control"
                />
              </CustomTooltip>
              <CustomTooltip
                placement="right"
                tooltipClasses="text-nowrap"
                tooltipId="deployAndRunLLTxCalldataTooltip"
                tooltipText={<FormattedMessage id="udapp.tooltipText10" />}
              >
                <button
                  id="deployAndRunLLTxSendTransaction"
                  data-id="pluginManagerSettingsDeployAndRunLLTxSendTransaction"
                  className="btn udapp_instanceButton p-0 w-50 border-warning text-warning"
                  onClick={sendData}
                >
                  Transact
                </button>
              </CustomTooltip>
            </div>
          </div>
          <div>
            <label id="deployAndRunLLTxError" className="text-danger my-2">
              {llIError}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
