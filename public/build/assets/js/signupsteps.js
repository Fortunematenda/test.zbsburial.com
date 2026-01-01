let serviceName="";
let service_id="";
function toast(icon,txt,time)
{
    yoyoToast.fire({
        type: icon,
        title: 'Status',
        message: txt,
        timeout: time,
        position: 'top-right',
        timeoutFunction: ()=> {},   
    });
}



$(document).ready(function(){

    var current_fs, next_fs, previous_fs; //fieldsets
    var opacity;
    var current = 1;
    var steps = $("fieldset").length;
    let execute = false;

    var url = window.location.href;
    var urlObj = new URL(url);
   serviceName = urlObj.searchParams.get("service");
    service_id = urlObj.pathname.split('/')[3];

    $("#mservice").text(serviceName);
    
    setProgressBar(current);

    $("#next1").click(function(){
        let distance =  parseInt($("#distance").val(),10);
        let location = $("#searchLocation").val();
        if(location.length<3)
            {
                toast("danger","Please enter location",5000);
            }
        else{
            execute = true;
        }
        });
        $("#next2").click(function(){
            let first_name = $("#first_name").val();
        let last_name = $("#last_name").val();
        let contact_number = $("#contact_number").val();
        let email = $("#email").val();
         if(first_name.length<3)
            {
                toast("danger","Please enter first name",5000);
            }
            else if(last_name.length<3)
                {
                    toast("danger","Please enter last name",5000);
                }
                
                    
                           
                                else if ($('input[name="website"]:checked').length < 1) {
                                    toast("danger","Please confirm website",5000);
                                }
                                else if ($('input[name="company_size"]:checked').length < 1) {
                                    toast("danger","Please confirm company size",5000);
                                }
                                else if ($('input[name="sales_team"]:checked').length < 1) {
                                    toast("danger","Please confirm sales team",5000);
                                }
                             else if ($('input[name="social_media"]:checked').length < 1)
                                 {
                                   toast("danger","Please confirm social media",5000);
                                 } 
         
           
            else{
                execute = true;
            }
            });

platform = new H.service.Platform({
    apikey: '0i96U6UU1rKvZazleCxLsJDqyRjXxVlFdUCQc8gb3go' 
});

// Get Geocoding service and DOM elements
searchService = platform.getSearchService();
locationInput = document.getElementById('location');
suggestionsList = document.getElementById('suggestions');

// Event listener for input changes


    
    $(".next").click(function(){
        $("#info").hide();
        if (execute === false) {
            return false;
        }
    current_fs = $(this).parent();
    next_fs = $(this).parent().next();
    
    $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
    
    next_fs.show();
    current_fs.animate({opacity: 0}, {
    step: function(now) {
    opacity = 1 - now;
    
    current_fs.css({
    'display': 'none',
    'position': 'relative'
    });
    next_fs.css({'opacity': opacity});
    },
    duration: 500
    });
    setProgressBar(++current);
    });
    
    $(".previous").click(function(){    
    current_fs = $(this).parent();
    previous_fs = $(this).parent().prev();
    $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
    
    previous_fs.show();
    
    current_fs.animate({opacity: 0}, {
    step: function(now) {
    opacity = 1 - now;
    
    current_fs.css({
    'display': 'none',
    'position': 'relative'
    });
    previous_fs.css({'opacity': opacity});
    },
    duration: 500
    });
    setProgressBar(--current);
    });
    
    function setProgressBar(curStep){
    var percent = parseFloat(100 / steps) * curStep;
    percent = percent.toFixed();
    $(".progress-bar").css("width",percent+"%");
    execute=false;
    }
    
    $(".submit").click(function(){
    return false;
    })

   

    $("#submit_create_profile").click(function(){
        let first_name = $("#first_name").val();
        let last_name = $("#last_name").val();
        let contact_number = $("#contact_number").val();
        let location = $("#searchLocation").val();
        let biography = "";
        let latitude = $("#latitude").val();
        let longitude = $("#longitude").val();
        let distance = $("#distance").val();
        let email = $("#email").val();
        let password = $("#password").val();
        let password_confirmation = $("#confirm_password").val();
        let company_name = $("#company_name").val();
        let is_company_social_media = $('input[name="social_media"]:checked').val();
        let is_company_sales_team = $('input[name="sales_team"]:checked').val();
        let is_company_website = $('input[name="website"]:checked').val();
        let company_size = $('input[name="company_size"]:checked').val();
        let location_select = 1;
        var _token = $('input[name="_token"]').val();
        if(password.length<6)
            {
                toast("danger","Please enter password",3000);
            }
            else if(password != password_confirmation)
                {
                    toast("danger","Please match your password",3000);
                }
       else{
        const obj = {
            first_name,last_name,contact_number,location,latitude,longitude,distance,email,password,password_confirmation,company_name,is_company_website,company_size,is_company_sales_team,is_company_social_media,location_select,_token,service_id,biography
        }

  
            $.ajax({
                url: '/register',
                type: 'POST',   
                data: obj,
           beforeSend: function() {                
                    $("#loader").show();
                },
                success: function(response) {
                    console.log(response);
                   
                    if(response.status === "success_login")
                    {
                        window.location.href = '/dashboard';                        
                        toast("success",response.message,10000);
                        current_fs = $(".next").parent();
                        next_fs = $(".next").parent().next();
                        $("#confirm").addClass("active");
                        
                        next_fs.show();
                        current_fs.animate({opacity: 0}, {
                        step: function(now) {
                        opacity = 1 - now;
                        
                        current_fs.css({
                        'display': 'none',
                        'position': 'relative'
                        });
                        next_fs.css({'opacity': opacity});
                        },
                        duration: 500
                        });
                        setProgressBar(++current);
                     
                    }
                    else if(response.status === "success_otp")
                    {
                        toast("success",response.message,10000);
                        current_fs = $(".next").parent();
                        next_fs = $(".next").parent().next();
                        $("#confirm").addClass("active");
                        
                        next_fs.show();
                        current_fs.animate({opacity: 0}, {
                        step: function(now) {
                        opacity = 1 - now;
                        
                        current_fs.css({
                        'display': 'none',
                        'position': 'relative'
                        });
                        next_fs.css({'opacity': opacity});
                        },
                        duration: 500
                        });
                        setProgressBar(++current);
                        window.location.href = response.redirect_url;
                    }
                    else if(response.status === "duplicate")
                        {
                            toast("danger",'Account already exists, please signin',5000);  
                            $("#info").show(); 
                            $("#info").html(response.message);
                        }
                else{
                    toast("danger",'Error : '+response.message,5000);   
                }
                 
                    
                },
                error: function(xhr, status, error) {
                    toast("danger",'Error : '+xhr.responseText,5000);    
                    console.log(xhr.responseText);          
                },
                complete: function() {
                    $("#loader").hide();
                }
            });
           
        }
        });
        $('#location').on('input', function() {
            var query = $(this).val(); // Get the input value
    
            if (query.length >= 3) { // Start searching after 3 characters
                searchService.autosuggest({
                    q: query,
                    at: '52.5159,13.3777', // Change as needed
                    limit: 5
                }, function(result) {
                    $('#suggestionsList').empty(); // Clear previous suggestions
    
                    // Populate suggestions
                    $.each(result.items, function(index, item) {
                        var listItem = $('<li></li>').text(item.title).addClass('suggestion-item');
    
                        listItem.on('click', function() {
                            $('#locationInput').val(item.title); // Set input to selected suggestion
                            $('#suggestionsList').empty(); // Clear suggestions
                        });
    
                        $('#suggestionsList').append(listItem); // Add suggestion to the list
                    });
                }, function(error) {
                    console.error('Autocomplete error:', error);
                });
            } else {
                $('#suggestionsList').empty(); // Clear suggestions if input is less than 3 characters
            }
        });
        $('.js-example-basic-multiple').select2();
    });
    