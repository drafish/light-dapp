import React from 'react';
import { UniversalDappUI } from '../../components/UniversalDappUI';
import { SettingsUI } from '../../components/SettingsUI';
import RemixUiTerminal from '../../components/UiTerminal';

const HomePage: React.FC = () => {
  return (
    <div>
      <div className="grid">
        <div className="col-9 d-inline-block">
          <UniversalDappUI />
        </div>
        <div className="col-3 d-inline-block">
          <SettingsUI />
        </div>
      </div>
      <RemixUiTerminal />
    </div>
  );
};

export default HomePage;
