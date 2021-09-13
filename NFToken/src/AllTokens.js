import React, { useState } from 'react';
import { Row } from "react-bootstrap";
import TokenItem from './TokenItem';


function AllTokens({className, allTokens,transfer,approve}) {
    
    return (
        <Row className={`${className} d-flex`}>
            {allTokens.map((token,i) =>
                <TokenItem 
                    key={i} 
                    token={token}
                    transfer={transfer}
                    approve={approve}/>
                )}

        </Row>
    );
}

export default AllTokens;