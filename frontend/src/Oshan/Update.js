import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useParams, useNavigate } from "react-router-dom";
import config from '../config';

const Update = () => {

    const [itemName, setItemName] = useState('');
    const [itemCategory, setItemCategory] = useState('');
    const [itemQty, setItemQty] = useState('');
    const [itemDescription, setItemDescription] = useState('');

    const  { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {

        const getOneItem = async () => {

           await axios.get(`${config.apiUrl}/item/${id}`)
           .then((res) => {
               setItemName(res.data.Item.itemName);
               setItemCategory(res.data.Item.itemCategory);
               setItemQty(res.data.Item.itemQty);
               setItemDescription(res.data.Item.itemDescription);
               console.log(res.data.message);
           })
           .catch((err) => {
               if(err.response){
                   console.log(err.response.data.message);
               }else {
                   console.log("Error occurred while processing your axios get request. " + err.message);
               }
           })

        }

        getOneItem();

   }, [id])


   const updateData =  async (e) => {
        e.preventDefault();

        try{

            const confirmed = window.confirm('Are you sure you want to update this item?');

            if(confirmed){

                let updatedItemData = {
                    itemName: itemName,
                    itemCategory: itemCategory,
                    itemQty: itemQty,
                    itemDescription: itemDescription,
                }
        
                await axios.patch(`${config.apiUrl}/itemUpdate/${id}`, updatedItemData)
                .then((res) => {
                    alert(res.data.message);
                    console.log(res.data.message);
                    navigate('/');
                })
                .catch((err) => {
                    if(err.response){
                        console.log(err.response.data.message);
                    }else {
                        console.log("Error occurred while processing your axios patch request. " + err.message);
                    }
                })

            } else {
                alert('Update cancelled!');
            }

        } catch(err){
            console.log('updateData function failed! ERROR: ' + err.message);
        }

   }


    return (

        <div className="createFormContainer">
        
            <div className="formBootstrap">
                <h2 className="mb-4">Update Form</h2>

                <form onSubmit={updateData}>
                    <div className="form-group mb-3">
                        <label htmlFor="itemNameID">Item Name</label>
                        <input type="text" className="form-control" id="itemNameID" placeholder="Enter Item Name" onChange={(e) => setItemName(e.target.value)} value={itemName}/>
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="itemCategoryID">Item Category</label>
                        <input type="text" className="form-control" id="itemCategoryID" placeholder="Enter Item Category" onChange={(e) => setItemCategory(e.target.value)} value={itemCategory}/>
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="itemQtyID">Item Qty</label>
                        <input type="number" className="form-control" id="itemQtyID" placeholder="Enter Item Qty" onChange={(e) => setItemQty(e.target.value)} value={itemQty}/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="itemDescriptionID" className="form-label">Item Description</label>
                        <textarea className="form-control" id="itemDescriptionID" rows="3" onChange={(e) => setItemDescription(e.target.value)} value={itemDescription}></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary">Update</button>
                </form>

            </div>

        </div>

    )
};

export default Update;