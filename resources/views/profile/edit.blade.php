<x-app-layout>
  
    
      
      <style type="text/css">
  
  
  .ui-w-80 {
      width: 80px !important;
      height: auto;
  }
  
  .btn-default {
      border-color: rgba(24,28,33,0.1);
      background: rgba(189, 3, 226, 0);
      color: #4E5155;
  }
  
  label.btn {
      margin-bottom: 0;
  }
  
  .btn-outline-primary {
      border-color: #26B4FF;
      background: transparent;
      color: #26B4FF;
  }
  
  .btn {
      cursor: pointer;
  }
  
  .text-light {
      color: #babbbc !important;
  }
  
  .btn-facebook {
      border-color: rgba(0,0,0,0);
      background: #3B5998;
      color: #fff;
  }
  
  .btn-instagram {
      border-color: rgba(0,0,0,0);
      background: #000;
      color: #fff;
  }
  
  .card {
      background-clip: padding-box;
      box-shadow: 0 1px 4px rgba(24,28,33,0.012);
  }
  
  .row-bordered {
      overflow: hidden;
  }
  
  .account-settings-fileinput {
      position: absolute;
      visibility: hidden;
      width: 1px;
      height: 1px;
      opacity: 0;
  }
  .account-settings-links .list-group-item.active {
      font-weight: bold !important;
  }
  html:not(.dark-style) .account-settings-links .list-group-item.active {
      background: transparent !important;
  }
  .account-settings-multiselect ~ .select2-container {
      width: 100% !important;
  }
  .light-style .account-settings-links .list-group-item {
      padding: 0.85rem 1.5rem;
      border-color: rgba(24, 28, 33, 0.03) !important;
  }
  .light-style .account-settings-links .list-group-item.active {
      color: #4e5155 !important;
  }
  .material-style .account-settings-links .list-group-item {
      padding: 0.85rem 1.5rem;
      border-color: rgba(24, 28, 33, 0.03) !important;
  }
  .material-style .account-settings-links .list-group-item.active {
      color: #4e5155 !important;
  }
  .dark-style .account-settings-links .list-group-item {
      padding: 0.85rem 1.5rem;
      border-color: rgba(255, 255, 255, 0.03) !important;
  }
  .dark-style .account-settings-links .list-group-item.active {
      color: #fff !important;
  }
  .light-style .account-settings-links .list-group-item.active {
      color: #4E5155 !important;
  }
  .light-style .account-settings-links .list-group-item {
      padding: 0.85rem 1.5rem;
      border-color: rgba(24,28,33,0.03) !important;
  }

        header {
            background-color: white;
            padding: 15px;
            border-bottom: 1px solid #ddd;
            text-align: center;
        }

        header img {
            height: 50px;
        }

        .tabs {
            display: flex;
            overflow-x: auto;
            white-space: nowrap;
            border-bottom: 1px solid #ddd;
            background-color: white;
        }

        .tab {
            padding: 10px 20px;
            cursor: pointer;
            flex-shrink: 0 !important;
            text-align: center;
            margin-top: 25px;

        }

        .tab.active {
            border-bottom: 2px solid #4285f4;
            font-weight: bold;
            color: #4285f4;
        }

        .content {
            padding: 20px;
        }

        .section {
            background-color: white;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .section h2 {
            font-size: 18px;
            margin: 0;
            padding: 15px;
            background-color: #4285f4;
            color: white;
        }

        .section p {
            padding: 15px;
            margin: 0;
            color: #333;
        }

        .section a {
            display: block;
            padding: 15px;
            text-decoration: none;
            color: #4285f4;
            background-color: #f9f9f9;
            border-top: 1px solid #ddd;
        }

        .section a:hover {
            background-color: #f1f1f1;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .tabs {
                overflow-x: auto;
                scrollbar-width: thin;
            }

            .tab {
                flex: 0 0 auto;
            }
        }
  
        .cHKndY {
    flex: 1 1 0% !important;
    text-align: center !important;
    font-size: 20px !important;
    font-weight: bold !important;
    box-shadow: none !important;
    margin-bottom: 16px !important;
    color: purple !important;
    margin-top: 16px !important;
}
.iidlEb {
    max-width: 768px !important ;
    margin: 24px auto !important;
    border-radius: 4px !important;
    box-shadow: rgb(224, 224, 224) 0px 0px 0px 1px !important;
    background-color: rgb(255, 255, 255) !important;
    padding: 24px 16px !important;
}
.wHRnL {
    background-color: rgb(255, 255, 255) !important;
    box-shadow: rgb(224, 224, 224) 0px 0px 0px 1px !important;
    color: rgba(0, 0, 0, 0.87) !important;
}

.wUjgt {
   /* font-family: "source sans pro", "sans-serif";*/
    font-size: 16px;
    margin-bottom: 8px;
    color: rgba(0, 0, 0, 0.87);
    font-weight: bold;
}

</style>
        
<title>account settings</title>
<div class="tabs wHRnL wUjgt" id="tabs">
    <div class="tab profile" data-content="profile" href="#profile">
        Personal Info
    </div>
    <div class="tab photos" data-content="photos" href="#photos">
       Photos
    </div>
    <div class="tab services" data-content="services" href="#services">
        Services
    </div>
    <div class="tab purchase_credits" data-content="purchase_credits" href="#purchase_credits">
        Credits
    </div>
    <div class="tab data-privacy" data-content="data-privacy">
        Data & Privacy
    </div>
    <div class="tab password" data-content="password"  href="#password">
        Security
    </div>
    <div class="tab social-links" data-content="social-links"  href="#social-links">
        Social links
    </div>
    <div class="tab notifications" data-content="notifications" href="#notifications">
        Notifications
    </div>
</div>




<div class="container light-style flex-grow-1 container-p-y iidlEb">
    @if(session('success'))
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        {{ session('success') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
    @elseif(session('error'))
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
        {{ session('error') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
    @endif
    {{-- Display Validation Errors --}}
    @if($errors->any())
    <div class="alert alert-danger">
        <ul>
            @foreach($errors->all() as $error)
            <li>
                {{ $error }}
            </li>
            @endforeach
        </ul>
    </div>
    @endif
    <form id="send-verification" method="post" action="{{ route('verification.send') }}">
        @csrf
    </form>
<form method="post" action="{{ route('profile.update') }}" class="" enctype="multipart/form-data">
    @csrf
    @method('patch')
    <!-- Form fields go here -->
     <div class="tab-content" >
        <!--General-->
        <div class="tab-pane fade active show" id="profile">
            @include('profile.partials.update-profile-information-form')
           
        </div>
        <!--Photos-->
        <div class="tab-pane fade" id="photos">
            <div class="card-body pb-2">
                @include('profile.partials.photos-form')
            </div>
        </div>
         <!--Services-->
        <div class="tab-pane fade" id="services">
            <div class="card-body pb-2">
                @include('profile.partials.update-services')
            </div>
        </div>
        
       
        <!--Purchase Credits-->
        <div class="tab-pane fade" id="purchase_credits" style=" justify-content: center;" >
            @include('profile.partials.buy-credits-form')
           
        </div>
        <!--Data Privacy-->
        <div class="tab-pane fade" id="data-privacy">
            @include('profile.partials.data-privacy-form')
          
        </div>
         <!--Security-->
        <div class="tab-pane fade" id="password">
            <div class="card-body pb-2">
                @include('profile.partials.update-password-form')
            </div>
        </div>
        <div class="tab-pane fade" id="social-links">
            @include('profile.partials.social-links-form')
         
        </div>
        <!--Notifications-->
        <div class="tab-pane fade" id="notifications">
            @include('profile.partials.notifications-form')
           
        </div>
    </div>

</form>
</div>
  <script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script>
  <script src="https://code.jquery.com/jquery-1.10.2.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.0/dist/js/bootstrap.bundle.min.js"></script>
  <script type="text/javascript"></script>

  </x-app-layout>
  
  <script>
    function getCookie(name) {
    const cookies = document.cookie.split(';'); // Split all cookies into an array
    for (let cookie of cookies) {
        cookie = cookie.trim(); // Remove leading and trailing spaces
        if (cookie.startsWith(name + "=")) {
            return cookie.substring((name + "=").length); // Return the value of the cookie
        }
    }
    return null; // Return null if the cookie is not found
}
    let tab_name = "profile";
    document.addEventListener('DOMContentLoaded', function () {
    // Select all tabs
    const tabs = document.querySelectorAll('.tab');
    
    // Attach event listeners to all tabs
    tabs.forEach((tab) => {
        tab.addEventListener('click', function () {
            // Remove active class from all tabs
            tabs.forEach((t) => t.classList.remove('active'));
            
            // Add active class to the clicked tab
            this.classList.add('active');
            
            // Hide all tab contents
            const tabContents = document.querySelectorAll('.tab-pane');
            tabContents.forEach((content) => content.classList.remove('active', 'show'));
            
            // Show the corresponding content
            const contentId = this.getAttribute('data-content');
            const contentElement = document.getElementById(contentId);
            tab_name = contentId;
            document.cookie = `tab_name=${tab_name}; path=/`;
            if (contentElement) {
                contentElement.classList.add('active', 'show');
            }
        });
    });

    // Initialize the first tab as active on load
    const tabNameCookie = getCookie('tab_name');
    console.log(tabNameCookie);
if (tabNameCookie) {
    tab_name = tabNameCookie;
} else {
    tab_name = "profile";
}
    const initialTab = document.querySelector('.tab.'+tab_name);
    if (initialTab) {
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-pane');
            tabContents.forEach((content) => content.classList.remove('active', 'show'));
        $("."+tab_name).addClass("active");
        
        const initialContentId = initialTab.getAttribute('data-content');
        const initialContent = document.getElementById(initialContentId);
        if (initialContent) {
            initialContent.classList.add('active', 'show');
        }
    }
});

//document.cookie = `tab_name=profile; path=/`;     
  </script>
  <!-- Bootstrap CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- Bootstrap JS (required for dismiss functionality) -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>

  <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA_Qd54wgjWo4t-Klmi3m_pz8HbHz0GQto&libraries=places&callback=initializeAutocomplete" type="text/javascript"></script>