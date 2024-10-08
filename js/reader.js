const musicPlayer = document.querySelector('.musicPlayer');
const audio = document.getElementById('myAudio');
const closeButton = document.getElementById('closeButton');
const prevButton = document.getElementById('prevButton');
const playButton = document.getElementById('playButton');
const nextButton = document.getElementById('nextButton');
const slider = document.getElementById('musicSlider');
const txtTitle = document.querySelector('.txtTitle');
const txtProgress = document.querySelector('.txtProgress');
const txtDuration = document.querySelector('.txtDuration');
let audioFiles = [];
let audioPos = 0;
let isSupported = false;
let wakeLock = null;
let isActive = false;

audio.addEventListener('timeupdate', () => {
    const currentTime = audio.currentTime;
    const duration = audio.duration;

    txtProgress.textContent = getFormattedTime((currentTime > 0) ? currentTime : 0);
    txtDuration.textContent = getFormattedTime((duration > 0) ? duration : 0);

    const progress = (currentTime / duration) * 100;
    slider.value = (progress > 0) ? progress : 0;
});

audio.addEventListener('ended', () => {
    if (audioPos < (audioFiles.length - 1)) {
        audioPos++;

        const card = document.querySelector(`#card${audioPos}`);
        card.scrollIntoView();

        audio.src = audioFiles[audioPos];
        txtTitle.textContent = audioPos + 1;
        audio.play();

        skipVisibility();
    } else {
        if (isActive) {
            releaseWakeLock();
        }
    }
});

audio.addEventListener('play', () => {
    playButton.src = "../assets/player-pause-filled.svg";
});

audio.addEventListener('pause', () => {
    playButton.src = "../assets/player-play-filled.svg";
});

closeButton.addEventListener('click', () => {
    if (!audio.paused) {
        audio.pause();
        if (isActive) {
            releaseWakeLock();
        }
    }

    musicPlayer.classList.add('hidden');
});

playButton.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        if (!isActive) {
            setWakeLock();
        }
    } else {
        audio.pause();
        if (isActive) {
            releaseWakeLock();
        }
    }
});

nextButton.addEventListener('click', () => {
    if (audioPos < (audioFiles.length - 1)) {
        audioPos++;

        const card = document.querySelector(`#card${audioPos}`);
        card.scrollIntoView();

        audio.src = audioFiles[audioPos];
        txtTitle.textContent = audioPos + 1;
        audio.play();

        skipVisibility();
    }
});

prevButton.addEventListener('click', () => {
    if (audioPos > 0) {
        audioPos--;

        const card = document.querySelector(`#card${audioPos}`);
        card.scrollIntoView();

        audio.src = audioFiles[audioPos];
        txtTitle.textContent = audioPos + 1;
        audio.play();

        skipVisibility();
    }
});

slider.addEventListener('input', () => {
    if (!audio.paused) {
        audio.pause();
        if (isActive) {
            releaseWakeLock();
        }
    }

    const value = slider.value;
    const duration = audio.duration;
    const currentTime = (value / 100) * duration;

    txtProgress.textContent = getFormattedTime(currentTime);

    audio.currentTime = currentTime;
});

// Get Data
const urlParams = new URLSearchParams(window.location.search);
const surahNum = urlParams.get('surah');

fetch(`https://api-quran-zekoodev.vercel.app/surahs/${surahNum || 1}/`)
    .then(response => response.json())
    .then(data => {
        let cards = '';
        for (var i = 0; i < data.numberOfAyahs; i++) {
            cards += `
                <div class="card" id="card${i}">
                    <div class="actions">
                        <div id="playButton">
                            <img src="../assets/volume.svg" alt="playButton" />
                            <p>Dengarkan</p>
                        </div>
                    </div>
                    <p class="arab">${data.ayahs[i].arab} <span class="number">${konversiAngkaArab(data.ayahs[i].number.inSurah)}</span></p>
                    <p class="translation">${data.ayahs[i].number.inSurah}. ${data.ayahs[i].translation}</p>
                </div>
            `;

            audioFiles.push(data.ayahs[i].audio.alafasy);
        }
        document.querySelector('.card-wrapper').innerHTML = cards;

        const playButtons = document.querySelectorAll('.card .actions #playButton');

        playButtons.forEach((playButton, i) => {
            playButton.addEventListener('click', () => {
                if (audio.src != audioFiles[i]) {
                    if (!audio.paused) {
                        audio.pause();
                    }

                    const card = document.querySelector(`#card${i}`);
                    card.scrollIntoView();

                    audio.src = audioFiles[i];
                    txtTitle.textContent = i + 1;
                    audio.play();

                    if (!isActive) {
                        setWakeLock();
                    }
                } else {
                    if (audio.paused) {
                        audio.play();
                        if (!isActive) {
                            setWakeLock();
                        }
                    } else {
                        audio.pause();
                        if (isActive) {
                            releaseWakeLock();
                        }
                    }
                }

                musicPlayer.classList.remove('hidden');
                audioPos = i;

                skipVisibility();
            });
        });
    })
    .catch((error) => {
        console.error(error);
    });

function konversiAngkaArab(angka) {
    const angkaBiasa = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const angkaArab = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

    let angkaStr = angka.toString();
    let hasil = '';

    for (let i = 0; i < angkaStr.length; i++) {
        let index = angkaBiasa.indexOf(angkaStr[i]);
        hasil += angkaArab[index];
    }

    return hasil;
}

function getFormattedTime(value) {
    return `${('0' + Math.floor(value / 60)).slice(-2)}.${('0' + Math.floor(value % 60)).slice(-2)}`;
}

/* Wake Lock */
if ("wakeLock" in navigator) {
    // console.log("Screen Wake Lock API supported!");
    isSupported = true;
} else {
    // console.log("Wake lock is not supported by this browser.");
}

async function setWakeLock() {
    if (isSupported) {
        try {
            wakeLock = await navigator.wakeLock.request("screen");
            isActive = true;
            // console.log("Wake Lock is active!");

            wakeLock.addEventListener("release", () => {
                // console.log("Wake Lock has been released");
            });
        } catch (err) {
            // console.log(`${err.name}, ${err.message}`);
        }
    }
}

function releaseWakeLock() {
    if (isSupported) {
        wakeLock.release().then(() => {
            wakeLock = null;
            isActive = false;
        });
    }
}

function skipVisibility() {
    if (audioPos == (audioFiles.length - 1)) {
        nextButton.style.opacity = '0.2';
        prevButton.style.opacity = '1';
    } else if (audioPos == 0) {
        nextButton.style.opacity = '1';
        prevButton.style.opacity = '0.2';
    } else {
        nextButton.style.opacity = '1';
        prevButton.style.opacity = '1';
    }
}