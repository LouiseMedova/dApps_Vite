import './App.css';
import React, { useEffect, useState } from 'react';
import {
  binary,
  off_chain,
  ABI
} from './config';
import { PRIVATE_KEY } from './secrets';
import Header from './Header';
import { log } from 'util';
const { WS_RPC } = require('@vite/vitejs-ws');
const { client, ViteAPI, wallet, utils, abi, accountBlock, keystore } = require('@vite/vitejs');


function App() {

  const [num, setNum] = useState(undefined);
  const [owner, setOwner] = useState(undefined);
  //const [accounts, setAccounts] = useState(undefined);
  const [selectedAccount, setSelectedAccount] = useState(undefined);

  const seed = PRIVATE_KEY;
  const connection = new WS_RPC('ws://localhost:23457');
  const provider = new ViteAPI(connection, () => {
      console.log("client connected");
  });


  const myAccount = wallet.getWallet(seed).deriveAddress(0);
  console.log(wallet.getWallet(seed))
  const recipientAccount = wallet.getWallet(seed).deriveAddress(1);
  const account2 = wallet.getWallet(seed).deriveAddress(2);
  
  const accounts = new Array(10).fill(undefined).map((account,i) => wallet.getWallet(seed).deriveAddress(i));
  //  setAccounts(accounts);
  
  console.log(accounts);
  // fill in contract info
  const CONTRACT = {
      binary: binary,    // binary code
      abi: ABI,
      offChain: off_chain,  // binary offchain code
      address: 'vite_cc92c2495d83340d4f95728505d536e6e264aebde745075dbf',   // set address of your deployed contract
  }

  
  
async  function getterValues(account) {
    let params = [account.address];
    let data = abi.encodeFunctionCall(CONTRACT.abi[6], params);
    let dataBase64 = utils._Buffer.from(data, 'hex').toString('base64');

    const result  = await provider.request('contract_callOffChainMethod', {
            'selfAddr':CONTRACT.address,
            'offChainCode':CONTRACT.offChain,
            'data':dataBase64      
        });
        const res =  parseInt(Buffer.from(result, 'base64').toString('hex'),16);
        console.log(res);
        setNum(res);
}

async  function getOwner(e) {
  e.preventDefault();
  const tokenId = e.target.elements[0].value;
  let params = [tokenId];
  let data = abi.encodeFunctionCall(CONTRACT.abi[1], params);
  console.log(CONTRACT.abi);
  let dataBase64 = utils._Buffer.from(data, 'hex').toString('base64');

  const result  = await provider.request('contract_callOffChainMethod', {
          'selfAddr':CONTRACT.address,
          'offChainCode':CONTRACT.offChain,
          'data':dataBase64      
      });
      console.log(Buffer.from(result, 'base64').toString('hex'));
      const owner =  parseInt(Buffer.from(result, 'base64').toString('hex'),16);
      console.log(owner);
      setOwner(owner);
}
async  function callContract(account, methodName, abi, params, amount) {
  console.log(account.address);
   const block = accountBlock.createAccountBlock('callContract', {
            address: account.address,
            abi,
            toAddress: CONTRACT.address,
            methodName: methodName,
            params,
            amount
    }).setProvider(provider).setPrivateKey(account.privateKey);

    await block.autoSetPreviousAccountBlock();
    const result = await block.sign().send();
    console.log('call success', result);
}
async  function createToken() {
      await callContract(selectedAccount, 'createToken', CONTRACT.abi, []);
}

async  function transfer(e) {
  e.preventDefault();
  const from = e.target.elements[0].value;
  const to = e.target.elements[1].value;
  const tokenId = e.target.elements[2].value;
  await callContract(selectedAccount, 'safeTransferFrom', CONTRACT.abi, [from, to, tokenId]);
}

async  function approve(e) {
  e.preventDefault();
  const approved  = e.target.elements[0].value;
  const tokenId = e.target.elements[1].value;
  await callContract(selectedAccount, 'approve', CONTRACT.abi, [approved, tokenId]);
}

async function receiveTransaction(account) {
    // get the first unreceived tx
    const data = await provider.request('ledger_getUnreceivedBlocksByAddress', account.address, 0, 1);
    if (!data || !data.length) {
        console.log('[LOG] No Unreceived Blocks');
        return;
    }
    // create a receive tx
    const ab = accountBlock.createAccountBlock('receive', {
        address: account.address,
        sendBlockHash: data[0].hash
    }).setProvider(provider).setPrivateKey(account.privateKey);

    await ab.autoSetPreviousAccountBlock();
    const result = await ab.sign().send();
    console.log('receive success', result);
} 

const selectAccount = account => {
  setSelectedAccount(account);
}
useEffect(() => {
  const init = async () => {
    console.log(selectedAccount);
    setSelectedAccount(accounts[0]);
    getterValues(accounts[0]);

  }
  init();

}, []);


if(typeof selectedAccount === 'undefined') {
  return <div>Loading...</div>
}

  return (
    <div id="app">
      <Header
          contract={CONTRACT.address}
          accounts={accounts}
          selectedAccount={selectedAccount}
          selectAccount={selectAccount}
      />
      <main className="container-fluid">
        <div className="row">
          <div className="col-sm- first-col">
          <button 
                  onClick={e => createToken()}
                  type="submit" 
                  className="btn btn-primary"
                >
                  Create Token
            </button>  
          </div>
        
        <div className="col-sm-8">
          <h2>Transfer token</h2>
          <form onSubmit={e => transfer(e)}>
            <div className="form-group">
              <input 
                placeholder="from"
                className="mt-8 border rounded p-4"
                type="text" 
                id="from" 
                />
            </div>
            <div className="form-group">
              <input 
                placeholder="to"
                className="mt-8 border rounded p-4"
                type="text" 
                id="to" 
                />
            </div>
            <div className="form-group">
              <input 
                placeholder="tokenId"
                className="mt-8 border rounded p-4"
                type="text" 
                id="tokenId" />
            </div>
            <button type="submit" className="btn btn-primary">transfer</button>
          </form>
        </div>

        <div className="col-sm-12">
          <h2>Approve token</h2>
          <form onSubmit={e => approve(e)}>
            <div className="form-group">
              <input 
                placeholder="approved address"
                className="mt-8 border rounded p-4"
                type="text" 
                id="from" 
                />
            </div>
            <div className="form-group">
              <input 
                placeholder="tokenId"
                className="mt-8 border rounded p-4"
                type="text" 
                id="tokenId" />
            </div>
            <button type="submit" className="btn btn-primary">approve</button>
          </form>
        </div>
      </div>
       
      {num > 0 ? (
        <p>NFTTokens: {num}</p>
      ) : null}
      <button 
        type="button" 
        onClick={() => getterValues(selectedAccount)}
        >My balance
      </button>
      <h2>Approve token</h2>
          <form onSubmit={e => getOwner(e)}>
            <div className="form-group">
              <input 
                placeholder="tokenId"
                className="mt-8 border rounded p-4"
                type="text" 
                id="tokenId" />
            </div>
            <button type="submit" className="btn btn-primary">Owner of token</button>
          </form>
          </main>
    </div>
  );
}

export default App;
