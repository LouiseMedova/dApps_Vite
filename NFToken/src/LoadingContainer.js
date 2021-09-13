import React, { useState, useEffect } from 'react';
import {getProvider, getAccounts, getContract} from './utils';
import App from './App';

function LoadingContainer() {
    const [provider, setProvider] = useState(undefined);
    const [accounts, setAccounts] = useState([]);
    const[contract, setContract] = useState(undefined);

    useEffect(() => {
        const init =   () => {
            const provider = getProvider();
            const accounts = getAccounts();
            const contract = getContract();
            setProvider(provider);
            setAccounts(accounts);
            setContract(contract);
            console.log(contract);
        }
        init();
    }, []);

    const isReady = () => {
        return (
            typeof provider !== 'undefined'
            && typeof contract !== 'undefined'
            && accounts.length > 0
        );
      }
      
      if(!isReady()) {
        return <div>Loading...</div>
      }

    return (
        <App
            provider={provider}
            accounts={accounts}
            contract={contract}
        />
    )
}

export default LoadingContainer;