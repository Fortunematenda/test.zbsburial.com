let leadsArr = [];
let page = 1;
let isLoading = false;
let lastPage = false;
let filter = 0;
let total = 0;

$(document).ready(function() {
    $("#myleads").empty();
    fetchLeads();   
});

$("#dashboard-projects").scroll(function() {
    if ($("#dashboard-projects").scrollTop() + $("#dashboard-projects").height() >= $(document).height() - 100) {
            fetchLeads();
    }
});



$(document).on('click','.trail',function() {    
    let _token = $('input[name="_token"]').val();
    let trail_id = $(this).attr("trail_id");
    let lead_id = $(this).attr("lead_id");

    const obj = {_token,trail_id,lead_id};
    getJSONResponse("addleadstrail",obj).then((data) => {
    }).catch((error) => {
        console.error('Failed to fetch leads:', error);  // Handle the error here
    });         
});

$(document).on('click','#send_estimate',function() {    
    let _token = $('input[name="_token"]').val();    
    let lead_id = $(this).attr("lead_id");
    let estimate_amount = $("#estimate_amount").val();
    let estimate_type = $("#estimate_type").val();
    let respond_textarea_field = $("#respond_textarea_field").val();

    const obj = {_token,lead_id, estimate_amount, estimate_type, respond_textarea_field};
    getJSONResponse("updateestimate",obj).then((data) => {
      
        toast(data.status,data.message,5000);
    }).catch((error) => {
        console.error('Failed to update lead:', error);  // Handle the error here
    });         
});


$(document).on('click','.view_lead',function() {
    var _token = $('input[name="_token"]').val();
   let lead_id = $(this).attr("m");  
   const obj = {_token,lead_id};
   let details = ""; 

          // Only call displayLeads on desktop/tablet (viewport width > 768px)
          if ($(window).width() <= 768) {
            showDetails();
        }

   getHTMLResponse("getresponsedetails",obj).then((data) => {
    details = data;
    $("#show_details").html(details);
    $('.view_lead').removeClass('m-border');
    $(this).addClass('m-border');
}).catch((error) => {
    details = 'There is an error : '+error;  // Handle the error here
});    
   $("#show_details").html(details);
}); 

$(document).on('click','#add_note',function() {
    var _token = $('input[name="_token"]').val();
   let lead_id = $(this).attr("m");  
   let description=$('#note_description').val();
   const obj = {_token,lead_id,description};
   getJSONResponse("addleadnote",obj).then((data) => {
    toast("success",data.message,5000);
    $('#ininfo').append('<div class="details flex-column flex-grow-1 ml-2 mb-4 p-3 border text-sm"><div class="details-top d-flex justify-content-between text-sm text-grey-400">'+
        '<div class="details-top-left flex-grow-1"> <div class="item-actor-name">Me</div></div><div class="details-top-right">'+
        '<div class="item-date">'+data.date_entered+'</div></div></div><div class="details-center"><p class="item-message mb-0 mt-1">'+data.note["description"]+"</p></div></div>");
    $('#note_description').val("");
}).catch((error) => {
    console.log('There is an error : '+error);  // Handle the error here
}); 
}); 

$(document).on('change','#status-select',function() {
    var _token = $('input[name="_token"]').val();
   let lead_id = $(this).attr("m");
   let status = $(this).val();   
   const obj = {_token,lead_id,status};
   getJSONResponse("updatestatus",obj).then((data) => {
    toast("success",data.message,5000);
}).catch((error) => {
    console.log('There is an error : '+error);  // Handle the error here
}); 
});

$(document).on('click', '#one-tab', function () {
    isLoading = false;
    lastPage = false;
    page = 1;
    filter = 0;
    $('#end-message').hide();
    $("#myleads").empty();
    fetchLeads();     
});
$(document).on('click', '#two-tab', function () {
    isLoading = false;
    lastPage = false;
    page = 1;
    filter = 1;
    $('#end-message').hide();
    $("#myleads").empty();
    fetchLeads();     
});
$(document).on('click', '#three-tab', function () {
    isLoading = false;
    lastPage = false;
    page = 1;
    filter = 2;
    $('#end-message').hide();
    $("#myleads").empty();
    fetchLeads();     
});

const displayLeads = (json,pending_count,hired_count) =>{
  
    $("#one-tab>span").text(total);
    $("#two-tab>span").text(pending_count);
    $("#three-tab>span").text(hired_count);

    for(key in json)
        {
            let lead_id = json[key]["lead_id"];
            let first_letter = json[key]["first_letter"];
            let first_name = json[key]["first_name"];
            let location = json[key]["location"];
            let time = json[key]["time"];
            let urgent = json[key]["urgent"];
            let is_phone_verified = json[key]["is_phone_verified"];
            let additional_details = json[key]["additional_details"];
            let frequent = json[key]["frequent"];
            let contacted = json[key]["contacted"];
            let description = json[key]["description"];
            let hiring_decision = json[key]["hiring_decision"];   
            let remender = json[key]["remender"];
            let service_name = json[key]["service_name"];
            let credits = json[key]["credits"];
            let leads_trail = json[key]["leads_trail"];
            let contacted_status = json[key]["contacted_status"];
            let lastresponded = json[key]["lastresponded"];
            $("#myleads").append(leadsTemplate(lead_id,first_letter,first_name,location,time,urgent,is_phone_verified,additional_details,frequent,lastresponded,contacted,remender,service_name,credits,hiring_decision,leads_trail, contacted_status));
          
        }
        if(json.length>0 && page === 1)
        {
           
            let _token = $('input[name="_token"]').val();
            let lead_idu =json[0]["lead_id"];
            
            let details = "";
            if ($(window).width() > 768)
            {
                //alert("Terse")
            getHTMLResponse("getresponsedetails",{_token,lead_id:lead_idu}).then((data) => {
                details = data;
                $("#show_details").html(details);
                $('.view_lead').removeClass('m-border');
                $('.view_lead:first-child').addClass('m-border');
            }).catch((error) => {
                details = 'There is an error : '+error;  // Handle the error here
            });    
               $("#show_details").html(details);
        }
        }
        $(".loader").hide();
}

const getJSONResponse = (url,obj) => {
    return new Promise((resolve, reject) => {        
        $.ajax({
            url: '/'+url,
            type: 'POST',
            data: obj,
            beforeSend: function() {
                $(".loader").show();
            },
            success: function(data) {
                resolve(data);  // Resolve the promise with the data
            },
            error: function(xhr, status, error) {
                //console.error('Error:', status, error);
                reject(error);  // Reject the promise if there's an error
            },
            complete: function() {
                $(".loader").hide();
                isLoading = false;
            }
        });
    });
};
const getHTMLResponse = (url,obj) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/'+url,
            type: 'POST',
            data: obj,
            beforeSend: function() {
                $(".loader").show();
            },
            success: function(data) {
                resolve(data);  // Resolve the promise with the data
            },
            error: function(xhr, status, error) {
                //console.error('Error:', status, error);
                reject(error);  // Reject the promise if there's an error
            },
            complete: function() {
                $(".loader").hide();
            }
        });
    });
};




const leadsTemplate = (
    lead_id, first_letter, first_name, location, time, urgent, 
    is_phone_verified, additional_details, frequent, lastresponded, 
    contacted, remender, service_name, credits,hiring_decision,leads_trail, contacted_status
) => {

    let txt = "<button m='" + lead_id + "' class='view_lead'>" +
              "<div class='leads-list-item-card tw-p-6 tw-mx-4 tw-border-l-4 tw-border-transparent " +
              "tw-rounded-lg tw-bg-white hover:tw-bg-gray-50  hover:tw-shadow-lg' data-cy='lead-card-is-active-false'>" +
              "<div class='tw-flex tw-justify-between'>" +
              "<div class='tw-flex tw-relative LeadsListItem_blueDot__magSY'>" +
              "<div class='tw-mr-4'>" +
              "<div class='Avatar_base__iRlms Avatar_radiusFull__-VC23 Avatar_bgAF42FF__vTweJ' style='width: 40px; height: 40px;'>" +
              "<span class='tw-text-white tw-text-base tw-text-center'>" + first_letter + "</span>" +
              "</div></div>" +
              "<div class='tw-text-left'>" +
              "<p class='tw-m-0'><b>" + first_name + "</b></p>" +
              "<p class='tw-m-0 tw-font-gordita-regular tw-text-xs'>" + service_name + "</p>" +
              "<p class='tw-mt-1 tw-font-gordita-regular tw-text-xs tw-text-gray-500'></p>" +
              "</div></div>" +
              "<div style='color:purple'> <i class='bi bi-patch-check'></i></div>";

            txt += "</div><div class='tw-flex tw-flex-wrap tw-justify-start tw-items-center tw-gap-1 tw-mt-4' data-cy='value-badges'></div>";
            txt += " <div class='tw-flex tw-flex-col tw-p-2 tw-bg-gray-100 tw-rounded tw-text-xs tw-mt-4'>";
            
            txt += "  <span class='tw-text-left tw-mb-3 tw-text-xs tw-font-gordita-regular tw-flex tw-justify-start tw-items-end'><b><i class='bi bi-geo-alt'></i> " + location + "</b></span>";
            txt += "  <span class='tw-text-left tw-font-gordita-regular tw-text-gray-700'><i class='bi bi-alarm'></i> " + lastresponded + "</span>";
            txt += "</div> ";
           txt += "<div class='tw-bg-gray-50 tw-rounded-md tw-px-3 tw-py-2 tw-mt-3 tw-flex tw-justify-between tw-items-center tw-text-xs'>";
txt += "  <div class='tw-flex tw-items-center'>";
txt += "    <i class='bi bi-coin tw-mr-2'></i>";
txt += "    <span class='tw-text-gray-700'>" + credits + " Credits</span>";
txt += "  </div>";
txt += "  <div class='tw-flex tw-items-center'>";
txt += "    <i class='bi bi-circle-fill tw-text-yellow-500 tw-text-[0.65rem] tw-mr-2'></i>";
txt += "    <span class='tw-font-semibold tw-text-gray-800'>" + contacted_status + "</span>";
txt += "  </div>";
txt += "</div>";
            txt += "</div><div class='tw-flex tw-justify-between tw-mt-4'>";
            txt += "  <div class='tw-flex tw-justify-start tw-items-end' data-cy='lead-price'>";
          
            txt += "  </div>";
            txt += "  <div>";
            txt += "    <div>";
                   "<div></div>";
                   "<div></div>";
                   "</div><div><div><span>";
                   "";
     
            txt +="<span></span>";  

            txt += " </span></div></div></div></div></div></button>";                                    
    
 return txt;
};


$(document).on('click','.whatsap',function(){
let contact_number = $(this).attr("contact_number").replace('+','');
window.open('https://api.whatsapp.com/send/?phone='+contact_number+'&text&type=phone_number&app_absent=0', '_blank');
})

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
const fetchLeads = () => {
    if (isLoading || lastPage) return;

    isLoading = true;
    $(".loader").show();
    var _token = $('input[name="_token"]').val();
    const obj = {_token,page,filter};
    console.log(obj);
    getJSONResponse("getresponses",obj).then((data) => {
        console.log(data);
    const leadsArr = data["leads"]["leadsArr"];
    const current_page =  data["leads"]["current_page"];
    const last_page =  data["leads"]["last_page"];
    const count_total =  data["leads"]["leads_count"];
    const pending_count =  data["leads"]["pending_count"];
    const hired_count =  data["leads"]["hired_count"];
    if(total <= 0)
        {
            total =  count_total;
        } 

    displayLeads(leadsArr,pending_count,hired_count);
    if (current_page >= last_page) {
        lastPage = true;
        $('#end-message').show();
    } else {
        page++;
        $('#end-message').hide();
    }
}).catch((error) => {
    console.error('Failed to fetch leads:', error); 
});      
};