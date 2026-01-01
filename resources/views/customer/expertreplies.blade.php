<x-app-layout>

    <!-- CSRF token hidden input for ajax -->
    <input type="hidden" name="_token" value="{{ csrf_token() }}" />

    <!-- Main Screen -->
    <div id="main-screen">
      <!--  <header>
            <input type="text" placeholder="Ask Meta AI or Search" class="search-bar">
        </header>-->

        @if(count($replyexperts) > 0)
            <section class="chats">
                @php $defaultImg = "https://www.w3schools.com/w3images/avatar2.png"; @endphp

                @foreach($replyexperts as $expert)
                    @php
                        $img = $expert->profile_picture;
                        $path = strlen($img) > 5 ? Storage::url('uploads/' . $img) : $defaultImg;
                    @endphp

                    <div class="chat dexpert" contacted_user_id="{{ $expert->user_id }}" onclick="openChat('{{ $expert->first_name }} {{ $expert->last_name }}', '{{ $path }}')">
                         <img src="{{ $expert->profile_picture ? asset('storage/profile_pictures/' . $expert->profile_picture) : 'https://www.w3schools.com/w3images/avatar2.png' }}" class="chat-avatar">
                        <div class="chat-info">
                            <strong>{{ $expert->first_name }} {{ $expert->last_name }}</strong>
                            <p>Last message · {{ \Carbon\Carbon::parse($expert->last_message_at)->diffForHumans() }}</p>
                        </div>
                    </div>
                @endforeach
            </section>
        @else
            <h3 class="no-experts-message">No Experts</h3>
        @endif
    </div>
    

    <!-- Chat Screen -->
    <div id="chat-screen" style="display: none;">
        <div class=" chat-header sticky-top navbar-expand-lg" style="display: flex; align-items: center; gap: 10px;">
    <button onclick="closeChat()" type="button" class="back-button">← Back</button>
    <a href="#modal-overflow" uk-toggle style="text-decoration: none; color: inherit;">
    <img id="chat-image" src="https://via.placeholder.com/40" alt="User" class="chat-header-avatar">

    <div style="flex-grow: 1;">
        
            <h2 id="chat-name" style="margin: 0;">Chat Name</h2>

            <p class="service-info" style="margin: 0 ; color: gray;">
            {{ $expertnotes[0]->service_name ?? 'No Service Info' }}
        </p>
        </a>
    
<p class="online-status {{ $isOnline ? 'online' : 'offline' }}" style="margin: 0; font-size: 11px;">
    @if ($isOnline)
        Online
    @else
        Last seen: {{ $lastSeenDate ? \Carbon\Carbon::parse($lastSeenDate)->diffForHumans() : 'unknown' }}
    @endif
</p>
    </div>
    <div id="loader" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
z-index: 9999;">
    <div class="uk-position-center">
        <div uk-spinner="ratio: 2"></div> <!-- If you're using UIkit -->
    </div>
</div>

</div>





        <!-- Chat Body -->
        <div class="chatBody" id="chatBody"></div>

     

       <!-- Modal: Expert Info -->
<div id="modal-overflow" uk-modal>
    <div class="uk-modal-dialog">
        <button class="uk-modal-close-default" type="button" uk-close></button>

        <!-- Header -->
        <div class="uk-modal-header header">
            <img id="path" class="avatar path" src="#" alt="Profile Photo">
            <h1 id="name" class="modal-name"></h1>
            <p class="service-info">{{ $expertnotes[0]->service_name ?? '' }}</p>
        </div>

        <!-- Body (Info + Reviews) -->
        <div class="uk-modal-body infod" uk-overflow-auto >

            <!-- Profile Info Area (Populated by JS) -->
            <div class="infod" style="font-size: 14px;"></div>

            <!-- Review Section -->
            <div class="profile-reviews uk-margin-top" style="font-size: 12px;">
                <h3 class="section-title">Leave a Review</h3>

                <!-- Star Rating -->
                <div style="margin-bottom: 10px;">
                    <span class="cursor-pointer" onclick="setRating(1)">&#9733;</span>
                    <span class="cursor-pointer" onclick="setRating(2)">&#9733;</span>
                    <span class="cursor-pointer" onclick="setRating(3)">&#9733;</span>
                    <span class="cursor-pointer" onclick="setRating(4)">&#9733;</span>
                    <span class="cursor-pointer" onclick="setRating(5)">&#9733;</span>
                </div>

                <!-- Textarea -->
                <textarea id="comment" class="uk-textarea" rows="3" placeholder="Write your review..."></textarea>

                <!-- Submit Button -->
                <button class="uk-button uk-button-primary uk-margin-top" onclick="submitReview()">Submit Review</button>

                <!-- Submitted Review List -->
                <ul id="reviewList" class="uk-list uk-list-divider uk-margin-top"></ul>
            </div>

        </div>
    </div>
</div>

   <!-- Input Area -->
        <div class="chat-input">
            <input type="text" id="user_input" placeholder="Type a message..." autocomplete="off" />
            <button id="send-button" disabled>Send</button>
            <emoji-picker id="emojiPicker" style="display:none;"></emoji-picker>
        </div>

        <!-- Hidden Inputs -->
        <input type="hidden" id="xkk" value="{{ $lead_id ?? '' }}">
        <input type="hidden" id="uuus" value="{{ $user_id ?? '' }}">
    <!-- Image Modal -->
    <div id="imageModal" class="modal">
        <span class="close" id="closeModal">&times;</span>
        <img id="modalImage" src="" alt="Zoomed Image">
    </div>

    <!-- External CSS -->
    <link rel="stylesheet" href="https://sliderm.com/dist/1.0.8/sliderm.css" />
    <link rel="stylesheet" href="{{ asset('build/assets/css/expertreplies.css') }}" />

    <!-- External JS -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script> <!-- Added jQuery -->
    <script type="module" src="https://cdn.jsdelivr.net/npm/emoji-picker-element@^1/index.js"></script>
    <script src="https://sliderm.com/dist/1.0.8/sliderm.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.min.js"></script>

<style>

</style>
</x-app-layout>

<script>
document.addEventListener("DOMContentLoaded", function () {
  const emojiPicker = document.getElementById('emojiPicker');
  const userInput = document.getElementById('user_input');
  const sendButton = document.getElementById('send-button');
  const chatBody = document.getElementById('chatBody');
  const imageModal = document.getElementById('imageModal');
  const closeModal = document.getElementById('closeModal');
  const modalImage = document.getElementById('modalImage');

  // Emoji Picker
  if (emojiPicker) {
    emojiPicker.addEventListener('emoji-click', e => {
      userInput.value += e.detail.unicode;
    });
  }

  // Scroll on input focus
  if (userInput) {
    userInput.addEventListener('focus', () => {
      setTimeout(() => {
        userInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    });

    userInput.addEventListener('input', () => {
      sendButton.disabled = userInput.value.trim().length === 0;
    });

    userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendButton.disabled) {
          sendMessage();
        }
      }
    });
  }

  // Initial disable send button
  if (sendButton) sendButton.disabled = true;

  // Send button click
  if (sendButton) {
    sendButton.addEventListener('click', sendMessage);
  }

  // Modal close
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      imageModal.style.display = 'none';
    });
  }

  if (imageModal) {
    imageModal.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        imageModal.style.display = 'none';
      }
    });
  }

  // Auto-open first expert chat
  const firstDexpert = document.querySelector('.dexpert:first-child');
  if (firstDexpert) firstDexpert.click();
});

function openChat(name, imageUrl) {
  const fallbackImage = "/images/default-avatar.png";
  const finalImage = imageUrl?.startsWith('http') ? imageUrl : fallbackImage;

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
      const msgEl = document.createElement('div');
      msgEl.className = 'message user';
      msgEl.innerHTML = `
        <img class="avatar" src="https://www.w3schools.com/w3images/avatar2.png">
        <div>
          <p>${message}</p>
          <span class="timestamp">${new Date().toLocaleString()}</span>
        </div>`;
      chatBody.appendChild(msgEl);
      setTimeout(() => {
        chatBody.scrollTop = chatBody.scrollHeight;
      }, 50);

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

function startRecording() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Speech recognition not supported");
    return;
  }
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById('user_input').value += transcript;
  };
  recognition.start();
}

// Sliderm activation
function activateSlide() {
  const sliderElement = document.querySelector('#example-slider');
  if (!sliderElement) return;

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
document.addEventListener('click', async function (e) {
  const target = e.target.closest('.dexpert');
  if (!target) return;

  const lead_id = document.getElementById("xkk").value;
  const contacted_user_id = target.getAttribute("contacted_user_id");
  const _token = document.querySelector('input[name="_token"]').value;
  const chatBody = document.getElementById("chatBody");

  // Update hidden input
  document.getElementById("uuus").value = contacted_user_id;

  // Clear and show loading message
  chatBody.innerHTML = "Loading...";
  document.getElementById("loader").style.display = "block"; // Show loader

  try {
    const response = await fetch('/getleadnotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': _token
      },
      body: JSON.stringify({
        lead_id,
        contacted_user_id,
        _token
      })
    });

    const data = await response.json();
    const { expertnotes, details, name, profile_pic: path } = data;

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
      return dateObj.toLocaleDateString('en-ZA', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    };

    const formatTimestamp = (dateStr) => {
      const now = new Date();
      const msgDate = new Date(dateStr);

      if (now.toDateString() === msgDate.toDateString()) {
        return msgDate.toLocaleTimeString([], {
          hour: '2-digit', minute: '2-digit', hour12: false
        });
      }

      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      if (yesterday.toDateString() === msgDate.toDateString()) {
        return "Yesterday";
      }

      return msgDate.toLocaleDateString('en-ZA', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    };

    for (const msg of expertnotes) {
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

    chatBody.innerHTML = txt;

    setTimeout(() => {
      chatBody.scrollTop = chatBody.scrollHeight;
    }, 100);

    document.querySelector(".infod").innerHTML = details;
    document.getElementById("name").textContent = name;
    document.querySelector(".path").src = path;

    activateSlide(); // Optional re-init of slider
  } catch (error) {
    console.error('Error fetching lead notes:', error);
    chatBody.innerHTML = "<p style='color:red;'>Failed to load messages.</p>";
  } finally {
    document.getElementById("loader").style.display = "none"; // Hide loader
  }
});

</script>
<script>
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
        rating: currentRating
    };

    $.ajax({
        url: '/postrating',
        type: 'POST',
        data: obj,
        success: function (data) {
            if (data.status === "success") {
                let reviewList = document.getElementById("reviewList");
                let newReview = document.createElement("li");
                newReview.className = "border p-3 rounded-lg bg-gray-50";
                newReview.innerHTML = `<strong>⭐ ${currentRating} Stars</strong> - ${comment}`;

                reviewList.appendChild(newReview);
                document.getElementById("comment").value = "";
                setRating(0);
            }
        },
        error: function (xhr, status, error) {
            console.error('Error:', status, error);
        }
    });
}
</script>
