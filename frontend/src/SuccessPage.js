import { useEffect } from 'react';
import { auth } from './firebase'; 

const SuccessPage = () => {
  useEffect(() => {
    // 1. Give the Webhook 2 seconds to finish writing the 't' to PostgreSQL
    const timer = setTimeout(() => {
      // 2. THE FIX: window.location.href forces a total browser reboot.
      // This kills the "free user" stale state and fetches the fresh DB status.
      window.location.href = "/"; 
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>✅ Payment Successful!</h1>
      <p>Redirecting to your Pro Dashboard...</p>
    </div>
  );
};

export default SuccessPage;