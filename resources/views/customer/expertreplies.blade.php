<x-app-layout>
 
<head>
    <!-- External CSS -->
    <link rel="stylesheet" href="https://sliderm.com/dist/1.0.8/sliderm.css">
    <link rel="stylesheet" href="{{ asset('build/assets/css/expertreplies.css') }}">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- Emoji Picker -->
    <script type="module" src="https://cdn.jsdelivr.net/npm/emoji-picker-element@^1/index.js"></script>

    <!-- External JS -->
    <script src="https://sliderm.com/dist/1.0.8/sliderm.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.min.js"></script>
  </head>

  <body>
    <form>@csrf</form>

    <!-- Main Screen -->
    <div id="main-screen">
      <header>
        <input type="text" placeholder="Ask Meta AI or Search" class="search-bar">
      </header>

      @if(count($replyexperts) > 0)
      <section class="chats">
        @php $defaultImg = "https://www.w3schools.com/w3images/avatar2.png"; @endphp

        @foreach($replyexperts as $expert)
          @php
            $img = $expert->profile_picture;
            $path = strlen($img) > 5 ? Storage::url('uploads/' . $img) : $defaultImg;
          @endphp

         <div class="chat dexpert" contacted_user_id="{{ $expert->user_id }}" onclick="openChat('{{ $expert->first_name }} {{ $expert->last_name }}', '{{ $path }}')">
  <img src="{{ $path }}" class="chat-avatar">
  <div class="chat-info">
    <strong>{{ $expert->first_name }} {{ $expert->last_name }}</strong>
    <p>
      Last message · 
      {{ \Carbon\Carbon::parse($expert->last_message_at)->diffForHumans() }}
    </p>
  </div>
</div>

        @endforeach
      </section>
      @else
        <h3 align="center">No Experts</h3>
      @endif

      <footer>
        <div class="nav-item active">Chats</div>
        <div class="nav-item">Home</div>
      </footer>
    </div>

    <!-- Chat Screen -->
    <div id="chat-screen" style="display: none;">
      <div class="chat-header">
        <button onclick="closeChat()">← Back</button>
        <img id="chat-image" src="https://via.placeholder.com/40" alt="User" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;">
        <div>
          <h2 id="chat-name">Chat Name</h2>
          <p style="margin: 0; font-size: 15px; color: #888;">
            {{ $expertnotes[0]->service_name ?? 'No Service Info' }}
          </p>
        </div>
      </div>

      <!-- Chat Body -->
      <div class="chatBody" id="chatBody">
      </div>

      <!-- Input Area -->
      <div class="chat-input">
        <input type="text" id="user_input" placeholder="Type a message..." />
        <button id="send-button">Send</button>
        <emoji-picker id="emojiPicker" style="display:none;"></emoji-picker>
      </div>

      <!-- Hidden Inputs -->
      <input type="hidden" id="xkk" value="{{ $lead_id ?? '' }}">
      <input type="hidden" id="uuus" value="{{ $user_id ?? '' }}">
    </div>

    <!-- JavaScript -->
    <script>
      document.addEventListener("DOMContentLoaded", function () {
        // Emoji Picker
        const emojiPicker = document.getElementById('emojiPicker');
        if (emojiPicker) {
          emojiPicker.addEventListener('emoji-click', e => {
            document.getElementById('user_input').value += e.detail.unicode;
          });
        }

        // Send Message
       // document.getElementById('send-button').addEventListener('click', sendMessage);
      });

    function openChat(name, imageUrl) {
  const fallbackImage = "/images/default-avatar.png"; // Make sure this path exists on your server
  const finalImage = imageUrl && imageUrl.startsWith('http') ? imageUrl : fallbackImage;

  document.getElementById('main-screen').style.display = 'none';
  document.getElementById('chat-screen').style.display = 'block';
  document.getElementById('chat-name').textContent = name;
  document.getElementById('chat-image').src = finalImage;
}


      function closeChat() {
        document.getElementById('main-screen').style.display = 'block';
        document.getElementById('chat-screen').style.display = 'none';
      }

      function sendMessage() {
    const input = document.getElementById('user_input');
    const chatBody = document.getElementById('chatBody');
    const sendBtn = document.getElementById('send-button');
    const message = input.value.trim();

    if (!message) return;

    const lead_id = $("#xkk").val();
    const contacted_user_id = $("#uuus").val();
    const _token = $('input[name="_token"]').val();

    const obj = {
      lead_id,
      contacted_user_id,
      description: message,
      _token
    };

    $.ajax({
      url: '/addleadnote',
      type: 'POST',
      data: obj,
      beforeSend: function () {
        sendBtn.disabled = true;
      },
      success: function () {
  // Create and append the message element
  const msgEl = document.createElement('div');
  msgEl.className = 'message user';
  msgEl.innerHTML = `
    <img class="avatar" src="https://www.w3schools.com/w3images/avatar2.png">
    <div>
      <p>${message}</p>
      <span class="timestamp">${new Date().toLocaleString()}</span>
    </div>`;
  chatBody.appendChild(msgEl);

  // 🔁 Scroll after DOM update
  setTimeout(() => {
    chatBody.scrollTop = chatBody.scrollHeight;
  }, 50); // small delay ensures accurate scroll

  // Reset input
  input.value = '';
  input.focus();
},
      error: function (xhr, status, error) {
        console.error('Send failed:', status, error);
        alert('Failed to send message');
      },
      complete: function () {
        sendBtn.disabled = false;
      }
    });
  }

  // Event bindings
  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('user_input');
    const sendBtn = document.getElementById('send-button');

    // Disable/enable send button based on input
    input.addEventListener('input', () => {
      sendBtn.disabled = input.value.trim().length === 0;
    });

    // Enter key sends message
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) {
          sendMessage();
        }
      }
    });

    // Initial state
    sendBtn.disabled = true;

    // Button click
    sendBtn.addEventListener('click', () => {
      sendMessage();
    });
  });
      function startRecording() {
        if (!('webkitSpeechRecognition' in window)) {
          alert("Speech recognition not supported");
          return;
        }
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onresult = function(event) {
          const transcript = event.results[0][0].transcript;
          document.getElementById('user_input').value += transcript;
        };
        recognition.start();
      }
    </script>
  </body>

</x-app-layout>
<script>
        $(document).on('click','.dexpert',function(){
            let lead_id = $("#xkk").val();
            let contacted_user_id = $(this).attr("contacted_user_id"); 
            let _token = $('input[name="_token"]').val(); 
            const obj = {
                lead_id,
                contacted_user_id,
                _token
            };
            $("#uuus").val(contacted_user_id);
            
            $.ajax({
                url: '/getleadnotes',
                type: 'POST',
                data: obj, // Send data in one object
                beforeSend: function() {
                    $("#chatBody").empty();
                    $("#chatBody").html("loading....");
                },
               success: function(data) {
    console.log(data);
    const json = data["expertnotes"];
    const details = data["details"];
    const name = data["name"];
    const path = data["profile_pic"];

    let txt = "";
let lastDate = "";

const formatDateLabel = (dateStr) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const dateObj = new Date(dateStr);
    const dateOnly = dateObj.toLocaleDateString();
    const todayStr = today.toLocaleDateString();
    const yesterdayStr = yesterday.toLocaleDateString();

    if (dateOnly === todayStr) return "Today";
    if (dateOnly === yesterdayStr) return "Yesterday";
    return dateObj.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTimestamp = (dateStr) => {
    const now = new Date();
    const msgDate = new Date(dateStr);

    const isToday = now.toDateString() === msgDate.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = yesterday.toDateString() === msgDate.toDateString();

    if (isToday) {
        // Today → show only time (HH:MM)
        return msgDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } else if (isYesterday) {
        // Show "Yesterday"
        return "Yesterday";
    } else {
        // Older → show full date
        return msgDate.toLocaleDateString('en-ZA', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }
};

for (let key in json) {
    const msg = json[key];
    const msgDate = new Date(msg.date_entered).toLocaleDateString();

    if (msgDate !== lastDate) {
        lastDate = msgDate;
        txt += `<div class="date-divider"><span>${formatDateLabel(msg.date_entered)}</span></div>`;
    }

    const sender = msg.user_id === msg.leads_user_id ? "user" : "bot";
    txt += `
    <div class="message ${sender}">
      <img class="avatar" src="${path}">
      <div>
        <p>${msg.description}</p>
        <span class="timestamp">${formatTimestamp(msg.date_entered)}</span>
      </div>
    </div>`;
}

$("#chatBody").html(txt);



    // 👇 Scroll to bottom after chat loads
    setTimeout(() => {
        const chatBody = document.getElementById('chatBody');
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 100);

    $(".infod").html(details);
    $("#name").html(name);
    $(".path").attr('src', path);
},

                error: function(xhr, status, error) {
                    console.error('Error:', status, error); // Improved error logging
                },
                complete: function() {
                    $("#loader").hide();
                    activateSlide();
                }
            });
    
        })
        $(document).on("click", "#send-button", function() {
            let lead_id = $("#xkk").val();
            let contacted_user_id = $("#uuus").val();
            let _token = $('input[name="_token"]').val(); 
            let description = $("#user_input").val();
            const obj = {
                lead_id,
                contacted_user_id,
                description,
                _token
            };
        console.log(obj);
            $.ajax({
                url: '/addleadnote',
                type: 'POST',
                data: obj, // Send data in one object
                beforeSend: function() {
                },
                
                success: function(data) {
                    sendMessage();
                  console.log(data);
                },
                error: function(xhr, status, error) {
                    console.error('Error:', status, error); // Improved error logging
                },
                complete: function() {
                    $("#loader").hide();
                }
            });    
    });
    
    
     
    
        document.getElementById('closeModal').addEventListener('click', () => {
            const modal = document.getElementById('imageModal');
            modal.style.display = 'none';
        });
    
        document.getElementById('imageModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                e.currentTarget.style.display = 'none';
            }
        });
    
        $(document).ready(function(){
            var firstDexpert = $('.dexpert:first');
    firstDexpert.click();
    
        });
    
    
      
            let currentRating = 0;
    
            function setRating(rating) {
                currentRating = rating;
                let stars = document.querySelectorAll("span.cursor-pointer");
                stars.forEach((star, index) => {
                    star.style.color = index < rating ? "#facc15" : "#d1d5db"; // Yellow for selected stars
                });
            }
    
            function submitReview() {
            
                let comment = document.getElementById("comment").value;
                if (currentRating === 0 || comment.trim() === "") {
                    alert("Please provide a rating and a comment.");
                    return;
                }
    
                let lead_id = $("#xkk").val();
            let contacted_user_id = $("#uuus").val();
            let _token = $('input[name="_token"]').val(); 
           
            const obj = {
                lead_id,
                contacted_user_id,
                comment,
                _token,
                rating:currentRating
            };
    
            $.ajax({
                url: '/postrating',
                type: 'POST',
                data: obj, // Send data in one object
                beforeSend: function() {
                },
                success: function(data) {
                  
                    if(data.status === "success")     
                    {
                let reviewList = document.getElementById("reviewList");
                let newReview = document.createElement("li");
                newReview.className = "border p-3 rounded-lg bg-gray-50";
             newReview.innerHTML = `<strong>⭐ ${currentRating} Stars</strong> - ${comment}`;

    
                reviewList.appendChild(newReview);
                document.getElementById("comment").value = ""; // Clear input
                setRating(0); // Reset stars
                    }       
                },
                error: function(xhr, status, error) {
                    console.error('Error:', status, error); // Improved error logging
                },
                complete: function() {
                    //$("#loader").hide();
                }
            });    
    
               
            }
    
           function activateSlide() {
    const sliderElement = document.querySelector('#example-slider');
    
    if (!sliderElement) {
        console.warn("Slider element '#example-slider' not found.");
        return;
    }

    const sliderm = new Sliderm('#example-slider', {
        arrow: true,
        pagination: true,
        grouping: false,
        loop: true,
        preview: true,
        columns: 4,
        duration: 1000,
        spacing: 10,
        align: 'center',
    });

    // Attach modal functionality to all slider images
    document.querySelectorAll('.sliderm__slide img').forEach(img => {
        img.addEventListener('click', (e) => {
            const modal = document.getElementById('imageModal');
            const modalImg = document.getElementById('modalImage');
            modal.style.display = 'flex';
            modalImg.src = e.target.src;
        });
    });
}

    
    </script>
 
    <script>
 const inputField = document.querySelector('.chat-input input');
if (inputField) {
  inputField.addEventListener('focus', () => {
    setTimeout(() => {
      inputField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  });
}
</script>
