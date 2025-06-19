
<!DOCTYPE html>
@if(!session()->has('otp_user_id'))
    <script>
        window.location.href = "{{ route('login') }}";
    </script>
@endif

<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
   <title>OTP Verification</title>
    <link rel="stylesheet" href="style.css" />
    <!-- Boxicons CSS -->
    <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />
   <script src="script.js" defer></script>
  </head>
  <body>
    <div class="container">
    <h1>OTP Verification</h1>
    <P>The OTP will expire in 10 mins</P>
      <header>
     
        <i class="bx bxs-check-shield"></i>
      </header>
      <h4>Enter OTP Code</h4>
      @if(session('error'))
        <div style="color: red;">{{ session('error') }}</div>
    @endif

    <form method="POST" action="{{ route('verify.otp') }}">
        @csrf
        <div class="input-field">
          <input class="input" type="text" min="0" max="9" required/>
          <input class="input" type="text" disabled required/>
          <input class="input" type="text" disabled required/>
          <input class="input" type="text" disabled required/>
     
        </div>
        <input type="text" id="otp" name="otp" hidden/>
        <button type="submit">Verify OTP</button>
      </form>
      <p>OTP sent to your email</p>
    </div>
  </body>
</html>
<style>
    /* Import Google font - Poppins */
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700&display=swap");
* {
  margin: 1px;
  padding: 0;
  box-sizing: border-box;
  font-family: "Poppins", sans-serif;
}
body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #541e99;
  text-align: center;
}
:where(.container, form, .input-field, header) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.container {
  background: #fff;
  padding: 30px 65px;
  border-radius: 12px;
  row-gap: 20px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
}
.container header {
  height: 65px;
  width: 65px;
  background: #4070f4;
  color: #fff;
  font-size: 2.5rem;
  border-radius: 50%;
}
.container h4 {
  font-size: 1.25rem;
  color: #333;
  font-weight: 500;
}
form .input-field {
  flex-direction: row;
  column-gap: 10px;
}
.input-field input {
  height: 45px;
  width: 42px;
  border-radius: 6px;
  outline: none;
  font-size: 1.125rem;
  text-align: center;
  border: 1px solid #ddd;
}
.input-field input:focus {
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
}
.input-field input::-webkit-inner-spin-button,
.input-field input::-webkit-outer-spin-button {
  display: none;
}
form button {
  margin-top: 25px;
  width: 100%;
  color: #fff;
  font-size: 1rem;
  border: none;
  padding: 9px 0;
  cursor: pointer;
  border-radius: 6px;
  pointer-events: none;
  background: #6e93f7;
  transition: all 0.2s ease;
}
form button.active {
  background: #4070f4;
  pointer-events: auto;
}
form button:hover {
  background: #0e4bf1;
}
</style>

<script src="{{asset('build/assets/js/intlTelInput.min.js')}}"></script>
<script src="{{asset('build/assets/js/utils.js')}}"></script>
<script>
     const inputs = document.querySelectorAll(".input"),
  button = document.querySelector("button");
  const hiddenInput = document.getElementById("otp");
// iterate over all inputs
inputs.forEach((input, index1) => {
  input.addEventListener("keyup", (e) => {
    console.log("yyd")
    updateFullOTP();
    const currentInput = input,
      nextInput = input.nextElementSibling,
      prevInput = input.previousElementSibling;
      
    if (currentInput.value.length > 1) {
      currentInput.value = "";
      updateFullOTP();
      return;
    }
    
    if (nextInput && nextInput.hasAttribute("disabled") && currentInput.value !== "") {
      nextInput.removeAttribute("disabled");
      nextInput.focus();
    }
    // if the backspace key is pressed
    if (e.key === "Backspace") {
      // iterate over all inputs again
      inputs.forEach((input, index2) => {
 
        if (index1 <= index2 && prevInput) {
          input.setAttribute("disabled", true);
          input.value = "";
          prevInput.focus();
        }
      });
    }

    if (!inputs[3].disabled && inputs[3].value !== "") {
      button.classList.add("active");
      updateFullOTP();
      return;
    }
    
    button.classList.remove("active");
    
  });
});
//focus the first input which index is 0 on window load
window.addEventListener("load", () => inputs[0].focus());

function updateFullOTP() {
        const fullOTP = Array.from(inputs).map(input => input.value).join("");
        hiddenInput.value = fullOTP;
    }
</script>