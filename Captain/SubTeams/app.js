const api_url = 'http://localhost:8080';
var selected_subTeam_id = 0;

fetchTeamList();

async function fetchTeamList() {
    await refreshAccessToken();
    fillModalWithDevelopers()
    const userData = await getEnteredUsersData();
    const teamData = (await axios.get(`${api_url}/users/getteamdatafromuser/${userData.id}/`, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })).data

    const subTeamListData = (await axios.get(`${api_url}/users/subteamlist/with-team/${teamData.id}`, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })).data
    var html = '';
    if (subTeamListData.length) {
        const annPromises = subTeamListData.map(async item => {
            const ann_data = (await axios.get(`${api_url}/${item.announcement}`, {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                }
            })).data;
            return `
        <div class="cardd data-id="${item.id} style="border-left: 10px solid ${item.status == 'accepted' ? "#31920b" : (item.status == 'refused' ? "#a41b0f" : "#ffc205")};"">
        <div class="card-header">
        <h2 style="border-bottom: 2px solid ${item.status == 'accepted' ? "#31920b" : (item.status == 'refused' ? "#a41b0f" : "#ffc205")};">Bajarilayotgan loyiha: <span id="project_name"><a href="../Announcements/details.html?id=${ann_data.id}"><strong>${ann_data.project_name}</strong></a></span></h2>
                <button class="btn btn-delete" onclick="deleteBajaruvchi(${item.id})">
                    <i class="bi bi-trash-fill h4 text-danger" ></i>
                </button>

            </div>

            <div class="section" id="dev-list">
                ${await allDevelopers(item.developers)}
            </div>
          <div class="border-top d-flex justify-content-between p-2 mt-2">

          ${item.status != 'refused' ? `<button onclick="getSelectedSubTeamId(${item.id})" 
                class="open-modal-button btn btn-info mx-2 w-25" data-bs-toggle="modal" data-bs-target="#giveWorkModal">Dasturchilar
            </button>`: ''}

            ${item.status == 'pending' ?
                    `<button 
            onclick="accept_ButtonClick(${item.id})" 
            data-bs-toggle="modal" 
            data-bs-target="#getDoneWork" 

            class="open-modal-button btn btn-success mx-2 w-25">Qabullash</button> `: ''}
            
          </div>
          <div class="footer p-1 mt-0">
            <p>Yaratilgan vaqt: <span id="created_at">${item.created_at}</span></p>
            <p>Tahrirlangan vaqt: <span id="updated_at">${item.updated_at === item.created_at ? "Tahrirlanmagan" : item.updated_at}</span></p>
          </div>
        </div>
        `;
        });

        Promise.all(annPromises).then(results => {
            html = results.join('');
            document.getElementById("main").innerHTML = html;
        }).catch(error => {
            //console.error('Error fetching announcements:', error);
        });
    } else {
        html += `
    <div class="card">
        <div class="card-header">
            <h2 class="text-center text-white">Ish yuklanmagan</h2>
        </div>
    </div>
    `;
        document.getElementById("main").innerHTML = html;
    }
}

async function accept_ButtonClick(subTeamId) {
    await refreshAccessToken()
    selected_subTeam_id = subTeamId
}

async function cancelSubTeam(subTeamId) {
    await refreshAccessToken()
    selected_subTeam_id = subTeamId
    if (confirm("Bekor qilishga aminmisiz?")) {
        await axios.patch(`${api_url}/users/subteamlist/${selected_subTeam_id}`, {
            status: 'refused'
        }, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        })
    }
}


async function yes_Button_click() {
    await refreshAccessToken()
    await axios.patch(`${api_url}/users/subteamlist/${selected_subTeam_id}`, {
        status: 'accepted'
    }, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })
    window.location.reload();
}
async function getSelectedSubTeamId(id) {
    selected_subTeam_id = id
}

async function deleteBajaruvchi(id) {
    await refreshAccessToken()
    if (confirm(`O'chirishga aminmisiz?`)) {
        await refreshAccessToken()
        await axios.delete(`${api_url}/users/subteamlist/${id}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        })
        window.location.reload();
    }
}

async function fillModalWithDevelopers() {
    const submitButton = document.getElementById('give-btn');
    const eachDeveloperContainer = document.getElementById('each-developer-container');

    const teamTitle = localStorage.getItem('teamTitle');
    const global_team_id = localStorage.getItem('global_team_id');

    const devListUrl = `${api_url}/users/developer/${teamTitle}/${global_team_id}`;
    const devListResponse = await axios.get(devListUrl, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    });

    const devData = devListResponse.data;

    devData.forEach(item => {
        const eachDeveloper = document.createElement('div');
        eachDeveloper.className = 'each-developer';
        eachDeveloper.dataset.id = item.id;
        eachDeveloper.innerHTML = `
            <img class="rounded-circle mb-2" src=${item.image} width="60px">
            <h5>${item.fish}</h5>
            <p>(${item.position})</p>
        `;
        eachDeveloper.addEventListener('click', () => {
            eachDeveloper.classList.toggle('selected');
        });
        eachDeveloperContainer.appendChild(eachDeveloper);
    });

    submitButton.addEventListener('click', async () => {
        const selectedEachDevelopers = document.querySelectorAll('.each-developer.selected');
        const selectedIds = Array.from(selectedEachDevelopers).map(eachDeveloper => eachDeveloper.dataset.id);
        const announcement_id = localStorage.getItem('pressed_announcement_id');
        if (selectedIds.length) {
            const patchData = {
                announcement: announcement_id,
                team: global_team_id,
                developers: selectedIds
            };
            window.location.reload();

            //console.log('Post Data:', patchData); // Log data being sent

            try {
                const response = await axios.patch(`${api_url}/users/subteamlist/${selected_subTeam_id}`, patchData, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    }
                });

                //console.log('Server Response:', response.data); // Log server response
            } catch (error) {
                //console.error('Error posting subteam list:', error.response.data); // Log error response
                window.location.reload();
            }
        }
        else {
            alert("Dasturchilarni tanlang")
        }
    });
}


async function allDevelopers(devs) {
    var allCards = '';
    for (const each_dev_ID of devs) {
        allCards += await getDevInfo(each_dev_ID);
    }
    return allCards
}

async function getDevInfo(dev_id) {
    const developerAPI = `${api_url}/users/developer/${dev_id}`;

    const devInfo = (await axios.get(developerAPI, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    })).data;


    var devCardHtml = `
        <div class="card my-0 ">
            <div class="photo-box d-flex justify-content-center">
                <img src="${devInfo.image}" alt="Photo">
            </div>
            <div class="section m-0">
                <p><strong>Familiya:</strong> ${devInfo.fish.split(' ')[0]}</p>
                <p><strong>Ism:</strong> ${devInfo.fish.split(' ')[1] ? devInfo.fish.split(' ')[1] : '?'}</p>
            </div>
            <div class="section m-0">
                <p><strong>Yo'nalishi:</strong> ${capitalize(devInfo.position)}</p>
            </div>
        </div>
    `;
    return devCardHtml;
}

async function getEnteredUsersData() {
    await refreshAccessToken()
    const accessToken = localStorage.getItem("access_token");
    try {
        const response = await axios.get(`${api_url}/users/api/userinfo`, {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
        return response.data;
    } catch (error) {
        window.location.href = "../../index.html"
        return null;
    }
}


function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

document.getElementById('logoutBtn').addEventListener('click', async (event) => {
    await logOut();
});

async function logOut() {
    try {
        const s = await axios.post(`${api_url}/api/logout/`, {
            refresh_token: localStorage.getItem('refresh_token')
        }, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        });
        window.location.href = "../../index.html";
    } catch (error) {
        //console.error("logout error: ", error);
    }
}
async function refreshAccessToken() {
    const refresh_token = localStorage.getItem('refresh_token');

    try {
        const response = await axios.post(`${api_url}/api/token/refresh/`, {
            refresh: refresh_token
        });

        if (response.status === 200) {
            const new_access_token = response.data.access;
            localStorage.setItem('access_token', new_access_token);
        } else {
            throw new Error('Failed to refresh token');
        }
    } catch (error) {
        window.location.href = "../../index.html";
    }
}
