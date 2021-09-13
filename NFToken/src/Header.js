import React from 'react'; 
import Dropdown from './Dropdown.js';

function Header({
  accounts, 
  contract, 
  selectedAccount,
  balance,
  selectAccount}) {
  return (
    <header id="header" className="card">
      <div className="row">
        <div className="col-sm-3">
        <div className="d-inline p-2 bg-dark text-white">My balance: {balance}</div>
        </div>
        <div className="col-sm-3 flex">
          <Dropdown 
              items={accounts.map((account) => ({
                label: account.address,
                value: account
              }))} 
              activeItem={{
                label: selectedAccount.address,
                value: selectedAccount
              }}
              onSelect={selectAccount}
            />
        </div>
        <div className="col-sm-9">
          <h1 className="header-title">
            Dex - <span className="contract-address">Contract address: <span className="address">{contract}</span></span>
          </h1>
        </div>
      </div>
    </header>
  );
}

export default Header;