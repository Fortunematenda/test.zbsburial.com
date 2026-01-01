<!-- Become Expert Modal -->
<div id="modal-example" uk-modal="bg-close: false; esc-close: false">
    <div class="uk-modal-dialog uk-modal-body" style="border: 1px solid purple; border-radius: 4px;">
        <h2 class="uk-modal-title text-center">Become Expert</h2>
        <br>

        <form action="{{ route('becomeexpert') }}" method="POST" enctype="multipart/form-data" class="mr-3 ml-3">
            @csrf

            <!-- Company Name -->
            <div class="form-group">
                <label class="form-label">Company</label>
                <input type="text" id="company_name" name="company_name" placeholder="Enter company name"
                    class="form-control mb-1" style="border: 1px solid purple; border-radius: 4px;" required />
            </div>

            <!-- Distance -->
            <div class="form-group">
                <label class="form-label" for="distance">Distance</label>
                <select id="distance" name="distance"
                    class="form-control mb-1 text-black" style="border: 1px solid purple; border-radius: 4px;" required>
                    <option value="">Select distance</option>
                    <option value="50">50 Kilometers</option>
                    <option value="20">20 Kilometers</option>
                    <option value="10">10 Kilometers</option>
                </select>
            </div>

            <!-- Company Website -->
            <div class="form-group">
                <label class="form-label">Company Website</label>
                <select id="is_company_website" name="is_company_website"
                    class="form-control mb-1 text-black" style="border: 1px solid purple; border-radius: 4px;" required>
                    <option value="">Select Company Website</option>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                </select>
            </div>

            <!-- Company Size -->
            <div class="form-group">
                <label class="form-label">Company Size</label>
                <select id="company_size" name="company_size"
                    class="form-control mb-1 text-black" style="border: 1px solid purple; border-radius: 4px;" required>
                    <option value="">Select Company Size</option>
                    <option value="Self-employed">Self-employed</option>
                    <option value="2-10">2-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="200+">200+</option>
                </select>
            </div>

            <!-- Services -->
            <div class="form-group">
                <label class="form-label" for="service">Select Service</label>
                <select class="js-example-basic-multiple mt-1 block w-full" id="service" name="services[]" multiple="multiple"
                    style="cursor: default;padding-left: 20px !important;padding-right: 2px;">
                    @foreach($services as $service)
                        <option value="{{ $service->service_name }}">{{ $service->service_name }}</option>
                    @endforeach
                </select>
            </div>

            <!-- Bio -->
            <div class="form-group">
                <label class="form-label">Bio</label>
                <textarea class="form-control" id="biography" name="biography" rows="5"
                    placeholder="Enter your biography here..." style="border: 1px solid purple; border-radius: 4px;" required></textarea>
            </div>

            <!-- Buttons -->
            <p class="uk-text-right">
                <button class="uk-button uk-button-default uk-modal-close" type="button">Cancel</button>
                <button type="submit" class="uk-button btn btn-primary btn-round">Submit</button>
            </p>
        </form>
    </div>
</div>
