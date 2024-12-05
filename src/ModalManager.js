export class ModalManager {
	constructor() {
		this.modals = {};
	}

	registerModal(modalId, openButtonId, closeButtonId) {
		const modal = document.getElementById(modalId);
		const openButton = document.getElementById(openButtonId);
		const closeButton = document.getElementById(closeButtonId);

		if (!modal || !openButton || !closeButton) {
			console.error(`Erro ao registrar modal: ${modalId}`);
			return null;
		}

		const modalObj = {
			element: modal,
			open: () => {
				modal.style.display = "flex";
			},
			close: () => {
				modal.style.display = "none";
			},
		};

		openButton.addEventListener("click", modalObj.open);

		closeButton.addEventListener("click", (e) => {
			if (e.target === modal) {
				modalObj.close();
			}
		});

		this.modals[modalId] = modalObj;

		return modalObj;
	}

	openModal(modalId) {
		const modal = this.modals[modalId];
		if (modal) {
			modal.open();
		} else {
			console.error(`Modal não encontrado: ${modalId}`);
		}
	}

	closeModal(modalId) {
		const modal = this.modals[modalId];
		if (modal) {
			modal.close();
		} else {
			console.error(`Modal não encontrado: ${modalId}`);
		}
	}
}