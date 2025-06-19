<link rel="stylesheet" href="{{ asset('build/assets/css/main.css') }}">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css">
<style>
    @charset "UTF-8";
* {
  box-sizing: border-box;
}
.card1 {
    
    position: relative !important;
    background: #EDDDD4;
    color: #283D3B !important;
    width: 300px;
    height: 450px !important;
    border-radius: 20px;
    overflow: hidden;
    margin: 0 auto;
    text-align: center !important;
    box-shadow: 0 11px 26px 1px #0000004a, inset 0 -16px 90px #C4453640 !important;
}
.card1 h2 {
  margin: 0;
  width: 100%;
  font-size: 30px;
  background: #197278;
  padding: 20px 0;
  color: #EDDDD4;
  box-shadow: inset 0px 5px 4px -4px #ecddd461;
}
.card1 h3 {
  margin: 20px 0;
  font-size: 30px;
  text-shadow: 3px 2px 2px #283d3b38;
}
.card1 p {
  font-style: italic;
  margin: 0 0 30px 0;
  padding: 0 50px;
  text-align: center;
  
}
.card1 ul li:not(:last-child) {
  margin-bottom: 10px;
}
.card1 ul li.aval::before {
  font-family: "Font Awesome 5 Free";
  content: "";
  font-weight: 900;
  font-size: 20px;
  color: #197278;
  width: 40px;
  display: inline-block;
}
.card1 ul li.unaval::before {
  font-family: "Font Awesome 5 Free";
  content: "";
  font-weight: 900;
  font-size: 20px;
  color: #C44536;
  width: 40px;
  display: inline-block;
}
.card-1 h2 {
  background: #197278;
}
.card-1, .card-3 {
  position: relative;
  transform: scale(0.9);
}
.hot-badge::after {
  content: "HOT";
  position: absolute;
  background: linear-gradient(to right, #ffd400, #ffbc00);
  padding: 5px 54px;
  box-shadow: 0 0 5px 3px #715e006e;
  top: 17px;
  right: -46px;
  color: #5d4d00;
  font-family: "Nunito", sans-serif;
  font-size: 16px;
  transform: rotateZ(45deg);
}



</style>



<div class=" my-5">
    <div class="section-header p-4 rounded shadow-sm bg-light"  style="text-align: center;">
    <button class="btn btn-success credit-upsell-topup-submit">
            <span>You have {{$credits_balance}} Credits</span>
            <span class="loading-text"><span class="spinner spinner-border d-none"></span></span>
        </button>
    </div>

 <div class=" mt-5" >
  <div class="row row-cols-1 row-cols-md-2 row-cols-lg-2 g-4" >
            <div class="col ">
                <div class="card1 h-100 border-0 shadow-sm text-center package-standard bg-info text-white card1 card-1">
                    <div class="card1-body card1 card-2 hot-badge">
                    <h2>Basic Package</h2>
    <h3>R175.00</h3>
    <h4><i class="bi bi-coin"></i> 50 credits </h4>
    <ul>
      <li class="aval">5% OFF</li>
      <li class="aval">About 10 responses </li>
      
      <li class="unaval">24/7 support</li>
    </ul>
    <form method="POST" action="{{ route('purchase') }}">
                            @csrf
                            <input type="hidden" name="product_id" value="2">
                            <button type="submit" class="btn btn-primary w-100">Purchase</button>
                        </form>
                    </div>
                </div>
            </div>
            
            
            <div class="col ">
                <div class="card1 h-100 border-0 shadow-sm text-center package-standard bg-info text-white card1 card-1">
                    <div class="card1-body card1 card-2 hot-badge">
                    <h2>Standard Package</h2>
    <h3>R300.00</h3>
    <h4><i class="bi bi-coin"></i> 150 credits </h4>
    <ul>
      <li class="aval">15% OFF</li>
      <li class="aval">About 10 responses </li>
      
      <li class="unaval">24/7 support</li>
    </ul>
    
                        <form method="POST" action="{{ route('purchase') }}">
                            @csrf
                            <input type="hidden" name="product_id" value="2">
                            <button type="submit" class="btn btn-primary w-100">Purchase</button>
                          
                        </form>
                    </div>
                </div>
            </div>
   </div>
          
        <div class="mt-5 text-center">
            <button type="button" class="btn btn-outline-secondary" id="transaction-history-button">
                Transaction History
                <span class="spinner spinner-border d-none"></span>
            </button>
        </div>
    </div>

    <!-- Transaction Log Section -->
    <div class="transaction-log-section mt-4" style="display: none;">
        <div class="container1 p-4 bg-light rounded shadow-sm">
        <div class="">
                  <div class="card-header">
                    <div class="card-head-row card-tools-still-right">
                      <div class="card-title">Transaction History</div>
                      <div class="card-tools">
                        <div class="dropdown">
                          <button class="btn btn-icon btn-clean me-0" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="fas fa-ellipsis-h"></i>
                          </button>
                          <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            <a class="dropdown-item" href="#">Export to PDF</a>
                           
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="card1-body p-0">
                    <div class="table-responsive">
                      <!-- Projects table -->
                      <table class="table align-items-center mb-0">
                        <thead class="thead-light">
                      
                          <tr>
                            <th scope="col">PAYMENT NUMBER</th>
                            <th scope="col" class="text-end">DATE &amp; TIME</th>
                            <th scope="col" class="text-end">CREDITS</th>
                            <th scope="col" class="text-end">STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                        @foreach($transactions as $transaction)
                          <tr>
                            <th scope="row">
                              <span class="btn btn-icon btn-round btn-success btn-sm me-2">
                                <i class="fa fa-check"></i>
                              </span>
                              Payment ID #{{ $transaction->id }}
                            </th>
                            <td class="text-end">{{ $transaction->date_entered->format('d M Y H:i') }}</td>
                            <td class="text-end">{{ $transaction->credits }}</td>
                            <td class="text-end">
                              <span class="badge {{ $transaction->transaction_type == 'Deducted' ? 'badge-danger' : 'badge-success' }}">
                                {{ $transaction->transaction_type }}
                                        </span>
                            </td>
                          </tr>
                          @endforeach
                    @if($transactions->isEmpty())
                        <tr>
                            <td colspan="4" class="text-center">No transactions found.</td>
                        </tr>
                    @endif
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
            
        </div>
    </div>
</div>


<script>
    document.addEventListener('DOMContentLoaded', function () {
        const button = document.getElementById('transaction-history-button');
        const transactionLogSection = document.querySelector('.transaction-log-section');

        button.addEventListener('click', function () {
            transactionLogSection.style.display = transactionLogSection.style.display === 'none' ? 'block' : 'none';
        });
    });
</script>
