class AudioFileStorage {
	constructor() {
		this.storage = localStorage;
	}

	// Salva um arquivo de áudio como base64
	saveAudioFile(fileKey, file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (event) => {
				try {
					// Salva o arquivo como base64
					const base64Audio = event.target.result;

					// Salva informações do arquivo
					const audioInfo = {
						name: file.name,
						type: file.type,
						size: file.size,
						base64: base64Audio
					};

					this.storage.setItem(fileKey, JSON.stringify(audioInfo));
					resolve(audioInfo);
				} catch (error) {
					reject(error);
				}
			};

			reader.onerror = (error) => {
				reject(error);
			};

			// Lê o arquivo como base64
			reader.readAsDataURL(file);
		});
	}

	// Recupera um arquivo de áudio salvo
	getAudioFile(fileKey) {
		const storedAudio = this.storage.getItem(fileKey);
		return storedAudio ? JSON.parse(storedAudio) : null;
	}

	// Remove um arquivo de áudio
	removeAudioFile(fileKey) {
		this.storage.removeItem(fileKey);
	}
}

class ModalManager {
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

class PomodoroTimer {
	constructor() {
		this.workTime = this.loadWorkTime();
		this.breakTime = 5 * 60;
		this.timeLeft = this.workTime;
		this.timerInterval = null;
		this.isWorking = true;
		this.isPaused = true;

		// Seleção de elementos
		this.timerDisplay = document.getElementById("timer-section");
		this.startBtn = document.getElementById("startBtn");
		this.pauseBtn = document.getElementById("pauseBtn");
		this.resetBtn = document.getElementById("resetBtn");
		this.timeInput = document.getElementById("timeInput");
		this.setTimeBtn = document.getElementById("setTimeBtn");
		this.themeToggle = document.getElementById("themeToggle");
		this.musicToggle = document.getElementById("musicToggle");

		this.iconTheme = document.getElementById("theme-icon");
		this.iconMusic = document.getElementById("music-icon");
		this.editPen = document.getElementById("pen");

		// Inicializar ModalManager
		this.modalManager = new ModalManager();

		// Registrar modais usando ModalManager
		this.modalManager.registerModal(
			"edit-timer-modal",
			"open-edit-section",
			"edit-timer-modal",
		);
		this.modalManager.registerModal(
			"options-modal",
			"open-options-section",
			"options-modal",
		);

		this.bindEvents();
		this.loadThemePreference();

		this.timerDisplay.textContent = this.formatTime(this.workTime);
		this.timeInput.value = Math.floor(this.workTime / 60);
	}

	loadWorkTime() {
		const savedWorkTime = localStorage.getItem("pomodoroWorkTime");
		return savedWorkTime ? Number(savedWorkTime) : 25 * 60;
	}

	bindEvents() {
		this.startBtn.addEventListener("click", () => this.startTimer());
		this.pauseBtn.addEventListener("click", () => this.pauseTimer());
		this.resetBtn.addEventListener("click", () => this.resetTimer());
		this.setTimeBtn.addEventListener("click", () => this.setCustomTime());
		this.themeToggle.addEventListener("click", () => this.toggleTheme());
		this.musicToggle.addEventListener("click", () => this.toggleMusic());
	}

	loadThemePreference() {
		const savedTheme = localStorage.getItem("pomodoroTheme");
		if (savedTheme) {
			document.body.classList.toggle("dark-theme", savedTheme === "dark");

			for (const element of document.querySelectorAll(
				"[data-dark][data-light]",
			)) {
				element.src = element.getAttribute(`data-${savedTheme}`);
			}
		}

		this.loadMutedPreference();
	}

	toggleTheme() {
		document.body.classList.toggle("dark-theme");
		const theme = document.body.classList.contains("dark-theme")
			? "dark"
			: "light";

		for (const element of document.querySelectorAll(
			"[data-dark][data-light]",
		)) {
			element.src = element.getAttribute(`data-${theme}`);
		}

		localStorage.setItem("pomodoroTheme", theme);

		this.loadMutedPreference();
	}

	loadMutedPreference() {
		const savedMuted = localStorage.getItem("pomodoroMuted");
		let savedTheme = localStorage.getItem("pomodoroTheme");

		const elementsToMuteOrPlay = document.querySelectorAll("video, audio");

		savedTheme = savedTheme === "dark" ? "light" : "dark";

		if (savedMuted === "true") {
			this.iconMusic.setAttribute("src", `assets/${savedTheme}-mute.png`);
			for (const element of elementsToMuteOrPlay) {
				element.mute = true;
				element.pause();
			}
		} else {
			this.iconMusic.setAttribute("src", `assets/${savedTheme}-music.png`);
			for (const element of elementsToMuteOrPlay) {
				element.mute = false;
				element.play();
			}
		}
	}

	toggleMusic() {
		const theme = document.body.classList.contains("dark-theme")
			? "light"
			: "dark";
		const elementsToMuteOrPlay = document.querySelectorAll("video, audio");
		let muted;

		if (this.iconMusic.getAttribute("src") === `assets/${theme}-music.png`) {
			this.iconMusic.setAttribute("src", `assets/${theme}-mute.png`);
			muted = true;

			for (const element of elementsToMuteOrPlay) {
				element.mute = true;
				element.pause();
			}
		} else if (
			this.iconMusic.getAttribute("src") === `assets/${theme}-mute.png`
		) {
			this.iconMusic.setAttribute("src", `assets/${theme}-music.png`);
			muted = false;

			for (const element of elementsToMuteOrPlay) {
				element.mute = false;
				element.play();
			}
		}

		localStorage.setItem("pomodoroMuted", muted);
	}

	setCustomTime() {
		const customTime = Number.parseInt(this.timeInput.value);
		if (customTime > 0 && customTime <= 60) {
			const workTimeInSeconds = customTime * 60;
			localStorage.setItem("pomodoroWorkTime", workTimeInSeconds);

			this.workTime = workTimeInSeconds;
			this.timeLeft = this.workTime;
			this.timerDisplay.textContent = this.formatTime(this.timeLeft);
			this.modalManager.closeModal("edit-timer-modal");
		} else {
			alert("o tempo máximo\npermitido é entre 1 e 60");
		}
	}

	startTimer() {
		if (this.isPaused) {
			this.timerInterval = setInterval(() => this.updateTimer(), 1000);
			this.startBtn.style.display = "none";
			this.pauseBtn.style.display = "inline-block";
			this.isPaused = false;
		}
	}

	pauseTimer() {
		clearInterval(this.timerInterval);
		this.startBtn.style.display = "inline-block";
		this.pauseBtn.style.display = "none";
		this.isPaused = true;
	}

	resetTimer() {
		clearInterval(this.timerInterval);
		this.isWorking = true;
		this.timeLeft = this.workTime;
		this.timerDisplay.textContent = this.formatTime(this.timeLeft);
		this.startBtn.style.display = "inline-block";
		this.pauseBtn.style.display = "none";
		this.isPaused = true;
	}

	updateTimer() {
		if (this.timeLeft > 0) {
			this.timeLeft--;
			this.timerDisplay.textContent = this.formatTime(this.timeLeft);
		} else {
			this.switchMode();
		}
	}

	switchMode() {
		clearInterval(this.timerInterval);
		this.isWorking = !this.isWorking;

		if (this.isWorking) {
			this.timeLeft = this.workTime;
		} else {
			this.timeLeft = this.breakTime;
		}

		this.timerDisplay.textContent = this.formatTime(this.timeLeft);
		this.startTimer();
	}

	formatTime(seconds) {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`;
	}
}

new PomodoroTimer();
