import React, { useEffect } from 'react';
import { UniversalDappUI } from '../../components/UniversalDappUI';
import { SettingsUI } from '../../components/SettingsUI';
import RemixUiTerminal from '../../components/UiTerminal';
import DragBar from '../../components/DragBar';
import { useAppDispatch } from '../../redux/hooks';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch({ type: 'settings/connect' });
  }, []);

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
      <DragBar />
      <RemixUiTerminal />
    </div>
  );
};

export default HomePage;
