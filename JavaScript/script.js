let currentSong = new Audio();
const play = document.getElementById("play-btn");

let songs = [];
let currfolder = "";
let currentIndex = 0;

let cardconatiner = document.querySelector(".card-container");

function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) {
        return "00:00";
    }

    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

async function GetSongs(folder) {
    currfolder = folder;

    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    let songList = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if (element.href.toLowerCase().endsWith(".mp3")) {
            let song = decodeURIComponent(element.href)
                .split(/[\\/]/)
                .pop();

            songList.push(song);
        }
    }

    return songList;
}

function LoadSongs() {
    let SongUL = document
        .querySelector(".song-list")
        .getElementsByTagName("ul")[0];

    SongUL.innerHTML = "";

    for (const song of songs) {
        let songName = decodeURIComponent(song)
            .split(/[\\/]/)
            .pop()
            .replace(".mp3", "");

        SongUL.innerHTML += `
            <li>
                <img class="invert" src="Images/music.svg" alt="">
                <div class="info">
                    <div>${songName}</div>
                    <div>Shiwanshu</div>
                </div>
                <div class="play-now">
                    <span>Play now</span>
                    <img class="invert" src="Images/play.svg" alt="">
                </div>
            </li>
        `;
    }

    Array.from(
        document
            .querySelector(".song-list")
            .getElementsByTagName("li")
    ).forEach((e, index) => {
        e.addEventListener("click", () => {
            PlayMusic(songs[index]);
        });
    });
}

const PlayMusic = (track, pause = false) => {
    currentIndex = songs.indexOf(track);

    currentSong.src =
        `http://127.0.0.1:3000/${currfolder}/${encodeURIComponent(track)}`;

    if (!pause) {
        currentSong.play();
        play.src = "Images/pause.svg";
    }

    let songName = decodeURIComponent(track)
        .split(/[\\/]/)
        .pop()
        .replace(".mp3", "");

    document.querySelector(".song-info").innerHTML = songName;
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    let a = await fetch("http://127.0.0.1:3000/songs/");
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");

    cardconatiner.innerHTML = "";

    for (let index = 0; index < anchors.length; index++) {
        const e = anchors[index];

        let href = decodeURIComponent(
            e.getAttribute("href")
        );

        if (!href.endsWith("/") || href.includes("..")) {
            continue;
        }

        let parts = href.split(/[\\/]/);
        let folder = parts[parts.length - 2];

        if (!folder || folder === "songs") {
            continue;
        }

        try {
            let infoResponse = await fetch(
                `http://127.0.0.1:3000/songs/${encodeURIComponent(folder)}/info.json`
            );

            if (!infoResponse.ok) {
                continue;
            }

            let info = await infoResponse.json();

            cardconatiner.innerHTML += `
                <div data-folder="${folder}" class="card">

                    <div class="play">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="50"
                            height="50"
                        >
                            <circle
                                cx="12"
                                cy="12"
                                r="12"
                                fill="#1ed760"
                            />

                            <path
                                d="M9.3 7.2L16.7 11.5Q17.4 12 16.7 12.5L9.3 16.8Q8.5 17.3 8.5 16.3V7.7Q8.5 6.7 9.3 7.2Z"
                                fill="#000000"
                            />
                        </svg>
                    </div>

                    <img
                        src="/songs/${encodeURIComponent(folder)}/cover.jpeg"
                        alt=""
                    >

                    <h2>${info.title}</h2>

                    <p>${info.description}</p>

                </div>
            `;
        } catch (error) {
        }
    }

    Array.from(
        document.getElementsByClassName("card")
    ).forEach(card => {
        card.addEventListener("click", async () => {
            let folder = card.dataset.folder;

            songs = await GetSongs(
                `songs/${folder}`
            );

            if (songs.length === 0) {
                return;
            }

            currentIndex = 0;

            LoadSongs();

            PlayMusic(songs[0], true);

            PlayMusic(songs[0])
        });
    });
}

async function Main() {
    songs = await GetSongs("songs/Phonks");

    if (songs.length === 0) {
        return;
    }

    LoadSongs();

    PlayMusic(songs[0], true);

    displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "Images/pause.svg";
        } else {
            currentSong.pause();
            play.src = "Images/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML =
            `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;

        if (isFinite(currentSong.duration)) {
            document.querySelector(".circle").style.left =
                (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });

    document
        .querySelector(".seek-bar")
        .addEventListener("click", e => {
            let percent =
                (e.offsetX /
                    e.target.getBoundingClientRect().width) *
                100;

            document.querySelector(".circle").style.left =
                percent + "%";

            currentSong.currentTime =
                (currentSong.duration * percent) / 100;
        });

    document
        .querySelector(".hamburger")
        .addEventListener("click", () => {
            document.querySelector(".left").style.left = "0";
        });

    document
        .querySelector(".close")
        .addEventListener("click", () => {
            document.querySelector(".left").style.left = "-120%";
        });

    const previous =
        document.getElementById("previous-btn");

    const next =
        document.getElementById("next-btn");

    previous.addEventListener("click", () => {
        if (currentIndex > 0) {
            PlayMusic(
                songs[currentIndex - 1]
            );
        }
    });

    next.addEventListener("click", () => {
        if (currentIndex < songs.length - 1) {
            PlayMusic(
                songs[currentIndex + 1]
            );
        }
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", e => {
            currentSong.volume =
                parseInt(e.target.value) / 100;


        });

    document.querySelector(".volume>img").addEventListener("click",(e)=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg") 
            currentSong.volume = 0;

            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }

        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg") 
            currentSong.volume = .10;

            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })
    
}

Main();