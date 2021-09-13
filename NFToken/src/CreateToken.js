import React from 'react';
import styled from "styled-components";


function CreateToken({className, createMetaToken, captureFile}) {
    return (
      <Container>
          <form 
            className={className} 
            onSubmit={e => {
              e.preventDefault();
              createMetaToken(e)}}>
              <div className="form-group">
                  <input className="form-input" type="text" id="name"  placeholder="Enter name"/>
              </div>
              <div className="form-group">
                  <input className="form-input" type="text" id="description" placeholder="Enter description"/>
              </div>
              <div className="form-group">
                  <UploadInput 
                    type="file" 
                    id="upload"
                    onChange={captureFile}
                    />
                  <Label htmlFor="upload">Upload</Label>
              </div>
              <div className="buttons-container">
                  <button className="button-submit" type="submit">Submit</button>
              </div>              
        </form>
        </Container>
      );

}

const Container = styled.div`
 display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  max-width: 1000px;
  margin: auto;
  width: 100%;
  padding: 2rem;
  img {
    height: 3rem;
    cursor: pointer;
  }
`;

const UploadInput = styled.input`
  display: none;
`;

const Label = styled.label`
    display: inline-block;
    cursor: pointer;
    color: #81d1ff;
    background: transparent;
    border-radius: 1rem;
    margin: 2rem;
    padding: 0.8rem 1rem;
    border: 3px solid #81d1ff;
    &:hover {
      box-shadow: 0px 17px 16px -11px #81d1ff;
      transform: translateY(-5px);
    }
`;



export default CreateToken;