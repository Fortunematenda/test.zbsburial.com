<section class="p-4 bg-white rounded-lg">
<style>
    .text-yellow-400{
    color:#f1c40f !important;
}
</style>
 


    <form method="post" action="{{ route('update_services') }}" >
        @csrf

        <div>
        <x-input-label for="services" :value="__('Select Services')" />
     
        <select class="js-example-basic-multiple mt-1 block w-full" name="services[]" multiple="multiple" style="cursor: default;padding-left: 20px !important;padding-right: 2px ;">
        @foreach($services as $service)
    <option @if(in_array($service, $latest_services)) selected @endif>{{ $service }}</option>
@endforeach
</select>
<div class="disclaimer">
<i class="bi bi-info-circle-fill"></i>
      Choose a maximum of <strong>5 services</strong>  
       
    </div>
        </div>
        <br>

        <div class="flex items-center gap-4">
            <x-primary-button>{{ __('Save') }}</x-primary-button>
        </div>
    </form>

    <hr>
    <h3>Reviews</h3>
    @foreach($reviews as $review)
    @php
        $rating = (int) $review['rating'];
        $comment = $review['comment'];
        $remaining = 5 - $rating;
        $date_entered = $review['date_entered'];
        $first_name = $review['first_name'];
        $formattedDate = date('j F Y', strtotime($date_entered));

    @endphp
    
    <div class='border p-3 rounded-lg bg-gray-50 mt-2'>
        <div class='flex space-x-1'>
            @for ($i = 0; $i < $rating; $i++)
                <span class='text-yellow-400 text-2xl'>★</span>
            @endfor
            @for ($i = 0; $i < $remaining; $i++)
                <span class='text-gray-400 text-2xl'>★</span>
            @endfor
        </div>
        <p class='text-gray-400'>{{$first_name}} - {{$formattedDate}}</p>
        <h6>{{ $comment }}</h6>
    </div>
@endforeach
</section>

