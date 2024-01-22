import React from 'react';

const HomePage: React.FC = () => {
  const queryParams = new URLSearchParams(location.search);
  const address = queryParams.get('address');
  const abi = queryParams.get('abi') as string;
  console.log(JSON.parse(abi));

  return (
    <div>
      <div>{address}</div>
      <div>{abi}</div>
    </div>
  );
};

export default HomePage;
