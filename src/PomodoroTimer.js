import { ModalManager } from './ModalManager.js';
import { AudioFileStorage } from './AudioFileStorage.js';

export class PomodoroTimer {
	constructor() {
		this.workTime = this.loadWorkTime();
		this.breakTime = this.loadBreakTime();
		this.timeLeft = this.workTime;
		this.timerInterval = null;
		this.isWorking = true;
		this.isPaused = true;
		this.completedPomodoros = this.loadCompletedPomodoros();

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
		
		// Inicializar AudioFileStorage
		this.audioStorage = new AudioFileStorage();
		this.pomodoroAudioInput = document.getElementById("pomodoro-audio");
		this.breakAudioInput = document.getElementById("break-audio");
		this.loopAudioCheckbox = document.getElementById("loop-audio");

		// Elementos de áudio
		this.currentAudio = null;

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

		this.loadSavedAudios();
		this.bindEvents();
		this.loadThemePreference();
		this.requestNotificationPermission();

		this.timerDisplay.textContent = this.formatTime(this.workTime);
		this.timeInput.value = Math.floor(this.workTime / 60);
		
		// Adicionar input para tempo de descanso
		this.addBreakTimeInput();
	}

	loadWorkTime() {
		const savedWorkTime = localStorage.getItem("pomodoroWorkTime");
		return savedWorkTime ? Number(savedWorkTime) : 25 * 60;
	}

	loadBreakTime() {
		const savedBreakTime = localStorage.getItem("pomodoroBreakTime");
		return savedBreakTime ? Number(savedBreakTime) : 5 * 60;
	}

	loadCompletedPomodoros() {
		const saved = localStorage.getItem("completedPomodoros");
		return saved ? Number(saved) : 0;
	}

	saveCompletedPomodoros() {
		localStorage.setItem("completedPomodoros", this.completedPomodoros);
	}

	addBreakTimeInput() {
		const settingsDiv = document.querySelector("#edit-timer-modal #settings");
		if (!settingsDiv) return;

		const breakTimeDiv = document.createElement("div");
		breakTimeDiv.style.marginTop = "15px";
		breakTimeDiv.innerHTML = `
			<h3 style="font-size: small; font-family: Jetbrains Mono; margin-bottom: 10px;">
				TEMPO DE DESCANSO
			</h3>
			<div style="display: flex; gap: 10px;">
				<input type="number" id="breakTimeInput" value="${Math.floor(this.breakTime / 60)}" min="1" max="30">
				<button id="setBreakTimeBtn">
					<img data-dark="assets/images/light-clock.png" data-light="assets/images/dark-clock.png" src="assets/images/dark-clock.png">
				</button>
			</div>
		`;
		settingsDiv.appendChild(breakTimeDiv);

		document.getElementById("setBreakTimeBtn").addEventListener("click", () => {
			this.setCustomBreakTime();
		});
	}

	bindEvents() {
		this.startBtn.addEventListener("click", () => this.startTimer());
		this.pauseBtn.addEventListener("click", () => this.pauseTimer());
		this.resetBtn.addEventListener("click", () => this.resetTimer());
		this.setTimeBtn.addEventListener("click", () => this.setCustomTime());
		this.themeToggle.addEventListener("click", () => this.toggleTheme());
		this.musicToggle.addEventListener("click", () => this.toggleMusic());

		this.pomodoroAudioInput.addEventListener("change", (event) => {
			const file = event.target.files[0];
			if (file) {
				this.audioStorage
					.saveAudioFile("pomodoroAudio", file)
					.then((audioInfo) => {
						console.log("Pomodoro audio saved:", audioInfo);
						this.updateAudioPreview("pomodoro-preview", audioInfo);
					})
					.catch(console.error);
			}
		});

		this.breakAudioInput.addEventListener("change", (event) => {
			const file = event.target.files[0];
			if (file) {
				this.audioStorage
					.saveAudioFile("breakAudio", file)
					.then((audioInfo) => {
						console.log("Break audio saved:", audioInfo);
						this.updateAudioPreview("break-preview", audioInfo);
					})
					.catch(console.error);
			}
		});

		this.loopAudioCheckbox.addEventListener("change", (event) => {
			localStorage.setItem("pomodoroLoopAudio", event.target.checked);
		});

		// Atalhos de teclado
		document.addEventListener("keydown", (e) => {
			if (e.code === "Space" && !e.target.matches("input")) {
				e.preventDefault();
				this.isPaused ? this.startTimer() : this.pauseTimer();
			}
			if (e.code === "KeyR" && !e.target.matches("input")) {
				e.preventDefault();
				this.resetTimer();
			}
		});
	}

	requestNotificationPermission() {
		if ("Notification" in window && Notification.permission === "default") {
			Notification.requestPermission();
		}
	}

	showNotification(title, body) {
		if ("Notification" in window && Notification.permission === "granted") {
			new Notification(title, {
				body: body,
				icon: "assets/images/icon.png",
				tag: "pomodoro-notification",
				requireInteraction: true,
			});
		}
	}

	loadThemePreference() {
		const savedTheme = localStorage.getItem("pomodoroTheme");
		if (savedTheme) {
			document.body.classList.toggle("dark-theme", savedTheme === "dark");

			for (const element of document.querySelectorAll("[data-dark][data-light]")) {
				element.src = element.getAttribute(`data-${savedTheme}`);
			}
		}

		this.loadMutedPreference();
		this.loadLoopPreference();
	}

	loadLoopPreference() {
		const loopEnabled = localStorage.getItem("pomodoroLoopAudio") === "true";
		if (this.loopAudioCheckbox) {
			this.loopAudioCheckbox.checked = loopEnabled;
		}
	}

	toggleTheme() {
		document.body.classList.toggle("dark-theme");
		const theme = document.body.classList.contains("dark-theme") ? "dark" : "light";

		for (const element of document.querySelectorAll("[data-dark][data-light]")) {
			element.src = element.getAttribute(`data-${theme}`);
		}

		localStorage.setItem("pomodoroTheme", theme);
		this.loadMutedPreference();
	}

	loadMutedPreference() {
		const savedMuted = localStorage.getItem("pomodoroMuted");
		let savedTheme = localStorage.getItem("pomodoroTheme");
		savedTheme = savedTheme === "dark" ? "light" : "dark";

		if (savedMuted === "true") {
			this.iconMusic.setAttribute("src", `assets/images/${savedTheme}-mute.png`);
		} else {
			this.iconMusic.setAttribute("src", `assets/images/${savedTheme}-music.png`);
		}
	}

	toggleMusic() {
		const theme = document.body.classList.contains("dark-theme") ? "light" : "dark";
		let muted;

		if (this.iconMusic.getAttribute("src") === `assets/images/${theme}-music.png`) {
			this.iconMusic.setAttribute("src", `assets/images/${theme}-mute.png`);
			muted = true;
			this.stopCurrentAudio();
		} else {
			this.iconMusic.setAttribute("src", `assets/images/${theme}-music.png`);
			muted = false;
		}

		localStorage.setItem("pomodoroMuted", muted);
	}

	updateAudioPreview(previewId, audioInfo) {
		const previewElement = document.getElementById(previewId);
		previewElement.innerHTML = `
			<audio controls style="width: 100%; margin-top: 8px;">
				<source src="${audioInfo.base64}" type="${audioInfo.type}">
				Your browser does not support the audio tag.
			</audio>
		`;
	}

	loadSavedAudios() {
		const pomodoroAudio = this.audioStorage.getAudioFile("pomodoroAudio");
		const breakAudio = this.audioStorage.getAudioFile("breakAudio");

		if (pomodoroAudio) {
			this.updateAudioPreview("pomodoro-preview", pomodoroAudio);
		}

		if (breakAudio) {
			this.updateAudioPreview("break-preview", breakAudio);
		}
	}

	playAudio(type) {
		const isMuted = localStorage.getItem("pomodoroMuted") === "true";
		if (isMuted) return;

		const audioInfo = this.audioStorage.getAudioFile(
			type === "work" ? "pomodoroAudio" : "breakAudio"
		);

		if (!audioInfo) return;

		this.stopCurrentAudio();

		this.currentAudio = new Audio(audioInfo.base64);
		this.currentAudio.loop = localStorage.getItem("pomodoroLoopAudio") === "true";
		
		this.currentAudio.play().catch((error) => {
			console.error("Erro ao tocar áudio:", error);
		});
	}

	stopCurrentAudio() {
		if (this.currentAudio) {
			this.currentAudio.pause();
			this.currentAudio.currentTime = 0;
			this.currentAudio = null;
		}
	}

	setCustomTime() {
		const customTime = Number.parseInt(this.timeInput.value);
		if (customTime > 0 && customTime <= 120) {
			const workTimeInSeconds = customTime * 60;
			localStorage.setItem("pomodoroWorkTime", workTimeInSeconds);

			this.workTime = workTimeInSeconds;
			if (this.isWorking) {
				this.timeLeft = this.workTime;
				this.timerDisplay.textContent = this.formatTime(this.timeLeft);
			}
			this.modalManager.closeModal("edit-timer-modal");
		} else {
			alert("O tempo deve estar entre 1 e 120 minutos");
		}
	}

	setCustomBreakTime() {
		const breakTimeInput = document.getElementById("breakTimeInput");
		const customTime = Number.parseInt(breakTimeInput.value);
		
		if (customTime > 0 && customTime <= 30) {
			const breakTimeInSeconds = customTime * 60;
			localStorage.setItem("pomodoroBreakTime", breakTimeInSeconds);

			this.breakTime = breakTimeInSeconds;
			if (!this.isWorking) {
				this.timeLeft = this.breakTime;
				this.timerDisplay.textContent = this.formatTime(this.timeLeft);
			}
			this.modalManager.closeModal("edit-timer-modal");
		} else {
			alert("O tempo de descanso deve estar entre 1 e 30 minutos");
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
		this.stopCurrentAudio();
		this.isWorking = true;
		this.timeLeft = this.workTime;
		this.timerDisplay.textContent = this.formatTime(this.timeLeft);
		this.startBtn.style.display = "inline-block";
		this.pauseBtn.style.display = "none";
		this.isPaused = true;
		
		// Atualizar o visual
		document.body.classList.remove("break-mode");
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
		
		// Tocar áudio e mostrar notificação
		if (this.isWorking) {
			this.completedPomodoros++;
			this.saveCompletedPomodoros();
			this.playAudio("work");
			this.showNotification(
				"Pomodoro Completo! 🎉",
				`Você completou ${this.completedPomodoros} pomodoro(s) hoje. Hora de descansar!`
			);
			document.body.classList.add("break-mode");
		} else {
			this.playAudio("break");
			this.showNotification(
				"Descanso Terminado! 💪",
				"Hora de voltar ao trabalho com foco total!"
			);
			document.body.classList.remove("break-mode");
		}

		this.isWorking = !this.isWorking;
		this.timeLeft = this.isWorking ? this.workTime : this.breakTime;
		this.timerDisplay.textContent = this.formatTime(this.timeLeft);
		
		// Auto-iniciar próximo ciclo
		this.startTimer();
	}

	formatTime(seconds) {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	}
}

// Criando a instância do PomodoroTimer
new PomodoroTimer();
