

<x-app-layout>

    <link rel="stylesheet" href="{{asset('build/assets/css/main_v2-built.645e5822f3.v2.css')}}">
    <!-- Bootstrap 5 CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<!-- Bootstrap 5 JS (includes Popper) -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>


    
    
    <style>
        .uk-modal.uk-open {
    z-index: 10000 !important;
}
    </style>
    <!-- Marquee Section -->
    <div class="marquee-wrapper">
        <div class="marquee">
            <p>"Welcome to your dashboard! 🌟 We're here to make your experience seamless and efficient. Keep exploring, and don't forget to check out new features and updates tailored just for you!</p>
        </div>
    </div>

<link rel="stylesheet" href="{{asset('build/assets/css/main_v2-built.645e5822f3.v2.css')}}">
    <!-- Loading Overlay -->
    <div class="v2-loading-overlay">
        <div class="loading-box fade show mx-auto">
            <div class="d-flex flex-column py-4 align-items-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <h4 class="loading-text pt-2">
                    Please wait ...
                </h4>
            </div>
        </div>
    </div>
    <div class="pb-4">
                   
                        <div class="top-row_root__3JOm6" style="flex-wrap: nowrap !important;
    justify-content: space-around !important;">
          
      

                            <button class="Button_base__iY8s5 uk-button-small Button_minWidth__2dpSx Button_textBlue__796NH Button_bgLightBlue__0RMHv __btnPlaceRequest tw-border-0 mr-3">
                                <span class="button-main">
                                    <span class="child-container Button_childContainer__ytwFQ">
                                    <a href="{{ route('createrequests') }}" class="text-gray">Create new lead</a>
                                    </span>
                                </span>
                            </button> 
                            @if(auth()->user()->role == "Customer")
                            <button class="Button_base__iY8s5 uk-button-small Button_minWidth__2dpSx Button_textBlue__796NH Button_bgLightBlue__0RMHv __btnPlaceRequest tw-border-0" type="button" uk-toggle="target: #modal-example">
                                <span class="button-main">
                                    <span class="child-container Button_childContainer__ytwFQ text-gray" >
                                     Become an Expert
                                    </span>
                                </span>
                            </button>
@endif

                        </div>
       
                    </div>
                    
    <!-- Main Content Wrapper -->
    <div class="full-width-wrapper full-height-with-header bg-light-grey">
    @if(auth()->user()->password_updated == 0)
    <div class="alert alert-danger alert-dismissible fade show text-center" role="alert">
        <strong>Security Alert:</strong> Please <a href="{{ route('password.change') }}" class="text-white text-decoration-underline">change your password</a> to secure your account.
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
    
@endif



                
    <h4 class="font-weight-bold  mb-4 cHKndY">
                            Your requests
      </h4>
        <div id="__rctBuyerPlist">
            <div class="" id="app" style="background-color: rgb(249, 249, 250);">
                <div class="container tw-mx-auto">
                    <!-- Header Section -->
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

                    <!-- Project List Section -->
                    
                    <div class="mb-4">
                        
                        <div class="projectlistContainer" id="app">
                            <div data-testid="project_list" class="tw-flex tw-flex-row tw-grid sm:tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                                <!-- Project List Item 1 -->
                                        
               


                                <!-- Project List Item 2 -->
                                 @forelse ($user_leads as $lead)
                                <div data-cy="projectListItem" class="projectlist_item_projectListItem__+529Q tw-text-center tw-items-center tw-flex tw-flex-col tw-p-4 tw-shadow-md tw-bg-white tw-rounded tw-p-3">
                                    <h3 data-testid="_plistProjectLink" class="tw-pt-2 tw-text-center tw-cursor-pointer">
                                        {{$lead["service_name"]}}
                                    </h3>
                                    <p class="tw-text-center tw-text-sm tw-mb-4 tw-mt-1 tw-text-gray-400">
                                       {{$lead["date_entered"]}}
                                    </p>
                                    <div class="tw-flex tw-flex-col tw-grow tw-w-full">
                                        <div class="tw-pl-4 tw-pr-4">
                                            <div class="tw-flex tw-justify-center tw-mt-2 tw-mb-4">
                                                <div style="position: relative; width: 90px; height: 90px; display: flex; align-items: center; justify-content: center;">
                                                    <div style="width: 90px; height: 90px; background-color: #2D7AF1; opacity: 0.15; border-radius: 50%; position: absolute;"></div>
                                                    <i class="bi bi-check-circle-fill" style="font-size: 45px; color: purple;"></i>
                                                </div>
                                            </div>
                                            <p class="projectlist_item_text-grey-600__bDXRq tw-text-center tw-mb-3">
                                                We've got professionals ready and available!
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div class="tw-mt-3 tw-mb-2 tw-text-center">
                                    @if($lead["isExpertApplied"] > 0)
                                    <form method="POST" action="{{ route('expertreplies') }}">
                                    @csrf
                                    <input value="{{$lead["lead_id"]}}" name="kmm" hidden/>
                                        <button type="submit" data-testid="btn-viewquote" class="projectlist_item_linkButton__p+KBq tw-no-underline tw-drop-shadow-md tw-rounded tw-p-2 tw-text-white">
                                            View Experts
                                        </button>
                                        </form>
                                        @else
                                        @if($lead["status"] == "Open")
                                        <div class="uk-alert-danger" uk-alert>
    <p>Waiting for experts</p>
</div>
@endif
                                        @endif
                                    </div>
                                    @if($lead["status"] == "Open")
                                    <div class="actionsWrapper tw-pb-3 tw-mt-4 tw-items-center tw-text-center tw-text-sm">
                                        <a data-cy="btn_close_request" class="projectlist_item_link__eqrNt tw-pr-2 changestatus" dm="unavailable" xl="{{$lead["lead_id"]}}"  href="#modal-overflow" uk-toggle>
                                            Close request
                                        </a>
                                        |
                                        <a data-cy="btn_hired" class="projectlist_item_link__eqrNt tw-pl-2 changestatus" dm="hired" xl="{{$lead["lead_id"]}}"  href="#modal-overflow" uk-toggle>
                                            I hired someone
                                        </a>
                                    </div>
                                    @else
                                    <div class="uk-alert-primary" uk-alert>
    <p>Closed</p>
</div>
                                    @endif
                                </div>
                                @empty
                                                 <h3>No Leads</h3>
                               @endforelse
                            </div>
                        </div>
                    </div>
     
                    
                        
                    </div>
                  
                </div>
            </div>
        </div>
       

        <div id="modal-overflow" uk-modal>
    <div class="uk-modal-dialog">

        <button class="uk-modal-close-default" type="button" uk-close></button>

        <div class="uk-modal-header">
            <h2 class="uk-modal-title">Change Lead status</h2>
        </div>
        <form method="POST" action="{{ route('poststatus') }}">
        @csrf
        <div class="uk-modal-body" style="margin: 20px;" uk-overflow-auto>
      
        <div class="sel">
<h4>Who is the expert you hired? </h4>
        <div class="uk-margin">
            <select class="uk-select" aria-label="Select" name="expert" id="expert">
                <option>Select expert</option>
                <option value="0">I hired someone not on the list</option>
            </select>
        </div>
        </div>
        <h4>Type comment </h4>
        <div class="uk-margin">
            <textarea class="uk-textarea" rows="5" name="description" placeholder="Comment" aria-label="Textarea" REUIRED></textarea>
        </div>
<input id="xl" name="xl" hidden/>
<input id="status" name="status" hidden/>

        </div>

        <div class="uk-modal-footer uk-text-right">
            <button class="uk-button uk-button-default uk-modal-close" type="button">Cancel</button>
            <button class="uk-button uk-button-primary" type="submit">Submit</button>
        </div>
        </form>
    </div>
</div>


        <link rel="stylesheet" href="https://frontend-production.bark.com/129-0se7csjog8dvde6g/nrf-script/main.a634a7f188799b03.css">
        <link rel="stylesheet" href="https://frontend-production.bark.com/129-0se7csjog8dvde6g/nrf-script/363.24d653c081db1000.css">
        <link rel="stylesheet" href="https://frontend-production.bark.com/129-0se7csjog8dvde6g/nrf-script/702.f9315afa538250b2.css">
        <link onerror="window?.fallbackOnError?.call(this, `react_buyer_dashboard`);" rel="stylesheet" href="https://frontend-production.bark.com/130-o4zypk38cb99vdge/buyer-dashboard/styles.801bdd1ca194c698.css">
        <link onerror="window?.fallbackOnError?.call(this, `react_buyer_dashboard`);" rel="stylesheet" href="https://frontend-production.bark.com/130-o4zypk38cb99vdge/buyer-dashboard/main.d247f3888acfd52b.css">
        


    </div>
<!-- This is the modal -->
<div id="modal-example" uk-modal>
    <div class="uk-modal-dialog uk-modal-body" style="border: 1px solid purple; border-radius: 4px;">
        <h2 class="uk-modal-title" style="text-align: center;">Become Expert</h2>
        <br>

        <form action="{{ route('becomeexpert') }}" method="POST" enctype="multipart/form-data" class="mr-3 ml-3">
            @csrf

            <!-- Company Name -->
            <div class="form-group">
                <label class="form-label">Company</label>
                <input type="text" id="company_name" name="company_name" placeholder="Enter company name"
                    class="form-control mb-1" style="border: 1px solid purple; border-radius: 4px;" required />
            </div>

            <!-- Distance -->
            <div class="form-group">
                <label class="form-label" for="distance">Distance</label>
                <select id="distance" name="distance"
                    class="form-control mb-1 text-black" style="border: 1px solid purple; border-radius: 4px;" required>
                    <option value="">Select distance</option>
                    <option value="50">50 Kilometers</option>
                    <option value="20">20 Kilometers</option>
                    <option value="10">10 Kilometers</option>
                </select>
            </div>

            <!-- Company Website -->
            <div class="form-group">
                <label class="form-label">Company Website</label>
                <select id="is_company_website" name="is_company_website"
                    class="form-control mb-1 text-black" style="border: 1px solid purple; border-radius: 4px;" required>
                    <option value="">Select Company Website</option>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                </select>
            </div>

            <!-- Company Size -->
            <div class="form-group">
                <label class="form-label">Company Size</label>
                <select id="company_size" name="company_size"
                    class="form-control mb-1 text-black" style="border: 1px solid purple; border-radius: 4px;" required>
                    <option value="">Select Company Size</option>
                    <option value="Self-employed">Self-employed</option>
                    <option value="2-10">2-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="200+">200+</option>
                </select>
            </div>

            <!-- Select Service (Searchable Dropdown) -->
          
            <div class="form-group">
    <label class="form-label" for="service">Select Service</label>
    <select class="js-example-basic-multiple mt-1 block w-full" id="service" name="services[]" multiple="multiple"
        style="cursor: default;padding-left: 20px !important;padding-right: 2px;">
        @foreach($services as $service)
            <option value="{{ $service->service_name }}">{{ $service->service_name }}</option>
        @endforeach
    </select>
</div>
<style>
    /* Fix the height and overflow of the Select2 box */
.select2-container--default .select2-selection--multiple {
    min-height: 38px; /* or auto if you want it to expand */
    overflow-y: auto;
    max-height: 100px; /* limit height and allow scrolling */
    white-space: normal;
}

/* Allow wrapping of selected items */
.select2-selection__rendered {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 4px 8px;
    box-sizing: border-box;
}
</style>
<script>
$(document).ready(function() {
    $('#service').select2({
        placeholder: "Select a service",
        width: '100%' // Ensures it uses full width of container
    });
});
</script>



            <!-- Biography -->
            <div class="form-group">
                <label class="form-label">Bio</label>
                <textarea class="form-control" id="biography" name="biography" rows="5"
                    placeholder="Enter your biography here..." style="border: 1px solid purple; border-radius: 4px;" required></textarea>
            </div>

            <!-- Modal Buttons -->
            <p class="uk-text-right">
                <button class="uk-button uk-button-default uk-modal-close" type="button">Cancel</button>
                <button type="submit" class="uk-button btn btn-primary btn-round">Submit</button>
            </p>
        </form>
    </div>
</div>

<!-- Load jQuery first -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

<!-- Select2 CSS & JS -->
<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>

<!-- Initialize Select2 after modal is shown -->


<!-- Force black text inside dropdown -->
<style>
    select,
    select option,
    .select2-container--default .select2-selection--single {
        color: black !important;
    }
</style>




</x-app-layout>
    <script>

UIkit.util.on('#modal-example', 'shown', function () {
  const $select = $('#service');
  $select.select2({
    dropdownParent: $('#modal-example')
  });
  
});
$(document).on('change', '#service', function (e) {
  e.stopPropagation(); // prevent bubbling
  e.stopImmediatePropagation(); // prevent further event listeners

  const selectedValue = $(this).val();
  console.log('Selected option value:', selectedValue);

  // Re-show modal using UIkit API (don’t add classes manually)
  UIkit.modal('#modal-example').show();
});


        $(document).on("click",".changestatus",function(){
          let xl = $(this).attr("xl"); 
          let status = $(this).attr("dm");  
          $("#xl").val(xl);
          $("#status").val(status);

          if(status === "hired"){
$(".sel").show();
const selectElement = document.getElementById('expert');
while (selectElement.options.length > 2) {
    selectElement.remove(2);
}
$.ajax({
            url: "/leadexperts",
            type: 'GET',
            data: {xl},
            beforeSend: function() {
            },
            success: function(data) {
                data = data["xperts"];
                for(key in data)  
                {
                    $("#expert").append("<option value='"+data[key]["id"]+"'>"+data[key]["first_name"]+" "+data[key]["last_name"]+"</option>")
                }          
               
            }, 
            error: function(xhr, status, error) {
                console.error('Error:', status, error);
            },
            complete: function() {
            }
        });      
          }
          else{
            $(".sel").hide();
          }
        });

        $(document).on("click","#updatestatus",function(){
          let xl = $("#xl").val(); 
          let status = $("#status").val();  
          $("#xl").val(xl);
          $("#status").val(status);

        
$.ajax({
            url: "/leadexperts",
            type: 'GET',
            data: {xl},
            beforeSend: function() {
            },
            success: function(data) {
                data = data["xperts"];
                for(key in data)  
                {
                    $("#expert").append("<option value='"+data[key]["id"]+"'>"+data[key]["first_name"]+" "+data[key]["last_name"]+"</option>")
                }          
               
            }, 
            error: function(xhr, status, error) {
                console.error('Error:', status, error);
            },
            complete: function() {
            }
        });      
    }); 



        // Firebase configuration
        const firebaseConfig = {
    apiKey: "AIzaSyBwGgKI26k5xuzfnDetJdDb1caDG1z1vys",
    authDomain: "fortai-7d627.firebaseapp.com",
    projectId: "fortai-7d627",
    storageBucket: "fortai-7d627.appspot.com",
    messagingSenderId: "701202336945",
    appId: "1:701202336945:android:787548d1de86164643a690",
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Function to get FCM device token
  async function getDeviceToken() {
    try {
      // Request notification permission
    
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.error("Permission not granted for notifications.");
        return;
      }
     

      // Get FCM token
      const token = await messaging.getToken({ 
       // vapidKey: "BK3Mq1R2BYYvtCovdNN41votnuHAYxB4BnDQMAKOwHd_ZdyLLCNE5sIomukDAW6EZDti5RAPH32xAXLEDRGNOmo" 
      });
      let _token = $('input[name="_token"]').val(); // CSRF token
const obj = {
  token:token,
  _token:_token

};
      console.log("Device Token:", token);
      $.ajax({
            url: '/posttoken',
            type: 'POST',
            data: { serviceTxt, _token }, // Send data in one object
            beforeSend: function() {
                $("#search-service").show(); // Show loading or search div
            },
            success: function(data) {
             console.log(data)
            }, 
            error: function(xhr, status, error) {
                console.error('Error:', status, error); // Improved error logging
            },
            complete: function() {
                 // Hide loading or search div after request completes
            }
        });

    } catch (error) {
      console.error("Error getting token:", error);
    }
  
  }

  // Call the function when the page loads
  getDeviceToken();
   

 
    

    </script>

<!-- Add CSS for the Marquee -->
<style>
    .mb-4 {
  margin-bottom: 1.5rem !important;
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
    .marquee-wrapper {
        background-color: #f8f9fa;
        overflow: hidden;
        white-space: nowrap;
        width: 100%;
        border: 1px solid #ccc;
    }
    .marquee {
        display: inline-block;
        animation: marquee 40s linear infinite;
        font-size: 20px;
        padding: 10px 0;
        color: purple;
    }
    @keyframes marquee {
        from {
            transform: translateX(100%);
        }
        to {
            transform: translateX(-100%);
        }
    }

    .Button_bgLightBlue__0RMHv {
  
    border-color: rgb(168 93 203) !important;
   
}
.Button_textBlue__796NH {
    
    color: rgb(176 45 241) !important;
}
.account-settings-multiselect ~ .select2-container {
      width: 100% !important;
  }

  .alert-danger {
    color: #fff;
    background-color: #db0b29;
    border-color: #fff;
  }
</style>
