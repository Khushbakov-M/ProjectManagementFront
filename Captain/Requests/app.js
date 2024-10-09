const api_url = 'http://localhost:8080';
var global_team_id = '';
var global_user_id = '';
async function fetchRequests(searching_project_name, status) {
    // try {
    await refreshAccessToken();
    const userData = await getEnteredUsersData();
    if (!userData) return;

    const global_user_id = userData.id;
    const teamListUrl = `${api_url}/users/teamlist/with-user/${global_user_id}`;

    const teamListResponse = await axios.get(teamListUrl, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    });
    const teamData = teamListResponse.data[0];
    global_team_id = teamData.id
    const teamTitle = teamData.title
    localStorage.setItem('teamTitle', teamData.title); // Store the team title correctly
    localStorage.setItem('global_team_id', teamData.id); // Store the team ID correctly
    //console.log('Updated teamTitle and global_team_id in localStorage:', localStorage.getItem('teamTitle'), localStorage.getItem('global_team_id'));

    const subTeamListUrl = `${api_url}/users/subteamlist/with-team/${global_team_id}`;
    const subTeamListResponse = await axios.get(subTeamListUrl, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    });
    const myWorkRequesUrl = `${api_url}/myrequests/captain/${global_user_id}`;
    const myWorkRequestResponse = await axios.get(myWorkRequesUrl, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    });
//console.log(myWorkRequesUrl);



    const subTeamData = subTeamListResponse.data
    var workRequestsData = myWorkRequestResponse.data.filter(item => item.status === status);
    if (status == 'all') {
        workRequestsData = myWorkRequestResponse.data
    }
    if (searching_project_name.length > 0) {
        workRequestsData = workRequestsData.filter(item => item.announcement.project_name.includes(searching_project_name));
    }
    let html = '';
    if (workRequestsData.length) {
        workRequestsData.forEach(async item => {
            html += `
                    <div class="cardd mb-3 my-1" data-id="${item.id}" style="border-left: 10px solid ${item.status == 'accepted' ? "#31920b" : (item.status == 'refused' ? "#a41b0f" : "#ffc205")};">
                        <h2 style="border-bottom: 2px solid ${item.status == 'accepted' ? "#31920b" : (item.status == 'refused' ? "#a41b0f" : "#ffc205")};">Loyiha: <span id="project_name"><a href="../Announcements/details.html?id=${item.announcement.id}">${item.announcement.project_name}</span></a></h2>
                        <div class="section m-0">
                            <p>ID: <span class="highlight">${item.id}</span></p>
                        </div>
                        <div class="section m-0">
                            <p>Taklif qilingan muddat: <span class="highlight">${item.deadline}</span></p>
                        </div>
                        <div class="section m-0">
                            <p>Taklif qilingan narx: <span class="highlight">${item.cost}</span></p>
                        </div>
                        <div class="section m-0">
                            <p>Username: <span class="highlight">${item.description}</span></p>
                        </div>
                        <div class="section m-0">
                            <p>Status: <span class="highlight pb-2">${GetStatus(item.status)}</span></p>
                        </div>
                        <div class="footer">
                            <p>Yaratilgan vaqt: <span>${item.created_at}</span></p>
                            ${!subTeamListResponse.data.some(each => each.announcement === item.announcement.id)?(item.status == 'accepted' ? `<button id="giveWorkButton_${item.announcement.id}" onclick="handleButtonClick(${item.announcement.id},${item.id})" request-id="${item.id}" class="open-modal-button btn btn-success mx-2" data-bs-toggle="modal" data-bs-target="#giveWorkModal">Ish yuklash</button>` : ''):''}
                        </div>
                    </div>
                `;
        })
    }
    else {
        html = `
            <div class="cardd mb-4">
                <h2 class="text-center">Ro'yxat bo'sh</h2>
            </div>
            `
    }
    document.getElementById("projects_list").innerHTML += html;
    // } catch (error) {
    //     console.error(error);
    // }
}

document.addEventListener('DOMContentLoaded', async () => {
    await fillModalWithDevs()
    document.getElementById('statusSelect').value = 'all'
    document.getElementById("filter_project_name").value = ''
    await fetchRequests('', 'all');
})

document.getElementById('statusSelect').addEventListener('change', async function () {
    document.getElementById('projects_list').innerHTML = ""

    await fetchRequests(document.getElementById("filter_project_name").value, this.value);
});

document.getElementById("filter_project_name").addEventListener("input", async (event) => {
    document.getElementById('projects_list').innerHTML = ""
    await fetchRequests(document.getElementById("filter_project_name").value, document.getElementById('statusSelect').value);

});

async function getEnteredUsersData() {
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
        // console.error('Ошибка при получении информации о пользователе:', error.message);
        return null;
    }
}

var global_selected_request_id = -1
function handleButtonClick(ann_id,request_id) {
    localStorage.setItem('pressed_announcement_id', ann_id);
    global_selected_request_id = request_id
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

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function GetStatus(str) {
    if (str == 'pending') {
        return `Kutilmoqda <i class="bi bi-circle-fill" style="color: #ffc205; font-size: 1.5rem;"></i>`
    }
    else if (str == 'refused') {
        return `Rad etildi <i class="bi bi-circle-fill" style="color: #a41b0f; font-size: 1.5rem;"></i>`
    }
    else {
        return `Qabullandi <i class="bi bi-circle-fill" style="color: #31920b; font-size: 1.5rem;"></i>`
    }
}
