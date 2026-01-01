<nav>
    <div class="card-body pb-2">
        <!-- Facebook -->
        <form action="{{ route('update.sociallinks') }}" method="POST">
            @csrf

            <div class="form-group">
                <i class="bi bi-facebook"></i>
                <label class="form-label">Facebook</label>
                <input type="url" class="form-control" name="facebook" placeholder="facebook link" value="{{ old('facebook', auth()->user()->facebook) }}">
            </div>

            <!-- Twitter (X) -->
            <div class="form-group">
                <i class="bi bi-twitter-x"></i>
                <label class="form-label">Twitter (X)</label>
                <input type="url" class="form-control" name="twitter" placeholder="x.com link" value="{{ old('twitter', auth()->user()->twitter) }}">
            </div>

            <!-- LinkedIn -->
            <div class="form-group">
                <i class="bi bi-linkedin"></i>
                <label class="form-label">LinkedIn</label>
                <input type="url" class="form-control" name="linkedin" placeholder="linkedin link" value="{{ old('linkedin', auth()->user()->linkedin) }}">
            </div>

            <!-- Instagram -->
            <div class="form-group">
                <i class="bi bi-instagram"></i>
                <label class="form-label">Instagram</label>
                <input type="url" class="form-control" name="instagram" placeholder="instagram" value="{{ old('instagram', auth()->user()->instagram) }}">
            </div>

            <!-- Save Button -->
            <div class="flex items-center gap-4 mt-4">
                <x-primary-button type="submit" class="btn btn-primary">{{ __('Save') }}</x-primary-button>

               
            </div>
        </form>
    </div>
</nav>
