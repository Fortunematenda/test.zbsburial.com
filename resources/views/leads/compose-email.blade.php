
<x-app-layout>

<!-- include summernote css/js -->
<link href="https://cdn.jsdelivr.net/npm/summernote@0.9.0/dist/summernote.min.css" rel="stylesheet">
<link href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" rel="stylesheet">
<style>
    @media (min-width: 768px) {
    .navbar-nav {
        float: right !important;
    }
    .email-footer {
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #666;
        }
}
</style>

@if($end)

    <div class="alert alert-success" role="alert">
        
        {{ $message }}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>  

@else
    <div class="container">
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
    <h3 align="center">Compose Email</h3><br>
<div class="row">
    <div class="col-md-12">
    <form method="post" action="{{ route('send.email') }}" id="emailForm">
         @csrf
         <textarea id="summernote" name="editordata">
            {{$message}}
        </textarea>
        <input type="hidden" name="knn" value="{{$id}}"/>
        <button class="btn btn-danger">
            <i class="bi bi-x-circle"></i>
             Cancel
            </button>
            <button class="btn btn-info">
                <i class="bi bi-send"></i>
                 Send
                </button>
            </form>
    </div>
    <div class="email-footer">
            &copy; {{ date('Y') }} Fortai. All rights reserved.
        </div>
   
</div>
</div>
    
  @endif                                          
    
</x-app-layout>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/summernote@0.9.0/dist/summernote.min.js"></script>
<script>
    $(document).ready(function() {
  $('#summernote').summernote({
    height:300
  });
});

</script>
