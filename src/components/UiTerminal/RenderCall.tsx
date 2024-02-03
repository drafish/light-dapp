import React from 'react';
import { shortenHexData } from '../UiHelper';
import CheckTxStatus from './ChechTxStatus';
import showTable from './Table';
import { execution } from '@remix-project/remix-lib';

const typeConversion = execution.typeConversion;

const RenderCall = ({
  tx,
  resolvedData,
  logs,
  index,
  showTableHash,
  txDetails,
}: any) => {
  const to = resolvedData.contractName + '.' + resolvedData.fn;
  const from = tx.from ? tx.from : ' - ';
  const input = tx.input ? shortenHexData(tx.input) : '';
  const txType = 'call';

  return (
    <span id={`tx${tx.hash}`} key={index}>
      <div
        className="remix_ui_terminal_log"
        onClick={(event) => txDetails(event, tx)}
      >
        <CheckTxStatus tx={tx} type={txType} />
        <span>
          <span className="remix_ui_terminal_tx">[call]</span>
          <div className="remix_ui_terminal_txItem">
            <span className="remix_ui_terminal_txItemTitle">from:</span> {from}
          </div>
          <div className="remix_ui_terminal_txItem">
            <span className="remix_ui_terminal_txItemTitle">to:</span> {to}
          </div>
          <div className="remix_ui_terminal_txItem">
            <span className="remix_ui_terminal_txItemTitle">data:</span> {input}
          </div>
        </span>
        <i
          className={`remix_ui_terminal_arrow fas ${showTableHash.includes(tx.hash) ? 'fa-angle-up' : 'fa-angle-down'}`}
        ></i>
      </div>
      {showTableHash.includes(tx.hash)
        ? showTable(
            {
              hash: tx.hash,
              isCall: tx.isCall,
              contractAddress: tx.contractAddress,
              data: tx,
              from,
              to,
              gas: tx.gas,
              input: tx.input,
              'decoded input': resolvedData?.params
                ? JSON.stringify(
                    typeConversion.stringify(resolvedData.params),
                    null,
                    '\t',
                  )
                : ' - ',
              'decoded output': resolvedData?.decodedReturnValue
                ? JSON.stringify(
                    typeConversion.stringify(resolvedData.decodedReturnValue),
                    null,
                    '\t',
                  )
                : ' - ',
              val: tx.value,
              logs,
              transactionCost: tx.transactionCost,
              executionCost: tx.executionCost,
            },
            showTableHash,
          )
        : null}
    </span>
  );
};

export default RenderCall;
