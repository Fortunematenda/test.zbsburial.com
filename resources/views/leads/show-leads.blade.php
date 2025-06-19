<x-app-layout>
<style>
      .end-message {
            display: none;
            text-align: center;
            margin: 20px 0;
            color: purple;
        }
        .bd{
    border: 1px solid purple;
}
hr {
    height: 0;
    color: inherit;
    border-top-width: 1px;
    margin: 10px 0 10px 0px !important;
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
                        <div class="dashboard-projects col-12 col-md-5 col-lg-4 col-xl projects-column fixed-height-column verflow1-auto scroll-touch leads-list-container border-right bg-grey-50 lead-list"
                            id="dashboard-projects" style="max-height: 870px;">
                            <input type="hidden" id="js-show-new-header" name="js-show-new-header" value="0">





                            <div class="sticky-top">
                                <div id="leads-filter-header">
                                    <div data-testid="leads-filter-header">
                                        <div class="tw-p-4 tw-flex tw-bg-dark-blue-500 tw-w-full tw-justify-between">
                                            <div class="tw-text-white">
                                                <h5 class="!tw-mt-0 !tw-text-lg !tw-mb-0 !tw-leading-[20px] !tw-text-white">
                                                    <span class="matching_leads">0</span> matching leads</h5>
                                                <div class="tw-flex tw-flex-wrap">
                                                    <div class="tw-text-sm tw-font-gordita-regular tw-flex tw-mt-2"><svg
                                                            width="14" height="14" viewBox="0 0 14 14" fill="none"
                                                            xmlns="http://www.w3.org/2000/svg" class="tw-mr-1">
                                                            <path
                                                                d="M6.25 3.25H10.75V4.75H6.25V3.25ZM6.25 6.25H10.75V7.75H6.25V6.25ZM6.25 9.25H10.75V10.75H6.25V9.25ZM3.25 3.25H4.75V4.75H3.25V3.25ZM3.25 6.25H4.75V7.75H3.25V6.25ZM3.25 9.25H4.75V10.75H3.25V9.25ZM13.075 0.25H0.925C0.55 0.25 0.25 0.55 0.25 0.925V13.075C0.25 13.375 0.55 13.75 0.925 13.75H13.075C13.375 13.75 13.75 13.375 13.75 13.075V0.925C13.75 0.55 13.375 0.25 13.075 0.25ZM12.25 12.25H1.75V1.75H12.25V12.25Z"
                                                                fill="currentColor"></path>
                                                        </svg> <span class="tw-leading-[16px]">{{$services_count}}
                                                            services</span></div>
                                                    <div class="tw-flex tw-items-center tw-px-2 tw-mt-2"><span
                                                            class="tw-inline-flex tw-rounded-full tw-w-1 tw-h-1 tw-bg-gray-600"></span>
                                                    </div>
                                                    <div class="tw-text-sm tw-font-gordita-regular tw-flex tw-mt-2"><svg
                                                            width="17" height="17" viewBox="0 0 20 20"
                                                            xmlns="http://www.w3.org/2000/svg" fill="#CED0DA"
                                                            stroke="none" class="tw-mr-1">
                                                            <path fill-rule="evenodd" clip-rule="evenodd"
                                                                d="M10.0001 1.66663C6.77508 1.66663 4.16675 4.27496 4.16675 7.49996C4.16675 11.875 10.0001 18.3333 10.0001 18.3333C10.0001 18.3333 15.8334 11.875 15.8334 7.49996C15.8334 4.27496 13.2251 1.66663 10.0001 1.66663ZM10.0001 9.58329C8.85008 9.58329 7.91675 8.64996 7.91675 7.49996C7.91675 6.34996 8.85008 5.41663 10.0001 5.41663C11.1501 5.41663 12.0834 6.34996 12.0834 7.49996C12.0834 8.64996 11.1501 9.58329 10.0001 9.58329Z">
                                                            </path>
                                                        </svg> <span class="tw-leading-[16px]">{{$distance}} KM</span></div>
                                                </div>
                                            </div>
                                            <div class="tw-flex tw-items-end tw-pl-1 tw-flex-row"><a
                                                    href="/settings/"
                                                    class="Button_base__5Wcwx Button_sm__RWLp1 Button_smWithIcon__y3vYd Button_minWidth__WGVzH Button_textWhite__9w5Wn Button_bgDarkBlue__9V6YV !tw-no-underline tw-drop-shadow-[unset] !tw-px-2 !tw-min-h-[unset] tw-text-sm !tw-text-white"
                                                    data-cy="dashboard-filters-edit"
                                                    data-cham="dashboard-filters-edit"><span
                                                        class="tw-flex tw-justify-center"><span
                                                            class="button-main tw-flex tw-items-center tw-flex-row-reverse"><span
                                                                class="icon tw-text-current tw-inline-flex"><svg
                                                                    width="16" height="18" viewBox="0 0 16 18"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    class="!tw-text-white">
                                                                    <path fill-rule="evenodd" clip-rule="evenodd"
                                                                        d="M0.5 14.0005H15.5V17.3334H0.5V14.0005ZM10.7699 5.47194L8.1963 2.89865L1.33333 9.76075V12.334H3.90694L10.7699 5.47194ZM12.8013 3.44075C13.069 3.17313 13.069 2.74082 12.8013 2.4732L11.1954 0.867465C10.9278 0.599843 10.4954 0.599843 10.2277 0.867465L8.88259 2.21244L11.4562 4.78573L12.8013 3.44075Z"
                                                                        fill="currentColor"></path>
                                                                </svg></span><span
                                                                class="tw-icon-spacer tw-block tw-w-[8px]"></span><span
                                                                class="child-container Button_childContainer__YG7FP"><span
                                                                    class="!tw-text-sm">Edit</span></span></span></span></a>
                                            </div>
                                        </div>
                                        <div class="tw-py-2 tw-px-4 tw-bg-gray-300 tw-flex tw-justify-between">
                                            <div
                                                class="tw-flex tw-items-center tw-text-sm tw-font-gordita-regular tw-justify-between tw-w-full tw-pr-3">
                                                <span class="tw-text-gray-600">Showing all <span class="matching_leads1">0</span> leads</span>
                                            </div>
                                            <div class="tw-pl-3 tw-border-l tw-border-gray-400"><button id="sortdistance"
                                                    class="Button_base__5Wcwx Button_lg__UQt1r Button_minWidth__WGVzH Button_noOutline__CXC05 Button_textBlue__z9-S- Button_bgTransparent__cMajf !tw-p-0 !tw-min-h-[unset]"
                                                    data-cy="dashboard-filters-open"><span
                                                        class="tw-flex tw-justify-center"><span
                                                            class="button-main tw-flex tw-items-center "><span
                                                                class="icon tw-text-current tw-inline-flex">
                                                                
                                                                <svg
                                                                    class="MuiSvgIcon-root" focusable="false"
                                                                    viewBox="0 0 24 24" aria-hidden="true">
                                                                    <path
                                                                        d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z">
                                                                    </path>
                                                                </svg></span><span
                                                                class="tw-icon-spacer tw-block tw-w-[8px]"></span><span
                                                                class="child-container Button_childContainer__YG7FP">Filter</span></span></span></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div id="__rctLeadsQuickFilters">
                                    <div
                                        class="tw-py-2 tw-px-4 tw-bg-gray-400 tw-flex tw-justify-start tw-flex-wrap tw-gap-2">
                                        <span class="tw-inline-flex tw-items-end tw-relative dd"><button
                                                class="tw-relative tw-rounded tw-text-xs tw-py-1 tw-px-2 disabled:tw-bg-gray-300 disabled:tw-text-gray-600 tw-inline-flex tw-gap-1.5 tw-bg-white be_first">Be
                                                first to respond <span id="be_first" class="uk-badge">0</span></button></span><span
                                            class="tw-inline-flex tw-items-end tw-relative dd"><button
                                                class="tw-relative tw-rounded tw-text-xs tw-py-1 tw-px-2 disabled:tw-bg-gray-300 disabled:tw-text-gray-600 tw-inline-flex tw-gap-1.5 tw-bg-white my_urgent">Urgent
                                                requests <span id="my_urgent" class="uk-badge">0</span></button></span>
                                    </div>
                                </div>
                            </div>
                            
                            <div id="sticky-project"></div>
                            <div class="no-results mobile-no-results d-md-none" style="display: none;"></div>
                            <div id="js-record-template" style="display:none;">
                                <div class="dashboard-projects-item p-4 pl-xl-5 text-xs" data-project-id=""
                                    data-unread="">
                                    <div class="js-with-new-ui">
                                        <div class="text-grey-600">
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div id="__rctLeadsList">
                                <div class="infinite-scroll-component__outerdiv">
                                    <div class="infinite-scroll-component " style="height: 600px; overflow-y: auto;">
                                        
                                           
                                        <div class="tw-bg-gray-200 tw-overflow-y tw-h-full tw-gap-3 tw-flex tw-flex-col tw-py-3"
                                            data-cy="leads-list" id="myleads">
                                         </div>
                                         
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
                                    <div id="end-message" class="end-message">
        No more leads to display.
    </div>
    <div id="noleads" class="end-message">
        No leads to display.
    </div>
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


                        <div class="col-12 col-md-7 col-lg right-panel fixed-height-column overflow-auto scroll-touch h-100 d-block js-dashboard-right-container lead-details" style="max-height: 870px;"><br>

<div class="right-panel-wrapper ml-lg-4">
    <div class="project-details-project-container">
        <div class="w-100 project-details-grid-container">
            <div class="tw-w-full tw-flex tw-justify-center tw-items-center tw-py-4 loader" style="display:none">
                <div role="status" class="tw-flex" data-cy="loading-spinner" style="width: 22px; height: 22px;">
                    <svg class="LoadingSpinner_root__iaeTy tw-text-blue-500 undefined" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <title>Loading</title>
                        <circle class="LoadingSpinner_svgcircle__EIpp0" cx="12" cy="12" r="10"></circle>
                        <path class="LoadingSpinner_svgpath__5oUPF tw-opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span style="border: 0px; clip: rect(0px, 0px, 0px, 0px); height: 1px; margin: -1px; overflow: hidden; padding: 0px; position: absolute; width: 1px; white-space: nowrap; overflow-wrap: normal;">Loading...</span>
                </div>
            </div>
            <div class="d-flex flex-column project-details-col-project-top" id="show_details">
                <div class="d-flex flex-column project-details-col-project-top">
                    <div class="loading-project-interaction justify-content-center pt-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="sr-only">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

</div>
<div></div>
<div></div>
<div id="modal-center" class="uk-flex-top" uk-modal style="margin-top: 5px !important;
    margin-bottom: auto !important;">
    <div class="uk-modal-dialog uk-modal-body uk-margin-auto-vertical">

        <button class="uk-modal-close-default" type="button" uk-close></button>
        <div class="uk-modal-header">
            <h2 class="uk-modal-title">Top Up required</h2>
        </div>
        <div class="uk-modal-body" id="subscription_info">

        </div>

    </div>
</div>

<x-coin-svg size="30px" />

</x-app-layout>

<script src="{{asset('build/assets/js/leads.js')}}"></script>
