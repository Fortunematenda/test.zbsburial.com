<x-app-layout>
    <div class="container mt-5">
        <h2 class="mb-4">Change Your Password</h2>

       @if (session('status') === 'password-updated')
    <div class="alert alert-success">
        ✅ Password updated successfully!
    </div>
@endif


        @if($errors->any())
            <div class="alert alert-danger">
                <ul>
                    @foreach($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <form method="POST" action="{{ route('password.updateold') }}">
            @csrf
            @method('PUT')

            <div class="mb-3">
                <label for="password" class="form-label">New Password</label>
                <input id="password" name="password" type="password" class="form-control" required autocomplete="new-password">
            </div>

            <div class="mb-3">
                <label for="password_confirmation" class="form-label">Confirm New Password</label>
                <input id="password_confirmation" name="password_confirmation" type="password" class="form-control" required autocomplete="new-password">
            </div>

            <button type="submit" class="btn btn-primary">Save Password</button>
        </form>
    </div>
</x-app-layout>
