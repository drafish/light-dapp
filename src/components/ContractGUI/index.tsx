// eslint-disable-next-line no-use-before-define
import React, { useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import * as remixLib from '@remix-project/remix-lib';
import { CopyToClipboard } from '../CopyToClipboard';
import { CustomTooltip } from '../CustomTooltip';

const txFormat = remixLib.execution.txFormat;
const txHelper = remixLib.execution.txHelper;
export function ContractGUI(props: any) {
  const [title, setTitle] = useState<string>('');
  const [basicInput, setBasicInput] = useState<string>('');
  const [toggleContainer, setToggleContainer] = useState<boolean>(false);
  const [buttonOptions, setButtonOptions] = useState<{
    title: string;
    content: string;
    classList: string;
    dataId: string;
  }>({ title: '', content: '', classList: '', dataId: '' });
  const multiFields = useRef<Array<HTMLInputElement | null>>([]);
  const basicInputRef = useRef<any>();
  const intl = useIntl();

  useEffect(() => {
    if (props.title) {
      setTitle(props.title);
    } else if (props.funcABI.name) {
      setTitle(props.funcABI.name);
    } else {
      setTitle(props.funcABI.type === 'receive' ? '(receive)' : '(fallback)');
    }
    setBasicInput('');
    // we have the reset the fields before reseting the previous references.
    if (basicInputRef.current) basicInputRef.current.value = '';
    multiFields.current
      .filter((el) => el !== null && el !== undefined)
      .forEach((el: any) => (el.value = ''));
    multiFields.current = [];
  }, [props.title, props.funcABI]);

  useEffect(() => {
    if (props.lookupOnly) {
      //   // call. stateMutability is either pure or view
      setButtonOptions({
        title: title + ' - call',
        content: 'call',
        classList: 'btn-info',
        dataId: title + ' - call',
      });
    } else if (
      props.funcABI.stateMutability === 'payable' ||
      props.funcABI.payable
    ) {
      //   // transact. stateMutability = payable
      setButtonOptions({
        title: title + ' - transact (payable)',
        content: 'transact',
        classList: 'btn-danger',
        dataId: title + ' - transact (payable)',
      });
    } else {
      //   // transact. stateMutability = nonpayable
      setButtonOptions({
        title: title + ' - transact (not payable)',
        content: 'transact',
        classList: 'btn-warning',
        dataId: title + ' - transact (not payable)',
      });
    }
  }, [props.lookupOnly, props.funcABI, title]);

  const getEncodedCall = () => {
    const multiString = getMultiValsString(multiFields.current);
    // copy-to-clipboard icon is only visible for method requiring input params
    if (!multiString) {
      return intl.formatMessage({ id: 'udapp.getEncodedCallError' });
    }
    const multiJSON = JSON.parse('[' + multiString + ']');

    const encodeObj = txFormat.encodeData(
      props.funcABI,
      multiJSON,
      props.funcABI.type === 'constructor' ? props.evmBC : null,
    );

    if (encodeObj.error) {
      console.error(encodeObj.error);
      return encodeObj.error;
    } else {
      return encodeObj.data;
    }
  };

  const getEncodedParams = () => {
    try {
      const multiString = getMultiValsString(multiFields.current);
      // copy-to-clipboard icon is only visible for method requiring input params
      if (!multiString) {
        return intl.formatMessage({ id: 'udapp.getEncodedCallError' });
      }
      const multiJSON = JSON.parse('[' + multiString + ']');
      return txHelper.encodeParams(props.funcABI, multiJSON);
    } catch (e) {
      console.error(e);
    }
  };

  const switchMethodViewOn = () => {
    setToggleContainer(true);
    makeMultiVal();
  };

  const switchMethodViewOff = () => {
    setToggleContainer(false);
    const multiValString = getMultiValsString(multiFields.current);

    if (multiValString) setBasicInput(multiValString);
  };

  const getMultiValsString = (fields: (HTMLInputElement | null)[]) => {
    const valArray = fields as HTMLInputElement[];
    let ret = '';
    const valArrayTest = [];

    for (let j = 0; j < valArray.length; j++) {
      if (ret !== '') ret += ',';
      let elVal = valArray[j] ? valArray[j].value : '';

      valArrayTest.push(elVal);
      elVal = elVal.replace(/(^|,\s+|,)(\d+)(\s+,|,|$)/g, '$1"$2"$3'); // replace non quoted number by quoted number
      elVal = elVal.replace(
        /(^|,\s+|,)(0[xX][0-9a-fA-F]+)(\s+,|,|$)/g,
        '$1"$2"$3',
      ); // replace non quoted hex string by quoted hex string
      if (elVal) {
        try {
          JSON.parse(elVal);
        } catch (e) {
          elVal = '"' + elVal + '"';
        }
      }
      ret += elVal;
    }
    const valStringTest = valArrayTest.join('');

    if (valStringTest) {
      return ret;
    } else {
      return '';
    }
  };

  const makeMultiVal = () => {
    const inputString = basicInput;

    if (inputString) {
      const inputJSON =
        remixLib.execution.txFormat.parseFunctionParams(inputString);
      const multiInputs = multiFields.current as HTMLInputElement[];

      for (let k = 0; k < multiInputs.length; k++) {
        if (inputJSON[k]) {
          multiInputs[k].value = JSON.stringify(inputJSON[k]);
        }
      }
    }
  };

  const handleActionClick = async () => {
    props.clickCallBack(props.funcABI.inputs, basicInput);
  };

  const handleBasicInput = (e: { target: { value: any } }) => {
    const value = e.target.value;

    setBasicInput(value);
  };

  const handleExpandMultiClick = () => {
    const valsString = getMultiValsString(multiFields.current);

    if (valsString) {
      props.clickCallBack(props.funcABI.inputs, valsString);
    } else {
      props.clickCallBack(props.funcABI.inputs, '');
    }
  };

  return (
    <div
      className={`udapp_contractProperty ${
        (props.funcABI.inputs && props.funcABI.inputs.length > 0) ||
        props.funcABI.type === 'fallback' ||
        props.funcABI.type === 'receive'
          ? 'udapp_hasArgs'
          : ''
      }`}
    >
      <div
        className="udapp_contractActionsContainerSingle pt-2"
        style={{ display: toggleContainer ? 'none' : 'flex' }}
      >
        <CustomTooltip
          delay={0}
          placement={'right'}
          tooltipClasses="text-wrap"
          tooltipId="remixUdappInstanceButtonTooltip"
          tooltipText={
            props.inputs !== '' && basicInput === ''
              ? intl.formatMessage({ id: 'udapp.tooltipText12' })
              : buttonOptions.title
          }
        >
          <div
            className="d-flex btn p-0 wrapperElement"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={handleActionClick}
            data-id={buttonOptions.dataId}
            data-title={buttonOptions.title}
          >
            <button
              className={`udapp_instanceButton text-nowrap overflow-hidden text-truncate ${props.widthClass} btn btn-sm ${buttonOptions.classList}`}
              data-id={buttonOptions.dataId}
              data-title={buttonOptions.title}
              disabled={
                props.disabled || (props.inputs !== '' && basicInput === '')
              }
              style={{ pointerEvents: 'none' }}
            >
              {title}
            </button>
          </div>
        </CustomTooltip>
        <input
          className="form-control"
          data-id={
            props.funcABI.type === 'fallback' ||
            props.funcABI.type === 'receive'
              ? `'(${props.funcABI.type}')`
              : 'multiParamManagerBasicInputField'
          }
          placeholder={props.inputs}
          onChange={handleBasicInput}
          data-title={
            props.funcABI.type === 'fallback' ||
            props.funcABI.type === 'receive'
              ? `'(${props.funcABI.type}')`
              : props.inputs
          }
          ref={basicInputRef}
          style={{
            height: '2rem',
            visibility: !(
              (props.funcABI.inputs && props.funcABI.inputs.length > 0) ||
              props.funcABI.type === 'fallback' ||
              props.funcABI.type === 'receive'
            )
              ? 'hidden'
              : 'visible',
          }}
        />
        <i
          className="fas fa-angle-down udapp_methCaret"
          onClick={switchMethodViewOn}
          style={{
            visibility: !(
              props.funcABI.inputs && props.funcABI.inputs.length > 0
            )
              ? 'hidden'
              : 'visible',
          }}
        ></i>
      </div>
      <div
        className="udapp_contractActionsContainerMulti"
        style={{ display: toggleContainer ? 'flex' : 'none' }}
      >
        <div className="udapp_contractActionsContainerMultiInner text-dark">
          <div onClick={switchMethodViewOff} className="udapp_multiHeader">
            <div className="udapp_multiTitle run-instance-multi-title pt-3">
              {title}
            </div>
            <i className="fas fa-angle-up udapp_methCaret"></i>
          </div>
          <div>
            {props.funcABI.inputs.map((inp: any, index: number) => {
              return (
                <div className="udapp_multiArg" key={index}>
                  <label htmlFor={inp.name}> {inp.name}: </label>
                  <CustomTooltip
                    placement="left-end"
                    tooltipId="udappContractActionsTooltip"
                    tooltipClasses="text-nowrap"
                    tooltipText={inp.name}
                  >
                    <input
                      ref={(el) => {
                        multiFields.current[index] = el;
                      }}
                      className="form-control"
                      placeholder={inp.type}
                      data-id={`multiParamManagerInput${inp.name}`}
                      onChange={handleBasicInput}
                    />
                  </CustomTooltip>
                </div>
              );
            })}
          </div>
          <div className="d-flex udapp_group udapp_multiArg">
            <CopyToClipboard
              tip={intl.formatMessage({ id: 'udapp.copyCalldata' })}
              icon="fa-clipboard"
              direction={'bottom'}
              getContent={getEncodedCall}
            >
              <button className="btn remixui_copyButton">
                <i
                  id="copyCalldata"
                  className="m-0 remixui_copyIcon far fa-copy"
                  aria-hidden="true"
                ></i>
                <label htmlFor="copyCalldata">Calldata</label>
              </button>
            </CopyToClipboard>
            <CopyToClipboard
              tip={intl.formatMessage({ id: 'udapp.copyParameters' })}
              icon="fa-clipboard"
              direction={'bottom'}
              getContent={getEncodedParams}
            >
              <button className="btn remixui_copyButton">
                <i
                  id="copyParameters"
                  className="m-0 remixui_copyIcon far fa-copy"
                  aria-hidden="true"
                ></i>
                <label htmlFor="copyParameters">
                  <FormattedMessage id="udapp.parameters" />
                </label>
              </button>
            </CopyToClipboard>
            <CustomTooltip
              placement={'right'}
              tooltipClasses="text-nowrap"
              tooltipId="remixUdappInstanceButtonTooltip"
              tooltipText={buttonOptions.title}
            >
              <div onClick={handleExpandMultiClick}>
                <button
                  type="button"
                  data-id={buttonOptions.dataId}
                  className={`udapp_instanceButton btn ${buttonOptions.classList}`}
                  disabled={
                    props.disabled || (props.inputs !== '' && basicInput === '')
                  }
                >
                  {buttonOptions.content}
                </button>
              </div>
            </CustomTooltip>
          </div>
        </div>
      </div>
    </div>
  );
}