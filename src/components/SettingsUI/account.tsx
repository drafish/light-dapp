import React, { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { CopyToClipboard } from '../CopyToClipboard';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';

export function AccountUI() {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { selectedAccount, loadedAccounts, isRequesting } = useAppSelector(
    (state) => state.settings,
  );
  const accounts = Object.keys(loadedAccounts);

  const setAccount = (account: string) => {
    dispatch({ type: 'settings/save', payload: { selectedAccount: account } });
  };

  useEffect(() => {
    if (!selectedAccount && accounts.length > 0) setAccount(accounts[0]);
  }, [accounts, selectedAccount]);

  return (
    <div className="udapp_crow">
      <label className="udapp_settingsLabel">
        <FormattedMessage id="udapp.account" />
        {isRequesting && (
          <i className="fa fa-spinner fa-pulse ml-2" aria-hidden="true"></i>
        )}
      </label>
      <div className="udapp_account">
        <select
          id="txorigin"
          data-id="runTabSelectAccount"
          name="txorigin"
          className="form-control udapp_select custom-select pr-4"
          value={selectedAccount || ''}
          onChange={(e) => {
            setAccount(e.target.value);
          }}
        >
          {accounts.map((value, index) => (
            <option value={value} key={index}>
              {loadedAccounts[value]}
            </option>
          ))}
        </select>
        <div style={{ marginLeft: -5 }}>
          <CopyToClipboard
            tip={intl.formatMessage({ id: 'udapp.copyAccount' })}
            content={selectedAccount}
            direction="top"
          />
        </div>
      </div>
    </div>
  );
}
