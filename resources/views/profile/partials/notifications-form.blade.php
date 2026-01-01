<section class="p-4 bg-white rounded-lg">
    <form id="notificationForm" action="{{ route('notifications.subscribed') }}" method="POST">
        @csrf <!-- Include CSRF token for security -->
      <div class="p-4 sm:p-8 sm:rounded-lg">
            <div class="max-w-xl">
                <h4 class="text-md font-semibold mt-4">Services Alerts</h4>
                
                <label class="flex items-center mb-2">
                    <input type="hidden" name="subscribed_services_notifications" value="0"> <!-- Default false -->
                    <input type="checkbox" id="subscribed_services_notifications" name="subscribed_services_notifications" value="1" class="mr-2">
                    {{ __('Real-Time Alerts for Subscribed Services') }}
                </label>

                <label class="flex items-center mb-2">
                    <input type="hidden" name="new_leads_notifications" value="0"> <!-- Default false -->
                    <input type="checkbox" id="new_leads_notifications" name="new_leads_notifications" value="1" class="mr-2">
                    {{ __('Email Notifications for New Leads') }}
                </label>

                <label class="flex items-center mb-2">
                    <input type="hidden" name="weekly_newsletter_notifications" value="0"> <!-- Default false -->
                    <input type="checkbox" id="weekly_newsletter_notifications" name="weekly_newsletter_notifications" value="1" class="mr-2">
                    {{ __('Weekly Newsletter') }}
                </label>

                <h4 class="text-md font-semibold mt-4">SMS Notifications</h4>
                <label class="flex items-center mb-2">
                    <input type="hidden" name="sms_notifications" value="0"> <!-- Default false -->
                    <input type="checkbox" id="sms_notifications" name="sms_notifications" value="1" class="mr-2">
                    {{ __('Enable SMS Notifications') }}
                </label>

                <button type="submit" class="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                    {{ __('Save') }}
                </button>
            </div>
        </div>
    </form>
</section>

</form>

<script>
    // Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('notificationForm');

    // Load checkbox states from localStorage
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        const checkboxName = checkbox.name;
        // Set checkbox state based on localStorage
        if (localStorage.getItem(checkboxName) === 'true') {
            checkbox.checked = true;
        }

        // Add an event listener to update localStorage on change
        checkbox.addEventListener('change', function() {
            localStorage.setItem(checkboxName, checkbox.checked);
        });
    });

    // Add an event listener for the form submission
    form.addEventListener('submit', function(event) {
        // Prevent the default form submission
        event.preventDefault();

        // Prepare the data to be sent
        const formData = new FormData(form);

        // Send the data using fetch API
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': '{{ csrf_token() }}' // Include CSRF token for security
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            //console.log('Response from server:', data);
            toast('success', 'Notification settings updated successfully!', 3000);
        })
        .catch(error => {
            console.error('Error:', error);
            toast('error', 'Failed to update notification settings.', 3000);
        });
    });
});

// Your toast function
function toast(icon, txt, time) {
    yoyoToast.fire({
        type: icon,
        title: 'Status',
        message: txt,
        timeout: time,
        position: 'top-right',
        timeoutFunction: () => {},
    });
}

</script>
