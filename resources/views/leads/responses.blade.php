<x-app-layout>
<style>
    .tab-container {
      display: flex;
      cursor: pointer;
      margin-bottom: 10px;
    }
    
    .tab.active {
      background: #1890ff;
      color: #fff;
    }
    .tab-content {
      display: none;
      padding: 20px;
      background: #f9f9f9;
      border: 1px solid #ddd;
    }
    .tab-content.active {
      display: block;
    }

    h2 {
  color: #000;
  text-align: center;
  font-size: 2em;
  margin: 20px 0;
}

.warpper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tab {
  cursor: pointer;
  padding: 2px 2px;
  margin: 2px 2px;
  background: purple;
  display: inline-block;
  color: #fff;
  border-radius: 3px 3px 0px 0px;
  box-shadow: 0 0.5rem 0.8rem #00000080;
 
}

.panels {
  background: #fff;
  box-shadow: 0 2rem 2rem #00000080;
  min-height: 200px;
  width: 100%;
  max-width: 500px;
  border-radius: 3px;
  overflow: hidden;
  padding: 20px;
}

.panel {
  display: none;
  animation: fadein 0.8s;
}

@keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.panel-title {
  font-size: 1.5em;
  font-weight: bold;
}

.radio {
  display: none;
}

#one:checked ~ .panels #one-panel,
#two:checked ~ .panels #two-panel,
#three:checked ~ .panels #three-panel {
  display: block;
}

#one:checked ~ .tabs #one-tab,
#two:checked ~ .tabs #two-tab,
#three:checked ~ .tabs #three-tab {
  background: #fff;
  color: #000;
  border-top: 3px solid purple;
}
.end-message {
            display: none;
            text-align: center;
            margin: 20px 0;
            color: purple;
        }
        .Pending{
            color: gold;
            font-size: 20px;
        }
        .Archived{
            color: grey;
            font-size: 20px !important;
        }
        .Hired{
            color:rgb(91, 211, 63);
            font-size: 20px;
        }
        .Lost{
            color: red;
            font-size: 20px;
        }
        .Cancelled{
            color: brown;
            font-size: 20px;
        }
        .lead-list, .lead-details{
    transition: all 0.3s ease-in-out;
}
.back-button{
    display: none;
 }
@media (max-width: 768px){
    .lead-list {
        width: 100%;
    }
    .lead-details {
        width: 100%;
        display: none;
    }
    .lead-details.active{
        display: block;
    }
 .back-button{
    display: block;
 }
}
.back-button {
  position: relative;
  padding: 10px 20px 10px 40px;
  font-size: 10px;
  color: #ffffff;
  background-color: #1a191a;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-transform: uppercase;
  transition: background-color 0.3s ease;
}

.back-button:hover {
  background-color: purple;
}

.back-button:before {
  content: "\2190"; /* Unicode for left arrow */
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #ffffff;
}

</style>
    <div class="sticky-top enquiriesbanner">
        <div class="flex-fill d-flex">
            <div id="__rctSellerEnquiriesBanner" class="w-100"></div>
        </div>
    </div>

    <form>
                                            @csrf
                    </form>
                                            
    <div class="notification-template" style="display: none">
        <a class="notification-link" href="https://www.fortai.com/sellers/dashboard/">
            <div class="d-flex flex-row">
                <div class="d-flex flex-column ">
                    <img class="mr-2 mt-1 notification-icon" src="https://www.fortai.com/sellers/dashboard/" width="16"
                        height="16">
                </div>
                <div class="d-flex flex-column flex-grow-1 overflow-hidden">
                    <div class="d-flex flex-row flex-grow-1">
                        <strong>
                            <p class="title strong text-dark-blue"></p>
                        </strong>
                        <p class="justify-self-end date ml-auto"></p>
                    </div>
                    <p class="message pr-3 text-dark-blue text-truncate d-inline-block"></p>
                </div>
            </div>
        </a>
    </div>
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

    <div id="__rctSellerEnquiries"></div>


    <div class="seller-dash-v2 leads desktop">
        <div class="container-fluid px-0">
            <div class="row no-gutters">
                <div class="no-results-template pt-6 pt-lg-9 align-items-center px-4 d-none text-center mx-auto">
                    <img class="img-fluid" width="156" height="111"
                        src="./fortai.com - Leads_files/noresults-illustration.png!d=PVEswj"
                        srcset="https://d18jakcjgoan9.cloudfront.net/s/img/frontend-v2/seller-dashboard/noresults-illustration.png!d=PVEswj 1x, https://d18jakcjgoan9.cloudfront.net/s/img/frontend-v2/seller-dashboard/noresults-illustration.png!d=KAYSPp 2x">
                    <h4 class="no-results-title"></h4>
                    <p class="text-light-grey no-results-text"></p>
                    <a href="https://www.fortai.com/sellers/dashboard/" class="pt-top no-results-link mt-3"></a>
                </div>

                <div class="col fixed-height-column flex-grow-1 no-results desktop-no-results d-none"
                    style="max-height: 870px; display: none;"></div>

                <div class="col-12 col-md leads-and-responses ">



                    <div class="row no-gutters">
                        <!-- Leads list  -->
                        <div class="lead-list dashboard-projects col-12 col-md-5 col-lg-4 col-xl projects-column fixed-height-column overflow-auto1 scroll-touch leads-list-container border-right bg-grey-50"
                            id="dashboard-projects" style="max-height: 870px;">
                            <input type="hidden" id="js-show-new-header" name="js-show-new-header" value="0">





                            <div class="sticky-top">
                            <div id="leads-filter-header">
            <div data-testid="leads-filter-header">
               
           
    
    

                                        </div>
                                        <div class="tw-py-2 tw-px-4 tw-bg-gray-300 tw-flex tw-justify-between tw-bg-dark-blue-500">
                                            <div
                                                class="tw-flex tw-items-center tw-text-sm  tw-font-gordita-regular tw-justify-between tw-w-full tw-pr-3">
                                                 
                                                      
                                               <div class="warpper">
  <input class="radio" id="one" name="group" type="radio" checked>
  <input class="radio" id="two" name="group" type="radio">
  <input class="radio" id="three" name="group" type="radio">

  <div class="tabs">
    <label class="tab" id="one-tab" for="one">All <span class="uk-badge">0</span></label>
    <label class="tab" id="two-tab" for="two">Pending <span class="uk-badge">0</span></label>
    <label class="tab" id="three-tab" for="three">Hired <span class="uk-badge">0</span></label>
  </div>

</div>
                                            <div>
                                            
                                             </div>
                                             </div>
                                            <div class="tw-pl-3 tw-border-l tw-border-gray-400">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div id="__rctLeadsQuickFilters">
                                   
                            </div>
                            
                            
                            <div id="__rctLeadsList">
                                <div class="infinite-scroll-component__outerdiv">
                                    <div class="infinite-scroll-component " style="height: 600px; overflow-y: auto;">
                                          
                                        <div class="tw-bg-gray-200 tw-overflow-y tw-h-full tw-gap-3 tw-flex tw-flex-col tw-py-3"
                                            data-cy="leads-list" id="myleads">
                                      
                                                             <div class="tw-w-full tw-flex tw-justify-center tw-items-center tw-py-4 loader" style="display:none">
                                            <div role="status" class="tw-flex" data-cy="loading-spinner"
                                                style="width: 22px; height: 22px;">
                                                <svg class="LoadingSpinner_root__iaeTy  tw-text-blue-500 undefined"
                                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <title>Loading</title>
                                                    <circle class="LoadingSpinner_svgcircle__EIpp0" cx="12" cy="12"
                                                        r="10">
                                                    </circle>
                                                    <path class="LoadingSpinner_svgpath__5oUPF tw-opacity-75"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                                    </path>
                                                </svg>
                                                <span
                                                    style="border: 0px; clip: rect(0px, 0px, 0px, 0px); height: 1px; margin: -1px; overflow: hidden; padding: 0px; position: absolute; width: 1px; white-space: nowrap; overflow-wrap: normal;">Loading...</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                </div>
                                         <div id="end-message" class="end-message">
        No more leads to display.
    </div>
             
                            </div>
                            <div class="text-center load-more p-3" style="display: none;">
                                <button class="button button-white btn btn-link">
                                    Load more
                                </button>
                            </div>
                            <div class="align-center loading-more-records justify-content-center pt-8"
                                style="display: none;">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="sr-only">
                                        Loading...
                                    </span>
                                </div>
                            </div>
                        </div>



                        <!-- Right panel  -->



<div class=" lead-details col-12 col-md-7 col-lg right-panel fixed-height-column overflow-auto scroll-touch h-100 d-block js-dashboard-right-container" style="max-height: 870px;min-width:360px"><br>
<div class="right-panel-wrapper ml-lg-4" >                       
<div class="w-100 project-details-grid-container">
<div class="tw-w-full tw-flex tw-justify-center tw-items-center tw-py-4 loader" style="display:none">
    <div role="status" class="tw-flex" data-cy="loading-spinner" style="width: 22px; height: 22px;">
        <svg class="LoadingSpinner_root__iaeTy  tw-text-blue-500 undefined" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <title>Loading</title>
            <circle class="LoadingSpinner_svgcircle__EIpp0" cx="12" cy="12" r="10"></circle>
            <path class="LoadingSpinner_svgpath__5oUPF tw-opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span style="border: 0px; clip: rect(0px, 0px, 0px, 0px); height: 1px; margin: -1px; overflow: hidden; padding: 0px; position: absolute; width: 1px; white-space: nowrap; overflow-wrap: normal;">
            Loading...
        </span>
    </div>
</div>
</div>
<div class="d-flex flex-column project-details-col-project-top" id="show_details">
    <div class="d-flex flex-column project-details-col-project-top">
        <div class="loading-project-interaction justify-content-center pt-5">
            <div class="spinner-border text-primary" role="status">
                <span class="sr-only">
                    Loading...
                </span>
            </div>
        </div>
    </div>
</div>











                    </div>

                                                    
<x-coin-svg size="20px" />


</x-app-layout>

<script src="{{asset('build/assets/js/response.js')}}"></script>
<script>
$(document).on('click','.nav-item',function() {
      // Remove active class from all tabs and contents
      $('.nav-item').removeClass('active');
      $('.tab-content').removeClass('active');

      // Add active class to the clicked tab and related content
      $(this).addClass('active');
      $('#' + $(this).data('tab')).addClass('active');
    });
</script>