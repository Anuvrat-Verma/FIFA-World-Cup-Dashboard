export const initiateCheckout = async (userToken) => {
  try {
    const response = await fetch('http://localhost:8080/api/v1/billing/checkout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
        // This grabs the actual error message from Spring Boot
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (data.url) {
      window.location.href = data.url;
    }
  } catch (error) {
    console.error("Stripe Redirect Error:", error);
    // This will now pop up with the EXACT error code (e.g., 500, 403, 401)
    alert(error.message); 
  }
};