<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Upload & Preview</title>
    <link rel="stylesheet" href="styles.css">
    <script defer src="script.js"></script>
</head>
<body>

    <div class="upload-container">
    
    <form action="{{ route('upload_photos') }}" method="POST" enctype="multipart/form-data">
    @csrf

        <div class="drop-area" id="drop-area">
            <p>Drag & Drop Photos Here or Click to Upload</p>
            <input type="file" id="files" name="files[]" multiple accept="image/*" hidden>
        </div>
        <div class="text-right mt-3">
        <button type="submit" class="btn btn-primary">Save Photos</button>      
    </div>
</form>
        <div class="preview-container" id="preview-container">
        @foreach($images as $image)
        <div class="relative inline-block" id="{{ $image['id'] }}">
            <img src="{{ asset('storage/uploads/' . $image['image_name']) }}" class="w-full h-auto rounded-md shadow-md" />
            <button style="background-color:#9d0b91 !important"
                class="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-md hover:bg-red-700"
                onclick="deleteImage('{{ $image['id'] }}')"
            >
                X
            </button>
        </div>
    @endforeach

        </div>
    </div>

    <!-- Modal for Full-Screen Image Preview -->
    <div class="modal" id="image-modal">
        <span class="close">&times;</span>
        <img class="modal-content" id="full-image">
    </div>

</body>
</html>
<style>


.upload-container {
    width: 100%;
    text-align: center;
}

.drop-area {
    border: 2px dashed #007bff;
    padding: 20px;
    border-radius: 10px;
    background: #fff;
    cursor: pointer;
    transition: 0.3s;
}

.drop-area:hover {
    background: #f1f1f1;
}

.drop-area p {
    font-size: 16px;
    color: #333;
}

.preview-container {
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
}

.preview-container img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 5px;
    border: 1px solid #ddd;
    cursor: pointer;
    transition: transform 0.2s;
}

.preview-container img:hover {
    transform: scale(1.1);
}

/* Modal Styles */
.modal {
    display: contents !important;
    position: relative !important;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 20% !important;
    height: 60% !important;
    background-color: rgba(0, 0, 0, 0.8);
    justify-content: center !important;
    align-items: center !important;
}

.modal-content {
    max-width: 60%;
    max-height: 60%;
    border-radius: 10px;
}

.close {
    position: absolute;
    top: 20px;
    right: 30px;
    font-size: 40px;
    color: white;
    cursor: pointer;
}

.close:hover {
    color: red;
}

</style>

<script>
    document.addEventListener("DOMContentLoaded", () => {
    const dropArea = document.getElementById("drop-area");
    const fileInput = document.getElementById("files");
    const previewContainer = document.getElementById("preview-container");
    const modal = document.getElementById("image-modal");
    const fullImage = document.getElementById("full-image");
    const closeModal = document.querySelector(".close");

    // Click to upload
    dropArea.addEventListener("click", () => fileInput.click());

    // Handle file selection
    fileInput.addEventListener("change", (event) => {
        handleFiles(event.target.files);
    });

    // Handle drag events
    dropArea.addEventListener("dragover", (event) => {
        event.preventDefault();
        dropArea.classList.add("dragover");
    });

    dropArea.addEventListener("dragleave", () => {
        dropArea.classList.remove("dragover");
    });

    dropArea.addEventListener("drop", (event) => {
        event.preventDefault();
        dropArea.classList.remove("dragover");
        handleFiles(event.dataTransfer.files);
    });

    function handleFiles(files) {
        for (const file of files) {
            if (!file.type.startsWith("image/")) continue;

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = document.createElement("img");
                img.src = event.target.result;
                img.addEventListener("click", () => showImage(event.target.result));
                previewContainer.appendChild(img);
            };
        }
    }

    function showImage(src) {
        fullImage.src = src;
        modal.style.display = "flex";
    }

    closeModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});

function deleteImage(id){
    if(confirm("Do you really want to delete this image?"))
{
    var _token = $('input[name="_token"]').val();
    const obj = {
id,_token
    };
    $.ajax({
            url: '/deletephoto',
            type: 'POST',
            data: obj,
            beforeSend: function() {
               // $(".loader").show();
            },
            success: function(data) {
               if(data.status === "success")
               {
                $("#"+id).remove();
                alert("Photo successfully deleted");
               }
               else{
                alert("Failed to delete image")
               }
            },
            error: function(xhr, status, error) {
                console.error('Error:', status, error);
             
            },
            complete: function() {
                $(".loader").hide();
            }
        });
}
}

</script>
