<x-app-layout>
      
    
      
      <style type="text/css">
  
  
  .ui-w-80 {
      width: 80px !important;
      height: auto;
  }
  
  
  .btn-outline-primary {
      border-color: #26B4FF;
      background: transparent;
      color: #26B4FF;
  }
  
  .btn {
      cursor: pointer;
  }
  
 
 
  
  .card {
      background-clip: padding-box;
      box-shadow: 0 1px 4px rgba(24,28,33,0.012);
  }
  
  
  .account-settings-fileinput {
      position: absolute;
      visibility: hidden;
      width: 1px;
      height: 1px;
      opacity: 0;
  }
  



        /* Responsive Design */
        @media (max-width: 768px) {
      
        }
  
.iidlEb {
    max-width: 768px !important ;
    margin: 24px auto !important;
    border-radius: 4px !important;
    box-shadow: rgb(224, 224, 224) 0px 0px 0px 1px !important;
    background-color: rgb(255, 255, 255) !important;
    padding: 20px 16px !important;
}

</style>

     <link href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.0/dist/css/bootstrap.min.css" rel="stylesheet">
      
      
 


      
    <div class="container light-style flex-grow-1 container-p-y iidlEb ">
   
        <form action="{{ route('profile.update', $user->id) }}" method="POST" enctype="multipart/form-data">
    @csrf
    @method('Patch')
        
        <div class="media-body ml-4">
    @php
        $defaultImage = 'https://bootdey.com/img/Content/avatar/avatar1.png';
        $imagePath = 'storage/profile_pictures/' . ($user->profile_picture ?? '');
        $imageUrl = $user->profile_picture && file_exists(public_path($imagePath))
            ? asset($imagePath)
            : $defaultImage;
    @endphp

    <!-- Profile Image -->
    <img src="{{ $imageUrl }}" 
         alt="Profile Picture" 
         class="d-block ui-w-80 mb-2" 
         style="max-width: 120px; border-radius: 6px;">

    <!-- Upload Button -->
    <label for="profile_picture" class="btn btn-outline-primary">
        {{ __('Upload Profile Picture') }}
        <input type="file" 
               id="profile_picture" 
               name="profile_picture" 
               class="account-settings-fileinput d-none" 
               accept="image/*">
    </label>

    <!-- Info -->
    <div class="text-muted small mt-2">
        Allowed: JPG, GIF, or PNG. Max size: 4MB
    </div>
</div>


    <hr class="border-light m-0">

    <div class="card-body">
        <!-- First Name -->
        <div class="form-group">
            <label class="form-label">First Name</label>
            <input type="text" id="first_name" name="first_name" class="form-control mb-1" value="{{ old('first_name', $user->first_name) }}" required autofocus autocomplete="first_name"/>
        </div>

        <!-- Last Name -->
        <div class="form-group">
            <label class="form-label">Last Name</label>
            <input type="text" id="last_name" name="last_name" class="form-control mb-1" value="{{ old('last_name', $user->last_name) }}" required />
        </div>

        <!-- E-mail -->
        <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="email" name="email" class="form-control mb-1" value="{{ old('email', $user->email) }}" required autocomplete="username" />
        </div>

        <!-- Contact Number -->
        <div class="form-group">
            <label class="form-label">Contact Number</label>
            <input type="text" id="contact_number" name="contact_number" class="form-control mb-1" value="{{ old('contact_number', $user->contact_number) }}" />
        </div>
        
        <!-- Location -->
        <div class="form-group">
                            <label class="form-label">Location</label>
                            <input type="text" id="searchLocation" name="location" class="form-control mb-1" value="{{ old('location', $user->location) }}" placeholder="Enter your location" />
                            <input type="hidden" name="latitude" id="latitude" value="{{ old('latitude', $user->latitude) }}">
                            <input type="hidden" name="longitude" id="longitude" value="{{ old('longitude', $user->longitude) }}">
                        </div>
                        @if(session('temp_role') == "Expert") 
                        <div class="form-group">
                            <label class="form-label">Company</label>
                            <input type="text" id="company_name" name="company_name" class="form-control mb-1" value="{{ old('company_name', $user->company_name) }}" />
                        </div>
        
                        
                        <x-input-label for="inputState" :value="__('Distance')" />
                        <select class="Select_buttonClasses__rxXNq select-button" id="distance" name="distance">
                        <option value="{{ old('distance', $user->distance) }}" >{{ old('distance', $user->distance) }} Kilometers</option>
                            <option value="50">50 Kilometers</option>
                            <option value="20">20 Kilometers</option>
                            <option value="10">10 Kilometers</option>
                        </select>
                        <!-- Company Website -->
                        <div class="form-group">
                            <label class="form-label">Company Website</label>
                            <select id="is_company_website" name="is_company_website" class="form-control mb-1">
                                <option value="1" {{ old('is_company_website', $user->is_company_website) ? 'selected' : '' }}>Yes</option>
                                <option value="0" {{ !old('is_company_website', $user->is_company_website) ? 'selected' : '' }}>No</option>
                            </select>
                        </div>
        
                        <!-- Company Size -->
                        <div class="form-group">
                            <label class="form-label">Company Size</label>
                            <select id="company_size" name="company_size" class="form-control mb-1">
                                <option value="Self-employed" {{ old('company_size', $user->company_size) == 'Self-employed' ? 'selected' : '' }}>Self-employed</option>
                                <option value="2-10" {{ old('company_size', $user->company_size) == '2-10' ? 'selected' : '' }}>2-10</option>
                                <option value="11-50" {{ old('company_size', $user->company_size) == '11-50' ? 'selected' : '' }}>11-50</option>
                                <option value="51-200" {{ old('company_size', $user->company_size) == '51-200' ? 'selected' : '' }}>51-200</option>
                                <option value="200+" {{ old('company_size', $user->company_size) == '200+' ? 'selected' : '' }}>200+</option>
                            </select>
                        </div>

    <div class="form-group">
                    <label class="form-label">Bio</label>
                    <textarea class="form-control" id="biography" name="biography" rows="5">{{ old('biography', $user->biography) }} </textarea>
                    
                  </div>
                  </div>
                  @endif
    <div class="text-right mt-3">
        <button type="submit" class="btn btn-primary">Save</button>
        <a href="{{ route('profile.edit') }}" class="btn btn-secondary">Cancel</a>
    </div>
  
</form>
</div>
<div class="card-body pb-2">
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
    {{-- Display Validation Errors --}}
    @if($errors->any())
    <div class="alert alert-danger">
        <ul>
            @foreach($errors->all() as $error)
            <li>
                {{ $error }}
            </li>
            @endforeach
        </ul>
    </div>
    @endif
    @if (session('status') === 'password-updated')
    <div class="alert alert-success mt-4">
        ✅ Password updated successfully!
    </div>
@endif
<section id="changepass">
    <form method="post" action="{{ route('password.updateold') }}">
        @csrf
        @method('Put')
       

</div>


        <div>
            <x-input-label for="update_password_password" :value="__('New Password')" />
            <x-text-input id="update_password_password" name="password" type="password" class="mt-1 block w-full" autocomplete="new-password" />
            <x-input-error :messages="$errors->updatePassword->get('password')" class="mt-2" />
        </div>

        <div>
            <x-input-label for="update_password_password_confirmation" :value="__('Confirm Password')" />
            <x-text-input id="update_password_password_confirmation" name="password_confirmation" type="password" class="mt-1 block w-full" autocomplete="new-password" />
            <x-input-error :messages="$errors->updatePassword->get('password_confirmation')" class="mt-2" />
        </div>
        
        <div class="flex items-center gap-4 mt-4">
            <x-primary-button type="submit" class="btn btn-primary">{{ __('Save') }}</x-primary-button>

            @if (session('status') === 'password-updated')
                <p
                    x-data="{ show: true }"
                    x-show="show"
                    x-transition
                    x-init="setTimeout(() => show = false, 2000)"
                    class="text-sm text-gray-600"
                >{{ __('Saved.') }}</p>
            @endif
        </div>
        </form>
        </section>

        </x-app-layout>
        <script src="https://code.jquery.com/jquery-1.10.2.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.1.1/dist/js/bootstrap.bundle.min.js"></script>
        <script type="text/javascript"></script>