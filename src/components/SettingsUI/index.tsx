import React from 'react';
import { NetworkUI } from './network';
import { AccountUI } from './account';
import { GasPriceUI } from './gasPrice';
import { ValueUI } from './value';

export function SettingsUI() {
  return (
    <div className="udapp_settings">
      <NetworkUI />
      <AccountUI />
      <GasPriceUI />
      <ValueUI />
    </div>
  );
}
