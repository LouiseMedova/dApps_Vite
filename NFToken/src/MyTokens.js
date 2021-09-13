import React, { useState } from 'react';
import { Row } from "react-bootstrap";
import TokenItem from './TokenItem';


function MyTokens({className, tokens,transfer,approve}) {
    
    return (
        <Row className={`${className} d-flex`}>
            {tokens.map((token,i) =>
                <TokenItem 
                    key={i} 
                    token={token}
                    transfer={transfer}
                    approve={approve}/>
                )}

        </Row>
    );
}

export default MyTokens;