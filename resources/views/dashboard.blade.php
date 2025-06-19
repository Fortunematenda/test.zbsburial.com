<x-app-layout>

<link rel="stylesheet" href="{{asset('build/assets/css/kaiadmin.min.css')}}">
    <!-- Fonts and icons -->
   <script>
      WebFont.load({
        google: { families: ["Public Sans:300,400,500,600,700"] },
        custom: {
          families: [
            "Font Awesome 5 Solid",
            "Font Awesome 5 Regular",
            "Font Awesome 5 Brands",
            "simple-line-icons",
          ],
          urls: ["assets/css/fonts.min.css"],
        },
        active: function () {
          sessionStorage.fonts = true;
        },
      });
    </script>

    <!-- CSS Files -->

  
    

    <!-- CSS Just for demo purpose, don't include it in your project -->

  <style type="text/css">/* Chart.js */
@-webkit-keyframes chartjs-render-animation{from{opacity:0.99}to{opacity:1}}
@keyframes chartjs-render-animation{from{opacity:0.99}to{opacity:1}}
.chartjs-render-monitor{-webkit-animation:chartjs-render-animation 0.001s;animation:chartjs-render-animation 0.001s;}
</style><style type="text/css">.jqstooltip { position: absolute;left: 0px;
    top: 0px;visibility: hidden;background: rgb(0, 0, 0) transparent;
    background-color: rgba(0,0,0,0.6);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=#99000000, endColorstr=#99000000);
    -ms-filter: "progid:DXImageTransform.Microsoft.gradient(startColorstr=#99000000, endColorstr=#99000000)";
    color: white;font: 10px arial, san serif;text-align: left;white-space: nowrap;
    padding: 5px;border: 1px solid white;z-index: 10000;}.jqsfield { color: white;font: 10px arial, san serif;text-align: left;}</style><style>
        @font-face {
            font-family: 'NotoSans_online_security'; 
            src: url(chrome-extension://llbcnfanfmjhpedaedhbcnpgeepdnnok/assets/fonts/noto-sans-regular.woff);
        }

        @font-face {
            font-family: 'NotoSans_medium_online_security'; 
            src: url(chrome-extension://llbcnfanfmjhpedaedhbcnpgeepdnnok/assets/fonts/noto-sans-medium.ttf);
        }

        @font-face {
            font-family: 'NotoSans_bold_online_security'; 
            src: url(chrome-extension://llbcnfanfmjhpedaedhbcnpgeepdnnok/assets/fonts/noto-sans-bold.woff);
        }

        @font-face {
            font-family: 'NotoSans_semibold_online_security'; 
            src: url(chrome-extension://llbcnfanfmjhpedaedhbcnpgeepdnnok/assets/fonts/noto-sans-semibold.ttf);
        }
        .nav-link{
font-size: 15px !important;
        }
    .icon-wrapper {
      width: 20px;
      height: 20px;
      display: inline-block;
    }
    label {
            font-weight: bold;
            display: block;
            margin-top: 20px;
            text-align: center;
            margin-bottom: 20px;
        }

        .container1 {
            width: 100%;
            max-width: 400px;
            margin: auto;
            text-align: center;
            border: 1px solid #ccc;
            border-radius: 5px;
            padding: 20px;
            background-color: #f9f9f9;
        }

        .drop-area {
            border: 2px dashed purple;
            border-radius: 5px;
            padding: 20px;
            cursor: pointer;
            text-align: center;
            margin-top: 10px;
            background-color: #f9f9f9;
        }

        .drop-area:hover {
            background-color: #f0f0f0;
        }

        input[type="file"] {
            display: none;
        }

        button {
            width: 100%;
            padding: 2px;
            margin-top: 2px;
            border: none;
            border-radius: 5px;
           
            color: purple;
            cursor: pointer !important;
        }

        button:hover {
            background-color: purple;
        }

        hr {
            width: 100%;
            margin-top: 20px;
            border: 0;
            height: 1px;
            background: #ccc;
        }

  </style>
  
</head>
  <body>
   
        <div class="container">
          <div class="page-inner">
          
          <div class="d-flex align-items-left align-items-md-center flex-column flex-md-row pt-2 pb-4">
              <div>
                <h3 class="fw-bold mb-3">{{$greetings}}, {{$first_name}}!</h3>
                <h6 class="op-7 mb-2">{{$login_at}}</h6>
              </div>
              <div class="ms-md-auto py-2 py-md-0 col-sm-6">
                <a href="#" class="btn btn-primary btn-round"><b>Balance:{{$credits_balance}} Credits</b></a>
              </div>
            </div>
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
            @if(empty(auth()->user()->id_upload) || empty(auth()->user()->self_upload))
            <form action="{{ route('verifyfica') }}" method="POST" enctype="multipart/form-data">
              @csrf
              <div class="container1">
        <h2>Verify Your FICA</h2>
        <div class="alert alert-danger mt-3" role="alert" style="text-align: center; font-size: 14px; color: red; margin-bottom: 20px;">
        <b>Disclaimer:</b> In order for you to view leads, you need to submit the necessary documents for verification.
</div>
        
        <form id="ficaForm">
            
            <label for="idUpload">Upload ID/Passport</label>
            <div class="drop-area" id="dropID">
                Drag & Drop Files Here or Click to Upload
                <input type="file" id="idUpload" name="idUpload" accept="image/*,application/pdf" required>
            </div>

            <hr>

            <label for="selfieUpload">Upload Selfie Holding ID/Passport</label>
            <div class="drop-area" id="dropSelfie">
                Drag & Drop Files Here or Click to Upload
                <input type="file" id="selfieUpload" name="selfieUpload" accept="image/*" required>
            </div>

            <button class="btn btn-primary btn-round" type="submit">Submit</button>
        </form>
    </div>
              </form>
    <script>
        function setupDragAndDrop(dropAreaId, fileInputId) {
            const dropArea = document.getElementById(dropAreaId);
            const fileInput = document.getElementById(fileInputId);

            dropArea.addEventListener("click", () => fileInput.click());

            dropArea.addEventListener("dragover", (event) => {
                event.preventDefault();
                dropArea.style.backgroundColor = "#f0f0f0";
            });

            dropArea.addEventListener("dragleave", () => {
                dropArea.style.backgroundColor = "#f9f9f9";
            });

            dropArea.addEventListener("drop", (event) => {
                event.preventDefault();
                dropArea.style.backgroundColor = "#f9f9f9";

                if (event.dataTransfer.files.length > 0) {
                    fileInput.files = event.dataTransfer.files;
                    dropArea.innerText = event.dataTransfer.files[0].name;
                }
            });
        }

        setupDragAndDrop("dropID", "idUpload");
        setupDragAndDrop("dropSelfie", "selfieUpload");

    </script>
          @elseif(!empty(auth()->user()->id_upload) && empty(auth()->user()->date_verified))    
          <div class="alert alert-danger mt-3" role="alert" style="text-align: center; font-size: 14px; color: red; margin-bottom: 20px;">
       Waiting for verification
</div>
          @else
            <div class="row flex-row h-auto">
              <div class="col-sm-6 col-md-3">
              <a href="/seller/dashboard/" class="pr-4 text-grey-200 hover-dark noline text-sm text-capitalize">
                <div class="card card-stats card-round">
                  <div class="card-body">
                    <div class="row align-items-center">
                      <div class="col-icon">
                        <div class="icon-big text-center icon-primary bubble-shadow-small">
                        <i class="fas fa-luggage-cart"></i>
                        </div>
                      </div>
                      <div class="col col-stats ms-3 ms-sm-0">
                        <div class="numbers">
                          <p class="card-category">Leads</p>
                          <h4 class="card-title">  {{$number_of_leads}}</h4>
                        View
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </a>
              </div>

              <div class="col-sm-6 col-md-3">
              <a href="/seller/dashboard/" class="pr-4 text-grey-200 hover-dark noline text-sm text-capitalize">
                <div class="card card-stats card-round">
                  <div class="card-body">
                    <div class="row align-items-center">
                      <div class="col-icon">
                        <div class="icon-big text-center icon-success bubble-shadow-small">
                          <i class="bi bi-envelope-check-fill"></i>
                        </div>
                      </div>
                      
                      <div class="col col-stats ms-3 ms-sm-0">
                        <div class="numbers">
                          <p class="card-category">Unread Leads</p>
                          <h4 class="card-title">{{$unread_leads}}</h4>
                          View
                        </div>
                      </div>
                    </div>
                  </div>
                </div></a>
              </div> 

              <div class="col-sm-6 col-md-3">
              <a href="/responses/" class="pr-4 text-grey-200 hover-dark noline text-sm text-capitalize">
                <div class="card card-stats card-round">
                  <div class="card-body">
                    <div class="row align-items-center">
                      <div class="col-icon">
                        <div class="icon-big text-center icon-info bubble-shadow-small">
                          <i class="far fa-check-circle"></i>
                          
                        </div>
                      </div>
                      <div class="col col-stats ms-3 ms-sm-0">
                        <div class="numbers">
                          <p class="card-category">Responses</p>
                          <h4 class="card-title">  {{$contacted_lead}}</h4>
                          View
                        </div>
                      </div>
                    </div>
                  </div>
                </div></a>
              </div>
              
              
              <div class="col-sm-6 col-md-3">
              <a href="/responses/" class="pr-4 text-grey-200 hover-dark noline text-sm text-capitalize">
                <div class="card card-stats card-round">
                  <div class="card-body">
                    <div class="row align-items-center">
                      <div class="col-icon">
                        <div class="icon-big text-center icon-success bubble-shadow-small">
                        <i class="bi bi-hand-thumbs-up"></i>
                        </div>
                      </div>
                      
                      <div class="col col-stats ms-3 ms-sm-0">
                        <div class="numbers">
                          <p class="card-category">Responses Hired</p>
                          <h4 class="card-title">{{$contacted_hired}}</h4>
                          View
                        </div>
                      </div>
                    </div>
                  </div>
                </div></a>
              </div>
          


            </div>
            <div class="row flex-row h-auto">
              <div class="col-md-4">
                <div class="card card-primary card-round col sellerdash-col h-auto d-flex flex-column justify-content-between ">
                  <div class="card-header">
                    <div class="card-head-row">
                      <div class="card-title fw-bold float-end text-primary">
                      <div class="d-flex justify-content-between align-items-center flex-wrap">
          
            <div class=" mb-0  text-primary"><a <a href="/settings/">Profile Review</a></div>
        </div>
                    
                      </div>
                    </div>
                    <hr>
                    <div class="card-category">Enhancing your profile is an excellent way to attract more customers.</div>
                  </div>
                
                  <div class="card-body pb-0">
                    <div class="mb-4 mt-2">
                      <h2>{{$perc}}%</h2>
                      <div class="progress" style="height:8px">
                      <div class="progress-bar" role="progressbar" style="width: {{ $perc }}%;" aria-valuenow="{{ $perc }}" aria-valuemin="0" aria-valuemax="100"></div>

            </div>
                    </div>
                    <div class="pull-in"><div class="chartjs-size-monitor" style="position: absolute; inset: 0px; overflow: hidden; pointer-events: none; visibility: hidden; z-index: -1;"><div class="chartjs-size-monitor-expand" style="position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;pointer-events:none;visibility:hidden;z-index:-1;"><div style="position:absolute;width:1000000px;height:1000000px;left:0;top:0"></div></div><div class="chartjs-size-monitor-shrink" style="position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;pointer-events:none;visibility:hidden;z-index:-1;"><div style="position:absolute;width:200%;height:200%;left:0; top:0"></div></div></div>
                      
                    </div>
                  </div>
                </div>


                <div class="card card-primary card-round col sellerdash-col h-auto d-flex flex-column justify-content-between ">
                  <div class="card-header">
                    <div class="card-head-row">
                    <div class="card-title fw-bold float-end text-primary">
                      <div class="d-flex justify-content-between align-items-center flex-wrap">
            <div class=" mb-0  text-primary"><a <a href="/settings/">Ongoing Tasks</a></div>
           
        </div>
                   
                      </div>
                    </div>
                    <hr>
                    @if($latestresponse)
                    <div class="card-category">Current Tasks in Progress: <b>{{$latestresponse["service_name"]}}</b> </div>
                    <div class="card-category">Task Location: <b>{{$latestresponse["location"]}}</b></div>
                    <div class="card-category">Task Description:<b> {{$latestresponse["description"]}}</b></div>
                    <div class="card-category">Date:<b> {{$latestresponse["date_entered"]}}</b></div>
                    @else
                    <div class="card-category"><b> None</b></div>
                    @endif
                  </div>
                  <hr>
                  
                </div>

               


             
                </div>
                
                <div class="col-md-4">
                <div class="card card-primary card-round col sellerdash-col h-auto d-flex flex-column justify-content-between ">
                  <div class="card-header">
                    <div class="card-head-row">
                    <div class="card-title fw-bold float-end text-primary">
                      <div class="d-flex justify-content-between align-items-center flex-wrap">
            <div class=" mb-0  text-primary"><a <a href="/settings/">Leads Settings</a></div>
           
        </div>
                  
                 
                      </div>
                    </div>
                    <hr>
                    <div class="card-category h1  float-end">List my services</div>
                  </div>
                  <div class="card-body pb-0">
                    <div class="mb-4 mt-2">
                    <div class="flex-wrap category-list  ">
                                        @foreach($latest_services_limited as $service)
                                        <div class="badge   text-xs    "><p class="border border-grey-100 text-grey-800 font-weight-normal my-auto mr-2 p-2 badge-pill  text-truncate">{{$service}} </p></div>
                                        @endforeach

                                        @if($service_badge>0)
                                         
                                        <div class="badge badge-pill border border-grey-100 text-grey-800 font-weight-normal text-xs p-2 mr-2 my-auto text-truncate mw-100">
                                               +{{$service_badge}}
                                            </div>
                                            @endif
                                        </div>
                                    </div>
                  
                    <div class="pull-in"><div class="chartjs-size-monitor" style="position: absolute; inset: 0px; overflow: hidden; pointer-events: none; visibility: hidden; z-index: -1;"><div class="chartjs-size-monitor-expand" style="position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;pointer-events:none;visibility:hidden;z-index:-1;"><div style="position:absolute;width:1000000px;height:1000000px;left:0;top:0"></div></div><div class="chartjs-size-monitor-shrink" style="position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;pointer-events:none;visibility:hidden;z-index:-1;"><div style="position:absolute;width:200%;height:200%;left:0; top:0"></div></div></div>
                     
                    </div>
                  </div>
                </div>
                <div class="card card-round">
                  <div class="card-body pb-0">
                    <div class="card-title fw-bold float-end text-primary">Location
                    <a href="/settings" class="text-grey-200 noline hover-dark ">
                                   
                                    </a>
                    </div>
                    <hr>
                    <p class="mb-2">You're attracting customers within</p>
                 
                    <div class="flex-wrap category-list  ">
                                      
                                        <div class="card-title ">
                                        <i class="icon-big text-center icon-info bubble-shadow-small bi bi-geo-alt-fill"></i>
                                          <p>{{$location}} </p></div>
                                       
                                        <div class="badge badge-pill border border-grey-100 text-grey-800 font-weight-normal text-xs p-2 mr-2 my-auto text-truncate mw-100">
                                              
                                            </div>
                                           
                                        </div>
                                    </div>
                                </div>

                                <div class="card card-round">
                <div class="card-body pb-0">
                    <div class="card-title fw-bold float-end text-primary">Account Settings
                    <a href="/settings" class="text-grey-200 noline hover-dark ">
                                      
                                    </a>
                    </div>
                    <hr>
                    <p class="mb-2">Standard</p>
                 
                    <div class="flex-wrap category-list  ">
                                      
                                        <div class="card-title ">
                                        <i class="icon-big text-center icon-info bubble-shadow-small bi bi-person"></i>
                                         </div>
                                        
                          <div class="flex-wrap category-list  ">
                                     
                                     <div class="badge badge-pill border border-grey-100 text-grey-800 font-weight-normal text-xs p-2 mr-2 my-auto text-truncate mw-100">
                                           
                                         </div>
                                      
                                     </div>
                                 </div>
                             </div>
             </div>

                </div>
                
                <div class="col-md-4">
                <div class="card card-primary card-round col sellerdash-col h-auto d-flex flex-column justify-content-between ">
                  <div class="card-header">
                    <div class="card-head-row">
                    <div class="card-title fw-bold float-end text-primary">
                      <div class="d-flex justify-content-between align-items-center flex-wrap">
            <div class=" mb-0  text-primary"><a <a href="/settings/">Leads Trend</a></div>
           
        </div>
                   
                      </div>
                    </div>
                    <hr>
                   
                  <div class="card-body pb-0">
                    
                      <div class="chart-container" style="min-height: 375px"><div class="chartjs-size-monitor" style="position: absolute; inset: 0px; overflow: hidden; pointer-events: none; visibility: hidden; z-index: -1;"><div class="chartjs-size-monitor-expand" style="position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;pointer-events:none;visibility:hidden;z-index:-1;"><div style="position:absolute;width:1000000px;height:1000000px;left:0;top:0"></div></div><div class="chartjs-size-monitor-shrink" style="position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;pointer-events:none;visibility:hidden;z-index:-1;"><div style="position:absolute;width:200%;height:200%;left:0; top:0"></div></div></div>
                      <canvas id="statisticsChart" style="display: block; width: 648px; height: 375px;" width="648" height="375" class="chartjs-render-monitor"></canvas>
                    </div>
                    </div>
                    <div class="pull-in"><div class="chartjs-size-monitor" style="position: absolute; inset: 0px; overflow: hidden; pointer-events: none; visibility: hidden; z-index: -1;"><div class="chartjs-size-monitor-expand" style="position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;pointer-events:none;visibility:hidden;z-index:-1;"><div style="position:absolute;width:1000000px;height:1000000px;left:0;top:0"></div></div><div class="chartjs-size-monitor-shrink" style="position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;pointer-events:none;visibility:hidden;z-index:-1;"><div style="position:absolute;width:200%;height:200%;left:0; top:0"></div></div></div>
                  
                    </div>
                  </div>
                </div>
               
                

                  <div class="card card-round">
                  <div class="card-body pb-0">
                    <div class="card-title fw-bold float-end text-primary">
                    
                                    Help
                                   
                                    <hr>
                    </div>
                    <div class="text-dark-blue text-xs ml-2">
                                            <p class="text-left mb-3">
                                            Explore our <a class="text-nowrap text-dark-blue hover-light" href="/help"><u>Help Centre</u></a> for guidance and expert tips.
                                            </p>
                                            <p class="text-left mb-2">
                                                Email: <a class="text-dark-blue text-nowrap noline" href="mailto:support@fortai.com">fortai.com</a>
                                            </p>
                                            <p class="text-dark-blue mb-0">
                                                Call <a class="text-nowrap text-dark-blue" href="tel:+27612685933">86 331 2093</a>
                                            </p>
                                            <p class=" text-grey-400   mb-2">
                                                open Monday-Friday, 8:30am-5:30pm
                                            </p>
                                        </div>
                    <div class="flex-wrap category-list  ">
                                     
                                        <div class="badge badge-pill border border-grey-100 text-grey-800 font-weight-normal text-xs p-2 mr-2 my-auto text-truncate mw-100">
                                              
                                            </div>
                                         
                                        </div>
                                    </div>
                                </div>
                </div>
                </div>
                @endif
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-12">
                
          </div>
        </div>

        <footer class="footer">
          <div class="container-fluid d-flex justify-content-between">
            <nav class="pull-left">
              <ul class="nav">
                <li class="nav-item">
                  <a class="nav-link" href="/dashboard">
                   Fortai
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="/help"> Help </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="/help"> Licenses </a>
                </li>
              </ul>
            </nav>
            <div class="copyright">
              2024, made with <i class="fa fa-heart heart text-danger"></i> by
              <a href="/dashboard">Fortai</a>
            </div>
            <div>
              Distributed by
              <a target="_blank" href="/dashboard">Fortai</a>.
            </div>
          </div>
        </footer>
      </div>

      
    </div>
    <!--   Core JS Files   -->
   
    <script src="{{asset('build/assets/js/jquery-3.7.1.min.js.download')}}"></script>
    <script src="{{asset('build/assets/js/popper.min.js.download')}}"></script>
    <script src="{{asset('build/assets/js/bootstrap.min.js.download')}}"></script>
    <script src="{{asset('build/assets/js/jquery.scrollbar.min.js.download')}}"></script>
    <script src="{{asset('build/assets/js/chart.min.js.download')}}"></script>
    <script src="{{asset('build/assets/js/jquery.sparkline.min.js.download')}}"></script>
    <script src="{{asset('build/assets/js/circles.min.js.download')}}"></script>
    <script src="{{asset('build/assets/js/datatables.min.js.download')}}"></script>
    <script src="{{asset('build/assets/js/bootstrap-notify.min.js.download')}}"></script>
    <script src="{{asset('build/assets/js/jsvectormap.min.js.download')}}"></script>
    <script src="{{asset('build/assets/js/world.js.download')}}"></script>
    <script src="{{asset('build/assets/js/sweetalert.min.js.download')}}"></script>
    <script src="{{asset('build/assets/js/kaiadmin.min.js.download')}}"></script>
    <script src="{{asset('build/assets/js/setting-demo.js.download')}}"></script>
    <script src="{{asset('build/assets/js/demo.js.download')}}"></script>
    <script src="{{asset('build/assets/js/core/webfont.min.js')}}"></script>
    
   
    <script>
      $("#lineChart").sparkline([102, 109, 120, 99, 110, 105, 115], {
        type: "line",
        height: "70",
        width: "100%",
        lineWidth: "2",
        lineColor: "#177dff",
        fillColor: "rgba(23, 125, 255, 0.14)",
      });

      $("#lineChart2").sparkline([99, 125, 122, 105, 110, 124, 115], {
        type: "line",
        height: "70",
        width: "100%",
        lineWidth: "2",
        lineColor: "#f3545d",
        fillColor: "rgba(243, 84, 93, .14)",
      });

      $("#lineChart3").sparkline([105, 103, 123, 100, 95, 105, 115], {
        type: "line",
        height: "70",
        width: "100%",
        lineWidth: "2",
        lineColor: "#ffa534",
        fillColor: "rgba(255, 165, 52, .14)",
      });
    </script>
  

<div class="jvm-tooltip"></div>
<div style="left: -1000px; overflow: scroll; position: absolute; top: -1000px; border: none; box-sizing: content-box; height: 200px; margin: 0px; padding: 0px; width: 200px;">
    <div style="border: none; box-sizing: content-box; height: 200px; margin: 0px; padding: 0px; width: 200px;"></div></div></body></html>

    </x-app-layout>

    <script>

    $(document).ready(function() {
      console.log("Mboro diki")
        $.ajax({
            url: '/getleadstrend',
            type: 'GET',
            data: {  }, 
            success: function(data) {
              console.log(data);
                const json = data["leads"];
                let labels =[];
                let datam =[];
                for(key in json)
                {
                  labels.push(json[key]["labels"]);
                  datam.push(json[key]["data"]);
                }
              
                createDash(labels, datam);    
            }, 
            error: function(xhr, status, error) {
                console.log('Error here :'+error); // Improved error logging
            },
            complete: function() {
                 console.log("done");
                 
            }
        });
    
});

function createDash(labels, data)
{
  var ctx = document.getElementById('statisticsChart').getContext('2d');

var statisticsChart = new Chart(ctx, {
	type: 'line',
	data: {
		labels: labels,
		datasets: [{
			label: "Active Users",
			borderColor: 'purple',
			pointBackgroundColor: 'rgba(241, 244, 247, 0.6)',
			pointRadius: 0,
			backgroundColor: 'rgba(240, 226, 226, 0.4)',
			legendColor: '#177dff',
			fill: true,
			borderWidth: 2,
			data: data
		}]
	},
	options : {
		responsive: true, 
		maintainAspectRatio: false,
		legend: {
			display: false
		},
		tooltips: {
			bodySpacing: 4,
			mode:"nearest",
			intersect: 0,
			position:"nearest",
			xPadding:10,
			yPadding:10,
			caretPadding:10
		},
		layout:{
			padding:{left:5,right:5,top:15,bottom:15}
		},
		scales: {
			yAxes: [{
				ticks: {
					fontStyle: "500",
					beginAtZero: true,
					maxTicksLimit: 5,
					padding: 10
				},
				gridLines: {
					drawTicks: false,
					display: false
				}
			}],
			xAxes: [{
				gridLines: {
					zeroLineColor: "transparent"
				},
				ticks: {
					padding: 10,
					fontStyle: "500"
				}
			}]
		}, 
		legendCallback: function(chart) { 
			var text = []; 
			text.push('<ul class="' + chart.id + '-legend html-legend">'); 
			for (var i = 0; i < chart.data.datasets.length; i++) { 
				text.push('<li><span style="background-color:' + chart.data.datasets[i].legendColor + '"></span>'); 
				if (chart.data.datasets[i].label) { 
					text.push(chart.data.datasets[i].label); 
				} 
				text.push('</li>'); 
			} 
			text.push('</ul>'); 
			return text.join(''); 
		}  
	}
});

}


    
    </script>
     <script type="module" src="{{asset('build/assets/js/pushn.js')}}"></script>
    