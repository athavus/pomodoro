class PomodoroTimer {
	constructor() {
		this.workTime = this.loadWorkTime();
		this.breakTime = 5 * 60;
		this.timeLeft = this.workTime;
		this.timerInterval = null;
		this.isWorking = true;
		this.isPaused = true;

		this.timerDisplay = document.getElementById("timer-section");
		this.startBtn = document.getElementById("startBtn");
		this.pauseBtn = document.getElementById("pauseBtn");
		this.resetBtn = document.getElementById("resetBtn");
		this.timeInput = document.getElementById("timeInput");
		this.setTimeBtn = document.getElementById("setTimeBtn");
		this.themeToggle = document.getElementById("themeToggle");
		this.musicToggle = document.getElementById("musicToggle");

		this.modal = document.getElementById("modal");
		this.openEditSectionBtn = document.getElementById("open-edit-section");
		this.closeModalBtn = document.getElementById("modal");

		this.iconTheme = document.getElementById("theme-icon");
		this.iconMusic = document.getElementById("music-icon");
		this.editPen = document.getElementById("pen");

		this.bindEvents();
		this.loadThemePreference();
		this.loadMutedPreference();

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

		this.openEditSectionBtn.addEventListener("click", () => this.openModal());
		this.closeModalBtn.addEventListener("click", (e) => {
			if (e.target === this.modal) this.closeModal();
		});
	}

	openModal() {
		this.modal.style.display = "flex";
	}

	closeModal() {
		this.modal.style.display = "none";
	}

	loadThemePreference() {
		const savedTheme = localStorage.getItem("pomodoroTheme");
		if (savedTheme) {
			document.body.classList.toggle("dark-theme", savedTheme === "dark");

			for (const element of document.querySelectorAll('[data-dark][data-light]')) {
				element.src = element.getAttribute(`data-${savedTheme}`);
			}
		}
	}

	toggleTheme() {
		document.body.classList.toggle("dark-theme");
		let theme = document.body.classList.contains("dark-theme") ? "dark" : "light";

		for (const element of document.querySelectorAll('[data-dark][data-light]')) {
			element.src = element.getAttribute(`data-${theme}`);
		}

		theme = theme === 'dark' ? 'light' : 'dark' 

		this.iconMusic.src = localStorage.getItem('pomodoroMuted') === "true"
		? `assets/${theme}-mute.png`
		: `assets/${theme}-music.png`
		
		localStorage.setItem("pomodoroTheme", theme);
	}

	loadMutedPreference() {
		const savedMuted = localStorage.getItem("pomodoroMuted");
		let savedTheme = localStorage.getItem("pomodoroTheme");

		const elementsToMuteOrPlay = document.querySelectorAll("video, audio")
		
		savedTheme = savedTheme === "dark"
			? 'light'
			: 'dark'

		if (savedMuted) {
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
		const theme = document.body.classList.contains("dark-theme") ? "light" : "dark";
		const elementsToMuteOrPlay = document.querySelectorAll("video, audio")
		let muted;
		
		if (this.iconMusic.getAttribute("src") === `assets/${theme}-music.png`) {
			this.iconMusic.setAttribute("src", `assets/${theme}-mute.png`);
			muted = true;
			
			for (const element of elementsToMuteOrPlay) {
				element.mute = true;
				element.pause();
			}
		} else if (this.iconMusic.getAttribute("src") === `assets/${theme}-mute.png`) {
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
			this.closeModal();
		} else {
			alert('o tempo máximo\npermitido é entre 1 e 60');
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