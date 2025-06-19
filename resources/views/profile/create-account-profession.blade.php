<x-app-layout>
<link rel="stylesheet" href="{{asset('build/assets/css/create.css')}}">
<link rel="stylesheet" href="{{asset('build/assets/css/font-awesome.css')}}">
<style>
@media screen and (max-width: 768px) {
li strong{
        display:none;
    }
}
</style>
 <!-- Two-Column Section with Get Started and Image -->
 <div class="container-fluid">
    <div class="row justify-content-center">
        <div class="col-sm-10 col-md-10 col-lg-8 col-xl-5 text-center mt-3 mb-2">
            <div class="card px-2 pt-4 pb-0 mt-3 mb-3">
                <h2 id="heading">Sign Up for Your Professional Account</h2>
                <p>Fill all form field to go to next step</p>
                <form id="msform">
                    @csrf
                    <!-- progressbar -->
                    <ul id="progressbar">
                        <li class="active" id="account"><strong>Location</strong></li>
                        <li id="personal"><strong>Personal</strong></li>
                        <li id="lock"><strong>Password</strong></li>
                        <li id="confirm"><strong>Finish</strong></li>
                    </ul>
                    <div class="progress">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuemin="0" aria-valuemax="100"></div>
                    </div> <br> <!-- fieldsets -->
                    <fieldset>
                        <div class="form-card">
                            <div class="row">
                                <div class="col-12">
                                    <h2 class="fs-title">Which location do you want to receive leads from?</h2>
                                </div>
                             
                            </div> 
                         
                            

                            <div class="row myrow">
                               
                                <div class="col-md-6">                                 
                                <input name="searchLocation" id="searchLocation" aria-label="autocomplete" type="text" class="Select_buttonClasses__rxXNq select-button" role="combobox" placeholder="Enter your location" data-cy="seller-signup-form-location" id="location">
                                <input id="latitude" hidden ></input>
                                <input id="longitude" hidden ></input>
                                
                                </div>
                                <div class="col-md-6">
                                    <select class="Select_buttonClasses__rxXNq select-button" id="distance">
                                        <option value="50">50 Kilometers</option>
                                        <option value="20">20 Kilometers</option>
                                        <option value="10">10 Kilometers</option>
                                    </select>                              
                                </div>
                            </div>  
                        
                            <br>
                        </div> <input type="button" name="next" id="next1" class="next action-button" value="Next" />
                        <br>
                            <label class="binfo"> You can change your location at any time</label>
                    </fieldset>
                    <fieldset>
                        <div class="form-card">
                            <div class="row">
                                <!--<div class="col-12">
                                
                                    <p class="sub-text">You're just a few steps away from viewing our <span id="mservice"></span></p><br>
                                </div>-->
                             
                            </div> 
                            
                            <label class="fieldlabels">First Name: *</label> <input type="text" name="first_name" id="first_name" placeholder="First Name" /> 
                            <label class="fieldlabels">Last Name: *</label> <input type="text" name="last_name" id="last_name" placeholder="Last Name" /> 
                            <label class="fieldlabels">Company name (optional) </label> <input type="text" name="company_name" id="company_name" placeholder="Company name" />
                          
                            <label class="fieldlabels">Contact No.: *</label> <input type="text" name="contact_number" id="contact_number" placeholder="Contact No." /> 
                            <label class="fieldlabels">Email address: *</label> <input type="text" name="email" id="email" placeholder="Enter your email address" />
                         
                            <div class="radio-group">
    <div class="radio-label">Does your company have a website?</div>
    <div class="options-container">
      <input type="radio" id="yes" name="website" value="1">
      <label for="yes">Yes</label>
      <input type="radio" id="no" name="website" value="0">
      <label for="no">No</label>
    </div>

    <!-- Second Group: Company size, employees -->
    <div class="radio-label">Company size, employees</div>
    <div class="options-container">
      <input type="radio" id="self-employed" name="company_size" value="Self-employed">
      <label for="self-employed">Self-employed</label>
      <input type="radio" id="2-10" name="company_size" value="2-10">
      <label for="2-10">2-10</label>
      <input type="radio" id="11-50" name="company_size" value="11-50">
      <label for="11-50">11-50</label>
      <input type="radio" id="51-200" name="company_size" value="51-200">
      <label for="51-200">51-200</label>
      <input type="radio" id="200-plus" name="company_size" value="200+">
      <label for="200-plus">200+</label>
    </div>
  </div><br>  

  <div class="radio-label">Does your company have a sales team?</div>
  <div class="options-container">
      <input type="radio" id="Yes" name="sales_team" value="1">
      <label for="Yes">Yes</label>     
      <input type="radio" id="No" name="sales_team" value="0">
      <label for="No">No</label>
</div><br> 

<div class="radio-label">Does your company use social media?</div>
<div class="options-container">
      <input type="radio" id="social_mediaYes" name="social_media" value="1">
      <label for="social_mediaYes">Yes</label>  
      <input type="radio" id="social_mediaNo" name="social_media" value="0">
      <label for="social_mediaNo">No</label>
</div> 

  </div> 
  <input type="button" name="next" id="next2" class="next action-button" value="Next" /> <input type="button" name="previous" class="previous action-button-previous" value="Back" />
                        
                        
                    </fieldset>
                    <fieldset>
                        <div class="form-card">
                           
                            <label class="fieldlabels" style="border-color:#ffffff !important;">Create Password: *</label> <input type="password" name="password" id="password" placeholder="Enter your password" />
                            <label class="fieldlabels">Confirm Password: *</label> <input type="password" name="confirm_password" id="confirm_password" placeholder="confirm password" />
                           
                            <hr class="mrgin">
                          
                        </div> 
                        <input type="button" name="next" id="submit_create_profile" class="next action-button" value="Submit" /> 
                        <input type="button" name="previous" class="previous action-button-previous" value="Previous" />
<p align="center" id="loader" style="display:none"><img  height="50" width="50" src="{{asset('build/assets/img/loader.svg')}}"></p>
<p align="center" id="info" style="display:none"></p>
                    </fieldset>
                    <fieldset>
                        <div class="form-card">
                            <br><br>
                            <h2 class="purple-text text-center"><strong>DETAILS UPLOADED SUCCESSFULLY !</strong></h2> <br>
                            <div class="row justify-content-center">
                                <div class="col-3">  <img src="{{asset('build/assets/img/purpletick.png')}}" class="fit-image"> </div>
                            </div> <br><br>
                            <div class="row justify-content-center">
                                <div class="col-7 text-center">
                                    <h5 class="purple-text text-center">Thank you for signing up. Your submission is under review. You'll receive a confirmation email once it's approved.</h5>
                                </div>
                              
                            </div>
                            <br><br>
                            <div class="row justify-content-center">
                                <div class="text-center">
                                <a href="/seller/dashboard"> <button type="button" class="action-button">View Leads</button></a>
                                </div>
                              
                            </div>
                        </div>
                    </fieldset>
                </form>
            </div>
        </div>
    </div>
</div>

</x-app-layout>
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA_Qd54wgjWo4t-Klmi3m_pz8HbHz0GQto&libraries=places&callback=initializeAutocomplete" type="text/javascript"></script>
