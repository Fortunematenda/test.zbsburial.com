<x-app-layout>

    <!-- Stylesheets -->
    <link rel="stylesheet" href="{{asset('build/assets/css/main_v2-built.645e5822f3.v2.css')}}">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/uikit@3.16.6/dist/css/uikit.min.css" />
    <link rel="stylesheet" href="{{ asset('build/assets/css/buyer/custom-dashboard.css') }}">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" />
    <!-- External Bark CSS -->
    <link rel="stylesheet" href="https://frontend-production.bark.com/129-0se7csjog8dvde6g/nrf-script/main.a634a7f188799b03.css">
    <link rel="stylesheet" href="https://frontend-production.bark.com/129-0se7csjog8dvde6g/nrf-script/363.24d653c081db1000.css">
    <link rel="stylesheet" href="https://frontend-production.bark.com/129-0se7csjog8dvde6g/nrf-script/702.f9315afa538250b2.css">
    <link onerror="window?.fallbackOnError?.call(this, `react_buyer_dashboard`);" rel="stylesheet" href="https://frontend-production.bark.com/130-o4zypk38cb99vdge/buyer-dashboard/styles.801bdd1ca194c698.css">
    <link onerror="window?.fallbackOnError?.call(this, `react_buyer_dashboard`);" rel="stylesheet" href="https://frontend-production.bark.com/130-o4zypk38cb99vdge/buyer-dashboard/main.d247f3888acfd52b.css">


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

    <!-- Marquee Section -->
    <div class="marquee-wrapper">
        <div class="marquee">
            <p>"Welcome to your dashboard! 🌟 We're here to make your experience seamless and efficient. Keep exploring, and don't forget to check out new features and updates tailored just for you!</p>
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


    </div>
    <!-- ✅ Script Section (at bottom to avoid jQuery issues) -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/uikit@3.16.6/dist/js/uikit.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/uikit@3.16.6/dist/js/uikit-icons.min.js"></script>
    <script src="{{ asset('build/assets/js/custom-dashboard.js') }}"></script>
   

</x-app-layout>
