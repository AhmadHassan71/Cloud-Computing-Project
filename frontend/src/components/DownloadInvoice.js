import React, { useState } from 'react';
import axios from 'axios';

// Import config
import config from '../config';

// Import shared components
import Card from './shared/Card';
import Button from './shared/Button';
import Alert from './shared/Alert';
import Spinner from './shared/Spinner';

const DownloadInvoice = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const downloadInvoice = async () => {
        setIsLoading(true);
        setAlert(null);
        
        try {
            const response = await axios.get(`${config.apiUrl}${config.endpoints.invoice.generate}`);

            const { filepath } = response.data;

            const link = document.createElement('a');
            link.href = filepath;
            link.setAttribute('download', 'invoice.pdf');
            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);
            
            setAlert({
                type: 'success',
                message: 'Invoice downloaded successfully!'
            });
        } catch (error) {
            console.error('Error downloading invoice:', error.message);
            setAlert({
                type: 'error',
                message: 'Failed to download invoice. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="download-invoice-container">
            <Card className="invoice-card">
                <div className="invoice-header">
                    <h2>Download Invoice</h2>
                    <p>Generate and download a summary of all orders</p>
                </div>
                
                {alert && (
                    <Alert 
                        type={alert.type} 
                        message={alert.message} 
                        dismissible 
                        onClose={() => setAlert(null)}
                    />
                )}
                
                <div className="invoice-content">
                    <p>
                        Click the button below to generate a PDF invoice containing information about all orders.
                        This document can be used for record keeping, reporting, or accounting purposes.
                    </p>
                    
                    <div className="invoice-actions">
                        <Button 
                            variant="primary" 
                            onClick={downloadInvoice}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Spinner size="small" text="Generating invoice..." />
                            ) : (
                                <>
                                    <i className="fas fa-download"></i> Download Invoice
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default DownloadInvoice;
