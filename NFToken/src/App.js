import './App.css';
import React, { useEffect, useState } from 'react';
import bs58 from 'bs58';
import { PRIVATE_KEY } from './secrets';
import { Image, Card, Col } from "react-bootstrap";

import Header from './Header';
import CreateToken from './CreateToken';
import MyTokens from './MyTokens';
import AllTokens from './AllTokens';

const {  utils, abi, accountBlock } = require('@vite/vitejs');
const IPFS = require('ipfs-api');

const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

function App({provider, accounts, contract}) {

  const [balance, setBalance] = useState(undefined);
  const [selectedAccount, setSelectedAccount] = useState(undefined);
  const [tokens, setTokens] = useState([]);
  const [allTokens, setAllTokens] = useState([]);
  const [fileBuffer, setFileBuffer] = useState(undefined);
  const [hiddenForms, setHiddenForms] = useState({
    createTokenForm: true,
    myTokensForm: true,
    allTokensForm: true
  });


async  function getValues(method, params) {
    let i;
    for(i = 0; i < contract.abi.length; i++ ) {
      if(contract.abi[i].name === method){
        break;
      }
    }
    console.log(contract.abi[i]);
    console.log(params);
    let data = abi.encodeFunctionCall(contract.abi[i], params);
    let dataBase64 = utils._Buffer.from(data, 'hex').toString('base64');

    const result  = await provider.request('contract_callOffChainMethod', {
            'selfAddr':contract.address,
            'offChainCode':contract.offChain,
            'data':dataBase64      
        });
        
    return result;
}



async  function callContract(account, methodName, abi, params, amount) {
  
   const block = accountBlock.createAccountBlock('callContract', {
            address: account.address,
            abi,
            toAddress: contract.address,
            methodName: methodName,
            params,
            amount
    }).setProvider(provider).setPrivateKey(account.privateKey);

    await block.autoSetPreviousAccountBlock();
    const result = await block.sign().send();
    console.log('call success', result);
}

async  function createMetaToken(e) {

  console.log(fileBuffer);
  const ipfsHashFile = await ipfs.add(fileBuffer);
  console.log(ipfsHashFile[0].hash);
  const data = JSON.stringify({ 
        name: e.target.elements[0].value,
        desc: e.target.elements[1].value,
        img:  ipfsHashFile[0].hash
      }, null, ' ');

      console.log(data);
      const buffer = await Buffer.from(data);
      console.log(buffer);
      await ipfs.add(buffer, (err, ipfsHash) => {
        const shorten = (hash) => '0x' + bs58.decode(hash).slice(2).toString('hex');
        const short_hash = shorten(ipfsHash[0].hash);
  
     callContract(selectedAccount, 'createToken', contract.abi, [short_hash]);

      });
  
}

async  function transfer(e, id) {
  e.preventDefault();
  const from = await getOwner(id);
  const to = e.target.elements[0].value;
  await callContract(selectedAccount, 'safeTransferFrom', contract.abi, [from[0], to, id]);
}

async function getMetaData (id) {
  const result = await getValues('getTokenURI', [id]);
  const lengthen = (short) => bs58.encode(Buffer.from('1220' + short.slice(2), 'hex'));
  const hash = lengthen("0x"+ Buffer.from(result, 'base64').toString('hex'));
  const content = fetch("https://gateway.ipfs.io/ipfs/"+hash)
                      .then((result) =>{return result.text()} );
  const getData =  JSON.parse(await content);
  getData.id = id;
  return getData;
  //console.log(getData);             
}

async function getBalance (account) { 
  const result = await getValues('getBalance', [account.address]);
  const balance =  parseInt(Buffer.from(result, 'base64').toString('hex'),16);
  setBalance(balance);
}

async function getTokens (account) { 
  const result = await getValues('getTokensOf', [account.address]);
  const param = Buffer.from(result, 'base64').toString('hex');
  const tokenIds = (abi.decodeParameters(['uint256[]'],param))[0];
  console.log('tokenIds', tokenIds);
  const tokens = [];
  for (let i = 0; i < tokenIds.length; i++) {
      const token =  await getMetaData(tokenIds[i]);
      tokens.push(token);
  }
  console.log(tokens);
  setTokens(tokens);
}

async  function getOwner(tokenId) {
  const result = await getValues('getOwnerOf', [tokenId]);
  const param = Buffer.from(result, 'base64').toString('hex');
  let owner = abi.decodeParameters(['address'],param);
  return owner;
}

async  function getAllTokens() {
  const result = await getValues('getTotalNumberOfTokens', []);
  const param = Buffer.from(result, 'base64').toString('hex');
  let totalNumber = abi.decodeParameters(['uint256'],param);
  const tokens = [];
  for (let i = 0; i < totalNumber; i++) {
    const token =  await getMetaData(i);
    tokens.push(token);
}
setAllTokens(tokens);

}
async  function approve(e, id) {
  e.preventDefault();
  const approved  = e.target.elements[0].value;
  await callContract(selectedAccount, 'approve', contract.abi, [approved,id]);
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
  getBalance(account);
  getTokens(account); 
}

async function convertToBuffer (reader)  {
  //  file is converted to a buffer for upload to IPFS
      const buffer = await Buffer.from(reader.result);
      await setFileBuffer(buffer);
  };

function captureFile (e)  {
  e.stopPropagation()
  e.preventDefault()
  const file = e.target.files[0]
  console.log(file);
  let reader = new window.FileReader()
  reader.readAsArrayBuffer(file)
  reader.onloadend = () => convertToBuffer(reader)  
  };

useEffect(() => {
  const init = async () => {
    setSelectedAccount(accounts[0]);
    getBalance(accounts[0]);
    getTokens(accounts[0]);
    getAllTokens();
  }
  init();
}, []);

if(typeof selectedAccount === 'undefined') {
  return <div>Loading...</div>
}



  return (
    <div id="app">
      <Header
          contract={contract.address}
          accounts={accounts}
          selectedAccount={selectedAccount}
          balance={balance}
          selectAccount={selectAccount}
      />
      <div className="buttons-container">
        <button onClick={() => {
          setHiddenForms({
            createTokenForm: !hiddenForms.createTokenForm,
            myTokensForm: true,
            allTokensForm: true
          });
        }}>
          Create Token
        </button>
        <button onClick={() => {
          setHiddenForms({
            myTokensForm: !hiddenForms.myTokensForm,
            createTokenForm: true,
            allTokensForm: true
          });
        }}>
          My Tokens
        </button>
        <button onClick={() => {
          setHiddenForms({
            createTokenForm: true,
            myTokensForm: true,
            allTokensForm: !hiddenForms. allTokensForm
          });
        }}>
          All tokens
        </button>
      </div>


      <CreateToken
        className={hiddenForms.createTokenForm ? 'hidden' : ''}
        createMetaToken={createMetaToken}
        captureFile={captureFile}
        />
      <MyTokens
        className={hiddenForms.myTokensForm ? 'hidden' : ''}
        tokens={tokens}
        transfer={transfer}
        approve={approve}
        />
      <AllTokens
        className={hiddenForms.allTokensForm ? 'hidden' : ''}
        allTokens={allTokens}
        transfer={transfer}
        approve={approve}
      />

                
    </div>
  );
}

export default App;
