// Initialize select2 when modal is shown
UIkit.util.on('#modal-example', 'shown', function () {
    const $select = $('#service');
    $select.select2({
        dropdownParent: $('#modal-example'),
        placeholder: "Select a service",
        width: '100%'
    });
});

// Also initialize global select2s
$(document).ready(function () {
    $('.select2').select2({
        width: '100%'
    });
});

// Handle service selection without reopening modal
$(document).on('change', '#service', function (e) {
    e.stopPropagation();
    e.stopImmediatePropagation();

    const selectedValue = $(this).val();
    console.log('Selected option value:', selectedValue);

    // Removed: UIkit.modal('#modal-example').show();
});

// Change status and possibly fetch experts
$(document).on("click", ".changestatus", function () {
    const xl = $(this).attr("xl");
    const status = $(this).attr("dm");

    $("#xl").val(xl);
    $("#status").val(status);

    if (status === "hired") {
        $(".sel").show();

        const selectElement = document.getElementById('expert');
        while (selectElement.options.length > 2) {
            selectElement.remove(2);
        }

        fetchExperts(xl);
    } else {
        $(".sel").hide();
    }
});

// Update status button click
$(document).on("click", "#updatestatus", function () {
    const xl = $("#xl").val();
    const status = $("#status").val();

    if (status === "hired") {
        fetchExperts(xl);
    }
});

// AJAX to fetch experts
function fetchExperts(xl) {
    $.ajax({
        url: "/leadexperts",
        type: 'GET',
        data: { xl },
        success: function (data) {
            const experts = data["xperts"];
            for (const key in experts) {
                $("#expert").append(
                    "<option value='" + experts[key]["id"] + "'>" +
                    experts[key]["first_name"] + " " + experts[key]["last_name"] +
                    "</option>"
                );
            }
        },
        error: function (xhr, status, error) {
            console.error('Error:', status, error);
        }
    });
}

// ------------------- Firebase FCM Integration -------------------
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
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.error("Permission not granted for notifications.");
            return;
        }

        const token = await messaging.getToken();
        const _token = $('input[name="_token"]').val();

        console.log("Device Token:", token);

        $.ajax({
            url: '/posttoken',
            type: 'POST',
            data: {
                token: token,
                _token: _token
            },
            beforeSend: function () {
                $("#search-service").show();
            },
            success: function (data) {
                console.log("Token submitted:", data);
            },
            error: function (xhr, status, error) {
                console.error('Error sending token:', status, error);
            }
        });

    } catch (error) {
        console.error("Error getting token:", error);
    }
}

// Get token on page load
getDeviceToken();
