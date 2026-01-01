
<x-guest-layout>
  <div class="container1 bg-black text-white bg-[linear-gradient(to_bottom,#000,#200D42_34%,#4F21A1_65%,#A46EDB_82%)] py-[72px] sm:py-24 relative overflow-clip">
    <!-- Left Column -->
     <form>
      @csrf
      <div class="left-column absolute h-[375px] w-[750px] sm:w-[1536px] sm:h-[768px] lg:w-[2400px] lg:h-[1200px] rounded-[100%] bg-black left-1/2 -translate-x-1/2 border border-[#B48CDE] bg-[radial-gradient(closest-side,#000_82%,#9560EB)] top-[calc(100%-96px)] sm:top-[calc(100%-120px)]"></div>
      <h1 class="uk-animation-slide-left">
        Secure jobs and grow your business
      </h1>
      <div class="stars absolute top-0 left-0 w-full h-[900px]" style="opacity: 1; will-change: auto;"></div>
      <div class="txtclas uk-animation-slide-left">
        <p id="text" class="text-center text-xl mt-2  bg-[linear-gradient(to_right,#F87AFF,#FB93D0,#FFDD99,#C3F0B2,#2FD8FE)] text-transparent bg-clip-text [-webkit-background-clip:text]">
          Get High-Quality Leads, Fast!
        </p>
      </div>
      <div class="row" style="display: flex; gap: 20px; flex-wrap: wrap;">
        <div class="search-container">
          <div class="search-box">
            <div class="search-icon"><i class="bi bi-search search-icon"></i>
          </div>
          <input type="text" class="uk-animation-slide-left" placeholder="Enter your service" id="serviceTxt" autocomplete="off">
          <input type="hidden" id="serviceID">
          <svg class="search-border" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 671 111">
            <path class="border" d="M335.5,108.5h-280c-29.3,0-53-23.7-53-53v0c0-29.3,23.7-53,53-53h280"></path>
            <path class="border" d="M335.5,108.5h280c29.3,0,53-23.7,53-53v0c0-29.3-23.7-53-53-53h-280"></path>
          </svg>
        </div>
        <span id="search-service" class="et_pb_module et_pb_text et_pb_text_3  et_pb_text_align_left et_pb_bg_layout_light">
          <ul id="inner-service" class="searched-list"></ul>
        </span>
      </div>
      <div class="btn-main  uk-animation-slide-lef">
        <a id="step" href="#">
          <button class="search-btn" type="button">
            <i class="bi bi-search"></i>
            Get Started
          </button>
        </a>
      </div>
    </div>
  </form>

  <!-- Right Column -->
   <div class="right-column uk-animation-scale-up">
    <div>
      <img src="/build/assets/img/333.png" alt="Mechanic Image">
    </div>
  </div>
</div>

<div class="bg-black text-white py-[72px] sm:py-24" style="opacity: 1; transform: none; will-change: auto;">
  <div class="container"><h2 class="text-xl text-center text-white/70" style="opacity: 1; transform: none; will-change: auto;">
Trusted By The Best Organisations in South Africa
</h2>
<style>
  @keyframes marquee {
    0% {
      transform: translateX(100%);
    }
    100% {
      transform: translateX(-100%);
    }
  }

  .marquee {
    animation: marquee 20s linear infinite;
    animation-delay: 0s; /* Start immediately */
    /* Do not preserve the end state between page loads */
    animation-fill-mode: forwards;
    will-change: transform;
  }
</style>

<div class="flex overflow-hidden mt-9 relative w-full before:content-[''] after:content-[''] before:z-10 before:absolute after:absolute before:h-full after:h-full before:w-5 after:w-5 after:right-0 before:left-0 before:top-0 after:top-0 before:bg-[linear-gradient(to_right,#000,rgba(0,0,0,0))] after:bg-[linear-gradient(to_left,#000,rgba(0,0,0,0))]">
<div class="marquee-container w-full overflow-hidden">
        <div class="flex items-center gap-12 whitespace-nowrap marquee">
            <img src="/build/assets/img/electrician.jpg" alt="Partner 1" class="h-12 w-auto rounded">
            <img src="/build/assets/img/handyman.jpg" alt="Partner 2" class="h-12 w-auto rounded">
            <img src="/build/assets/img/wifitech.jpg" alt="Partner 3" class="h-12 w-auto rounded">
            <img src="/build/assets/img/electrician.jpg" alt="Partner 4" class="h-12 w-auto rounded">
            <img src="/build/assets/img/handyman.jpg" alt="Partner 5" class="h-12 w-auto rounded">
            <img src="/build/assets/img/wifitech.jpg" alt="Partner 6" class="h-12 w-auto rounded">
            <!-- duplicate for seamless loop -->
            <img src="/build/assets/img/electrician.jpg" alt="Partner 1" class="h-12 w-auto rounded">
            <img src="/build/assets/img/handyman.jpg" alt="Partner 2" class="h-12 w-auto rounded">
            <img src="/build/assets/img/wifitech.jpg" alt="Partner 3" class="h-12 w-auto rounded">
            <img src="/build/assets/img/electrician.jpg" alt="Partner 4" class="h-12 w-auto rounded">
            <img src="/build/assets/img/handyman.jpg" alt="Partner 5" class="h-12 w-auto rounded">
            <img src="/build/assets/img/wifitech.jpg" alt="Partner 6" class="h-12 w-auto rounded">
        </div>
    </div>

    <!-- UIkit JS (if needed for other UIkit components) -->
    <script src="https://cdn.jsdelivr.net/npm/uikit@3.16.15/dist/js/uikit.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/uikit@3.16.15/dist/js/uikit-icons.min.js"></script>
</div>
<div class="mt-6 text-center text-white/60 text-sm">
  Partnering with leading organisations to connect customers and trusted pros across South Africa.
  <br class="hidden sm:block" />Grow your business and reputation with Fortai.
</div>
</div>

</div>
</div>
<div id="features" class="bg-black text-white py-[72px] sm:py-24" style="opacity: 1; will-change: auto;">
<style>
        .image-container {
            display: flex;
            justify-content: center;
            gap: 10px;
            padding: 20px;
            margin-top: 4rem;
            border-width: 2px;
            border-radius: .75rem;
            border-radius: 20px;
           
}
        
        .image-container img {
            width: 200px; /* Adjust as needed */
            height: auto;
            border-radius: 10px;
        }

        .py-\[72px\] {
    padding-top: 72px;
    padding-bottom: 72px;
}
        @media (max-width: 768px) {
    .flex1 {
      flex-direction: column; /* Stack images vertically on small screens */
    }
  }
    </style>
   <div class="flex1 flex-wrap gap-4 flex items-center justify-center min-h-screen py-[72px]">
   <div class="w-[300px] h-[300px] border-4 border-purple-400 overflow-hidden ">
        <img class="w-full h-full object-cover" src="/build/assets/img/electrician.jpg" alt="Electrician">
    </div>
    <div class="w-[300px] h-[300px] border-4 border-purple-400 overflow-hidden">
        <img class="w-full h-full object-cover" src="/build/assets/img/handyman.jpg" alt="Handyman">
    </div>
    <div class="w-[300px] h-[300px] border-4 border-purple-400 overflow-hidden">
        <img class="w-full h-full object-cover" src="/build/assets/img/wifitech.jpg" alt="WiFi Tech">
    </div>
      </div>
  <div class="container">
    <h2 class="text-center text-3xl md:text-4xl md:max-w-[648px] mx-auto font-bold tracking-tighter" style="opacity: 1; transform: none; will-change: auto;">
      Everything You Need
    </h2>
    <div class="max-w-xl mx-auto" style="opacity: 1; transform: none; will-change: auto;">
      <p class="text-center mt-5 text-xl text-white/70">
        Whether you're a small business or a large enterprise, we provide all the essential tools to help you get hired.
      </p>
    </div>
   
</div></div>
  
  
  <div class="bg-black text-white bg-gradient-to-b from-black to-[#5D2CAB] py-[72px] sm:py-24 overflow-hidden max-w-full" style="opacity: 1; will-change: auto;">
    <div class="container">
      <h2 class="text-center text-3xl md:text-4xl md:max-w-[648px] mx-auto font-bold tracking-tighter" style="opacity: 1; transform: none; will-change: auto;">
        Beyond Expectations
      </h2>
      <div class="max-w-xl mx-auto" style="opacity: 1; transform: none; will-change: auto;">
        <p class="text-xl text-center text-white/70 mt-5">
        Discover highly-targeted leads and the services you offer.
        </p>
      </div>
     

</div></div></div>

    <script>
 

        var currentTab = 0;


function showTab(n) {
  // This function will display the specified tab of the form...
  var x = document.getElementsByClassName("tab");
  x[n].style.display = "block";
  //... and fix the Previous/Next buttons:
  if (n == 0) {
    document.getElementById("prevBtn").style.display = "none";
  } else {
    document.getElementById("prevBtn").style.display = "inline";
  }
  if (n == (x.length - 1)) {
    $("#subm").show();
    $("#nextBtn").hide();
  } else {
    $("#subm").hide();
    $("#nextBtn").show();
    $("#prevBtn").show();
    document.getElementById("nextBtn").innerHTML = "Next";
  }
  //... and run a function that will display the correct step indicator:
  fixStepIndicator(n)
}

function validateForm() {
  var x, y, i, valid = true;
  x = document.getElementsByClassName("tab");
  y = x[currentTab].getElementsByTagName("input");

  for (i = 0; i < y.length; i++) {
    if (y[i].type === "radio") {
      var name = y[i].name; 
      var radios = document.getElementsByName(name); 
      var isGroupValid = Array.from(radios).some(radio => radio.checked);

      // If no radio button in the group is selected, mark as invalid
      if (!isGroupValid) {
        radios.forEach(radio => radio.className += " invalid"); // Add "invalid" class to each radio
        valid = false; // Set the valid status to false
      }
    }

  }

  // If valid status is true, mark the step as finished and valid:
  if (valid) {
    document.getElementsByClassName("step")[currentTab].className += " finish";
  }

  return valid; // return the valid status
}

function fixStepIndicator(n) {
  // This function removes the "active" class of all steps...
  var i, x = document.getElementsByClassName("step");
  for (i = 0; i < x.length; i++) {
    x[i].className = x[i].className.replace(" active", "");
  }
  //... and adds the "active" class on the current step:
  x[n].className += " active";
}
function numC()
{
const phoneInputField = document.querySelector("#contact_number");
        const iti = window.intlTelInput(phoneInputField, {
            utilsScript: "{{asset('build/assets/js/utils.js')}}", // for formatting and validation
            initialCountry: "auto", // detect the user's country
            geoIpLookup: function(callback) {
                fetch('') 
                    .then((response) => response.json())
                    .then((data) => callback(data.country))
                    .catch(() => callback("za")); // default to 'us' if geolocation fails
            },
            preferredCountries: ["za"], // Customize preferred countries as desired
            separateDialCode: true, // Optional: shows dial code separately
        });

        // Optional: Add event listener for validation
        phoneInputField.addEventListener("GFFG", function() {
            const phoneNumber = iti.getNumber(); // gets the complete international phone number
            const isValid = iti.isValidNumber(); // validates the number
            if (!isValid) {
                alert("Invalid phone number");
            } else {
                alert(`Phone number is valid: ${phoneNumber}`);
            }
        });

        
    }
   
    </script>



<script>
  $(document).ready(function(){
    $("#serviceTxt").focus(function() {
      $(".search-box").addClass("border-searching");
      $(".search-icon").addClass("si-rotate");
      $("#serviceTxt").css('padding', '0 68px');
      $("#serviceTxt").attr('placeholder', 'Start searching...');
    });
    $("#serviceTxt").blur(function() {
      $(".search-box").removeClass("border-searching");
      $(".search-icon").removeClass("si-rotate");
      $("#serviceTxt").css('padding', '0 30px 0 50px');
      $("#serviceTxt").attr('placeholder', 'Enter your service');
     
    });
    $("#serviceTxt").keyup(function() {
        if($(this).val().length > 0) {
          $(".go-icon").addClass("go-in");
        }
        else {
          $(".go-icon").removeClass("go-in");
        }
    });

    $("#search1").focus(function() {
      $(".search-box1").addClass("border-searching1");
      $(".search-icon1").addClass("si-rotate");
      $("#search1").css('padding', '0 68px');
      $("#search1").attr('placeholder', 'Start searching...');
    });
    $("#search1").blur(function() {
      $(".search-box1").removeClass("border-searching1");
      $(".search-icon1").removeClass("si-rotate");
      $("#search1").css('padding', '0 30px 0 50px');
      $("#search1").attr('placeholder', 'Enter location in SA');
    });
    $("#search1").keyup(function() {
        if($(this).val().length > 0) {
          $(".go-icon").addClass("go-in");
        }
        else {
          $(".go-icon").removeClass("go-in");
        }
    });
    $(".go-icon").click(function(){
      $(".search-form").submit();
    });
});

const phrases = [
            "High-Quality Leads",
            "Unlock Growth",
            "Boost Your Business"
        ];
        let index = 0;
        let charIndex = 0;
        let isDeleting = false;
        const speed = 100;
        const delay = 2000;
        const textElement = document.getElementById("text");

        function typeEffect() {
            const currentPhrase = phrases[index];
            if (isDeleting) {
                charIndex--;
            } else {
                charIndex++;
            }
            textElement.textContent = currentPhrase.substring(0, charIndex);
            
            if (!isDeleting && charIndex === currentPhrase.length) {
                setTimeout(() => isDeleting = true, delay);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                index = (index + 1) % phrases.length;
            }
            setTimeout(typeEffect, isDeleting ? speed / 2 : speed);
        }

        typeEffect();
</script>


    </x-guest-layout>