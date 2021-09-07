import './App.css';
import React, { useEffect, useState } from 'react';
import {
  binary,
  off_chain,
  ABI
} from './config';
import { PRIVATE_KEY } from './secrets';
const { WS_RPC } = require('@vite/vitejs-ws');
const { client, ViteAPI, wallet, utils, abi, accountBlock, keystore } = require('@vite/vitejs');


function App() {

  const [num, setNum] = useState(undefined);

  const seed = PRIVATE_KEY;
  const connection = new WS_RPC('ws://localhost:23457');
  const provider = new ViteAPI(connection, () => {
      console.log("client connected");
  });


  const myAccount = wallet.getWallet(seed).deriveAddress(0);
  const recipientAccount = wallet.getWallet(seed).deriveAddress(1);
  const account2 = wallet.getWallet(seed).deriveAddress(2);
  console.log(num);
  // fill in contract info
  const CONTRACT = {
      binary: binary,    // binary code
      abi: ABI,
      offChain: off_chain,  // binary offchain code
      address: 'vite_2905b4f0bebc6519a303f3f9ed5ad0ecd0c16b168722b6df17',   // set address of your deployed contract
  }

  useEffect(() => {
    const init = async () => {
      getterValues()

    }
    init();

  }, []);

async  function getterValues() {
    let params = [myAccount.address];
    console.log(myAccount.address);
    console.log(recipientAccount.address);
    console.log(CONTRACT.abi[4]);
    console.log(ABI);
    let data = abi.encodeFunctionCall(CONTRACT.abi[4], params);
    let dataBase64 = utils._Buffer.from(data, 'hex').toString('base64');

    const result  = await provider.request('contract_callOffChainMethod', {
            'selfAddr':CONTRACT.address,
            'offChainCode':CONTRACT.offChain,
            'data':dataBase64      
        });
        const res =  parseInt(Buffer.from(result, 'base64').toString('hex'));
        console.log(res);
        setNum(res);
}

async  function callContract(account, methodName, abi, params, amount) {
   const block = accountBlock.createAccountBlock('callContract', {
            address: account.address,
            abi,
            toAddress: CONTRACT.address,
            methodName: methodName,
            params,
            amount
    }).setProvider(provider).setPrivateKey(account.privateKey);

       console.log(block);

    await block.autoSetPreviousAccountBlock();
    const result = await block.sign().send();
    console.log('call success', result);
}
async  function createToken() {
      await callContract(myAccount, 'createToken', CONTRACT.abi, []);
}

async  function transfer(e) {
  e.preventDefault();
  const from = e.target.elements[0].value;
  const to = e.target.elements[1].value;
  const tokenId = e.target.elements[2].value;
  await callContract(account2, 'transferFrom', CONTRACT.abi, [from, to, tokenId]);
}

async  function approve(e) {
  e.preventDefault();
  const approved  = e.target.elements[0].value;
  const tokenId = e.target.elements[1].value;
  await callContract(myAccount, 'approve', CONTRACT.abi, [approved, tokenId]);
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

  return (
    <div className="container">
        <div className="row">
        <div className="col-sm-12">
          <button 
                  onClick={e => createToken()}
                  type="submit" 
                  className="btn btn-primary"
                >
                  Create Token
            </button>        
        </div>
        <div className="col-sm-12">
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
       <p>Address: {myAccount.address}</p>
      {num > 0 ? (
        <p>NFTTokens: {num}</p>
      ) : null}
    </div>
  );
}

export default App;
