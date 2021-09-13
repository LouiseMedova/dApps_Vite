import {
  binary,
  off_chain,
  ABI
} from './config';
import { PRIVATE_KEY } from './secrets';
const { WS_RPC } = require('@vite/vitejs-ws');
const { ViteAPI, wallet, utils, abi, accountBlock, keystore } = require('@vite/vitejs');

const getProvider = () => {
    const seed = PRIVATE_KEY;
    const connection = new WS_RPC('ws://localhost:23457');
    console.log(connection);

    const provider = new ViteAPI(connection, () => {
        console.log("client connected");
});
    return provider;
}

const getAccounts = () => {
    const accounts = new Array(10).fill(undefined).map((account,i) => wallet.getWallet(PRIVATE_KEY).deriveAddress(i));
    return accounts;
}

const getContract = () => {
    const CONTRACT = {
        binary: binary,    // binary code
        abi: ABI,
        offChain: off_chain,  // binary offchain code
        address: 'vite_cc92c2495d83340d4f95728505d536e6e264aebde745075dbf',   // set address of your deployed contract
    }
    console.log(CONTRACT.abi);
    return CONTRACT;
}

export {getProvider, getAccounts, getContract};
