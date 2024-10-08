// Get Data
let cards = '';
let dataError = false;
let qdata = [];

fetch("https://api-quran-zekoodev.vercel.app/surahs/")
    .then(response => response.json())
    .then(data => {
        cards = '';
        for (var i = 0; i < data.length; i++) {
            cards += `
                <div
                    class="card"
                    style="animation: fadeIn 0.5s cubic-bezier(0.47, 1.64, 0.41, 0.8) ${0.05 * i}s forwards;"
                    onclick="openSurah(${data[i].number});"
                >
                    <p class="no-surah">${data[i].number}</p>
                    <div class="meta">
                        <p class="surah">${data[i].name}</p>
                        <p class="detail">${data[i].revelation} • ${data[i].numberOfAyahs} Ayat</p>
                        <p class="translation">("${data[i].translation}")</p>
                    </div>
                </div>
            `;
        }
        document.querySelector('.content .card-wrapper').innerHTML = cards;

        document.querySelector('.preloader').style.display = 'none';
        qdata = data;
    })
    .catch((error) => {
        document.querySelector('.content .card-wrapper').innerHTML = `<p class="error-text">Mohon maaf, sepertinya terjadi masalah pada server kami.</p>`;

        document.querySelector('.preloader').style.display = 'none';
        dataError = true;
    });

// Sort
const buttonSort = document.querySelector('.content .control .sort');
const textSort = document.querySelector('.content .control .sort .sort-text');
const imgSort = document.querySelector('.content .control .sort img');
let isAscending = false;

buttonSort.addEventListener('click', () => {
    if (!dataError) {
        qdata.reverse();

        cards = '';
        for (var i = 0; i < qdata.length; i++) {
            cards += `
            <div
                class="card"
                style="animation: fadeIn 0.5s cubic-bezier(0.47, 1.64, 0.41, 0.8) ${0.05 * i}s forwards;"
                onclick="openSurah(${qdata[i].number});"
            >
                <p class="no-surah">${qdata[i].number}</p>
                <div class="meta">
                    <p class="surah">${qdata[i].name}</p>
                    <p class="detail">${qdata[i].revelation} • ${qdata[i].numberOfAyahs} Ayat</p>
                    <p class="translation">("${qdata[i].translation}")</p>
                </div>
            </div>
        `;
        }
        document.querySelector('.content .card-wrapper').innerHTML = cards;

        if (isAscending) {
            textSort.textContent = 'Menurun';
            imgSort.src = '../assets/chevron-down.svg';
            isAscending = false;
        } else {
            textSort.textContent = 'Menaik';
            imgSort.src = '../assets/chevron-up.svg';
            isAscending = true;
        }
    }
});

// Search
const searchContainer = document.querySelector('.search-container');
const closeSearch = document.querySelector('.close-search');
const searchInput = document.querySelector('input');

searchInput.addEventListener('input', () => {
    let cards = '';
    let pos = 0;

    for (var i = 0; i < qdata.length; i++) {
        if (qdata[i].name.toLowerCase().includes(searchInput.value.toLowerCase())) {
            cards += `
                <div
                    class="card"
                    style="animation: fadeIn 0.5s cubic-bezier(0.47, 1.64, 0.41, 0.8) ${0.05 * pos}s forwards;"
                    onclick="openSurah(${qdata[i].number});"
                >
                    <p class="no-surah">${qdata[i].number}</p>
                    <div class="meta">
                        <p class="surah">${qdata[i].name}</p>
                        <p class="detail">${qdata[i].revelation} • ${qdata[i].numberOfAyahs} Ayat</p>
                        <p class="translation">("${qdata[i].translation}")</p>
                    </div>
                </div>
            `;
            pos++;
        }
    }

    document.querySelector('.search-container .card-wrapper').innerHTML = cards;
});

function search() {
    if (!dataError) {
        searchContainer.classList.toggle('active');
        searchInput.disabled = false;
        document.querySelector('.search-container .card-wrapper').innerHTML = '';
        setTimeout(() => {
            document.querySelector('.search-container .card-wrapper').innerHTML = cards;
            searchInput.focus();
        }, 200);
    }
}

closeSearch.addEventListener('click', () => {
    searchInput.disabled = true;
    setTimeout(() => {
        searchContainer.classList.toggle('active');
        searchInput.value = '';
    }, 200);
});

// Open Surah
function openSurah(i) {
    if (searchContainer.classList.contains('active')) {
        closeSearch.click();
        setTimeout(() => {
            window.open(`reader.html?surah=${i}`, '_self');
        }, 200);
    } else {
        window.open(`reader.html?surah=${i}`, '_self');
    }
}

// Navigation Visibility
const nav = document.querySelector('.header .nav');
const header = document.querySelector('.header');

window.onscroll = () => {
    if (window.scrollY > (header.offsetHeight - nav.offsetHeight)) {
        nav.classList.add('active');
    } else {
        nav.classList.remove('active');
    }
};

// Get Copyright
var date = new Date();
document.querySelector('.copyright').textContent = "Copyright ©" + date.getFullYear() + " Quran.me. All Rights Reserved.";