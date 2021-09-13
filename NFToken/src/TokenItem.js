import React, { useState } from 'react';
import { Image, Card, Col } from "react-bootstrap";
import styled from "styled-components";

function TokenItem({token, transfer, approve}) {
    
    const [hiddenForms, setHiddenForms] = useState({
        transfer: true,
        approve: true
    });
   
    return (
        <Col md={3} className="mt-3">
              <Card style={{width: 150, cursor: 'pointer'}} border={"light"}>
                <Image width={150} height={150} src={`https://gateway.ipfs.io/ipfs/${token.img}`} />
                  <div className="text-black-50 mt-1 d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                          <div>{token.name}</div>
                      </div>  
                      <div className="d-flex align-items-center">
                      <div>{token.description}</div>
                      </div>                  
                  </div>
                  <div className="buttons-container">
                    <Button
                        onClick={() => {
                            setHiddenForms({
                            transfer: !hiddenForms.transfer,
                            approve: true
                        })} }>
                        Transfer
                    </Button>
                    <Button
                        onClick={() => {
                            setHiddenForms({
                            transfer: true,
                            approve: !hiddenForms.approve
                        })} }>
                        Approve
                    </Button>
                </div>
                <div className="col-sm-8">
                <form 
                    className={hiddenForms.transfer? 'hidden' : ''}
                    onSubmit={e => {
                        e.preventDefault();
                        transfer(e, token.id)} }
                    >              
                    <div className="form-group">
                    <input 
                        placeholder="to"
                        className="mt-8 border rounded p-4"
                        type="text" 
                        id="to" 
                        />
                    </div>
                    <Button type="submit">Submit</Button>
                </form>
                <form className={hiddenForms.approve? 'hidden' : ''}
                    onSubmit={e => {
                        e.preventDefault();
                        approve(e, token.id)} }
                    >              
                    <div className="form-group">
                    <input 
                        placeholder="enter approved address"
                        className="mt-8 border rounded p-4"
                        type="text" 
                        id="approved_address" 
                        />
                    </div>
                    <Button type="submit">Submit</Button>
                </form>
                </div>               
              </Card>

              
        </Col>

    );
}

const Button = styled.button`
  font-size: 0.8rem;
  background: #74cef7;
  border: none;
  padding: 0.8rem 1.1rem;
  color: #fff;
  border-radius: 1rem;
  box-shadow: 0px 13px 24px -7px #e0f8ff;
  transition: all 0.2s ease-in-out;
  margin-left: 0.5rem;
  cursor: pointer;
  &:hover {
    box-shadow: 0px 17px 16px -11px #e0f8ff;
    transform: translateY(-5px);
  }
  @media (max-width: 670px){
  }
`;
export default TokenItem;