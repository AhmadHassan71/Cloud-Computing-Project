import React, { useState, useEffect } from "react";
import './Payment.css';
import { useParams } from "react-router-dom";
import axios from "axios";

const Payment = () => {
    const [order, setOrder] = useState(null);
    const [total, setTotal] = useState(0);
    const [paymentAmount, setPaymentAmount] = useState(""); 
    const [payableAmount, setPayableAmount] = useState(0); 
    const [selectedPromotion, setSelectedPromotion] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { id } = useParams();

    // Fetch order details when component mounts
    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/order/${id}`);
                if (response.data.success) {
                    setOrder(response.data.order);
                    setTotal(response.data.order.totalPrice);
                    setPayableAmount(response.data.order.totalPrice);
                } else {
                    setError("Failed to fetch order details");
                }
            } catch (err) {
                console.error("Error fetching order:", err);
                setError("An error occurred while fetching order details");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrderDetails();
        }
    }, [id]);

    // Initialize payableAmount when total changes
    useEffect(() => {
        setPayableAmount(total);
    }, [total]);

    const handleChange = (event) => {
        const { value } = event.target;
        setPaymentAmount(value);
    };

    const calculateChange = () => {
        const change = parseFloat(paymentAmount) - payableAmount;
        return isNaN(change) ? 0 : change;
    };

    const handlePromotionChange = (event) => {
        setSelectedPromotion(event.target.value);
        
        let discount = 0;
        
        switch (event.target.value) {
        case "Morning Brew Discount":
            discount = total * 0.10; // 10% discount
            break;
        case "Happy Hour Specials":
            discount = total * 0.15; // 15% discount
            break;
        case "Daily Roast Deals":
            discount = total * 0.20; // 20% discount
            break;
        case "Loyalty Bean Bonus":
            discount = total * 0.25; // 25% discount
            break;
        default:
            discount = 0;
            break;
        }

        const newPayableAmount = total - discount;
        setPayableAmount(newPayableAmount);
    };

  return (
    <div className="PaymentContainer">
        {loading ? (
            <div>Loading order details...</div>
        ) : error ? (
            <div className="error-message">{error}</div>
        ) : !order ? (
            <div>No order found with ID: {id}</div>
        ) : (
            <div className="PaymentWidthBlanceDiv">
                <div className="paymentTableContainer">
                    <h2>Payment Table</h2>
                    <div className="paymentTableWrapper">
                        <table className="paymentTable">
                            <thead>
                                <tr>
                                    <th scope="col">No</th>
                                    <th scope="col">Order Items</th>
                                    <th scope="col">Quantity</th>
                                    <th scope="col">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items && order.items.map((item, index) => (
                                    <tr key={item.id || index}>
                                        <th scope="row">{index + 1}</th>
                                        <td>{item.itemName || "Unknown Item"}</td>
                                        <td>1</td>
                                        <td>Rs.{item.itemPrice?.toFixed(2) || "0.00"}</td>
                                    </tr>
                                ))}
                                {(!order.items || order.items.length === 0) && (
                                    <tr>
                                        <td colSpan="4">No items in this order</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="paymentSideView">
                    <div className="calculationPhase">
                        <div className="paymentTotalPhase">
                            <p>Total: <span>{total} PKR</span></p>
                        </div>
                        <div className="paymentPropotionPhase">
                            <p>Add Promotion: </p>
                            <select name="promotion" id="promotion" value={selectedPromotion} onChange={handlePromotionChange}>
                                <option value="">Select a promotion</option>
                                <option value="Morning Brew Discount">Morning Brew Discount</option>
                                <option value="Happy Hour Specials">Happy Hour Specials</option>
                                <option value="Daily Roast Deals">Daily Roast Deals</option>
                                <option value="Loyalty Bean Bonus">Loyalty Bean Bonus</option>
                            </select>
                        </div>
                        <div className="paymentPayableAmountPhase">
                            <p>Payable Amount: <h3>{payableAmount} PKR</h3></p>
                        </div>
                    </div>
                    <div className="balancePhase">
                        <div className="paymentAmountDiv">
                            <label htmlFor="paymentAmount">Payment Amount(PKR):</label>
                            <input type="text" id="paymentAmount" name="paymentAmount" value={paymentAmount} onChange={handleChange} placeholder="Enter amount tendered" />
                        </div>
                        <div className="changeDiv">
                            <p>Change: <h3>{calculateChange()} PKR</h3></p>
                        </div>
                        <div className="PaymentButtonDiv">
                            <button className="custom-button">Done</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Payment;
