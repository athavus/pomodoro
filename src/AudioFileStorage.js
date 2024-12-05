export class AudioFileStorage {
	constructor() {
		this.storage = localStorage;
	}

	saveAudioFile(fileKey, file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (event) => {
				try {
					const base64Audio = event.target.result;

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

			reader.readAsDataURL(file);
		});
	}

	getAudioFile(fileKey) {
		const storedAudio = this.storage.getItem(fileKey);
		return storedAudio ? JSON.parse(storedAudio) : null;
	}

	removeAudioFile(fileKey) {
		this.storage.removeItem(fileKey);
	}
}