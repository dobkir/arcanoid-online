game.modalChoosingLevel = {
  modal: null,
  modalContent: null,

  modalChoosingLevel() {
    return (`
        <div class="modal__content">
          <div class="modal__greeting">
            <h1 class="modal__greeting--main">Welcome to Arkanoid!</h1>
            <h2 class="modal__greeting--secondary">Choose your level to start the game</h2>
          </div>
          <div class="modal__buttonsarea">
            <button 
            class="modal__button button__beginnerLvl" 
            type="button"
            name="modalChooseButton"
            value="beginner">
              beginner
            </button>
            <button 
            class="modal__button button__gamerLvl" 
            type="button" 
            name="modalChooseButton"
            value="gamer">
              gamer
            </button>
            <button 
            class="modal__button button__professionalLvl" 
            type="button" 
            name="modalChooseButton"
            value="professional">
              professional
            </button>
          </div>
        </div> 
    `)
  },

  openModal() {
    this.disableScroll();
    this.modal = document.createElement("div");
    this.modal.classList.add("modal");
    this.modal.insertAdjacentHTML("beforeend", this.modalChoosingLevel());
    document.body.append(this.modal);
    this.modalContent = document.querySelector(".modal__content");
    this.modal.classList.add("active");
    this.modalContent.classList.add("active");
  },

  closeModal() {
    this.modalContent.classList.remove("active")
    this.modal.classList.remove("active");
    this.modal.removeChild(this.modalContent);
    this.modal.remove();
    this.enableScroll();
    ;
  },

  // =========  Blocked and unblocked scroll of the page  ========= //

  disableScroll() {
    // The Scroll should not recalculate the width.
    if (document.disableScroll) return;
    // Calculating the scroll width.
    const widthScroll = window.innerWidth - document.body.offsetWidth;

    // When function disabledScroll() is active, parameter disabledScroll is true.
    document.disabledScroll = true;

    // Creating a new property inside the document body in which
    // writing the position of scrolling (window.scrollY).
    document.body.dbScrollY = window.scrollY;

    document.body.style.cssText = `
      position: fixed;
      /* Stopping of jumping content on height */
      top: ${-window.scrollY}px;
      left: 0;
      width: 100%;
      height: 100vh;
      /* Hiding the overflow. */
      overflow: hidden;
      /* Stopping of jumping content when the scroll line became hidden. */
      padding-right: ${widthScroll}px;
    `;
  },

  enableScroll() {
    // When function disabledScroll() is active, parameter disabledScroll is false.
    document.disabledScroll = true;

    document.body.style.cssText = '';
    window.scroll({
      top: document.body.dbScrollY
    });
  },

  // ======  End of Blocked and unblocked scroll of the page  ====== //

};