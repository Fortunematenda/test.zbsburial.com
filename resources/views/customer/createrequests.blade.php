<x-guest-layout>
  <!-- Firebase SDK (Compat Mode) -->
<style>
  .uk-modal-body {
    padding: 0px 0px !important;
}
</style>
 <div class="container1 bg-black text-white bg-[linear-gradient(to_bottom,#000,#200D42_34%,#4F21A1_65%,#A46EDB_82%)] py-[72px] sm:py-24 relative overflow-clip">
        <!-- Left Column -->
         <form style="z-index:1000 !important">
            @csrf
        <div class="left-column absolute h-[375px] w-[750px] sm:w-[1536px] sm:h-[768px] lg:w-[2400px] lg:h-[1200px] rounded-[100%] bg-black left-1/2 -translate-x-1/2 border border-[#B48CDE] bg-[radial-gradient(closest-side,#000_82%,#9560EB)] top-[calc(100%-96px)] sm:top-[calc(100%-120px)]">
        </div>
        <h1 class="uk-animation-scale-down">Get the Best Services, <br>Hassle-Free!</h1>
        
        <div class="stars absolute top-0 left-0 w-full h-[900px]" style="opacity: 1; will-change: auto;"></div>
   
       <div class="txtclas uk-animation-slide-left">
        <p id="text" class="text-center text-xl mt-2  bg-[linear-gradient(to_right,#F87AFF,#FB93D0,#FFDD99,#C3F0B2,#2FD8FE)] text-transparent bg-clip-text [-webkit-background-clip:text]">
        Find Trusted Experts Instantly!
        </p>
        </div>
        <div class="row" style="display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-left:12px; margin-right:12px">

<div class="search-container ">
  <div class="search-box">
    <div class="search-icon"><i class="bi bi-search search-icon"></i></div>
    <input type="text" class="uk-animation-slide-left" placeholder="Service you're looking for?" id="serviceTxt" autocomplete="off">
    <input type="hidden" id="serviceID" >
    <svg class="search-border" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 671 111">
      <path class="border" d="M335.5,108.5h-280c-29.3,0-53-23.7-53-53v0c0-29.3,23.7-53,53-53h280"></path>
      <path class="border" d="M335.5,108.5h280c29.3,0,53-23.7,53-53v0c0-29.3-23.7-53-53-53h-280"></path>
    </svg>
   
  </div>
  <span id="search-service">
                <ul id="inner-service" class="searched-list"></ul>
            </span>
</div>

<div class="location-container uk-animation-slide-bottom">
  <div class="search-box1">
    <div class="search-icon1"><i class="bi bi-crosshair search-icon1"></i></div>
    <form action="" class="search-form1">
      <input type="text" placeholder="Enter location in SA" id="searchLocation" autocomplete="off">
    </form>
    <svg class="search-border1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 671 111">
      <path class="border1" d="M335.5,108.5h-280c-29.3,0-53-23.7-53-53v0c0-29.3,23.7-53,53-53h280"></path>
      <path class="border1" d="M335.5,108.5h280c29.3,0,53-23.7,53-53v0c0-29.3-23.7-53-53-53h-280"></path>
    </svg>
  </div>
</div>
<input id="latitude" hidden></input>
        <input id="longitude" hidden></input>
<div class="btn-main uk-animation-slide-bottom">
<button class="search-btn" type="button" id="start_lead">
  <i class="bi bi-search"></i> Search
</button>
</div>

</div>

           
         
       
              </form>

        
        <!-- Right Column -->
        <div class="right-column uk-animation-slide-right">
    <div>
        <img src=" {{asset('build/assets/img/digital_marketing.png')}}" alt="Homepage Image 1" height="500" width="500">
       
    </div>
</div>
</div>

<div class="bg-black text-white py-[72px] sm:py-24" style="opacity: 1; transform: none; will-change: auto;">
  <div class="container uk-animation-slide-right"><h2 class="text-xl text-center text-white/70" style="opacity: 1; transform: none; will-change: auto;">
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
<div class="marquee-container">
        <div class="marquee-content" id="marqueeContent">
            <!-- Images will be dynamically inserted here using JavaScript -->
        </div>
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
    .border-2 {
      border-width: 2px;
  }
}
    </style>
   <div class="flex1 flex-wrap gap-4 flex items-center justify-center min-h-screen py-[72px] ">
   <div class="w-[300px] h-[300px] border-4 border-purple-400 overflow-hidden">
        <img class="w-full h-full object-cover" src="/build/assets/img/electrician.jpg" alt="Electrician">
    </div>
    <div class="w-[300px] h-[300px] border-4 border-purple-400 overflow-hidden">
        <img class="w-full h-full object-cover" src="/build/assets/img/handyman.jpg" alt="Handyman">
    </div>
    <div class="w-[300px] h-[300px] border-4 border-purple-400 overflow-hidden">
        <img class="w-full h-full object-cover" src="/build/assets/img/wifitech.jpg" alt="WiFi Tech">
    </div>
      </div></div>
  
  
  <div class="bg-black text-white bg-gradient-to-b from-black to-[#5D2CAB] py-[72px] sm:py-24 overflow-hidden max-w-full" style="opacity: 1; will-change: auto;">
    <div class="container">
      <h2 class="text-center text-3xl md:text-4xl md:max-w-[648px] mx-auto font-bold tracking-tighter" style="opacity: 1; transform: none; will-change: auto;">
        Beyond Expectations
      </h2>
      <div class="max-w-xl mx-auto" style="opacity: 1; transform: none; will-change: auto;">
        <p class="text-xl text-center text-white/70 mt-5">
        Professional solutions designed to connect you with the right experts
        </p>
      </div>
      <div class="flex justify-center overflow-hidden" style="opacity: 0.5; transform: perspective(800px) rotateX(15deg);">
        
</div>

</div></div></div>
<div id="modal-create" uk-modal>
    <div class="uk-modal-dialog uk-modal-body" style="border-radius: 9px !important;">
    <button class="uk-modal-close-default" type="button" uk-close></button>

    <br/>
    <h2 align="center" class="uk-modal-title">New lead</h2>

        <form id="regForm" method="POST" action="/action_page.php" enctype="multipart/form-data">
 
  <!-- One "tab" for each step in the form: -->
  
    <div id="insteps">

    </div>
    <div style="text-align: center;margin-left: auto; margin-right: auto; width: 50%; display:none" id="loader">
        <img src="{{asset('build/assets/img/loader.svg')}}"/>
    </div>

  <div style="overflow:auto; margin-top:23px">
    <div style="float:right;">
      <button type="button" class="uk-button uk-button-default uk-button-small" id="prevBtn" onclick="nextPrev(-1)">Previous</button>
      <button type="button" class="uk-button uk-button-primary uk-button-small" id="nextBtn" onclick="nextPrev(1)">Next</button>
      <button type="submit" style="display:none" id="subm" class="uk-button uk-button-primary uk-button-small">SUBMIT</button>
    </div>
  </div>
  <!-- Circles which indicates the steps of the form: -->
  <div style="text-align:center;margin-top:40px;" id="bullets">
    <span class="step"></span>
    <span class="step"></span>
    <span class="step"></span>
    <span class="step"></span>
  </div>
</form>

    </div>
</div> 

<input id="isLogged" value = "{{ auth()->check() ? 'Logged' : 'Guest' }}" hidden/>

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
  /*
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
*/
        
    }
   
    </script>

<script src="{{asset('build/assets/js/intlTelInput.min.js')}}"></script>
<script src="{{asset('build/assets/js/utils.js')}}"></script>
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA_Qd54wgjWo4t-Klmi3m_pz8HbHz0GQto&libraries=places&callback=initializeAutocomplete" type="text/javascript"></script>
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
      $("#serviceTxt").attr('placeholder', 'Service you\'re looking for?');
     
    });
    $("#serviceTxt").keyup(function() {
        if($(this).val().length > 0) {
          $(".go-icon").addClass("go-in");
        }
        else {
          $(".go-icon").removeClass("go-in");
        }
    });

    $("#searchLocation").focus(function() {
      $(".search-box1").addClass("border-searching1");
      $(".search-icon1").addClass("si-rotate");
      $("#searchLocation").css('padding', '0 68px');
      $("#searchLocation").attr('placeholder', 'Start searching...');
    });
    $("#searchLocation").blur(function() {
      $(".search-box1").removeClass("border-searching1");
      $(".search-icon1").removeClass("si-rotate");
      $("#searchLocation").css('padding', '0 30px 0 50px');
      $("#searchLocation").attr('placeholder', 'Enter location in SA');
    });
    $("#searchLocation").keyup(function() {
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
            "Find Trusted Experts",
            "Get Instant Quotes",
            "Hire with Confidence"
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

    <style>
        /* Marquee container */
        .marquee-container {
            width: 100%;
            overflow: hidden;
            white-space: nowrap;
            position: relative;
            background: black;
            padding: 10px 0;
        }

        /* Marquee inner wrapper */
        .marquee-content {
            display: flex;
            gap: 40px; /* Adjust spacing between images */
            animation: scrollMarquee 30s linear infinite;
        }

        /* Marquee animation */
        @keyframes scrollMarquee {
            from {
                transform: translateX(0);
            }
            to {
                transform: translateX(-50%);
            }
        }

        /* Image styles */
        .marquee-content img {
            height: 30px; /* Adjust image height */
            width: auto;
        }
    </style>
    <script>
        // Array of image sources
        const imageSources = [
            '/build/assets/img/bluedoglogo.png',
            '/build/assets/img/Genius.png',
            '/build/assets/img/LevelUp.png',
            '/build/assets/img/Scoutbird.png',
            '/build/assets/img/bluedoglogo.png',
            '/build/assets/img/Mobiosoft.png',
            '/build/assets/img/RocketDigital.png',
            '/build/assets/img/Shopido.png',
            '/build/assets/img/bluedoglogo.png',
            '/build/assets/img/Genius.png',
            '/build/assets/img/LevelUp.png',
            '/build/assets/img/Scoutbird.png',
            '/build/assets/img/bluedoglogo.png',
            '/build/assets/img/Mobiosoft.png',
            '/build/assets/img/RocketDigital.png',
            '/build/assets/img/Shopido.png'
            
        ];

        // Get the marquee content container
        const marqueeContent = document.getElementById('marqueeContent');

        // Loop through the imageSources array and create img elements
        imageSources.forEach(src => {
            // Create the image element
            const imgElement = document.createElement('img');
            imgElement.src = src;
            imgElement.alt = src.split('/').pop().split('.')[0] + " Logo"; // Set alt text from file name
            
            // Append the image to the marquee container
            marqueeContent.appendChild(imgElement);

           
        });

  
    </script>
    
</x-guest-layout>