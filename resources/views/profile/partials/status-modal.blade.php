<div id="modal-overflow" uk-modal>
    <div class="uk-modal-dialog">

        <button class="uk-modal-close-default" type="button" uk-close></button>

        <div class="uk-modal-header">
            <h2 class="uk-modal-title">Change Lead Status</h2>
        </div>

        <form method="POST" action="{{ route('poststatus') }}">
            @csrf
            <div class="uk-modal-body" style="margin: 20px;" uk-overflow-auto>

                <!-- Expert Selection -->
                <div class="sel">
                    <h4>Who is the expert you hired?</h4>
                    <div class="uk-margin">
                        <select class="uk-select" name="expert" id="expert" required>
                            <option value="">Select expert</option>
                            <option value="0">I hired someone not on the list</option>
                        </select>
                    </div>
                </div>

                <!-- Comment Area -->
                <h4>Type Comment</h4>
                <div class="uk-margin">
                    <textarea class="uk-textarea" rows="5" name="description" placeholder="Comment" required></textarea>
                </div>

                <!-- Hidden Inputs -->
                <input id="xl" name="xl" type="hidden" />
                <input id="status" name="status" type="hidden" />

            </div>

            <div class="uk-modal-footer uk-text-right">
                <button class="uk-button uk-button-default uk-modal-close" type="button">Cancel</button>
                <button class="uk-button uk-button-primary" type="submit">Submit</button>
            </div>
        </form>

    </div>
</div>
