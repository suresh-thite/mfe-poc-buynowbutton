import React, { useState, useEffect } from 'react';
import './BuyNowButton.css';

const BuyNowButton = ({ config = {}, onBuyNow, onInit }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Call onInit when component mounts
  useEffect(() => {
    if (onInit) {
      onInit({
        available: true,
        config,
        productId: config.productId || '',
        timestamp: new Date().toISOString()
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = async () => {
    console.log('handleClick', config, isLoading);
    setIsLoading(true);
    // Example for API integration  and response will send back to the host application
    try {
      // const ledgerApiUrl = 'https://hogwartz.d05d0001.residentportaldev.com/api/?controller=ledger&action=getSettings'; // Getting an CORS error
      const ledgerApiUrl = 'https://jsonplaceholder.typicode.com/todos/1' // it's working fine
      
      const ledgerResponse = await fetch(ledgerApiUrl, {
        method: 'GET',
        // headers: {
        //   'accept': 'application/json, text/plain, */*',
        //   'accept-language': 'en-US,en;q=0.9',
        //   'authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJqdGkiOiI2MmVlZjEzNThlY2VjNjE5NDFjZjQ1NDciLCJpYXQiOjE3NjI1MTg2MDIsIm5iZiI6MTc2MjUxODYwMiwiZXhwIjoxNzYyNTM2NjAyLCJkYXRhIjp7ImRldmljZUlkIjowLCJjaWQiOjQ1NDcsImN1c3RvbWVySWQiOjMyMDk2MjkwLCJsZWFzZUlkIjoxNTc2MjM1NywicHJvcGVydHlJZCI6ODQ1NDAsIndlYnNpdGVJZCI6MjI0NDUsInJlYWRPbmx5IjpmYWxzZSwidXNlcm5hbWUiOiJwMkB0ZXN0LmxjbCIsImNvbnRhY3RVc2VySWQiOjAsImNvbXBhbnlVc2VySWQiOjB9fQ.g8xvXsa3QNQnMeHWyKTiD98BwrXm1vQhihZxAztqeHI8kqP8d3eTWHj_WHL4h7ktUSjHBde47zGuGfMzTnAbng',
        //   "pragma": "no-cache",
        //   "pragma": "no-cache",
        //   "priority": "u=1, i",
        //   "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
        //   "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
        //   "sec-ch-ua-mobile": "?0",
        //   "sec-ch-ua-mobile": "?0",
        //   "sec-ch-ua-platform": "\"macOS\"",
        //   "sec-ch-ua-platform": "\"macOS\"",
        //   "sec-fetch-dest": "empty",
        //   "sec-fetch-mode": "cors",
        //   "sec-fetch-site": "cross-site",
        //   'x-consumer': 'rpweb',
        //   'x-consumer-version': '1.0'
        // },
        // credentials: 'include' // Include cookies
      });

      if (ledgerResponse.ok) {
        const ledgerData = await ledgerResponse.json();
        console.log('📊 Ledger API Response:', ledgerData);

        const purchaseData = {
          productId: config.productId || '',
          productName: config.productName || '',
          productPrice: config.productPrice || 0,
          productCurrency: config.productCurrency || 'USD',
          timestamp: new Date().toISOString(),
          apiResponse: ledgerData
        };
  
        // Call onBuyNow callback
        if (onBuyNow) {
          onBuyNow(purchaseData);
        }
      } else {
        console.warn('⚠️ Ledger API request failed:', ledgerResponse.status, ledgerResponse.statusText);
      }
    } catch (error) {
      console.error('❌ Ledger API call error:', error);
    } finally {
      setIsLoading(false);
    }


    // Example for after purchanse send data to the host application

    // try {
    //   const purchaseData = {
    //     productId: config.productId || '',
    //     productName: config.productName || '',
    //     productPrice: config.productPrice || 0,
    //     productCurrency: config.productCurrency || 'USD',
    //     timestamp: new Date().toISOString()
    //   };

    //   // Call onBuyNow callback
    //   if (onBuyNow) {
    //     onBuyNow(purchaseData);
    //   }

    //   // Simulate processing
    //   await new Promise(resolve => setTimeout(resolve, 500));
    // } catch (error) {
    //   console.error('Buy Now error:', error);
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(price);
  };

  return (
    <div className="buy-now-section">
      <button
        className={`buy-now-button ${isLoading ? 'loading' : ''}`}
        onClick={handleClick}
        disabled={!config.enabled || isLoading}
        style={{
          backgroundColor: config.color || '#FF3B30',
          borderRadius: config.borderRadius || '12px',
          fontSize: config.size === 'large' ? '18px' : config.size === 'small' ? '14px' : '16px',
          padding: config.size === 'large' ? '16px 32px' : config.size === 'small' ? '10px 20px' : '14px 28px'
        }}
      >
        {isLoading ? (
          <span>Processing...</span>
        ) : (
          <>
            <span>{config.label || 'Buy Now'}</span>
            {config.showPrice && config.productPrice > 0 && (
              <span className="button-price">
                {formatPrice(config.productPrice, config.productCurrency)}
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
};

export default BuyNowButton;

