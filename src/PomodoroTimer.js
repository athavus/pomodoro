import { ModalManager } from './ModalManager.js';
import { AudioFileStorage } from './AudioFileStorage.js';

export class PomodoroTimer {
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

		this.iconTheme = document.getElementById("theme-icon");
		this.editPen = document.getElementById("pen");

		// Inicializar ModalManager
		this.modalManager = new ModalManager();
    // Inicializar AudioFileStorage
    this.audioStorage = new AudioFileStorage();
    this.pomodoroAudioInput = document.getElementById("pomodoro-audio");
    this.breakAudioInput = document.getElementById("break-audio");

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
			this.iconMusic.setAttribute("src", `assets/images/${savedTheme}-mute.png`);
			for (const element of elementsToMuteOrPlay) {
				element.mute = true;
				element.pause();
			}
		} else {
			this.iconMusic.setAttribute("src", `assets/images/${savedTheme}-music.png`);
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

		if (this.iconMusic.getAttribute("src") === `assets/images/${theme}-music.png`) {
			this.iconMusic.setAttribute("src", `assets/images/${theme}-mute.png`);
			muted = true;

			for (const element of elementsToMuteOrPlay) {
				element.mute = true;
				element.pause();
			}
		} else if (
			this.iconMusic.getAttribute("src") === `assets/images/${theme}-mute.png`
		) {
			this.iconMusic.setAttribute("src", `assets/images/${theme}-music.png`);
			muted = false;

			for (const element of elementsToMuteOrPlay) {
				element.mute = false;
				element.play();
			}
		}

		localStorage.setItem("pomodoroMuted", muted);
	}

  updateAudioPreview(previewId, audioInfo) {
    const previewElement = document.getElementById(previewId);
    previewElement.innerHTML = `<audio controls>
      <source src="${audioInfo.base64}" type="${audioInfo.type}">
      Your browser does not support the audio tag.
    </audio>`;
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

// Criando a instância do PomodoroTimer
new PomodoroTimer();