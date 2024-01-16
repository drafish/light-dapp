import React, { useState, useEffect, useRef, type SyntheticEvent } from 'react';
import { FormattedMessage } from 'react-intl';

import TerminalWelcomeMessage from './terminalWelcome';
import { CustomTooltip } from '../CustomTooltip';
import RenderCall from './RenderCall';
import RenderKnownTransactions from './RenderKnownTransactions';
import parse from 'html-react-parser';

import {
  EMPTY_BLOCK,
  KNOWN_TRANSACTION,
  type RemixUiTerminalProps,
} from './types';

import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import './index.css';

export interface ClipboardEvent<T = Element> extends SyntheticEvent<T, any> {
  clipboardData: DataTransfer;
}

export const RemixUiTerminal = (props: RemixUiTerminalProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const dispatch = useAppDispatch();
  const { journalBlocks } = useAppSelector((state) => state.terminal);

  const [clearConsole, setClearConsole] = useState(false);

  const [showTableHash, setShowTableHash] = useState<any[]>([]);

  // terminal inputRef
  const inputEl = useRef<any>(null);
  const messagesEndRef = useRef<any>(null);
  const typeWriterIndexes = useRef<any>([]);

  // terminal dragable
  const panelRef = useRef(null);
  const terminalMenu = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [journalBlocks.length]);

  const handleClearConsole = () => {
    setClearConsole(true);
    typeWriterIndexes.current = [];
    dispatch({ type: 'terminal/save', payload: { console: [] } });
    inputEl.current.focus();
  };
  /* start of autoComplete */

  const txDetails = (event: any, tx: any) => {
    if (showTableHash.includes(tx.hash)) {
      const index = showTableHash.indexOf(tx.hash);
      if (index > -1) {
        setShowTableHash((prevState) => prevState.filter((x) => x !== tx.hash));
      }
    } else {
      setShowTableHash((prevState) => [...prevState, tx.hash]);
    }
    scrollToBottom();
  };

  const handleToggleTerminal = () => {
    setIsOpen(!isOpen);
    props.plugin.call('layout', 'minimize', props.plugin.profile.name, isOpen);
  };

  useEffect(() => {
    props.plugin.on(
      'layout',
      'change',
      (panels: { terminal: { minimized: any } }) => {
        setIsOpen(!panels.terminal.minimized);
      },
    );

    return () => {
      props.plugin.off('layout', 'change');
    };
  }, []);

  const classNameBlock = 'remix_ui_terminal_block px-4 py-1 text-break';

  return !props.visible ? (
    <></>
  ) : (
    <div
      style={{ flexGrow: 1 }}
      className="remix_ui_terminal_panel"
      ref={panelRef}
    >
      <div className="remix_ui_terminal_bar d-flex">
        <div
          className="remix_ui_terminal_menu d-flex w-100 align-items-center position-relative border-top border-dark bg-light"
          ref={terminalMenu}
          data-id="terminalToggleMenu"
        >
          <CustomTooltip
            placement="top"
            tooltipId="terminalToggle"
            tooltipClasses="text-nowrap"
            tooltipText={
              isOpen ? (
                <FormattedMessage id="terminal.hideTerminal" />
              ) : (
                <FormattedMessage id="terminal.showTerminal" />
              )
            }
          >
            <i
              className={`mx-2 remix_ui_terminal_toggleTerminal fas ${isOpen ? 'fa-angle-double-down' : 'fa-angle-double-up'}`}
              data-id="terminalToggleIcon"
              onClick={handleToggleTerminal}
            ></i>
          </CustomTooltip>
          <div
            className="mx-2 remix_ui_terminal_console"
            id="clearConsole"
            data-id="terminalClearConsole"
            onClick={handleClearConsole}
          >
            <CustomTooltip
              placement="top"
              tooltipId="terminalClear"
              tooltipClasses="text-nowrap"
              tooltipText={<FormattedMessage id="terminal.clearConsole" />}
            >
              <i className="fas fa-ban" aria-hidden="true"></i>
            </CustomTooltip>
          </div>
          <CustomTooltip
            placement="top"
            tooltipId="terminalClear"
            tooltipClasses="text-nowrap"
            tooltipText={<FormattedMessage id="terminal.pendingTransactions" />}
          >
            <div className="mx-2">0</div>
          </CustomTooltip>
        </div>
      </div>
      <div
        tabIndex={-1}
        className="remix_ui_terminal_container d-flex h-100 m-0 flex-column"
        data-id="terminalContainer"
      >
        <div className="position-relative d-flex flex-column-reverse h-100">
          <div
            id="journal"
            className="remix_ui_terminal_journal d-flex flex-column pt-3 pb-4 px-2 mx-2 mr-0"
            data-id="terminalJournal"
          >
            {!clearConsole && <TerminalWelcomeMessage />}
            {journalBlocks?.map((x: any, index: number) => {
              if (x.name === EMPTY_BLOCK) {
                return (
                  <div className={classNameBlock} data-id="block" key={index}>
                    <span className="remix_ui_terminal_tx">
                      <div className="remix_ui_terminal_txItem">
                        [
                        <span className="remix_ui_terminal_txItemTitle">
                          block:{x.message} -{' '}
                        </span>{' '}
                        0 {'transactions'} ]
                      </div>
                    </span>
                  </div>
                );
              } else if (x.name === KNOWN_TRANSACTION) {
                return x.message.map((trans: any) => {
                  return (
                    <div
                      className={classNameBlock}
                      data-id={`block_tx${trans.tx.hash}`}
                      key={index}
                    >
                      {trans.tx.isCall ? (
                        <RenderCall
                          tx={trans.tx}
                          resolvedData={trans.resolvedData}
                          logs={trans.logs}
                          index={index}
                          plugin={props.plugin}
                          showTableHash={showTableHash}
                          txDetails={txDetails}
                        />
                      ) : (
                        <RenderKnownTransactions
                          tx={trans.tx}
                          receipt={trans.receipt}
                          resolvedData={trans.resolvedData}
                          logs={trans.logs}
                          index={index}
                          plugin={props.plugin}
                          showTableHash={showTableHash}
                          txDetails={txDetails}
                          provider={x.provider}
                        />
                      )}
                    </div>
                  );
                });
              } else if (Array.isArray(x.message)) {
                return x.message.map((msg: any, i: number) => {
                  // strictly check condition on 0, false, except undefined, NaN.
                  // if you type `undefined`, terminal automatically throws error, it's error message: "undefined" is not valid JSON
                  // if you type `NaN`, terminal would give `null`
                  if (msg === false || msg === 0) msg = msg.toString();
                  else if (!msg) msg = 'null';
                  if (React.isValidElement(msg)) {
                    return (
                      <div className="px-4 block" data-id="block" key={i}>
                        <span className={x.style}>{msg}</span>
                      </div>
                    );
                  } else if (typeof msg === 'object') {
                    if (msg.value && isHtml(msg.value)) {
                      return (
                        <div className={classNameBlock} data-id="block" key={i}>
                          <span className={x.style}>{parse(msg.value)} </span>
                        </div>
                      );
                    }
                    let stringified;
                    try {
                      stringified = JSON.stringify(msg);
                    } catch (e) {
                      console.error(e);
                      stringified = '< value not displayable >';
                    }
                    return (
                      <div className={classNameBlock} data-id="block" key={i}>
                        <span className={x.style}>{stringified} </span>
                      </div>
                    );
                  } else {
                    // typeWriterIndexes: we don't want to rerender using typewriter when the react component updates
                    if (
                      x.typewriter &&
                      !typeWriterIndexes.current.includes(index)
                    ) {
                      typeWriterIndexes.current.push(index);
                      return (
                        <div
                          className={classNameBlock}
                          data-id="block"
                          key={index}
                        >
                          <span
                            ref={(element) => {
                              typewrite(
                                element,
                                msg ? msg.toString() : null,
                                () => {
                                  scrollToBottom();
                                },
                              );
                            }}
                            className={x.style}
                          ></span>
                        </div>
                      );
                    } else {
                      return (
                        <div className={classNameBlock} data-id="block" key={i}>
                          <span className={x.style}>
                            {msg ? msg.toString() : null}
                          </span>
                        </div>
                      );
                    }
                  }
                });
              } else {
                // typeWriterIndexes: we don't want to rerender using typewriter when the react component updates
                if (
                  x.typewriter &&
                  !typeWriterIndexes.current.includes(index)
                ) {
                  typeWriterIndexes.current.push(index);
                  return (
                    <div className={classNameBlock} data-id="block" key={index}>
                      {' '}
                      <span
                        ref={(element) => {
                          typewrite(element, x.message, () => {
                            scrollToBottom();
                          });
                        }}
                        className={x.style}
                      ></span>
                    </div>
                  );
                } else {
                  if (typeof x.message !== 'function') {
                    return (
                      <div
                        className={classNameBlock}
                        data-id="block"
                        key={index}
                      >
                        {' '}
                        <span className={x.style}> {x.message}</span>
                      </div>
                    );
                  }
                  return null;
                }
              }
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

const typewrite = (elementsRef: any, message: any, callback: any) => {
  (() => {
    let count = 0;
    const id = setInterval(() => {
      if (!elementsRef) return;
      count++;
      elementsRef.innerText = message.substr(0, count);
      // scroll when new line ` <br>
      if (elementsRef.lastChild.tagName === `BR`) callback();
      if (message.length === count) {
        clearInterval(id);
        callback();
      }
    }, 5);
  })();
};

function isHtml(value: any) {
  if (!value.indexOf) return false;
  return (
    value.indexOf('<div') !== -1 ||
    value.indexOf('<span') !== -1 ||
    value.indexOf('<p') !== -1 ||
    value.indexOf('<label') !== -1 ||
    value.indexOf('<b') !== -1
  );
}

export default RemixUiTerminal;
