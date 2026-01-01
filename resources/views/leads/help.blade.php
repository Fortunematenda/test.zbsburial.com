<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Help') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto">
            <div class="p-6 sm:p-12 bg-white shadow sm:rounded-lg">
                <h3 class="text-lg font-semibold mb-4">How can we assist you?</h3>
                <p class="mb-4">
    If you have any questions or need assistance, feel free to contact us using the details below.  
    Our support team will respond as soon as possible.
</p>


    
                <div class="mt-4 text-sm text-gray-600">
                  
                    <ul class="list-disc ml-5">
                        <li>Email: <a href="mailto:support@fortai.com" class="text-blue-600 hover:underline">support@fortai.com</a></li>
                        <li>Phone: <a href="tel:+27612685933" class="text-blue-600 hover:underline">+27 21 456 7890</a></li>
                    </ul>
                </div>
                
                
            </div>
        </div>
    </div>
</x-app-layout>
