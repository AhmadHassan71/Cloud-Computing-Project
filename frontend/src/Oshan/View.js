import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import config from '../config';

const View = () => {

    const [ allItems, setAllItem ] = useState([]);

    useEffect(() => {

         const getAllItems = async () => {

            await axios.get(`${config.apiUrl}${config.endpoints.items.getAll}`)
            .then((res) => {
                setAllItem(res.data.AllItems);
                console.log('Status: ' + res.data.status);
                console.log(res.data.message);
            })
            .catch((err) => {
                if(err.response){
                    console.log(err.response.data.message);
                }else {
                    console.log("Error occurred while processing your axios get request. " + err.message)
                }
            })

         }

         getAllItems();

    }, [])


    //implementing handleDelete function
    const handleDelete = async (id) => {

        try{

            const confirmed = window.confirm('Are you sure you want to delete this item?');

            if(confirmed){
                await axios.delete(`${config.apiUrl}${config.endpoints.items.delete}/${id}`)
                .then((res) => {
                    alert(res.data.message);
                    console.log(res.data.message);
                    console.log("status: " + res.data.status);
                })
                .catch((err) => {
                    if(err.response){
                        console.log(err.response.data.message);
                    }else {
                        console.log("Error occurred while processing your axios delete request. " + err.message)
                    }
                })
            } else {
                alert('Deletion cancelled!');
            }

        } catch(err){
            console.log('handleDelete function failed! ERROR: ' + err.message);
        }

    }


    return (
        <div className="allItemscontainer">

            <div className="addItemBtnDiv">
                <Link to='/createform'><button type="button" class="btn btn-success addItemBtn">Add Item</button></Link>
                <button type="button" class="btn btn-danger addItemBtn">Logout</button>
            </div>

            {/* <ToastContainer/> */}
            
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">No</th>
                        <th scope="col">id</th>
                        <th scope="col">Item Name</th>
                        <th scope="col">Item Category</th>
                        <th scope="col">Item Qty</th>
                        <th scope="col">Item Description</th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                <tbody>
                    {allItems.map((items, index) => (
                        <tr key={items.id}>
                            <td>{index + 1}</td>
                            <td>{items.id}</td>
                            <td>{items.itemName}</td>
                            <td>{items.itemCategory}</td>
                            <td>{items.itemQty}</td>
                            <td>{items.itemDescription}</td>
                            <td>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <Link to={`/updateform/${items.id}`}>
                                                    <button type="button" className="btn btn-warning">Edit</button>
                                                </Link>
                                            </td> &nbsp;
                                            <td>
                                                <button type="button" className="btn btn-danger" onClick={() => handleDelete(items.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    )
}


export default View;