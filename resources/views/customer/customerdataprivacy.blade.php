<!DOCTYPE html>
<style>
 

.terms-container {
    background: #fff;
    padding: 20px;
    width: 450px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    text-align: center;
}

h2 {
    color: #333;
}

.terms-box {
    max-height: 250px;
    overflow-y: auto;
    text-align: left;
    border: 1px solid #ddd;
    padding: 15px;
    margin-bottom: 15px;
    font-size: 14px;
    background: #f9f9f9;
}

.accept-box {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
}

label {
    margin-left: 8px;
    font-size: 14px;
}

button {
    background: #28a745;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
}

button:disabled {
    background: #ccc;
    cursor: not-allowed;
}

</style>

<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fortai - Terms and Conditions</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>

    <div class="">
        <h2>Fortai Terms and Conditions</h2>
        <div class="terms-box">
            <p><b>By using Fortai, you agree to comply with our Terms and Conditions. These rules govern your use of the platform, your rights, and responsibilities...</b></p>
            <p>1. Eligibility: You must be 18 years or older or have parental consent to use our services.</p>
            <p>2. Account Security: Users must keep login credentials confidential and report unauthorized access.</p>
            <p>3. Payments: All transactions must be completed securely through Fortai's payment gateway.</p>
            <p>4. Liability: Fortai is not liable for service disputes, delays, or inaccuracies.</p>
            <p>5. Data Privacy: We collect personal data as outlined in our Privacy Policy.</p>
            <p>6. Prohibited Activities: Users must not engage in illegal activities, fraud, or misuse of the platform.</p>
            <p>7. Dispute Resolution: In case of disputes, mediation or arbitration may be required.</p>
            <p>8. Updates: Fortai reserves the right to modify these Terms and will notify users of significant changes.</p>
        </div>

        <div class="accept-box">
            <input type="radio" id="acceptTerms" name="terms" required>
            <label for="acceptTerms">I accept the Terms and Conditions</label>
        </div>

        <button id="continueBtn" disabled>Continue</button>
    </div>

    <script>
        document.getElementById("acceptTerms").addEventListener("change", function() {
            document.getElementById("continueBtn").disabled = !this.checked;
        });
    </script>

</body>
</html>
